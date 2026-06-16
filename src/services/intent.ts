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
 *  2. aesthetic-aura     — "aura", "spotify wrapped", "style card", "vibe"
 *  3. gap-analysis       — "missing", "need", "what am i lacking", "buy"
 *  4. analytics          — "stats", "analytics", "dashboard", "wardrobe stats"
 *  5. outfit-help        — "wear", "outfit", "what should i", "look for", "dressed"
 *  6. wardrobe-search    — "show", "search", "find", "all my", specific garments
 *  7. feedback-like      — "like", "love", "favorite"
 *  8. feedback-dislike   — "dislike", "hate", "not a fan"
 *  9. chat               — fallback (now handled intelligently)
 */

interface IntentRule {
  intent: LunaIntent;
  required: string[];    // at least ONE must match
  veto?: string[];       // if any of these match, skip this rule
}

const RULES: IntentRule[] = [
  // 1. Style explanation (FEATURE 2)
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
      'describe my style',
      'my fashion sense',
      'minimalist',
      'avant-garde',
      'streetwear',
      'boho',
      'classic style',
      'cottagecore',
      'dark academia',
      'old money',
      'y2k',
      'my vibe',
      'fashion personality',
      'what kind of style',
      'my style identity',
      'aesthetic type',
      'fashion archetype',
    ],
  },

  // 2. Aesthetic Aura (FEATURE 3)
  {
    intent: 'aesthetic-aura',
    required: [
      'aura',
      'spotify wrapped',
      'spotify',
      'wrapped',
      'style card',
      'my vibe card',
      'aesthetic card',
      'show my aura',
      'my aesthetic aura',
      'generate aura',
      'vibe check',
      'fashion aura',
      'style aura',
      'what is my aura',
      'whats my aura',
      "what's my aura",
      'aura style',
      'aura card',
    ],
  },

  // 3. Gap analysis
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
      'should i get',
      'should i buy',
      'add to my wardrobe',
      'invest in',
      'need more',
      'upgrade my',
      'complete my wardrobe',
      'capsule wardrobe',
      'winter essentials',
      'summer essentials',
    ],
  },

  // 4. Analytics (NEW)
  {
    intent: 'analytics',
    required: [
      'wardrobe stats',
      'my stats',
      'analytics',
      'dashboard',
      'show my stats',
      'how many items',
      'most worn',
      'least worn',
      'total items',
      'wear count',
      'sustainability score',
      'my wardrobe health',
      'closet stats',
      'style stats',
      'wardrobe analytics',
    ],
  },

  // 5. Outfit help (FEATURE 1)
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
      'wear to',
      'wear for',
      'wear tomorrow',
      'wear today',
      'wear tonight',
      'wear this weekend',
      'college outfit',
      'work outfit',
      'party outfit',
      'casual outfit',
      'date outfit',
      'interview outfit',
      'wedding outfit',
      'formal outfit',
      'how should i dress',
      'help me get dressed',
      'what goes with',
      'pair with',
      'match with',
      'combine with',
      'get dressed',
      'dressing for',
      'outfit idea',
      'outfit inspiration',
      'lookbook',
    ],
  },

  // 6. Wardrobe search
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
      'my tops',
      'my dresses',
      'my jeans',
      'my pants',
      'my skirts',
      'my jackets',
      'my shoes',
      'my bags',
      'how many',
      'count my',
      'where is',
      'where are',
      'find me',
    ],
  },

  // 7. Feedback - Like (NEW)
  {
    intent: 'feedback-like',
    required: [
      'i like',
      'i love',
      'that is my favorite',
      'this is my favorite',
      'i really like',
      'i love this',
      'favorite outfit',
      'i like this outfit',
      'i love this outfit',
    ],
  },

  // 8. Feedback - Dislike (NEW)
  {
    intent: 'feedback-dislike',
    required: [
      'i dislike',
      'i hate',
      'not a fan',
      'i dont like',
      'i do not like',
      'i hate this',
      'i dislike this',
      'not my style',
      'not for me',
    ],
  },
];

export function classifyIntent(message: string): LunaIntent {
  const norm = message.toLowerCase();

  for (const rule of RULES) {
    if (rule.veto && rule.veto.some(v => norm.includes(v))) continue;
    if (rule.required.some(kw => norm.includes(kw))) return rule.intent;
  }

  return 'chat';
}

// ─── Debug badge metadata ─────────────────────────────────────────────────────

export const getIntentMetadata = (intent: LunaIntent) => {
  switch (intent) {
    case 'outfit-help':
      return {
        label: 'Outfit Suggestions',
        route: 'GET /api/weather → GET /api/style/dna → POST /api/ai/outfit-match',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
        description: 'Weather + Style DNA + AI Matcher',
      };
    case 'style-explanation':
      return {
        label: 'Style DNA',
        route: 'GET /api/style/dna/{user_id}',
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
        description: 'Your aesthetic type, color preference, comfort level, silhouette',
      };
    case 'aesthetic-aura':
      return {
        label: 'Aesthetic Aura',
        route: 'GET /api/style/aura',
        color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
        description: 'Spotify Wrapped-style style card',
      };
    case 'wardrobe-search':
      return {
        label: 'Wardrobe Search',
        route: 'GET /api/wardrobe (client-side filter)',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
        description: 'Search your wardrobe items',
      };
    case 'gap-analysis':
      return {
        label: 'Gap Analysis',
        route: 'POST /api/ai/gap-analysis',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
        description: 'Find what\'s missing from your wardrobe',
      };
    case 'analytics':
      return {
        label: 'Wardrobe Analytics',
        route: 'GET /api/dashboard/stats',
        color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30',
        description: 'Wardrobe stats, most/least worn, sustainability',
      };
    case 'feedback-like':
      return {
        label: 'Feedback (Like)',
        route: 'POST /api/feedback',
        color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30',
        description: 'Save feedback for outfit',
      };
    case 'feedback-dislike':
      return {
        label: 'Feedback (Dislike)',
        route: 'POST /api/feedback',
        color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
        description: 'Save feedback for outfit',
      };
    default:
      return {
        label: 'Smart Reply',
        route: 'wardrobe context + rule engine',
        color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30',
        description: 'Context-aware fallback responses',
      };
  }
};
