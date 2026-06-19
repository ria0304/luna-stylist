from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
from intent import classify_intent
from smart_reply import get_llm_reply, get_instant_reply

app = FastAPI(title="Luna API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WYA_API_URL = os.getenv("WYA_API_URL", "http://localhost:8000")


# ---------- Models ----------

class ChatRequest(BaseModel):
    message: str
    token: str
    wardrobe_items: Optional[List[dict]] = None  # frontend passes these in

class ChatResponse(BaseModel):
    reply: str
    intent: str
    data: Optional[dict] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str


# ---------- Helpers ----------

def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

async def call_wya(method: str, path: str, token: str, **kwargs) -> dict:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method,
                f"{WYA_API_URL}{path}",
                headers=auth_headers(token),
                timeout=15.0,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="WYA backend unreachable")


# ---------- Routes ----------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "luna-api", "version": "2.0.0"}


@app.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{WYA_API_URL}/api/auth/login",
                json={"email": body.email, "password": body.password},
                timeout=10.0,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Login failed")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="WYA backend unreachable")


@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    intent = classify_intent(body.message)

    # Structured intents — route to WYA endpoints directly
    if intent == "outfit_suggestion":
        data = await call_wya("POST", "/api/ai/outfit-match-context", body.token,
                               json={"context": {"occasion": "everyday"}, "limit": 1})
        reply = format_outfits(data)

    elif intent == "wardrobe_search":
        query = extract_search_query(body.message)
        data = await call_wya("GET", f"/api/wardrobe/search?q={query}", body.token)
        reply = format_wardrobe(data)

    elif intent == "gap_analysis":
        data = await call_wya("POST", "/api/ai/gap-analysis", body.token, json={})
        reply = format_gaps(data)

    elif intent == "style_explanation":
        # style DNA doesn't need user_id in path on some routes — adjust if needed
        data = await call_wya("GET", "/api/style/analytics", body.token)
        reply = format_style(data)

    else:
        # ── General fashion Q&A via LLM ──────────────────────────────────────
        data = None
        instant = get_instant_reply(body.message)
        if instant:
            reply = instant
        else:
            reply = await get_llm_reply(body.message, body.wardrobe_items or [])

    return ChatResponse(reply=reply, intent=intent, data=data)


# ---------- Formatters ----------

def format_outfits(data: dict) -> str:
    outfits = data.get("outfits", [])
    if not outfits:
        return "I couldn't find a great outfit match right now. Try adding more items to your wardrobe!"
    outfit = outfits[0]
    items = outfit.get("items", [])
    item_names = ", ".join(
        i.get("name", "Item") for i in items if isinstance(i, dict)
    ) if items and isinstance(items[0], dict) else ", ".join(items)
    style = outfit.get("style", "")
    return f"Here's what I put together for you{' (' + style + ')' if style else ''}:\n\n{item_names}"

def format_wardrobe(data: dict) -> str:
    items = data.get("items", [])
    if not items:
        return "Nothing found matching that. Try a different search?"
    lines = [f"Found {len(items)} item(s):\n"]
    for item in items[:8]:
        name = item.get("name", "Item")
        color = item.get("dominant_color", "")
        lines.append(f"• {name}" + (f" ({color})" if color else ""))
    return "\n".join(lines)

def format_gaps(data: dict) -> str:
    gaps = data.get("gaps", [])
    if not gaps:
        return "Your wardrobe looks pretty complete! No major gaps found."
    lines = ["Here's what your wardrobe is missing:\n"]
    for gap in gaps[:5]:
        category = gap.get("category", "Item") if isinstance(gap, dict) else gap
        suggestion = gap.get("suggestion", "") if isinstance(gap, dict) else ""
        lines.append(f"• {category}" + (f" — {suggestion}" if suggestion else ""))
    return "\n".join(lines)

def format_style(data: dict) -> str:
    aesthetic = data.get("aesthetic_type") or data.get("style_archetype") or "unique"
    return f"Your style is **{aesthetic}**. Ask me to break it down further or suggest outfits around it."

def extract_search_query(message: str) -> str:
    stopwords = {"show", "me", "my", "find", "all", "the", "i", "have", "got", "what", "do", "in"}
    words = message.lower().split()
    filtered = [w for w in words if w not in stopwords]
    return "+".join(filtered) if filtered else message
