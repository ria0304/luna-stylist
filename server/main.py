from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import os
from intent import classify_intent
from smart_reply import get_instant_reply, get_llm_reply

app = FastAPI(title="Luna API", version="1.0.0", root_path="/luna-api")

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
    return {"status": "ok", "service": "luna-api"}


@app.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{WYA_API_URL}/auth/login",
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

    if intent == "outfit_suggestion":
        data = await call_wya("POST", "/outfits/generate", body.token, json={"prompt": body.message})
        reply = format_outfits(data)

    elif intent == "wardrobe_search":
        query = extract_search_query(body.message)
        data = await call_wya("GET", f"/wardrobe/search?q={query}", body.token)
        reply = format_wardrobe(data)

    elif intent == "gap_analysis":
        data = await call_wya("GET", "/wardrobe/gaps", body.token)
        reply = format_gaps(data)

    elif intent == "style_explanation":
        data = await call_wya("GET", "/style/profile", body.token)
        reply = format_style(data)

    else:
        data = None
        instant = get_instant_reply(body.message)
        reply = instant if instant else await get_llm_reply(body.message, body.wardrobe_items or [])

    return ChatResponse(reply=reply, intent=intent, data=data)


# ---------- Formatters ----------

def format_outfits(data: dict) -> str:
    outfits = data.get("outfits", [])
    if not outfits:
        return "I couldn't find a great outfit match right now. Try adding more items to your wardrobe!"
    lines = ["Here's what I put together for you:\n"]
    for i, outfit in enumerate(outfits[:3], 1):
        items = ", ".join(outfit.get("items", []))
        lines.append(f"{i}. {items}")
    return "\n".join(lines)

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
    for gap in gaps:
        lines.append(f"• {gap}")
    return "\n".join(lines)

def format_style(data: dict) -> str:
    aesthetic = data.get("aesthetic_type", "unique")
    traits = data.get("traits", [])
    desc = data.get("description", "")
    lines = [f"Your style is **{aesthetic}**."]
    if traits:
        lines.append("Key traits: " + ", ".join(traits))
    if desc:
        lines.append(f"\n{desc}")
    return "\n".join(lines)

def extract_search_query(message: str) -> str:
    stopwords = ["show", "me", "my", "find", "all", "the", "i", "have", "got"]
    words = message.lower().split()
    filtered = [w for w in words if w not in stopwords]
    return "+".join(filtered) if filtered else message
