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
  price?: number;
  brand?: string;
  sustainability_score?: number;
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

// ── FEATURE 1: Outfit Suggestions (Weather + AI Matcher) ──────────────────

/** Returned by GET /api/weather */
export interface WeatherAPI {
  condition: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  location: string;
}

/** Returned by POST /api/ai/outfit-match */
export interface OutfitMatchAPI {
  outfits: Array<{
    id: string;
    name: string;
    items: WardrobeItemAPI[];
    reasoning: string;
    score: number;
  }>;
}

/** Returned by GET /api/style/dna/{user_id} */
export interface StyleDnaAPI {
  has_dna: boolean;
  user_id?: string;
  styles?: string;         // JSON-serialised string: '["minimalist","classic"]'
  comfort_level?: string;
  color_preference?: string;
  silhouette?: string;
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
  shopping_suggestions?: ShoppingSuggestionsAPI;
  price_range?: PriceRangeAPI;
}

/** Shopping suggestions from gap analysis */
export interface ShoppingSuggestionsAPI {
  amazon?: string;
  myntra?: string;
  search_query?: string;
  price_range?: PriceRangeAPI;
}

/** Price range suggestion */
export interface PriceRangeAPI {
  min: number;
  max: number;
  currency: string;
}

/** Returned by POST /api/ai/gap-analysis */
export interface GapAnalysisAPI {
  gaps: WardrobeGapAPI[];
  primaryAesthetic?: string;
  dnaAlignmentScore?: number;
  neutralRatio?: number;
  patternRatio?: number;
  wardrobeCount?: number;
  sustainability_score?: number;
  shopping_links_included?: boolean;
}

// ── FEATURE 3: Aesthetic Aura ──────────────────────────────────────────────

/** Returned by GET /api/style/aura */
export interface AestheticAuraAPI {
  styles: Array<{ name: string; percentage: number }>;
  dominantColors: Array<{ color: string; percentage: number }>;
  summary: string;
  aesthetic_type: string;
  vibe: string;
}

// ── FEATURE 5: Dashboard & Analytics ──────────────────────────────────────

/** Returned by GET /api/dashboard/stats */
export interface DashboardStatsAPI {
  wardrobe_count: number;
  total_wears: number;
  most_worn_item: {
    name: string;
    wear_count: number;
  } | null;
  least_worn_item: {
    name: string;
    wear_count: number;
  } | null;
  new_items_30_days: number;
  style_archetype: string;
  sustainability_score: number;
  gap_items_count: number;
  recent_activity: Array<{
    type: string;
    created_at: string;
  }>;
  last_updated: string;
}

/** Returned by GET /api/dashboard/activity */
export interface ActivityTimelineAPI {
  wear_logs: Array<{
    created_at: string;
    item_id: string;
    occasion: string;
    weather: string;
  }>;
  feedback_logs: Array<{
    created_at: string;
    action: string;
    outfit_id: string;
  }>;
  total_wears: number;
  total_feedback: number;
  period_days: number;
}

// ── FEATURE 6: Feedback ────────────────────────────────────────────────────

/** Returned by GET /api/feedback/history */
export interface FeedbackItemAPI {
  feedback_id: number;
  user_id: string;
  outfit_id: string | null;
  item_id: string | null;
  action: 'like' | 'dislike' | 'save' | 'wear' | 'skip';
  context: string;
  created_at: string;
}

/** Returned by GET /api/feedback/stats */
export interface FeedbackStatsAPI {
  total_feedback: number;
  likes: number;
  dislikes: number;
  saves: number;
  wears: number;
  satisfaction_rate: number;
}

// ── FEATURE 9: Wardrobe Analytics ──────────────────────────────────────────

