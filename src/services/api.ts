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
    return wyaRequest<any>('/api/weather');
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

  // ── FEATURE 2: Style DNA ────────────────────────────────────────────────────
  // Uses getStyleDna() above ^^

  // ── FEATURE 3: Aesthetic Aura ──────────────────────────────────────────────
  async getAestheticAura() {
    return wyaRequest<any>('/api/style/aura');
  },

  // ── FEATURE 4: Gap Analysis ─────────────────────────────────────────────────
  async getGapAnalysis() {
    return wyaRequest<any>('/api/ai/gap-analysis', {
      method: 'POST',
      body: JSON.stringify({}),
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
};
