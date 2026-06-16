/**
 * Luna — WYA API Service
 * Calls WYA's real FastAPI backend via CloudFront
 */

const WYA_BASE = import.meta.env.VITE_WYA_API_URL as string;

async function wyaRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('luna_wya_token');

  const response = await fetch(`${WYA_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData.detail || errorData.error || response.statusText;
    throw new Error(`${response.status}: ${detail}`);
  }

  return response.json() as Promise<T>;
}

export const wyaApi = {
  // ── Generic HTTP Utility Methods ───────────────────────────────────────────
  /**
   * Generic GET request utility.
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return wyaRequest<T>(endpoint, { method: 'GET' });
  },

  /**
   * Generic POST request utility.
   */
  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return wyaRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ── Authentication ──────────────────────────────────────────────────────────
  /**
   * Authenticate with WYA credentials.
   * Returns { access_token, user: { user_id, email, full_name, gender, ... } }
   */
  async login(email: string, password: string) {
    const response = await fetch(`${WYA_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Authentication failed');
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('luna_wya_token', data.access_token);
    }
    return data as { access_token: string; user: Record<string, any> };
  },

  /** Clear stored token */
  logout() {
    localStorage.removeItem('luna_wya_token');
  },

  // ── Wardrobe ──────────────────────────────────────────────────────────────────
  /**
   * GET /api/wardrobe
   * Returns a flat array of wardrobe items (snake_case fields).
   */
  async getWardrobe() {
    return wyaRequest<unknown[]>('/api/wardrobe');
  },

  /**
   * GET /api/outfits
   * Returns saved outfits for the current user.
   */
  async getSavedOutfits() {
    return wyaRequest<unknown[]>('/api/outfits');
  },

  // ── FEATURE 1: Outfit Suggestions ──────────────────────────────────────────
  /**
   * GET /api/weather
   * Returns current weather data for the user's location.
   */
  async getWeather() {
    return wyaRequest<{
      condition: string;
      temperature: number;
      humidity: number;
      wind_speed: number;
      location: string;
    }>('/api/weather');
  },

  /**
   * GET /api/style/dna/{user_id}
   * Returns Style DNA data for the user.
   */
  async getStyleDna(userId: string) {
    return wyaRequest<{
      has_dna: boolean;
      styles: string;
      comfort_level: string;
      color_preference: string;
      silhouette: string;
      summary: string;
    }>(`/api/style/dna/${userId}`);
  },

  /**
   * POST /api/ai/outfit-match
   * Returns outfit suggestions based on occasion, weather, and style DNA.
   */
  async getOutfitMatch(occasion?: string, weather?: string) {
    return wyaRequest<{
      outfits: Array<{
        id: string;
        name: string;
        items: any[];
        reasoning: string;
        score: number;
      }>;
    }>('/api/ai/outfit-match', {
      method: 'POST',
      body: JSON.stringify({ occasion, weather }),
    });
  },

  // ── FEATURE 2: Style DNA Explanation ───────────────────────────────────────
  // Uses getStyleDna() above ^^

  // ── FEATURE 3: Aesthetic Aura ──────────────────────────────────────────────
  /**
   * GET /api/style/aura
   * Returns Aesthetic Aura data (Spotify Wrapped-style style card).
   */
  async getAestheticAura() {
    return wyaRequest<{
      styles: Array<{ name: string; percentage: number }>;
      dominantColors: Array<{ color: string; percentage: number }>;
      summary: string;
      aesthetic_type: string;
      vibe: string;
    }>('/api/style/aura');
  },

  // ── Existing Features ────────────────────────────────────────────────────────
  /**
   * POST /api/ai/curate-outfits
   * Generates outfit suggestions from the wardrobe item list.
   * Body: { items: WardrobeItemAPI[] }
   */
  async curateOutfits(items: unknown[]) {
    return wyaRequest<unknown>('/api/ai/curate-outfits', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * POST /api/ai/gap-analysis
   * Returns { gaps[], primaryAesthetic, wardrobeCount, ... }
   */
  async getGapAnalysis() {
    return wyaRequest<unknown>('/api/ai/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  /**
   * GET /api/style/aura (already defined above ^^)
   * Returns aesthetic breakdown percentages and dominant colors.
   */
  // async getStyleAura() { ... }  // Now renamed to getAestheticAura() for clarity

  /**
   * POST /api/trip/curate
   * Returns packing suggestions for a trip.
   */
  async getTripPacking(destination: string, days: number) {
    return wyaRequest<unknown>('/api/trip/curate', {
      method: 'POST',
      body: JSON.stringify({ destination, days }),
    });
  },

  /**
   * GET /api/evolution
   * Returns style evolution data over time.
   */
  async getEvolution() {
    return wyaRequest<unknown>('/api/evolution');
  },

  /**
   * GET /api/green-score
   * Returns sustainability score for the wardrobe.
   */
  async getGreenScore() {
    return wyaRequest<unknown>('/api/green-score');
  },
};
