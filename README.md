# Luna — Conversational AI Stylist

Luna is a conversational wardrobe assistant that lets you talk to your closet in plain English.

Built as a standalone chat interface that connects to [WYA](https://github.com/ria0304/WYA-Whats-Your-Aesthetic)'s fashion intelligence API — Luna knows what you own, what your style is, and what you're missing before you say a word.

---

## What Luna Does

- **Outfit help** — "What should I wear to college tomorrow?" → real outfits from your actual wardrobe
- **Wardrobe search** — "Show all my black tops" → instant natural language queries
- **Gap analysis** — "What am I missing for winter?" → powered by WYA's gap analyzer
- **Style explanation** — "Why am I a minimalist?" → your Style DNA explained in plain English

---

## How It Works

Luna is a React frontend with an intent classification layer. It authenticates against WYA's backend API using JWT tokens and routes natural language queries to the correct wardrobe endpoint.

No wardrobe data lives in Luna. WYA is the brain. Luna is the interface.

```
User message
    ↓
Intent classifier
    ↓
Route to WYA endpoint
    ↓
Format response
    ↓
Chat reply
```

---

## Tech Stack

- React + TypeScript
- WYA REST API (wardrobe, style, AI endpoints)
- Intent classifier (natural language → API route)

---

## Related

[WYA — What's Your Aesthetic](https://github.com/ria0304/WYA-Whats-Your-Aesthetic) — the full wardrobe intelligence platform Luna connects to.

---

*Luna is part of the WYA ecosystem. It does not store any wardrobe data independently.*
