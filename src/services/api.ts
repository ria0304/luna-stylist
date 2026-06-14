/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAuthToken } from './auth';

// Helper to make authenticated requests
async function wyaRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `WYA API Error: ${response.statusText}`);
  }

  return response.json();
}

export const wyaApi = {
  // Login against WYA Backend JWT Authenticator
  async login(email: string) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'secure_bypass_with_token' }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }
      return res.json();
    });
  },

  // Retrieve wardrobe items, optionally filtering with query string
  async getWardrobe(q?: string) {
    const path = q ? `/api/wardrobe?q=${encodeURIComponent(q)}` : '/api/wardrobe';
    return wyaRequest(path);
  },

  // Retrieve outfit suggestions, optionally filtering by occasion
  async getOutfits(occasion?: string) {
    const path = occasion ? `/api/outfits?occasion=${encodeURIComponent(occasion)}` : '/api/outfits';
    return wyaRequest(path);
  },

  // Get Style DNA
  async getStyleDna() {
    return wyaRequest('/api/style');
  },

  // Get Gap Analysis
  async getGapAnalysis() {
    return wyaRequest('/api/gap-analysis');
  },

  // Submit stylist conversation request
  async sendChat(message: string, history: any[], intent?: string) {
    return wyaRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, intent }),
    });
  },
};
