import re

# Intent types mirror what intent.ts currently does, but easier to extend here
INTENT_PATTERNS = {
    "outfit_suggestion": [
        r"what should i wear",
        r"outfit for",
        r"dress me",
        r"what to wear",
        r"suggest an outfit",
        r"give me an outfit",
        r"something (casual|formal|cool|nice)",
        r"what can i wear",
        r"style me",
    ],
    "wardrobe_search": [
        r"show (me |all )?(my )?",
        r"find my",
        r"all my",
        r"do i have",
        r"search (my )?wardrobe",
        r"what (tops?|bottoms?|dresses?|jackets?|shoes?|bags?) do i have",
        r"my (black|white|red|blue|green|navy|grey|gray|brown|pink|yellow|beige)",
    ],
    "gap_analysis": [
        r"what am i missing",
        r"what do i need",
        r"wardrobe gap",
        r"missing from my wardrobe",
        r"what should i buy",
        r"what to add",
    ],
    "style_explanation": [
        r"why am i",
        r"what('s| is) my (style|aesthetic)",
        r"explain my (style|aesthetic|vibe)",
        r"what does my style say",
        r"my style dna",
        r"what kind of style",
        r"describe my aesthetic",
    ],
}

def classify_intent(message: str) -> str:
    text = message.lower().strip()
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text):
                return intent
    return "general"
