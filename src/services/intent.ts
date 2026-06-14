/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LunaIntent } from '../types';

/**
 * Luna's client-side intent classifier.
 * Scans natural language for semantic keywords to predict/identify fashion routes.
 */
export const classifyIntent = (message: string): LunaIntent => {
  const norm = message.toLowerCase();

  // Outfit help patterns
  if (
    norm.includes('wear') || 
    norm.includes('outfit') || 
    norm.includes('college') || 
    norm.includes('tomorrow') ||
    norm.includes('occasion') || 
    norm.includes('dressed') || 
    norm.includes('match') ||
    norm.includes('dress')
  ) {
    return 'outfit-help';
  }

  // Wardrobe search patterns
  if (
    norm.includes('tops') || 
    norm.includes('black') || 
    norm.includes('jeans') || 
    norm.includes('pants') || 
    norm.includes('show') || 
    norm.includes('search') || 
    norm.includes('wardrobe') || 
    norm.includes('closet') ||
    norm.includes('trousers') ||
    norm.includes('sneakers') ||
    norm.includes('boots')
  ) {
    return 'wardrobe-search';
  }

  // Gap analysis patterns
  if (
    norm.includes('gap') || 
    norm.includes('missing') || 
    norm.includes('winter') || 
    norm.includes('summer') || 
    norm.includes('need') ||
    norm.includes('buy') ||
    norm.includes('expose') ||
    norm.includes('insufficient')
  ) {
    return 'gap-analysis';
  }

  // Style explanation patterns
  if (
    norm.includes('minimalist') || 
    norm.includes('dna') || 
    norm.includes('style') || 
    norm.includes('aesthetic') || 
    norm.includes('why am i') ||
    norm.includes('archetype')
  ) {
    return 'style-explanation';
  }

  return 'chat';
};

/**
 * Gets a human-friendly label and description for each intent to populate the debug badge.
 */
export const getIntentMetadata = (intent: LunaIntent) => {
  switch (intent) {
    case 'outfit-help':
      return {
        label: 'Outfit Recommendation',
        route: '/api/outfits',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
      };
    case 'wardrobe-search':
      return {
        label: 'Wardrobe Search',
        route: '/api/wardrobe',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
      };
    case 'gap-analysis':
      return {
        label: 'Gap Analysis',
        route: '/api/gap-analysis',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
      };
    case 'style-explanation':
      return {
        label: 'Style DNA Explanation',
        route: '/api/style',
        color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
      };
    default:
      return {
        label: 'Fallback Chat & Dialogue',
        route: '/api/chat',
        color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30'
      };
  }
};
