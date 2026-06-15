/**
 * Luna — Chat View
 * Routes natural language to WYA's real API endpoints with robust error handling.
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

  // Pre-load wardrobe
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
    const base = { id: `l-${Date.now()}`, sender: 'luna' as const, timestamp: new Date().toISOString(), intent };

    switch (intent) {
      case 'wardrobe-search': {
        const query = text.toLowerCase();
        const matched = allItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.color?.toLowerCase() ?? '').includes(query)
        );
        return {
          ...base,
          text: matched.length > 0
            ? `I found ${matched.length} items in your wardrobe that match your search:`
            : `I couldn't find anything matching that in your wardrobe. Try searching for a specific color or category?`,
          wardrobeItems: matched,
        };
      }

      case 'outfit-help': {
        // Try to fetch curated suggestions based on wardrobe state
        try {
          const curatedRaw = await wyaApi.curateOutfits(allItems);
          const curated = ((curatedRaw as any).outfits || []).map(mapOutfit);

          return {
            ...base,
            text: curated.length > 0
              ? `I've put together some looks based on what you have:`
              : `I need a few more items in your wardrobe to start building full outfits!`,
            outfits: curated,
          };
        } catch (e) {
          return { ...base, text: "I'm having trouble styling you right now. Let me try again in a bit!" };
        }
      }

      case 'gap-analysis': {
        const raw = await wyaApi.getGapAnalysis() as GapAnalysisAPI;
        const data = mapGapAnalysis(raw);
        return {
          ...base,
          text: data.summary || `Here's a breakdown of what's missing from your collection:`,
          gapAnalysis: data,
        };
      }

      case 'style-explanation': {
        const raw = await wyaApi.getStyleDna(session.user_id) as StyleDnaAPI;
        if (!raw.has_dna) {
          return {
            ...base,
            text: `It looks like we haven't analyzed your Style DNA yet. Head over to the main WYA app to take the quiz!`,
          };
        }
        const dna = mapStyleDna(raw);
        return {
          ...base,
          text: `Based on your wardrobe, your aesthetic is **${dna.primaryStyle}**. ${dna.summary || ''}`,
          styleDna: dna,
        };
      }

      default:
        // Fallback to the SmartReply engine for general chit-chat
        return buildSmartReply(text, allItems, base);
    }
  };

  const handleDisconnect = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent font-sans relative overflow-hidden">
      {/* Existing Header & UI Logic Remains Same */}
      <header className="border-b border-white/25 dark:border-zinc-900/40 bg-white/35 dark:bg-zinc-950/30 backdrop-blur-xl px-6 py-4 flex items-center justify-between shrink-0 relative z-10">
         {/* ... (Your existing header JSX) ... */}
      </header>

      <ChatWindow messages={messages} debugMode={debugMode} />
      
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={messages.length > 0 && messages[messages.length - 1].isLoading === true}
      />

      {/* Wardrobe Drawer */}
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
              className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-zinc-950 shadow-2xl z-40 border-l border-zinc-100 dark:border-zinc-900 flex flex-col"
            >
              {/* ... (Your existing wardrobe drawer content) ... */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
