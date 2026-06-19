/**
 * Luna — Chat View
 * Routes natural language directly to WYA's real orchestration API endpoints.
 */

import React, { useState, useEffect } from 'react';
import {
  UserSession,
  ChatMessage,
  WardrobeItem,
  WardrobeItemAPI,
  mapWardrobeItem,
  mapOutfit,
  mapStyleDna,
  mapGapAnalysis,
} from '../types';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { wyaApi } from '../services/api';
import { classifyIntent } from '../services/intent';
import { buildSmartReply } from '../services/smartReply';
import { clearSession } from '../services/auth';
import { LogOut, Sparkles, Grid, X, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  session: UserSession;
  onLogout: () => void;
}

export default function Chat({ session, onLogout }: ChatProps) {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [closetOpen, setClosetOpen]   = useState(false);
  const [allItems, setAllItems]       = useState<WardrobeItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState(false);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      sender: 'luna',
      text: `Hey ${session.profileName}, I'm Luna — your personal stylist who knows your wardrobe.\n\nAsk me anything:\n\n- "Show me all my black tops"\n- "What should I wear to college tomorrow?"\n- "What am I missing for winter?"\n- "Why am I a minimalist?"\n- "Show me my Aesthetic Aura"\n- "Show me my wardrobe stats"`,
      timestamp: new Date().toISOString(),
      intent: 'chat',
    }]);
  }, [session.profileName]);

  useEffect(() => {
    (async () => {
      setLoadingCloset(true);
      try {
        const raw = await wyaApi.getWardrobe();
        setAllItems((raw as WardrobeItemAPI[]).map(mapWardrobeItem));
      } catch (err) {
        console.error('Wardrobe load failed:', err);
      } finally {
        setLoadingCloset(false);
      }
    })();
  }, []);

  const handleSendMessage = async (text: string) => {
    const intent = classifyIntent(text);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    
    const loadMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      sender: 'luna',
      text: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
      intent,
    };
    
    setMessages(prev => [...prev, userMsg, loadMsg]);

    try {
      const responseMsg = await buildResponse(text, intent);
      setMessages(prev => [...prev.filter(m => !m.isLoading), responseMsg]);
    } catch (err: any) {
      console.error('Luna Service Error:', err);

      if (err.status === 401 || err.message?.includes('401')) {
        handleDisconnect();
        return;
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `err-${Date.now()}`,
          sender: 'luna',
          text: `I'm having trouble connecting to my fashion brain right now. Check your connection or try again.`,
          timestamp: new Date().toISOString(),
          intent: 'chat',
        },
      ]);
    }
  };

  const buildResponse = async (text: string, intent: ChatMessage['intent']): Promise<ChatMessage> => {
    const base = { 
      id: `l-${Date.now()}`, 
      sender: 'luna' as const, 
      timestamp: new Date().toISOString(), 
      intent 
    };

    switch (intent) {
      case 'outfit-help': {
        try {
          const occasion = extractOccasion(text);
          const [weather, dna] = await Promise.all([
            wyaApi.getWeather().catch(() => ({ condition: 'unknown', temp: 0 })),
            wyaApi.getStyleDna(session.userId).catch(() => ({ has_dna: false })),
          ]);
          const outfits = await wyaApi.getOutfitMatchContext({
            occasion,
            weather: weather.condition,
            temperature: weather.temp,
          }, 5).catch(() => ({ outfits: [] }));

          if (!outfits.outfits || outfits.outfits.length === 0) {
            return {
              ...base,
              text: `I couldn't create any outfits from your current wardrobe. Try uploading more items first.`
            };
          }

          let responseText = '';
          const weatherText = weather.condition && weather.condition !== 'unknown' 
            ? `the ${weather.condition} weather (${weather.temp ?? ''}°C)` 
            : 'your current weather';
            
          if (dna.has_dna && dna.styles) {
            responseText = `Based on your ${dna.styles} style and ${weatherText}, here are some looks I curated for you:`;
          } else {
            responseText = `Based on ${weatherText}, here are some outfits from your wardrobe:`;
          }

          return {
            ...base,
            text: responseText,
            outfits: outfits.outfits.map((o: any) => ({
              ...o,
              reasoning: o.reasoning || `This look combines your items perfectly.`
            })),
          };
        } catch (error) {
          console.error('Outfit help error:', error);
          return {
            ...base,
            text: `I'm having trouble styling you right now. Make sure you have items in your wardrobe and try again.`
          };
        }
      }

      case 'style-explanation': {
        try {
          const dna = await wyaApi.getStyleDna(session.userId);
          
          if (!dna.has_dna || !dna.styles) {
            return {
              ...base,
              text: `You haven't completed your Style DNA quiz yet. Head to WYA and take the quiz to discover your aesthetic. It only takes 2 minutes.`
            };
          }
          
          let explanation = `Your Style DNA: ${dna.styles}\n\n`;
          explanation += `Color Preference: ${dna.color_preference || 'Varied'}\n`;
          explanation += `Comfort Level: ${dna.comfort_level || 'Moderate'}\n`;
          if (dna.silhouette) {
            explanation += `Silhouette: ${dna.silhouette}\n\n`;
          }
          explanation += dna.summary || `Your style is ${dna.styles} — you prefer ${dna.color_preference?.toLowerCase() || 'vibrant'} colors and ${dna.comfort_level?.toLowerCase() || 'comfortable'} fits.`;
          
          return {
            ...base,
            text: explanation,
            styleDna: dna,
          };
        } catch (error) {
          console.error('Style DNA error:', error);
          return {
            ...base,
            text: `I'm having trouble reading your Style DNA right now. Make sure you've completed the quiz in WYA.`
          };
        }
      }

      case 'aesthetic-aura': {
        try {
          const aura = await wyaApi.getAestheticAura();
          
          if (!aura || !aura.styles || aura.styles.length === 0) {
            return {
              ...base,
              text: `You don't have enough wardrobe data to generate your Aesthetic Aura yet. Upload more items to WYA and try again.`
            };
          }
          
          let auraText = `Your Aesthetic Aura\n\n`;
          auraText += `${aura.aesthetic_type || 'Unique'} Vibe\n\n`;
          auraText += `Style Breakdown:\n`;
          
          aura.styles.forEach((style: any) => {
            auraText += `  - ${style.name}: ${style.percentage}%\n`;
          });
          
          if (aura.dominantColors && aura.dominantColors.length > 0) {
            auraText += `\nDominant Colors:\n`;
            aura.dominantColors.forEach((color: any) => {
              auraText += `  - ${color.color}: ${color.percentage}%\n`;
            });
          }
          
          if (aura.summary) {
            auraText += `\n${aura.summary}`;
          }
          
          return {
            ...base,
            text: auraText,
            styleDna: aura,
          };
        } catch (error) {
          console.error('Aesthetic Aura error:', error);
          return {
            ...base,
            text: `I'm having trouble generating your Aesthetic Aura right now. Make sure you have enough wardrobe data and try again.`
          };
        }
      }

      case 'wardrobe-search': {
        const query = text.toLowerCase();
        const matched = allItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.color?.toLowerCase() ?? '').includes(query) ||
          (item.fabric?.toLowerCase() ?? '').includes(query)
        );
        
        if (matched.length > 0) {
          return {
            ...base,
            text: `I found ${matched.length} item${matched.length > 1 ? 's' : ''} in your wardrobe that match "${text}":`,
            wardrobeItems: matched,
          };
        }
        
        const categories = [...new Set(allItems.map(i => i.category))];
        const colors = [...new Set(allItems.map(i => i.color))];
        const fabrics = [...new Set(allItems.map(i => i.fabric).filter(Boolean))];
        
        let suggestions = 'Try searching for:\n';
        if (colors.length > 0) suggestions += `- Colors: ${colors.join(', ')}\n`;
        if (categories.length > 0) suggestions += `- Categories: ${categories.join(', ')}\n`;
        if (fabrics.length > 0) suggestions += `- Fabrics: ${fabrics.join(', ')}`;
        
        return {
          ...base,
          text: `I couldn't find anything matching "${text}" in your wardrobe.\n\n${suggestions}`,
          wardrobeItems: [],
        };
      }

      case 'gap-analysis': {
        try {
          const gaps = await wyaApi.getGapAnalysis();
          const data = gaps as any;
          
          if (!data.gaps || data.gaps.length === 0) {
            return {
              ...base,
              text: `Your wardrobe looks well-rounded. You have a good mix of items. Keep up the great style.`
            };
          }
          
          let gapText = `Wardrobe Gap Analysis\n\n`;
          gapText += `Your primary aesthetic is ${data.primaryAesthetic || 'unique'}. You have ${data.wardrobeCount || 0} items.\n\n`;
          gapText += `What you're missing:\n`;
          
          data.gaps.slice(0, 5).forEach((gap: any) => {
            const priority = gap.priority || 'medium';
            const priorityLabel = priority === 'high' ? '[High]' : priority === 'medium' ? '[Medium]' : '[Low]';
            gapText += `  ${priorityLabel} ${gap.category} - ${gap.suggestion || gap.reason || ''}\n`;
          });
          
          return {
            ...base,
            text: gapText,
            gapAnalysis: data,
          };
        } catch (error) {
          console.error('Gap analysis error:', error);
          return {
            ...base,
            text: `I couldn't run a complete scan on your wardrobe right now. Make sure you have items uploaded and try again.`
          };
        }
      }

      case 'analytics': {
        try {
          const stats = await wyaApi.getDashboardStats();
          
          let statsText = `Wardrobe Stats\n\n`;
          statsText += `Total Items: ${stats.wardrobe_count || 0}\n`;
          statsText += `Total Wears: ${stats.total_wears || 0}\n`;
          statsText += `Style Archetype: ${stats.style_archetype || 'Not set'}\n`;
          statsText += `Sustainability Score: ${stats.sustainability_score || 0}%\n`;
          statsText += `New Items (30 days): ${stats.new_items_30_days || 0}\n\n`;
          
          if (stats.most_worn_item) {
            statsText += `Most Worn: ${stats.most_worn_item.name} (${stats.most_worn_item.wear_count} times)\n`;
          }
          
          if (stats.least_worn_item) {
            statsText += `Least Worn: ${stats.least_worn_item.name} (${stats.least_worn_item.wear_count} times)\n`;
          }
          
          return {
            ...base,
            text: statsText,
          };
        } catch (error) {
          console.error('Analytics error:', error);
          return {
            ...base,
            text: `I'm having trouble fetching your wardrobe stats right now. Try again later.`
          };
        }
      }

      case 'feedback-like': {
        try {
          const outfitId = extractOutfitId(text);
          await wyaApi.saveFeedback('like', outfitId);
          return {
            ...base,
            text: `Thanks for your feedback! I'll remember that you liked this.`
          };
        } catch (error) {
          return {
            ...base,
            text: `I couldn't save your feedback. Try again.`
          };
        }
      }

      case 'feedback-dislike': {
        try {
          const outfitId = extractOutfitId(text);
          await wyaApi.saveFeedback('dislike', outfitId);
          return {
            ...base,
            text: `Thanks for your feedback! I'll remember that you didn't like this and suggest different styles.`
          };
        } catch (error) {
          return {
            ...base,
            text: `I couldn't save your feedback. Try again.`
          };
        }
      }

      default: {
        return buildSmartReply(text, allItems, base, session.token);
      }
    }
  };

  function extractOccasion(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('college') || lower.includes('class') || lower.includes('school')) return 'casual';
    if (lower.includes('work') || lower.includes('meeting') || lower.includes('office')) return 'formal';
    if (lower.includes('party') || lower.includes('club') || lower.includes('night out')) return 'party';
    if (lower.includes('date') || lower.includes('dinner') || lower.includes('romantic')) return 'romantic';
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('sport')) return 'athleisure';
    if (lower.includes('beach') || lower.includes('pool') || lower.includes('summer')) return 'beach';
    return 'everyday';
  }

  function extractOutfitId(text: string): string | undefined {
    const match = text.match(/outfit[_\s]?id[_\s]?[:=]?\s*([a-zA-Z0-9-]+)/i);
    return match ? match[1] : undefined;
  }

  const handleDisconnect = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent font-sans relative overflow-hidden">
      
      <header className="border-b border-white/25 dark:border-zinc-900/40 bg-white/35 dark:bg-zinc-950/30 backdrop-blur-xl px-6 py-4 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] rounded-full flex items-center justify-center shadow-xs border border-white/40">
            <span className="font-serif italic font-bold text-base text-zinc-850">l</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif italic font-bold text-base text-zinc-950 dark:text-zinc-50 tracking-wide">
                luna
              </h1>
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-sans tracking-tight flex items-center gap-1">
              <Sparkles size={10} className="text-pink-400/80" />
              WYA Stylist • {session.profileName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setClosetOpen(true)}
            className="p-1.5 bg-white/45 dark:bg-zinc-900/45 border border-white/35 dark:border-zinc-800/40 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-sans text-xs flex items-center gap-1.5 cursor-pointer backdrop-blur-sm hover:bg-white/65"
          >
            <Grid size={13} />
            <span className="hidden sm:inline font-medium">Wardrobe</span>
            <span className="bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {allItems.length}
            </span>
          </button>

          <button
            onClick={handleDisconnect}
            className="p-1.5 bg-white/45 dark:bg-zinc-900/45 hover:bg-red-50/50 text-zinc-500 hover:text-red-600 border border-white/30 rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      <ChatWindow messages={messages} />
      
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={messages.length > 0 && messages[messages.length - 1].isLoading === true}
      />

      <AnimatePresence>
        {closetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setClosetOpen(false)}
              className="absolute inset-0 bg-black z-30 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-zinc-950 shadow-2xl z-40 border-l border-zinc-100 dark:border-zinc-900 flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900/80 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-serif italic font-semibold text-md text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Shirt className="text-pink-400" size={16} />
                    {session.profileName}&apos;s Wardrobe
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                    {allItems.length} items synced from WYA
                  </p>
                </div>
                <button
                  onClick={() => setClosetOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 bg-zinc-50 dark:bg-zinc-900 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingCloset ? (
                  <div className="text-center py-12 text-xs text-zinc-400 italic">
                    Loading your wardrobe from WYA...
                  </div>
                ) : allItems.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-400 italic">
                    No wardrobe items found. Add items in WYA first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {allItems.map(item => (
                      <div
                        key={item.item_id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-800 rounded-2xl overflow-hidden p-2 flex flex-col group"
                      >
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                              <Shirt size={28} />
                            </div>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md text-[8px] text-zinc-100 font-mono px-1 rounded uppercase">
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-2.5 flex-1 flex flex-col justify-between">
                          <h5 className="font-sans font-medium text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-1">
                            {item.name}
                          </h5>
                          <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                            <span className="capitalize">{item.color}</span>
                            {item.fabric && <span className="capitalize">{item.fabric}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
