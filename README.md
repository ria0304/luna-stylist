# Luna — Conversational AI Stylist


Luna lets you talk to your wardrobe in plain English.

It's a standalone chat interface built on top of [WYA](https://github.com/ria0304/WYA-Whats-Your-Aesthetic)'s fashion intelligence API — so before you say a word, Luna already knows what you own, what your style is, and what you're missing.

**Live →** http://luna-stylist.s3-website.ap-south-1.amazonaws.com/

---

## What You Can Ask

- *"What should I wear to college tomorrow?"* → real outfits from your actual wardrobe
- *"Show all my black tops"* → natural language wardrobe search
- *"What am I missing for winter?"* → gap analysis powered by WYA
- *"Why am I a minimalist?"* → your Style DNA explained in plain English

---

## How It Works

Luna is a React frontend with an intent classification layer. It authenticates against WYA's backend using JWT tokens and routes your messages to the right wardrobe endpoint.

No wardrobe data lives in Luna. WYA is the brain. Luna is the mouth.

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

## Project Structure

```
luna-stylist/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD → S3 + CloudFront
│
└── src/
    ├── main.tsx                # App entry point
    ├── index.css               # Global styles
    ├── App.tsx                 # Root component, auth gate
    │
    ├── views/
    │   ├── Login.tsx           # WYA login screen
    │   └── Chat.tsx            # Main chat interface + all intent routing
    │
    ├── components/
    │   ├── ChatWindow.tsx      # Message list renderer
    │   ├── ChatInput.tsx       # Text input + send button
    │   ├── IntentBadge.tsx     # Debug overlay showing classified intent
    │   └── OutfitCard.tsx      # Outfit result card
    │
    ├── services/
    │   ├── api.ts              # All WYA API calls (wardrobe, outfits, style, gaps)
    │   ├── auth.ts             # JWT token storage and session helpers
    │   ├── intent.ts           # Keyword-based intent classifier
    │   └── smartReply.ts       # Fallback replies for general chat messages
    │
    └── types/
        └── index.ts            # Shared TypeScript types + API response mappers
```

---

## Tech Stack

- React + TypeScript
- Tailwind CSS
- WYA REST API (wardrobe, style, AI endpoints)
- Intent classifier (natural language → API route)
- Hosted on AWS S3 + CloudFront

---

## Setup

```bash
npm install
cp .env.example .env
# Set VITE_WYA_API_URL to your WYA backend URL
npm run dev
```

You need a WYA account to use Luna. No standalone login — Luna authenticates directly against your WYA wardrobe.

---

## Deployment

Pushes to `main` automatically deploy via GitHub Actions:

1. Builds the React app
2. Syncs to S3 with correct cache headers
3. Invalidates CloudFront on `index.html`

GitHub Secrets required: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID`, `VITE_WYA_API_URL`, `LUNA_CLOUDFRONT_DISTRIBUTION_ID`

---

## Related

[WYA — What's Your Aesthetic](https://github.com/ria0304/WYA-Whats-Your-Aesthetic) — the full wardrobe intelligence platform Luna connects to.

---

*Luna is part of the WYA ecosystem. It does not store any wardrobe data independently.*
