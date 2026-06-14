/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI client of @google/genai SDK
// We set the User-Agent as required by the build instructions.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// WYA Backend Database (Wardrobe, Outfits, Style DNA, Gap Analysis)
const wardrobeItems = [
  {
    id: "w1",
    name: "Black Cashmere Turtleneck",
    category: "Tops",
    color: "Black",
    brand: "Uniqlo U",
    season: ["Winter", "Autumn"],
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w2",
    name: "Beige Wool Trench Coat",
    category: "Outerwear",
    color: "Beige",
    brand: "Lemaire",
    season: ["Autumn", "Spring"],
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w3",
    name: "Charcoal Wool Blazer",
    category: "Outerwear",
    color: "Charcoal",
    brand: "Theory",
    season: ["Autumn", "Winter"],
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w4",
    name: "Dark Wash Slim Jeans",
    category: "Bottoms",
    color: "Indigo",
    brand: "Nudie Jeans",
    season: ["Spring", "Summer", "Autumn", "Winter"],
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w5",
    name: "Classic White Leather Sneakers",
    category: "Shoes",
    color: "White",
    brand: "Common Projects",
    season: ["Spring", "Summer", "Autumn"],
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w6",
    name: "Black Silk Button-Up Shirt",
    category: "Tops",
    color: "Black",
    brand: "Equipment",
    season: ["Spring", "Summer", "Autumn"],
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w7",
    name: "Tan Suede Chelsea Boots",
    category: "Shoes",
    color: "Tan",
    brand: "Saint Laurent",
    season: ["Autumn", "Winter"],
    imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w8",
    name: "Gray Pleated Trousers",
    category: "Bottoms",
    color: "Gray",
    brand: "COS",
    season: ["Spring", "Autumn", "Winter"],
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w9",
    name: "Olive Green Utility Jacket",
    category: "Outerwear",
    color: "Olive",
    brand: "Barbour",
    season: ["Autumn", "Spring"],
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "w10",
    name: "White Heavyweight T-Shirt",
    category: "Tops",
    color: "White",
    brand: "Lady White Co.",
    season: ["Spring", "Summer"],
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop"
  }
];

const outfits = [
  {
    id: "o1",
    name: "Modern Academic",
    description: "A sophisticated structured outfit pairing warm black textures with grey structure and boots.",
    occasion: "college, studying, presentation, work",
    items: ["w8", "w1", "w3", "w7"]
  },
  {
    id: "o2",
    name: "Minimalist Classic",
    description: "An effortless clean casual look suitable for layered weather. Comfortably paired with white sneakers.",
    occasion: "college, casual hangouts, weekend, coffee run",
    items: ["w4", "w10", "w2", "w5"]
  },
  {
    id: "o3",
    name: "Sleek Minimalist",
    description: "A sharp, refined dark evening aesthetic. Features premium silk draping paired with warm tan boots.",
    occasion: "dinner, date night, party, semi-formal",
    items: ["w8", "w6", "w7"]
  },
  {
    id: "o4",
    name: "Urban Explorer",
    description: "Cozy black layer combined with an olive utility jacket and casual white footwear details.",
    occasion: "travel, walking, errands, casual weekend",
    items: ["w4", "w1", "w9", "w5"]
  }
];

const styleDna = {
  archetype: "Elevated Minimalist",
  profile: "Your aesthetic leans heavily on a high-synergy capsule wardrobe philosophy. You focus on luxury texture pairings, structural cuts, and a deeply cohesive neutral color palette (black, gray, beige, white, and subtle olive). This results in high versatility: nearly every item in your closet pairs together effortlessly.",
  minimalistScore: 92,
  details: [
    "Neutral palette dominance: 80% of items reside in a neutral, matching colorspace.",
    "Capsule efficiency: Extremely high synergy, averaging 4.5 distinct outfits per individual piece.",
    "Texture contrast priority: Leverages material friction (wool vs smooth silk vs soft cashmere) to create visual depth without styling noise."
  ],
  explainedValues: [
    { label: "Color Palette", value: "Dominated by deep charcoal, soft beige, rich black, and clean optic white." },
    { label: "Material Focus", value: "Natural luxury fabrics: Cashmere, virgin wool, heavy cotton, and soft mulberry silk." },
    { label: "Choice Pattern", value: "Intentionality. Buying fewer high-craft items instead of high-frequency fast changes." }
  ]
};

