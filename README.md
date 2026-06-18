<div align="center">

<img src="https://img.shields.io/badge/React-TypeScript-blue?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/Vite-Frontend-purple?style=flat-square&logo=vite" />
<img src="https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-orange?style=flat-square&logo=amazonaws" />
<img src="https://img.shields.io/badge/WYA-Powered-pink?style=flat-square" />
<img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?style=flat-square&logo=githubactions" />

![CI/CD](https://github.com/ria0304/luna-stylist/actions/workflows/deploy.yml/badge.svg)

# Luna — Conversational AI Stylist

**A chat interface that lets you talk to your wardrobe in plain English.**
Luna connects to [WYA](https://github.com/ria0304/WYA-Whats-Your-Aesthetic)'s fashion intelligence API so before you say a word, it already knows what you own, what your aesthetic is, and what you're missing.

> **Live →** http://luna-stylist.s3-website.ap-south-1.amazonaws.com/
>
> ⚠️ **Status:** Requires a WYA account. The WYA EC2 backend is currently paused to manage AWS costs — API features (wardrobe, outfit matching, gap analysis) are offline. Frontend is live. To run the full stack, see [Run Locally](#run-locally).

</div>

---

## Problem Statement

Wardrobe apps show you what you own. Fashion apps show you what's trending. Neither one lets you just *ask*.

**1. You can't query your own closet.**
Finding something to wear means physically digging through your wardrobe or scrolling through a grid of thumbnail photos. There's no way to say "show me everything navy" or "what do I have for a formal dinner?" and get a real answer.

**2. Style insights are buried in dashboards.**
WYA builds a rich style profile for every user — aesthetic type, style vectors, wardrobe gaps — but surfacing that data requires navigating menus. Most users never reach it.

**3. Outfit suggestions have no context.**
Generic recommendation engines don't know you had a job interview last Tuesday or that you're packing for a beach trip. Natural language does.

Luna solves all three. It's a conversational layer on top of WYA that turns your wardrobe into something you can actually talk to.

---

## What You Can Ask

| Message | What Luna does |
|---|---|
| *"What should I wear to college tomorrow?"* | Generates real outfits from your actual wardrobe |
| *"Show all my black tops"* | Natural language search across your garments |
| *"What am I missing for winter?"* | Gap analysis powered by WYA's wardrobe intelligence |
| *"Why am I a minimalist?"* | Your Style DNA explained in plain English |
| *"Give me something casual for the weekend"* | Occasion-filtered outfit suggestions |

---

## How It Works

Luna is a React frontend with a lightweight intent classification layer. It authenticates against WYA's backend using JWT tokens and routes your messages to the correct wardrobe endpoint based on what you asked.

No wardrobe data lives in Luna. WYA is the brain. Luna is the mouth.

```
User message
    ↓
Intent classifier  (keyword + pattern matching → intent type)
    ↓
Route to WYA endpoint  (wardrobe / outfits / style / gaps)
    ↓
Format API response  (garment cards, outfit cards, plain text)
    ↓
Chat reply
```

### Intent Classification

The classifier (`src/services/intent.ts`) maps natural language to one of five intent types before any API call is made:

| Intent | Example triggers | WYA endpoint |
|---|---|---|
| `outfit_suggestion` | "what should I wear", "outfit for", "dress me" | `POST /outfits/generate` |
| `wardrobe_search` | "show me", "find my", "all my [color/type]" | `GET /wardrobe/search` |
| `gap_analysis` | "what am I missing", "what do I need" | `GET /wardrobe/gaps` |
| `style_explanation` | "why am I", "what's my aesthetic", "explain my style" | `GET /style/profile` |
| `general` | anything else | Smart reply fallback (no API call) |

---

## Architecture

```mermaid
flowchart TD
    A["🌐 Browser\nUser"]:::gray

    B["⚡ CloudFront CDN\nHTTPS · global edge caching"]:::purple

    C["🗂️ S3 Static Frontend\nReact + Vite · TypeScript · Luna"]:::teal

    D["🤖 Intent Classifier\nKeyword + pattern matching"]:::blue

    E["🖥️ WYA FastAPI Backend\nEC2 · Docker · ap-south-1"]:::amber

    F["👗 WYA Wardrobe\nGarments · Style profile · Gaps · Outfits"]:::coral

    A --> B
    B --> C
    C --> D
    D -->|"JWT auth + routed request"| E
    E --> F

    classDef gray   fill:#e8e6e1,stroke:#9c9a92,color:#2C2C2A
    classDef purple fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef teal   fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef blue   fill:#E6F1FB,stroke:#185FA5,color:#0C447C
    classDef amber  fill:#FAEEDA,stroke:#854F0B,color:#633806
    classDef coral  fill:#FAECE7,stroke:#993C1D,color:#712B13
```

**Deployment**
- Frontend → S3 + CloudFront (HTTPS, CDN cached, global)
- Auth → JWT tokens from WYA's `/auth/login` endpoint, stored in `localStorage`
- CI/CD → GitHub Actions (push to `main` → build + S3 sync + CloudFront invalidation)

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
│       └── deploy.yml          # CI/CD → S3 + CloudFront invalidation
│
└── src/
    ├── main.tsx                # App entry point
    ├── index.css               # Global styles
    ├── App.tsx                 # Root component + auth gate
    │
    ├── views/
    │   ├── Login.tsx           # WYA login screen
    │   └── Chat.tsx            # Main chat interface + intent routing
    │
    ├── components/
    │   ├── ChatWindow.tsx      # Message list renderer
    │   ├── ChatInput.tsx       # Text input + send button
    │   ├── IntentBadge.tsx     # Debug overlay — shows classified intent
    │   └── OutfitCard.tsx      # Outfit result card component
    │
    ├── services/
    │   ├── api.ts              # All WYA API calls (wardrobe, outfits, style, gaps)
    │   ├── auth.ts             # JWT token storage + session helpers
    │   ├── intent.ts           # Keyword-based intent classifier
    │   └── smartReply.ts       # Fallback replies for unclassified messages
    │
    └── types/
        └── index.ts            # Shared TypeScript types + API response mappers
```

---

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- Deployed on AWS S3 + CloudFront (HTTPS)

**Intelligence**
- Intent classifier — keyword + pattern matching → API route
- Smart reply fallback — handles general conversation without hitting WYA
- WYA REST API — wardrobe, style profile, outfit generation, gap analysis
- JWT session management — no wardrobe data stored locally

**AWS Infrastructure**
- S3 — static hosting for the React build
- CloudFront — HTTPS, CDN caching, single distribution for global delivery
- CI/CD — GitHub Actions on push to `main`

---

## Run Locally

```bash
git clone https://github.com/ria0304/luna-stylist
cd luna-stylist
npm install
cp .env.example .env
# Set VITE_WYA_API_URL to your WYA backend URL
npm run dev
```

> Luna requires a running WYA backend. See [WYA — Run Locally](https://github.com/ria0304/WYA-Whats-Your-Aesthetic#run-locally) to spin up the API.
>
> You also need a WYA account — Luna has no standalone auth. It authenticates directly against your WYA wardrobe.

---

## Deployment

Pushes to `main` automatically deploy via GitHub Actions:

1. Builds the React app (`npm run build`)
2. Syncs `dist/` to S3 with correct cache headers
3. Invalidates CloudFront on `index.html`

**GitHub Secrets required:**

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM credentials for S3 + CloudFront |
| `AWS_SECRET_ACCESS_KEY` | IAM credentials |
| `AWS_ACCOUNT_ID` | AWS account ID |
| `VITE_WYA_API_URL` | WYA backend base URL (injected at build time) |
| `LUNA_CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution for cache invalidation |

---

## Related

[WYA — What's Your Aesthetic](https://github.com/ria0304/WYA-Whats-Your-Aesthetic) — the full wardrobe intelligence platform Luna connects to. Computer vision, style profiling, outfit matching, sustainability scoring — all the heavy lifting happens here.

---

*Luna is part of the WYA ecosystem. It does not store any wardrobe data independently.*
