import os
import re
import asyncio
import httpx

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# meta-llama/llama-3.1-8b-instruct:free was discontinued by OpenRouter (404).
# google/gemini-flash-1.5:free and mistralai/mistral-7b-instruct:free are
# also gone (404) as of 2026-06-20. Free-tier OpenRouter models get pulled
# or congested without notice, so we try a short list of confirmed-working
# slugs in order instead of depending on a single model. All three below
# were confirmed live + responding with real completions on 2026-06-20.
# meta-llama/llama-3.3-70b-instruct works but is sometimes rate-limited
# upstream by its provider ("Venice"), which is why it's listed last.
MODELS = [
    "openai/gpt-oss-120b:free",
    "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
]

MAX_RETRIES_PER_MODEL = 1  # one retry per model on 429 before moving to the next
BASE_BACKOFF_SECONDS = 2

SYSTEM_PROMPT = """You are Luna, a sharp and intuitive personal fashion stylist. You know the user's wardrobe inside out.

Rules:
- Answer ONLY fashion-related questions: styling, outfits, trends, color theory, fabrics, occasions, care tips, aesthetics, capsule wardrobes, shopping advice.
- If asked something completely unrelated to fashion, politely redirect: "I'm your stylist — let's keep it fashion. What do you want to wear?"
- Be concise, warm, and specific. No filler phrases.
- When the user's wardrobe items are provided, reference them by name when relevant.
- Never make up items that aren't in the wardrobe.
- Do NOT use markdown formatting of any kind — no asterisks, no **bold**, no # headers, no underscores for emphasis. Plain text only.
- For lists, use a simple dash (-) followed by a space, one item per line. Do not use bullet characters or markdown list syntax.
- Use a short plain-text line (e.g. "Neutral options:") instead of a bolded or markdown header to introduce a group of items.
- Keep responses under 200 words unless a detailed breakdown is genuinely needed."""


def _strip_markdown(text: str) -> str:
    """Remove common markdown artifacts the model might still slip in,
    despite the system prompt asking it not to. Safe on plain text —
    only targets markdown-specific patterns, not regular punctuation."""
    # Bold/italic markers: **text** or *text* or __text__ or _text_
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'(?<!\w)\*(.+?)\*(?!\w)', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    # Markdown headers: lines starting with #
    text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
    # Markdown bullet markers (•, *, or - used as a list bullet at line start)
    text = re.sub(r'^[•*]\s+', '- ', text, flags=re.MULTILINE)
    return text.strip()


async def _call_model(client: httpx.AsyncClient, model: str, messages: list) -> tuple[int, dict | str]:
    """Single call attempt. Returns (status_code, parsed_json_or_raw_text)."""
    response = await client.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://luna-stylist.app",
            "X-Title": "Luna Stylist",
        },
        json={
            "model": model,
            "messages": messages,
            "max_tokens": 400,
            "temperature": 0.7,
        }
    )
    try:
        return response.status_code, response.json()
    except Exception:
        return response.status_code, response.text


async def get_llm_reply(message: str, wardrobe_items: list = None) -> str:
    """Call OpenRouter, trying each model in MODELS in order.

    Each model gets one retry on a 429 (rate-limited upstream) with a short
    backoff before moving on to the next model in the list. A 404 (model
    discontinued/unavailable) skips straight to the next model with no retry.
    """

    if not OPENROUTER_API_KEY:
        return "I'm not fully set up yet — my AI brain needs an API key. Ask your developer to add OPENROUTER_API_KEY."

    # Build wardrobe context string if items provided
    wardrobe_context = ""
    if wardrobe_items:
        item_lines = []
        for item in wardrobe_items[:30]:  # cap at 30 to stay within token limits
            name = item.get("name") or "Unnamed"
            category = item.get("category") or ""
            color = item.get("dominant_color") or item.get("color") or ""
            fabric = item.get("fabric") or ""
            parts = [p for p in [color, fabric, category] if p]
            item_lines.append(f"• {name}" + (f" ({', '.join(parts)})" if parts else ""))
        wardrobe_context = "\n\nUser's current wardrobe:\n" + "\n".join(item_lines)

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT + wardrobe_context
        },
        {
            "role": "user",
            "content": message
        }
    ]

    last_status = None

    async with httpx.AsyncClient(timeout=20.0) as client:
        for model in MODELS:
            for attempt in range(MAX_RETRIES_PER_MODEL + 1):
                try:
                    status, body = await _call_model(client, model, messages)
                except Exception:
                    # Network-level failure — try the next model, don't retry this one
                    last_status = "connection error"
                    break

                if status == 200 and isinstance(body, dict):
                    try:
                        content = body["choices"][0]["message"]["content"].strip()
                        return _strip_markdown(content)
                    except (KeyError, IndexError, TypeError):
                        last_status = "malformed response"
                        break  # try next model

                if status == 429:
                    last_status = 429
                    if attempt < MAX_RETRIES_PER_MODEL:
                        retry_after = None
                        if isinstance(body, dict):
                            retry_after = body.get("error", {}).get("metadata", {}).get("retry_after_seconds_raw")
                        wait = float(retry_after) if retry_after else BASE_BACKOFF_SECONDS * (2 ** attempt)
                        await asyncio.sleep(min(wait, 8))
                        continue
                    break  # exhausted retries on this model, try next

                if status == 404:
                    last_status = 404
                    break  # model gone, try next immediately, no retry

                # Any other status — log and move to next model
                last_status = status
                break

    # All models exhausted
    if last_status == 429:
        return "My AI's a little overwhelmed with requests right now — give it a few seconds and try that again."
    if last_status == 404:
        return "My AI models need an update on the backend — ask your developer to check the OpenRouter model slugs."
    return "I couldn't reach my AI right now. Check your connection and try again."


# ── Instant client-side style replies (no LLM needed) ──────────────────────

GREETINGS = {"hi", "hello", "hey", "hii", "heyy", "sup", "yo"}

def get_instant_reply(message: str) -> str | None:
    """Return an instant reply for simple inputs, or None if LLM should handle it."""
    text = message.lower().strip().rstrip("!")

    if text in GREETINGS:
        return "Hey! I'm Luna, your personal stylist. Ask me what to wear, how to style something, or anything fashion — I've got you."

    if any(word in text for word in ["thank", "thanks", "ty", "thank you"]):
        return "Anytime! What else are we styling?"

    return None  # LLM handles everything else
