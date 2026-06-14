// ─── Raw API response shapes from WYA (snake_case, matches Pydantic defaults) ─

/** Returned by GET /api/wardrobe — flat array of these */
export interface WardrobeItemAPI {
  item_id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  fabric?: string;
  image_url?: string;
  wear_count?: number;
  last_worn?: string;
  created_at?: string;
}

/** Returned by GET /api/outfits — each saved outfit */
export interface OutfitAPI {
  id: string;
  name: string;
  vibe?: string;
  items: WardrobeItemAPI[];
  created_date?: string;
  worn_count?: number;
  last_worn?: string;
}

/** Returned by POST /api/ai/curate-outfits */
export interface CuratedOutfitAPI {
  name: string;
  vibe?: string;
  occasion?: string;
  items: WardrobeItemAPI[];
}

/** Returned by GET /api/style/dna/{user_id} */
export interface StyleDnaAPI {
  has_dna: boolean;
  user_id?: string;
  styles?: string;         // JSON-serialised string: '["minimalist","classic"]'
  comfort_level?: string;
  summary?: string;
  created_at?: string;
}

/** Single gap entry inside the gap-analysis response */
export interface WardrobeGapAPI {
  category: string;
  description: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  affiliateQuery?: string;
  affiliateBrand?: string;
  affiliateUrl?: string;
  dnaAlignmentScore?: number;
  gender?: string;
}

/** Returned by POST /api/ai/gap-analysis */
export interface GapAnalysisAPI {
  gaps: WardrobeGapAPI[];
  primaryAesthetic?: string;
  dnaAlignmentScore?: number;
  neutralRatio?: number;
  patternRatio?: number;
  wardrobeCount?: number;
}

// ─── UI types (camelCase, used throughout Luna components) ────────────────────

export interface WardrobeItem {
  item_id: string;     // keep snake_case to match WYA — easier than aliasing
  name: string;
  category: string;
  color: string;
  fabric?: string;
  image_url?: string;
  wear_count?: number;
  // Derived / display helpers
  displayName: string;
}

export interface Outfit {
  id: string;
  name: string;
  vibe?: string;
  occasion?: string;
  items: WardrobeItem[];
}

export interface StyleDna {
  hasDna: boolean;
  styles: string[];        // parsed from the JSON string
  comfortLevel?: string;
  summary?: string;
  primaryStyle: string;    // styles[0] capitalised
}

export interface WardrobeGap {
  category: string;
  description: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  affiliateQuery?: string;
  affiliateUrl?: string;
}

export interface GapAnalysis {
  gaps: WardrobeGap[];
  primaryAesthetic?: string;
  wardrobeCount?: number;
  summary?: string;
}

export type LunaIntent =
  | 'outfit-help'
  | 'wardrobe-search'
  | 'gap-analysis'
  | 'style-explanation'
  | 'chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'luna';
  text: string;
  timestamp: string;
  intent?: LunaIntent;
  outfits?: Outfit[];
  wardrobeItems?: WardrobeItem[];
  styleDna?: StyleDna;
  gapAnalysis?: GapAnalysis;
  isLoading?: boolean;
}

export interface UserSession {
  user_id: string;
  email: string;
  full_name?: string;
  token: string;
  // Derived display fields
  profileName: string;     // full_name || email.split('@')[0]
  styleArchetype?: string; // populated after style/dna fetch if desired
}

// ─── Mapper functions — convert API shapes → UI types ─────────────────────────

export function mapWardrobeItem(raw: WardrobeItemAPI): WardrobeItem {
  return {
    item_id: raw.item_id,
    name: raw.name,
    category: raw.category,
    color: raw.color,
    fabric: raw.fabric,
    image_url: raw.image_url,
    wear_count: raw.wear_count,
    displayName: raw.name,
  };
}

export function mapOutfit(raw: OutfitAPI | CuratedOutfitAPI): Outfit {
  return {
    id: (raw as OutfitAPI).id || `curated-${Date.now()}-${Math.random()}`,
    name: raw.name,
    vibe: raw.vibe,
    occasion: (raw as OutfitAPI & { occasion?: string }).occasion,
    items: (raw.items || []).map(mapWardrobeItem),
  };
}

export function mapStyleDna(raw: StyleDnaAPI): StyleDna {
  let styles: string[] = [];
  if (raw.styles) {
    try {
      styles = JSON.parse(raw.styles);
    } catch {
      styles = [raw.styles];
    }
  }
  return {
    hasDna: raw.has_dna,
    styles,
    comfortLevel: raw.comfort_level,
    summary: raw.summary,
    primaryStyle: styles.length > 0
      ? styles[0].charAt(0).toUpperCase() + styles[0].slice(1)
      : 'Unknown',
  };
}

export function mapGapAnalysis(raw: GapAnalysisAPI): GapAnalysis {
  return {
    gaps: (raw.gaps || []).map(g => ({
      category: g.category,
      description: g.description,
      reason: g.reason,
      priority: g.priority,
      affiliateQuery: g.affiliateQuery,
      affiliateUrl: g.affiliateUrl,
    })),
    primaryAesthetic: raw.primaryAesthetic,
    wardrobeCount: raw.wardrobeCount,
    summary: raw.primaryAesthetic
      ? `Your primary aesthetic is ${raw.primaryAesthetic}. You have ${raw.wardrobeCount ?? '?'} items.`
      : undefined,
  };
}

export function mapUserSession(token: string, user: Record<string, any>): UserSession {
  return {
    user_id: user.user_id || '',
    email: user.email || '',
    full_name: user.full_name,
    token,
    profileName: user.full_name || (user.email ? user.email.split('@')[0] : 'there'),
  };
}