const gapAnalysis = {
  season: "Autumn / Winter",
  gaps: [
    {
      category: "Tops",
      description: "Lacking visual middle layers—specifically thick structural cardigans or oatmeal knit pullovers to introduce warmth.",
      priority: "medium",
      suggestion: "A charcoal or oatmeal ribbed wool cardigan to safely layer over silk shirts."
    },
    {
      category: "Accessories",
      description: "No heavy-duty cold-weather accessories (scarves, beanies) matching your neutral palette.",
      priority: "low",
      suggestion: "A thick premium beige cashmere scarf to seamlessly join your wool trench coat."
    },
    {
      category: "Shoes",
      description: "Extremely vulnerable to wet winter elements. Present options (suede, white canvas) will distress in heavy rain or slush.",
      priority: "high",
      suggestion: "A durable piece like waterproof black leather minimal lug boots."
    }
  ],
  summary: "Your wardrobe represents a highly functional layering array for mild transition climates, but is structurally exposed to heavy winter elements and sub-zero precipitation."
};

// --- API ENDPOINTS ---

// 1. Auth Endpoint (Mock Auth using base64 tokens to simulate real JWT storage)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate simple payload base64 to simulate JWT
  const payload = {
    email,
    profileName: "Alexis",
    styleArchetype: "Elevated Minimalist",
    exp: Date.now() + 60 * 60 * 24 * 1000 // 1 day
  };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  res.json({
    token,
    user: {
      email,
      profileName: "Alexis",
      styleArchetype: "Elevated Minimalist"
    }
  });
});

// Middleware to mock JWT authentication from authorization headers
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. WYA API requires authentication." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.exp < Date.now()) {
      return res.status(401).json({ error: "WYA access token expired. Please log in again." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
};

// 2. Full Wardrobe Listing & Search
app.get("/api/wardrobe", authenticate, (req: any, res) => {
  const { q, category } = req.query as { q?: string; category?: string };
  let items = [...wardrobeItems];

  if (category) {
    items = items.filter(
      item => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (q) {
    const term = q.toLowerCase();
    items = items.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        item.color.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.brand && item.brand.toLowerCase().includes(term))
    );
  }

  res.json(items);
});

// 3. Outfits Recommendations
app.get("/api/outfits", authenticate, (req, res) => {
  const { occasion } = req.query as { occasion?: string };
  let results = outfits.map(o => ({
    ...o,
    items: o.items.map(itemId => wardrobeItems.find(item => item.id === itemId)!)
  }));

  if (occasion) {
    const term = occasion.toLowerCase();
    results = results.filter(
      o =>
        o.occasion.toLowerCase().includes(term) ||
        o.name.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term)
    );
  }

  res.json(results);
});

// 4. Style DNA Info
app.get("/api/style", authenticate, (req, res) => {
  res.json(styleDna);
});

// 5. Gap Analysis Info
app.get("/api/gap-analysis", authenticate, (req, res) => {
  res.json(gapAnalysis);
});

