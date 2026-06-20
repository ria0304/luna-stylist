import os
import asyncio
import httpx

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


MODEL = "meta-llama/llama-3.3-70b-instruct:free"

MAX_RETRIES = 2
BASE_BACKOFF_SECONDS = 2

SYSTEM_PROMPT = """You are Luna, a sharp and intuitive personal fashion stylist. You know the user's wardrobe inside out.

Rules:
- Answer ONLY fashion-related questions: styling, outfits, trends, color theory, fabrics, occasions, care tips, aesthetics, capsule wardrobes, shopping advice.
- If asked something completely unrelated to fashion, politely redirect: "I'm your stylist — let's keep it fashion. What do you want to wear?"
- Be concise, warm, and specific. No filler phrases.
- When the user's wardrobe items are provided, reference them by name when relevant.
- Never make up items that aren't in the wardrobe.
- Format lists with bullet points (•) for readability.
- Keep responses under 200 words unless a detailed breakdown is genuinely needed."""


async def get_llm_reply(message: str, wardrobe_items: list = None) -> str:
    """Call OpenRouter with the user message and optional wardrobe context.

    Retries on 429 (rate-limited upstream) with short backoff, since
    OpenRouter's free-tier models can be temporarily saturated rather
    than genuinely unavailable.
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

    last_error_detail = ""

    async with httpx.AsyncClient(timeout=20.0) as client:
        for attempt in range(MAX_RETRIES + 1):
            try:
                response = await client.post(
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://luna-stylist.app",
                        "X-Title": "Luna Stylist",
                    },
                    json={
                        "model": MODEL,
                        "messages": messages,
                        "max_tokens": 400,
                        "temperature": 0.7,
                    }
                )

                if response.status_code == 429:
                    last_error_detail = "rate-limited"
                    if attempt < MAX_RETRIES:
                        # Respect Retry-After if present, else exponential backoff
                        retry_after = response.headers.get("Retry-After")
                        wait = float(retry_after) if retry_after else BASE_BACKOFF_SECONDS * (2 ** attempt)
                        await asyncio.sleep(min(wait, 10))
                        continue
                    return "My AI's a little overwhelmed with requests right now — give it a few seconds and try that again."

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    # Model slug itself is gone/discontinued — not a transient issue
                    return "My AI model needs an update on the backend — ask your developer to check the OpenRouter model slug."
                last_error_detail = str(e.response.status_code)
                return f"My AI is having a moment — got a {e.response.status_code} from OpenRouter. Try again shortly."
            except Exception:
                last_error_detail = "connection error"
                return "I couldn't reach my AI right now. Check your connection and try again."

    return "My AI's a little overwhelmed with requests right now — give it a few seconds and try that again."


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
