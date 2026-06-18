import random

FALLBACKS = [
    "I'm best at helping you find outfits, search your wardrobe, or explain your style. Try asking me something like 'what should I wear today?'",
    "Not sure I caught that! You can ask me things like 'show my black tops' or 'what am I missing for winter'.",
    "I'm a styling assistant — ask me about your wardrobe, outfits, or your personal aesthetic!",
    "Hmm, I didn't quite get that. Try asking me to suggest an outfit or search for something specific in your wardrobe.",
]

GREETINGS = {"hi", "hello", "hey", "hii", "heyy", "sup", "yo"}

def get_smart_reply(message: str) -> str:
    text = message.lower().strip().rstrip("!")
    if text in GREETINGS:
        return "Hey! Ask me what to wear, search your wardrobe, or find out what you're missing. What do you need?"
    if any(word in text for word in ["thank", "thanks", "ty"]):
        return "Anytime! Anything else you want to explore in your wardrobe?"
    if any(word in text for word in ["help", "what can you do", "how does this work"]):
        return (
            "Here's what I can do:\n"
            "• **Outfit suggestions** — 'What should I wear to college tomorrow?'\n"
            "• **Wardrobe search** — 'Show all my black tops'\n"
            "• **Gap analysis** — 'What am I missing for winter?'\n"
            "• **Style explanation** — 'Why am I a minimalist?'"
        )
    return random.choice(FALLBACKS)