/** Returned by GET /api/wardrobe/analytics */
export interface WardrobeAnalyticsAPI {
  total_items: number;
  total_value: number;
  most_worn: Array<{
    name: string;
    item_id: string;
    wear_count: number;
    category: string;
    color: string;
    last_worn: string | null;
  }>;
  least_worn: Array<{
    name: string;
    item_id: string;
    wear_count: number;
    category: string;
    color: string;
    created_at: string;
  }>;
  cost_per_wear: Array<{
    name: string;
    item_id: string;
    price: number;
    wear_count: number;
    cost_per_wear: number;
    category: string;
    color: string;
  }>;
  category_distribution: Record<string, number>;
  color_distribution: Record<string, number>;
  sustainability_score: number;
  average_wear_count: number;
}

/** Returned by GET /api/wardrobe/analytics/evolution */
export interface StyleEvolutionAPI {
  has_evolution: boolean;
  message?: string;
  trajectory: Array<{
    timestamp: string;
    archetype: string;
    colors: string[];
    comfort_level: number;
  }>;
  current_archetype?: string;
  first_archetype?: string;
  evolution_direction?: string;
  total_snapshots: number;
  timespan?: {
    start: string;
    end: string;
  };
}

// ─── UI types (camelCase, used throughout Luna components) ────────────────────

export interface WardrobeItem {
  item_id: string;
  name: string;
  category: string;
  color: string;
  fabric?: string;
  image_url?: string;
  wear_count?: number;
  price?: number;
  brand?: string;
  sustainability_score?: number;
  displayName: string;
}

export interface Outfit {
  id: string;
  name: string;
  vibe?: string;
  occasion?: string;
  items: WardrobeItem[];
  reasoning?: string;
  score?: number;
}

export interface StyleDna {
  hasDna: boolean;
  styles: string[];
  comfortLevel?: string;
  colorPreference?: string;
  silhouette?: string;
  summary?: string;
  primaryStyle: string;
}

export interface WardrobeGap {
  category: string;
  description: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  affiliateQuery?: string;
  affiliateUrl?: string;
  shoppingSuggestions?: ShoppingSuggestions;
  priceRange?: PriceRange;
}

export interface ShoppingSuggestions {
  amazon?: string;
  myntra?: string;
  searchQuery?: string;
  priceRange?: PriceRange;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface GapAnalysis {
  gaps: WardrobeGap[];
  primaryAesthetic?: string;
  wardrobeCount?: number;
  summary?: string;
  sustainabilityScore?: number;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  location: string;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  items: WardrobeItem[];
  reasoning: string;
  score: number;
}

export interface AestheticAura {
  styles: Array<{ name: string; percentage: number }>;
  dominantColors: Array<{ color: string; percentage: number }>;
  summary: string;
  aestheticType: string;
  vibe: string;
}

// ── FEATURE 5: Dashboard UI Types ──────────────────────────────────────────

export interface DashboardStats {
  wardrobeCount: number;
  totalWears: number;
  mostWornItem: { name: string; wearCount: number } | null;
  leastWornItem: { name: string; wearCount: number } | null;
  newItems30Days: number;
  styleArchetype: string;
  sustainabilityScore: number;
  gapItemsCount: number;
  recentActivity: Array<{ type: string; createdAt: string }>;
  lastUpdated: string;
}

export interface ActivityTimeline {
  wearLogs: Array<{ createdAt: string; itemId: string; occasion: string; weather: string }>;
  feedbackLogs: Array<{ createdAt: string; action: string; outfitId: string }>;
  totalWears: number;
  totalFeedback: number;
  periodDays: number;
}

// ── FEATURE 6: Feedback UI Types ───────────────────────────────────────────

export interface FeedbackItem {
  feedbackId: number;
  userId: string;
  outfitId: string | null;
  itemId: string | null;
  action: 'like' | 'dislike' | 'save' | 'wear' | 'skip';
  context: Record<string, any>;
  createdAt: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  likes: number;
  dislikes: number;
  saves: number;
  wears: number;
  satisfactionRate: number;
}

// ── Chat & Session ───────────────────────────────────────────────────────────

export type LunaIntent =
  | 'outfit-help'
  | 'wardrobe-search'
  | 'gap-analysis'
  | 'style-explanation'
  | 'aesthetic-aura'
  | 'analytics'
  | 'feedback-like'
  | 'feedback-dislike'
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
  aestheticAura?: AestheticAura;
  dashboardStats?: DashboardStats;
  isLoading?: boolean;
}

