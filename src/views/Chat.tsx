/**
 * Luna — Chat View
 * Connects to real WYA API endpoints
 */

import React, { useState, useEffect } from 'react';
import { UserSession, ChatMessage, WardrobeItem } from '../types';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { wyaApi } from '../services/api';
import { classifyIntent } from '../services/intent';
import { clearSession } from '../services/auth';
import {
  LogOut,
  Settings,
  Sparkles,
  Grid,
  X,
  Shirt,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  session: UserSession;
  onLogout: () => void;
}

export default function Chat({ session, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [closetOpen, setClosetOpen] = useState<boolean>(false);
  const [closetItems, setClosetItems] = useState<WardrobeItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState<boolean>(false);

  // Welcome message on load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial-welcome',
          sender: 'luna',
          text: `Hi ${session.profileName || 'there'} 👋 I'm Luna, your WYA stylist.\n\nI can see your wardrobe, style profile, and wardrobe gaps. Try asking:\n\n• "What should I wear to college tomorrow?"\n• "Show my black tops"\n• "What am I missing for winter?"\n• "Why am I a minimalist?"`,
          timestamp: new Date().toISOString(),
          intent: 'chat'
        }
      ]);
    }
  }, [session]);

  // Pre-load wardrobe for the closet drawer
  useEffect(() => {
    const loadCloset = async () => {
      setLoadingCloset(true);
      try {
        const items = await wyaApi.getWardrobe();
        setClosetItems(Array.isArray(items) ? items : items.items || []);
      } catch (err) {
        console.error('Failed to load wardrobe:', err);
      } finally {
        setLoadingCloset(false);
      }
    };
    loadCloset();
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
      id: `l-loading-${Date.now()}`,
      sender: 'luna',
      text: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
      intent
    };

    setMessages(prev => [...prev, userMsg, loadMsg]);

    try {
      let responseMsg: ChatMessage = {
        id: `l-${Date.now()}`,
        sender: 'luna',
        timestamp: new Date().toISOString(),
        intent,
        text: ''
      };

      // Route to correct WYA endpoint based on intent
      if (intent === 'wardrobe-search') {
        const items = await wyaApi.getWardrobe(text);
        const results = Array.isArray(items) ? items : items.items || [];
        responseMsg.text = results.length > 0
          ? `Found ${results.length} item${results.length > 1 ? 's' : ''} in your wardrobe:`
          : "I couldn't find any matching items in your wardrobe.";
        responseMsg.wardrobeItems = results;

      } else if (intent === 'outfit-help') {
        const data = await wyaApi.getOutfits(text);
        const outfits = Array.isArray(data) ? data : data.outfits || [];
        responseMsg.text = outfits.length > 0
          ? "Here are some outfits from your wardrobe:"
          : "I couldn't generate outfits right now. Try adding more items to your wardrobe.";
        responseMsg.outfits = outfits;

      } else if (intent === 'gap-analysis') {
        const data = await wyaApi.getGapAnalysis();
        responseMsg.text = data.summary || "Here's what's missing from your wardrobe:";
        responseMsg.gapAnalysis = data;

      } else if (intent === 'style-explanation') {
        const data = await wyaApi.getStyleDna();
        responseMsg.text = `Your style archetype is **${data.archetype || data.primary_archetype}**. ${data.profile || data.description || ''}`;
        responseMsg.styleDna = data;

      } else {
        // Fallback chat — use gap analysis or style DNA as context
        responseMsg.text = "I'm Luna, your WYA stylist. Ask me about your outfits, wardrobe, style profile, or what you're missing.";
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        responseMsg
      ]);

    } catch (error: any) {
      console.error('Luna API error:', error);

      if (error.message?.includes('401') || error.message?.includes('expired')) {
        handleDisconnect();
        return;
      }

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id: `l-err-${Date.now()}`,
          sender: 'luna',
          text: `Something went wrong: ${error.message}. Please try again.`,
          timestamp: new Date().toISOString(),
          intent: 'chat'
        }
      ]);
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
              WYA Stylist • {session.profileName || 'your wardrobe'}
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
              {closetItems.length}
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
                    {closetItems.length} items synced from WYA
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
                ) : closetItems.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-400 italic">
                    No wardrobe items found. Add items in WYA first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {closetItems.map((item: WardrobeItem) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-800 rounded-2xl overflow-hidden p-2 flex flex-col group"
                      >
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={item.imageUrl || item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md text-[8px] text-zinc-100 font-mono px-1 rounded uppercase">
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-2.5 flex-1 flex flex-col justify-between">
                          <h5 className="font-sans font-medium text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-1">
                            {item.name}
                          </h5>
                          <span className="text-[9px] text-zinc-400 block mt-0.5">
                            {item.brand || ''}
                          </span>
                          <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                            <span className="capitalize">{item.dominant_color || item.color}</span>
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
