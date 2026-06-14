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

  /**
   * GET /api/wardrobe
   * Returns a flat array of wardrobe items (snake_case fields).
   * WYA does not support ?q= filtering server-side — filtering is done client-side in Luna.
   */
  async getWardrobe() {
    return wyaRequest<unknown[]>('/api/wardrobe');
  },

  /**
   * GET /api/outfits
   * Returns saved outfits for the current user.
   * Used for the outfit-help intent (no image needed, unlike /api/ai/outfit-match).
   */
  async getSavedOutfits() {
    return wyaRequest<unknown[]>('/api/outfits');
  },

  /**
   * POST /api/ai/curate-outfits
   * Generates outfit suggestions from the wardrobe item list.
   * Body: { items: WardrobeItemAPI[] }
   * Used when the user asks what to wear and has no saved outfits.
   */
  async curateOutfits(items: unknown[]) {
    return wyaRequest<unknown>('/api/ai/curate-outfits', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  /**
   * GET /api/style/dna/{user_id}
   * Returns { has_dna, styles (JSON string), comfort_level, summary }
   */
  async getStyleDna(userId: string) {
    return wyaRequest<unknown>(`/api/style/dna/${userId}`);
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
   * GET /api/style/aura
   * Returns aesthetic breakdown percentages and dominant colors.
   */
  async getStyleAura() {
    return wyaRequest<unknown>('/api/style/aura');
  },
};