export interface UserSession {
  user_id: string;
  email: string;
  full_name?: string;
  token: string;
  profileName: string;
  styleArchetype?: string;
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
    price: raw.price,
    brand: raw.brand,
    sustainability_score: raw.sustainability_score,
    displayName: raw.name,
  };
}

export function mapOutfit(raw: OutfitAPI | CuratedOutfitAPI | any): Outfit {
  return {
    id: (raw as OutfitAPI).id || `curated-${Date.now()}-${Math.random()}`,
    name: raw.name,
    vibe: raw.vibe,
    occasion: (raw as OutfitAPI & { occasion?: string }).occasion,
    items: (raw.items || []).map(mapWardrobeItem),
    reasoning: raw.reasoning,
    score: raw.score,
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
    colorPreference: raw.color_preference,
    silhouette: raw.silhouette,
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
      shoppingSuggestions: g.shopping_suggestions ? {
        amazon: g.shopping_suggestions.amazon,
        myntra: g.shopping_suggestions.myntra,
        searchQuery: g.shopping_suggestions.search_query,
        priceRange: g.shopping_suggestions.price_range,
      } : undefined,
      priceRange: g.price_range,
    })),
    primaryAesthetic: raw.primaryAesthetic,
    wardrobeCount: raw.wardrobeCount,
    summary: raw.primaryAesthetic
      ? `Your primary aesthetic is ${raw.primaryAesthetic}. You have ${raw.wardrobeCount ?? '?'} items.`
      : undefined,
    sustainabilityScore: raw.sustainability_score,
  };
}

export function mapWeather(raw: WeatherAPI): WeatherData {
  return {
    condition: raw.condition || 'unknown',
    temperature: raw.temperature || 0,
    humidity: raw.humidity || 0,
    wind_speed: raw.wind_speed || 0,
    location: raw.location || 'Unknown',
  };
}

export function mapAestheticAura(raw: AestheticAuraAPI): AestheticAura {
  return {
    styles: raw.styles || [],
    dominantColors: raw.dominantColors || [],
    summary: raw.summary || 'Your style is uniquely you!',
    aestheticType: raw.aesthetic_type || 'Unique',
    vibe: raw.vibe || 'Authentic',
  };
}

export function mapDashboardStats(raw: DashboardStatsAPI): DashboardStats {
  return {
    wardrobeCount: raw.wardrobe_count,
    totalWears: raw.total_wears,
    mostWornItem: raw.most_worn_item ? {
      name: raw.most_worn_item.name,
      wearCount: raw.most_worn_item.wear_count,
    } : null,
    leastWornItem: raw.least_worn_item ? {
      name: raw.least_worn_item.name,
      wearCount: raw.least_worn_item.wear_count,
    } : null,
    newItems30Days: raw.new_items_30_days,
    styleArchetype: raw.style_archetype,
    sustainabilityScore: raw.sustainability_score,
    gapItemsCount: raw.gap_items_count,
    recentActivity: raw.recent_activity.map(a => ({
      type: a.type,
      createdAt: a.created_at,
    })),
    lastUpdated: raw.last_updated,
  };
}

export function mapFeedbackItem(raw: any): FeedbackItem {
  return {
    feedbackId: raw.feedback_id,
    userId: raw.user_id,
    outfitId: raw.outfit_id,
    itemId: raw.item_id,
    action: raw.action,
    context: raw.context ? JSON.parse(raw.context) : {},
    createdAt: raw.created_at,
  };
}

export function mapFeedbackStats(raw: FeedbackStatsAPI): FeedbackStats {
  return {
    totalFeedback: raw.total_feedback,
    likes: raw.likes,
    dislikes: raw.dislikes,
    saves: raw.saves,
    wears: raw.wears,
    satisfactionRate: raw.satisfaction_rate,
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
