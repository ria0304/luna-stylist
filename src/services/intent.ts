import { LunaIntent } from '../types';

/**
 * Luna's intent classifier.
 *
 * Rules are evaluated in ORDER — the first match wins.
 * Each rule has a set of positive keywords and optional negative keywords
 * (veto words that prevent a match even if positives hit).
 *
 * Priority:
 *  1. style-explanation  — "why am i", "dna", "aesthetic", "archetype"
 *  2. gap-analysis       — "missing", "need", "what am i lacking", "buy"
 *  3. outfit-help        — "wear", "outfit", "what should i", "look for", "dressed"
 *  4. wardrobe-search    — "show", "search", "find", "all my", specific garments
 *  5. chat               — fallback
 */

interface IntentRule {
  intent: LunaIntent;
  required: string[];    // at least ONE must match
  veto?: string[];       // if any of these match, skip this rule
}

const RULES: IntentRule[] = [
  // 1. Style explanation — check BEFORE gap/outfit so "my aesthetic" doesn't get lost
  {
    intent: 'style-explanation',
    required: [
      'why am i',
      'style dna',
      'my dna',
      'my aesthetic',
      'my archetype',
      'style profile',
      'style type',
      'what is my style',
      "what's my style",
      'explain my style',
      'minimalist',
      'avant-garde',
      'streetwear',
      'boho',
      'classic style',
    ],
  },

  // 2. Gap analysis — check BEFORE outfit-help to catch "i need a black dress"
  {
    intent: 'gap-analysis',
    required: [
      'what am i missing',
      'what do i need',
      "i'm missing",
      'i am missing',
      'wardrobe gap',
      'gap in my',
      "what's missing",
      'what should i buy',
      'what to buy',
      'what to add',
      'lacking',
      'wardrobe needs',
    ],
  },

  // 3. Outfit help — intentional "what to wear" phrasing
  {
    intent: 'outfit-help',
    required: [
      'what should i wear',
      'what to wear',
      'outfit for',
      'outfit to',
      'dress for',
      'dress to',
      'look for',
      'dressed for',
      'what do i wear',
      'suggest an outfit',
      'recommend an outfit',
      'style me',
      'put together',
      'put an outfit',
    ],
  },

  // 4. Wardrobe search — show / search / find specific items
  {
    intent: 'wardrobe-search',
    required: [
      'show me',
      'show my',
      'show all',
      'search my',
      'find my',
      'find all',
      'all my',
      'list my',
      'do i have',
      'do i own',
      'what do i have',
      "what's in my wardrobe",
      'in my wardrobe',
      'in my closet',
    ],
  },
];

export function classifyIntent(message: string): LunaIntent {
  const norm = message.toLowerCase();

  for (const rule of RULES) {
    // Check veto words first
    if (rule.veto && rule.veto.some(v => norm.includes(v))) continue;
    // Check at least one required keyword
    if (rule.required.some(kw => norm.includes(kw))) return rule.intent;
  }

  return 'chat';
}

// ─── Debug badge metadata ─────────────────────────────────────────────────────

export const getIntentMetadata = (intent: LunaIntent) => {
  switch (intent) {
    case 'outfit-help':
      return {
        label: 'Outfit Recommendation',
        route: 'GET /api/outfits → POST /api/ai/curate-outfits',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
      };
    case 'wardrobe-search':
      return {
        label: 'Wardrobe Search',
        route: 'GET /api/wardrobe (client-side filter)',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
      };
    case 'gap-analysis':
      return {
        label: 'Gap Analysis',
        route: 'POST /api/ai/gap-analysis',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
      };
    case 'style-explanation':
      return {
        label: 'Style DNA',
        route: 'GET /api/style/dna/{user_id}',
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
      };
    default:
      return {
        label: 'General Chat',
        route: '—',
        color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30',
      };
  }
};
