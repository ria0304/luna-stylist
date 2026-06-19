/**
 * Luna — WYA API Service
 * Complete mapping of all WYA endpoints
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
  // ── Authentication ──────────────────────────────────────────────────────────
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
    return data;
  },

  logout() {
    localStorage.removeItem('luna_wya_token');
  },

  // ── Wardrobe ──────────────────────────────────────────────────────────────────
  async getWardrobe() {
    return wyaRequest<any[]>('/api/wardrobe');
  },

  async getWardrobeItem(itemId: string) {
    return wyaRequest<any>(`/api/wardrobe/${itemId}`);
  },

  async deleteWardrobeItem(itemId: string) {
    return wyaRequest<any>(`/api/wardrobe/${itemId}`, { method: 'DELETE' });
  },

  async archiveWardrobeItem(itemId: string) {
    return wyaRequest<any>(`/api/wardrobe/${itemId}/archive`, { method: 'POST' });
  },

  async wearWardrobeItem(itemId: string) {
    return wyaRequest<any>(`/api/wardrobe/${itemId}/wear`, { method: 'POST' });
  },

  // ── Outfits ──────────────────────────────────────────────────────────────────
  async getSavedOutfits() {
    return wyaRequest<any[]>('/api/outfits');
  },

  async getOutfit(outfitId: string) {
    return wyaRequest<any>(`/api/outfits/${outfitId}`);
  },

  async markOutfitWorn(outfitId: string) {
    return wyaRequest<any>(`/api/outfits/${outfitId}/worn`, { method: 'POST' });
  },

  // ── FEATURE 1: Outfit Suggestions ──────────────────────────────────────────
  async getWeather() {
    return wyaRequest<any>('/api/ai/weather');
  },

  async getStyleDna(userId: string) {
    return wyaRequest<any>(`/api/style/dna/${userId}`);
  },

  async saveStyleDna(data: any) {
    return wyaRequest<any>('/api/style/dna', { method: 'POST', body: JSON.stringify(data) });
  },

  async getOutfitMatch(occasion?: string, weather?: string, temperature?: number) {
    return wyaRequest<any>('/api/ai/outfit-match', {
      method: 'POST',
      body: JSON.stringify({ occasion, weather, temperature }),
    });
  },

  async curateOutfits(items: any[]) {
    return wyaRequest<any>('/api/ai/curate-outfits', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // ── FEATURE 1b: Context-Aware Outfit Match ─────────────────────────────────
  async getOutfitMatchContext(context: any, limit?: number) {
    return wyaRequest<any>('/api/ai/outfit-match-context', {
      method: 'POST',
      body: JSON.stringify({ context, limit: limit || 5 }),
    });
  },

  // ── FEATURE 1c: Outfit Scoring ─────────────────────────────────────────────
  async scoreOutfit(outfit: any) {
    return wyaRequest<any>('/api/ai/outfit-score', {
      method: 'POST',
      body: JSON.stringify({ outfit }),
    });
  },

  // ── FEATURE 2: Style DNA ────────────────────────────────────────────────────
  // Uses getStyleDna() above ^^

  async getStyleAnalytics() {
    return wyaRequest<any>('/api/style/analytics');
  },

  async getEvolutionHistory() {
    return wyaRequest<any>('/api/style/evolution/history');
  },

  // ── FEATURE 3: Aesthetic Aura ──────────────────────────────────────────────
  async getAestheticAura() {
    return wyaRequest<any>('/api/style/aura');
  },

  // ── FEATURE 4: Gap Analysis ─────────────────────────────────────────────────
  async getGapAnalysis(inspiredCategory?: string, includeLinks?: boolean) {
    return wyaRequest<any>('/api/ai/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({ inspired_category: inspiredCategory, include_shopping_links: includeLinks }),
    });
  },

  // ── FEATURE 5: Evolution ────────────────────────────────────────────────────
  async getStyleEvolution() {
    return wyaRequest<any>('/api/style/evolution');
  },

  // ── FEATURE 6: Green Score ──────────────────────────────────────────────────
  async getGreenScore() {
    return wyaRequest<any>('/api/ai/green-audit', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // ── FEATURE 7: Travel Packing ──────────────────────────────────────────────
  async getVacationPacker(destination: string, days: number, weather?: string) {
    return wyaRequest<any>('/api/ai/vacation-packer', {
      method: 'POST',
      body: JSON.stringify({ destination, days, weather }),
    });
  },

  // ── FEATURE 8: Recommendations ─────────────────────────────────────────────
  async getRecommendations() {
    return wyaRequest<any>('/api/recommend/outfit', { method: 'POST' });
  },

  async getSimilarItems(itemId: string) {
    return wyaRequest<any>(`/api/recommend/similar/${itemId}`);
  },

  // ── FEATURE 9: Dashboard ────────────────────────────────────────────────────
  async getDashboardStats() {
    return wyaRequest<any>('/api/dashboard/stats');
  },

  async getActivityTimeline(days?: number) {
    return wyaRequest<any>(`/api/dashboard/activity?days=${days || 30}`);
  },

  // ── FEATURE 6b: Feedback ────────────────────────────────────────────────────
  async saveFeedback(action: string, outfitId?: string, itemId?: string, context?: any) {
    return wyaRequest<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ action, outfit_id: outfitId, item_id: itemId, context }),
    });
  },

  async getFeedbackHistory(limit?: number) {
    return wyaRequest<any>(`/api/feedback/history?limit=${limit || 50}`);
  },

  async getFeedbackStats() {
    return wyaRequest<any>('/api/feedback/stats');
  },

  // ── FEATURE 10: User Profile ───────────────────────────────────────────────
  async getProfile() {
    return wyaRequest<any>('/api/user/profile');
  },

  async updateProfile(data: any) {
    return wyaRequest<any>('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) });
  },

  async getPreferences() {
    return wyaRequest<any>('/api/user/preferences');
  },

  async updatePreferences(data: any) {
    return wyaRequest<any>('/api/user/preferences', { method: 'PUT', body: JSON.stringify(data) });
  },

  async getUserActivity() {
    return wyaRequest<any>('/api/user/activity');
  },

  async getWearTimeline() {
    return wyaRequest<any>('/api/user/wear-timeline');
  },

  // ── Weather Search ──────────────────────────────────────────────────────────
  async searchWeather(query: string) {
    return wyaRequest<any>('/api/ai/weather-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // ── FEATURE 11: Wardrobe Analytics ─────────────────────────────────────────
  async getWardrobeAnalytics() {
    return wyaRequest<any>('/api/wardrobe/analytics');
  },

  async getStyleEvolutionData() {
    return wyaRequest<any>('/api/wardrobe/analytics/evolution');
  },
};


// ── Luna's own backend (LLM-powered general fashion Q&A) ───────────────────

const LUNA_BASE = import.meta.env.VITE_LUNA_API_URL as string;

export const lunaApi = {
  async chat(message: string, token: string, wardrobeItems: any[] = []) {
    const response = await fetch(`${LUNA_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        token,
        wardrobe_items: wardrobeItems,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`${response.status}: ${err.detail || response.statusText}`);
    }

    return response.json() as Promise<{ reply: string; intent: string; data?: any }>;
  },
};
