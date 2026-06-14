/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  brand?: string;
  season: string[];
  imageUrl: string;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  occasion: string;
  items: WardrobeItem[];
}

export interface StyleDnaValue {
  label: string;
  value: string;
}

export interface StyleDna {
  archetype: string;
  profile: string;
  minimalistScore: number;
  details: string[];
  explainedValues: StyleDnaValue[];
}

export interface WardrobeGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface GapAnalysis {
  season: string;
  gaps: WardrobeGap[];
  summary: string;
}

export type LunaIntent = 'outfit-help' | 'wardrobe-search' | 'gap-analysis' | 'style-explanation' | 'chat';

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
  email: string;
  token: string;
  profileName: string;
  styleArchetype: string;
}
