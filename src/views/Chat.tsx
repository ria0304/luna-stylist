/**
 * Luna — Chat View
 * Routes natural language to WYA's real API endpoints.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserSession,
  ChatMessage,
  WardrobeItem,
  WardrobeItemAPI,
  mapWardrobeItem,
  mapOutfit,
  mapStyleDna,
  mapGapAnalysis,
  StyleDnaAPI,
  GapAnalysisAPI,
} from '../types';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { wyaApi } from '../services/api';
import { classifyIntent } from '../services/intent';
import { buildSmartReply } from '../services/smartReply';
import { clearSession } from '../services/auth';
import { LogOut, Settings, Sparkles, Grid, X, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  session: UserSession;
  onLogout: () => void;
}

export default function Chat({ session, onLogout }: ChatProps) {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [debugMode, setDebugMode]     = useState(false);
  const [closetOpen, setClosetOpen]   = useState(false);
  const [allItems, setAllItems]       = useState<WardrobeItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState(false);

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      sender: 'luna',
      text: `Hey ${session.profileName} 👋 I'm Luna — think of me as your personal stylist who actually knows your wardrobe.\n\nAsk me anything:\n\n• "Show me all my black tops"\n• "What should I wear to college tomorrow?"\n• "What am I missing for winter?"\n• "Why am I a minimalist?"`,
      timestamp: new Date().toISOString(),
      intent: 'chat',
    }]);
  }, [session.profileName]);

  // Pre-load entire wardrobe once — used for search filtering and outfit curation
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

  // ── Message handler ─────────────────────────────────────────────────────────

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
      console.error('Luna error:', err);

      // Auto-logout on 401
      if (err.message?.startsWith('401')) {
        handleDisconnect();
        return;
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `err-${Date.now()}`,
          sender: 'luna',
          text: `Something went wrong — give it another try in a second.`,
          timestamp: new Date().toISOString(),
          intent: 'chat',
        },
      ]);
    }
  };

  const buildResponse = async (text: string, intent: ChatMessage['intent']): Promise<ChatMessage> => {
    const base = { id: `l-${Date.now()}`, sender: 'luna' as const, timestamp: new Date().toISOString(), intent };

    switch (intent) {

      // ── Wardrobe search — client-side filter on cached items ────────────────
      case 'wardrobe-search': {
        const query = text.toLowerCase();
        const matched = allItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.color?.toLowerCase() ?? '').includes(query) ||
          (item.fabric?.toLowerCase() ?? '').includes(query)
        );
        return {
          ...base,
          text: matched.length > 0
            ? `Found ${matched.length} thing${matched.length > 1 ? 's' : ''} that match:`
            : `Nothing came up for that — try a different colour or type of clothing.`,
          wardrobeItems: matched,
        };
      }

      // ── Outfit help — saved outfits first, curate if empty ─────────────────
      case 'outfit-help': {
        const savedRaw = await wyaApi.getSavedOutfits();
        const saved = (savedRaw as any[]).map(mapOutfit);

        if (saved.length > 0) {
          return {
            ...base,
            text: `Here are some outfits you've saved — pick one or tell me the occasion and I'll narrow it down:`,
            outfits: saved.slice(0, 6),
          };
        }

        // Fall back to AI curation using wardrobe items
        if (allItems.length === 0) {
          return {
            ...base,
            text: `Your wardrobe is empty right now. Add some pieces in WYA and I'll start putting outfits together.`,
          };
        }

        const curatedRaw = await wyaApi.curateOutfits(allItems);
        const curated = ((curatedRaw as any).outfits || []).map(mapOutfit);

        return {
          ...base,
          text: curated.length > 0
            ? `Here are some outfit ideas pulled from your wardrobe:`
            : `Couldn't pull outfits together right now — try again in a moment.`,
          outfits: curated,
        };
      }

      // ── Gap analysis ────────────────────────────────────────────────────────
      case 'gap-analysis': {
        const raw = await wyaApi.getGapAnalysis() as GapAnalysisAPI;
        const data = mapGapAnalysis(raw);
        return {
          ...base,
          text: data.summary ?? `Here's what your wardrobe could use more of:`,
          gapAnalysis: data,
        };
      }

      // ── Style DNA ───────────────────────────────────────────────────────────
      case 'style-explanation': {
        const raw = await wyaApi.getStyleDna(session.user_id) as StyleDnaAPI;
        if (!raw.has_dna) {
          return {
            ...base,
            text: `You haven't done the Style DNA quiz in WYA yet — go do that first and then come back. It only takes a few minutes.`,
          };
        }
        const dna = mapStyleDna(raw);
        return {
          ...base,
          text: `Your style is **${dna.primaryStyle}**${dna.comfortLevel ? ` and your comfort level is ${dna.comfortLevel}` : ''}. ${dna.summary ?? ''}`,
          styleDna: dna,
        };
      }

      // ── Smart reply fallback ────────────────────────────────────────────────
      default:
        return buildSmartReply(text, allItems, base);
    }
  };

  const handleDisconnect = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent font-sans relative overflow-hidden">

      {/* Header */}
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
            onClick={() => setDebugMode(!debugMode)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              debugMode
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-800'
                : 'bg-white/45 text-zinc-600 dark:bg-zinc-900/45 dark:text-zinc-400 border-white/35 hover:bg-white/65'
            }`}
          >
            <Settings size={12} className={debugMode ? 'animate-spin-slow' : ''} />
            <span className="hidden sm:inline">Diagnostics</span>
            <span className="text-[9px] px-1 bg-zinc-550/10 dark:bg-white/10 rounded">
              {debugMode ? 'ON' : 'OFF'}
            </span>
          </button>

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

      <ChatWindow messages={messages} debugMode={debugMode} />
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={messages.length > 0 && messages[messages.length - 1].isLoading === true}
      />

      {/* Wardrobe drawer */}
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
