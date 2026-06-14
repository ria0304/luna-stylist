/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LunaIntent } from '../types';
import { getIntentMetadata } from '../services/intent';
import { Sparkles, Search, Dna, AlertCircle, MessageCircle } from 'lucide-react';

interface IntentBadgeProps {
  intent: LunaIntent;
  visible: boolean;
}

export default function IntentBadge({ intent, visible }: IntentBadgeProps) {
  if (!visible) return null;

  const meta = getIntentMetadata(intent);
  
  const getIcon = () => {
    const iconSize = 13;
    switch (intent) {
      case 'outfit-help':
        return <Sparkles size={iconSize} className="mr-1 inline" />;
      case 'wardrobe-search':
        return <Search size={iconSize} className="mr-1 inline" />;
      case 'gap-analysis':
        return <AlertCircle size={iconSize} className="mr-1 inline" />;
      case 'style-explanation':
        return <Dna size={iconSize} className="mr-1 inline" />;
      default:
        return <MessageCircle size={iconSize} className="mr-1 inline" />;
    }
  };

  return (
    <div 
      id={`intent-badge-${intent}`}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${meta.color} transition-all duration-300 animate-fade-in`}
    >
      {getIcon()}
      <span className="opacity-90">{meta.label}</span>
      <span className="mx-1.5 opacity-40">|</span>
      <span className="text-[10px] opacity-75 font-mono tracking-tight">{meta.route}</span>
    </div>
  );
}