// 6. Conversational Stylist Routing & Generation Core
app.post("/api/chat", authenticate, async (req: any, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // If Gemini key is not present, we will gracefully respond with mock stylist responses that guide the user.
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Offline fallback classifier & natural response
      const lowercaseMsg = message.toLowerCase();
      let reply = "";
      let intent: "outfit-help" | "wardrobe-search" | "gap-analysis" | "style-explanation" | "chat" = "chat";
      let recommendedOutfitIds: string[] = [];
      let foundItemIds: string[] = [];
      let showStyleDna = false;
      let showGapAnalysis = false;

      if (lowercaseMsg.includes("wear") || lowercaseMsg.includes("outfit") || lowercaseMsg.includes("college") || lowercaseMsg.includes("tomorrow") || lowercaseMsg.includes("dinner")) {
        intent = "outfit-help";
        if (lowercaseMsg.includes("college") || lowercaseMsg.includes("tomorrow")) {
          reply = "I've picked out some perfect outfits for college tomorrow! The **Minimalist Classic** is exceptional for a laid-back, highly versatile layered look. If you have a presentation, definitely lean on the **Modern Academic** with your pleated trousers and Theory wool blazer.";
          recommendedOutfitIds = ["o1", "o2"];
        } else if (lowercaseMsg.includes("dinner") || lowercaseMsg.includes("date")) {
          reply = "For dinner, the **Sleek Minimalist** is an absolute stunner. The soft gloss of your Black Silk Button-Up pairs masterfully with the gray pleated trousers and Tan Suede boots.";
          recommendedOutfitIds = ["o3"];
        } else {
          reply = "Based on your current closet, I highly suggest trying one of your core lifestyle looks! Here are your recommended capsule wardrobe combinations:";
          recommendedOutfitIds = ["o1", "o2", "o3", "o4"];
        }
      } else if (lowercaseMsg.includes("tops") || lowercaseMsg.includes("black") || lowercaseMsg.includes("jeans") || lowercaseMsg.includes("show") || lowercaseMsg.includes("search") || lowercaseMsg.includes("wardrobe")) {
        intent = "wardrobe-search";
        if (lowercaseMsg.includes("black")) {
          reply = "I've scanned your wardrobe and found your two gorgeous black pieces: the Uniqlo U **Black Cashmere Turtleneck** and the luxury Equipment **Black Silk Button-Up**.";
          foundItemIds = ["w1", "w6"];
        } else if (lowercaseMsg.includes("tops") || lowercaseMsg.includes("shirt")) {
          reply = "Scanning your collection, you own some wonderful tops, including cashmere, premium silk, and fine heavy cotton:";
          foundItemIds = ["w1", "w6", "w10"];
        } else {
          reply = "Scanned your closet space! Here are matching pieces from your capsule archive:";
          foundItemIds = ["w1", "w4", "w5", "w8"];
        }
      } else if (lowercaseMsg.includes("gap") || lowercaseMsg.includes("missing") || lowercaseMsg.includes("winter") || lowercaseMsg.includes("need")) {
        intent = "gap-analysis";
        reply = "I've run a gap analysis on your wardrobe for the chilly season. Your primary critical gap is **Shoes**—your current white sneakers and suede boots are highly vulnerable to heavy rain or slush. I highly suggest adding waterproof black leather minimal lug boots. Here is your full wardrobe gap priority breakdown:";
        showGapAnalysis = true;
      } else if (lowercaseMsg.includes("minimalist") || lowercaseMsg.includes("dna") || lowercaseMsg.includes("aesthetic") || lowercaseMsg.includes("why am i") || lowercaseMsg.includes("style")) {
        intent = "style-explanation";
        reply = "Your WYA Style DNA classifies you as an **Elevated Minimalist**. Your score is an exceptional **92%**, reflecting an impeccable capsule structure. You prioritize clean lines, rich material friction, and a gorgeous neutral palette. Let's look at your full aesthetic DNA scorecard:";
         showStyleDna = true;
      } else {
        reply = "Hi Alexis! I'm Luna, your WYA conversational stylist. I have full clarity on your virtual wardrobe, Style DNA, and seasonal gaps. Ask me something like:\n\n* 'What should I wear to college tomorrow?'\n* 'Show all my black styles'\n* 'What am I missing for winter?'\n* 'Explain my Style DNA'";
      }

      const mappedOutfits = recommendedOutfitIds.map(id => {
        const outfit = outfits.find(o => o.id === id)!;
        return {
          ...outfit,
          items: outfit.items.map(itemId => wardrobeItems.find(w => w.id === itemId)!)
        };
      });

      const mappedItems = foundItemIds.map(id => wardrobeItems.find(w => w.id === id)!);

      return res.json({
        text: reply,
        intent,
        outfits: mappedOutfits.length > 0 ? mappedOutfits : undefined,
        wardrobeItems: mappedItems.length > 0 ? mappedItems : undefined,
        styleDna: showStyleDna ? styleDna : undefined,
        gapAnalysis: showGapAnalysis ? gapAnalysis : undefined
      });
    }

    // --- GEMINI POWERED INTELLIGENT ROUTER & WRITER ---
    const chatContextPrompt = `
You are "Luna", an elegant, humble, and exceptionally stylish conversational wardrobe assistant for WYA (What's Your Aesthetic).
You know everything about the user "Alexis" who has logged into their closet.

Alexis's Capsule Closet Database:
${JSON.stringify({ wardrobeItems, outfits, styleDna, gapAnalysis }, null, 2)}

User's current message: "${message}"

You must respond as Luna in a highly fashion-literate, helpful, warm, and sophisticated manner.
Keep your answer completely factual to Alexis's real items. Do NOT invent clothing pieces that do not exist, unless suggesting things to buy under the "gap-analysis" or "gaps" requests.

Task:
You must classify the user's message into one of the following fashion intents:
1. 'outfit-help': they ask what to wear, college clothing suggestions, outfit matching, etc.
2. 'wardrobe-search': they want to locate specific items, show black tops, list styles, search pants, etc.
3. 'gap-analysis': they ask what is missing, what is needed for winter, closet gaps, etc.
4. 'style-explanation': they ask about their style DNA archetype, why they are a minimalist, aesthetic values.
5. 'chat': standard conversational greetings, simple fashion philosophies, general chit-chat.

You MUST reply with a JSON object parsing the message and returning the recommended pieces or layouts.
The response must adhere to the following strict JSON schema structure:
{
  "reply": "A beautiful, well-paragraphed markdown conversational response from Luna, maintaining her warm and stylish persona. Use bold names for items, and write elegantly.",
  "intent": "outfit-help | wardrobe-search | gap-analysis | style-explanation | chat",
  "recommendedOutfitIds": ["o1", "o2", etc - list matching outfit IDs ONLY if intent is outfit-help or requested],
  "foundItemIds": ["w1", "w2", etc - list matching wardrobe item IDs if they search items, or if highly relevant to query],
  "showStyleDna": true/false (set true ONLY if they ask about style DNA, minimalist archetype, or explanation),
  "showGapAnalysis": true/false (set true ONLY if they ask what is missing, winter gap analysis, cold weather gaps)
}
`;

    const modelSelection = "gemini-3.5-flash"; // Valid model under basic text/JSON task
    const response = await ai.models.generateContent({
      model: modelSelection,
      contents: chatContextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "Elegant, stylish markdown-supported chat reply from Luna." },
            intent: { type: Type.STRING, description: "Classified intent." },
            recommendedOutfitIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended outfit IDs (e.g. ['o1'])"
            },
            foundItemIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specifically found wardrobe item IDs (e.g. ['w1', 'w6'])"
            },
            showStyleDna: { type: Type.BOOLEAN, description: "True if style DNA dashboard must be shown." },
            showGapAnalysis: { type: Type.BOOLEAN, description: "True if wardrobe gap analysis must be shown." }
          },
          required: ["reply", "intent"]
        }
      }
    });

    const bodyText = response.text?.trim() || "{}";
    const data = JSON.parse(bodyText);

    // Map recommending data from db structure
    const mappedOutfits = (data.recommendedOutfitIds || []).map((id: string) => {
      const outfit = outfits.find(o => o.id === id);
      if (!outfit) return null;
      return {
        ...outfit,
        items: outfit.items.map(itemId => wardrobeItems.find(w => w.id === itemId)!)
      };
    }).filter(Boolean);

    const mappedItems = (data.foundItemIds || []).map((id: string) => {
      return wardrobeItems.find(w => w.id === id);
    }).filter(Boolean);

    res.json({
      text: data.reply,
      intent: data.intent || "chat",
      outfits: mappedOutfits.length > 0 ? mappedOutfits : undefined,
      wardrobeItems: mappedItems.length > 0 ? mappedItems : undefined,
      styleDna: data.showStyleDna ? styleDna : undefined,
      gapAnalysis: data.showGapAnalysis ? gapAnalysis : undefined
    });

  } catch (error: any) {
    console.error("Gemini stylist generation error:", error);
    res.status(500).json({ error: "Luna's fashion database could not compile style recommendation: " + error.message });
  }
});


// Dev & Production Serving Setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LUNA WYA ENGINE] Running cleanly at http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error("Failed to start Luna server:", err);
});
