/**
 * Luna — WYA API Service
 * Calls WYA's real FastAPI backend via CloudFront
 */

const WYA_BASE = import.meta.env.VITE_WYA_API_URL;

async function wyaRequest(endpoint: string, options: RequestInit = {}) {
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
    throw new Error(errorData.detail || errorData.error || `WYA API Error: ${response.statusText}`);
  }

  return response.json();
}

export const wyaApi = {
  // Login with real WYA credentials — returns JWT token
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

  // Logout — clear stored token
  logout() {
    localStorage.removeItem('luna_wya_token');
  },

  // Wardrobe — get all items, optionally filter by search query or category
  async getWardrobe(q?: string, category?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    const query = params.toString();
    return wyaRequest(`/api/wardrobe${query ? `?${query}` : ''}`);
  },

  // Outfit match — occasion-based outfit generation from real wardrobe
  async getOutfits(occasion?: string) {
    return wyaRequest('/api/ai/outfit-match', {
      method: 'POST',
      body: JSON.stringify({ occasion: occasion || 'casual' }),
    });
  },

  // Style DNA — returns archetype, scores, style profile
  async getStyleDna() {
    return wyaRequest('/api/style/dna');
  },

  // Gap analysis — returns missing categories and purchase suggestions
  async getGapAnalysis() {
    return wyaRequest('/api/ai/gap-analysis');
  },

  // Green score — sustainability rating for the wardrobe
  async getGreenScore() {
    return wyaRequest('/api/style/green-score');
  },
};
