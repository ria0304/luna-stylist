/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  Terminal, 
  Cpu, 
  Sparkles, 
  Grid, 
  ChevronRight, 
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

  // Initialize with a welcoming greeting from Luna
  useEffect(() => {
    // Check if there are any existing messages
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial-welcome',
          sender: 'luna',
          text: `Hi ${session.profileName}. I am Luna, your private fashion stylist.\n\nI have fully synchronized with your capsule closet. I understand your unique silhouette, your favorite colorways, and your signature aesthetic profile. How shall I style you today?\n\nTry asking: "What should I wear to college tomorrow?", "Select my black statement pieces", or "What am I missing for an autumn capsule?"`,
          timestamp: new Date().toISOString(),
          intent: 'chat'
        }
      ]);
    }
  }, [session]);

  // Fetch full wardrobe closet items in background to support the "Closet Inventory" drawer
  useEffect(() => {
    const loadCloset = async () => {
      setLoadingCloset(true);
      try {
        const items = await wyaApi.getWardrobe();
        setClosetItems(items);
      } catch (err) {
        console.error('Failed to pre-cache closet items:', err);
      } finally {
        setLoadingCloset(false);
      }
    };
    loadCloset();
  }, []);

  const handleSendMessage = async (text: string) => {
    // 1. Assign client-side estimated localized intent before network request
    const predictedIntent = classifyIntent(text);

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
      intent: predictedIntent // display predicted intent on the loader!
    };

    setMessages(prev => [...prev, userMsg, loadMsg]);

    try {
      // Setup minimal history array
      const historyLog = messages
        .filter(m => m.id !== 'initial-welcome')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Call Express routing proxy
      const response = await wyaApi.sendChat(text, historyLog, predictedIntent);

      // Replace the loader with actual response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const modelResponse: ChatMessage = {
          id: `l-${Date.now()}`,
          sender: 'luna',
          text: response.text,
          timestamp: new Date().toISOString(),
          intent: response.intent,
          outfits: response.outfits,
          wardrobeItems: response.wardrobeItems,
          styleDna: response.styleDna,
          gapAnalysis: response.gapAnalysis
        };
        return [...filtered, modelResponse];
      });

    } catch (error: any) {
      console.error('Luna styler endpoint error:', error);
      
      // Auto-disconnect if authenticated token was flagged 401 expired
      if (error.message && error.message.includes('expired')) {
        handleDisconnect();
        return;
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        const errorResponse: ChatMessage = {
          id: `l-err-${Date.now()}`,
          sender: 'luna',
          text: `My style intelligence module ran into an unexpected connection interruption: ${error.message}. Please try again shortly.`,
          timestamp: new Date().toISOString(),
          intent: 'chat'
        };
        return [...filtered, errorResponse];
      });
    }
  };

  const handleDisconnect = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent font-sans relative overflow-hidden">
      
      {/* Top Header Panel */}
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
              Bespoke Stylist • profiling {session.profileName}
            </p>
          </div>
        </div>

        {/* Action button groupings */}
        <div className="flex items-center gap-3">
          {/* Debug toggle layout */}
          <button
            id="debug-toggle-btn"
            onClick={() => setDebugMode(!debugMode)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              debugMode
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-800 dark:border-zinc-200'
                : 'bg-white/45 text-zinc-600 dark:bg-zinc-900/45 dark:text-zinc-400 border-white/35 dark:border-zinc-800/40 hover:bg-white/65 dark:hover:bg-zinc-855'
            }`}
            title="Toggle style diagnostics"
          >
            <Settings size={12} className={debugMode ? "animate-spin-slow" : ""} />
            <span className="hidden sm:inline">Diagnostics</span>
            <span className="text-[9px] px-1 bg-zinc-550/10 dark:bg-white/10 rounded font-sans">
              {debugMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Wardrobe inspection drawer trigger */}
          <button
            id="closet-drawer-btn"
            onClick={() => setClosetOpen(true)}
            className="p-1.5 bg-white/45 dark:bg-zinc-900/45 border border-white/35 dark:border-zinc-800/40 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-sans text-xs flex items-center gap-1.5 cursor-pointer shadow-3xs backdrop-blur-sm hover:bg-white/65 dark:hover:bg-zinc-900/65"
          >
            <Grid size={13} />
            <span className="hidden sm:inline font-medium">Capsule Vault</span>
            <span className="bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {closetItems.length}
            </span>
          </button>

          {/* Logout button */}
          <button
            id="signout-btn"
            onClick={handleDisconnect}
            className="p-1.5 bg-white/45 dark:bg-zinc-900/45 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-450 hover:text-red-650 dark:hover:text-red-400 border border-white/30 dark:border-zinc-800/40 rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
            title="Disconnect WYA Closet Node"
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Main chat window stack */}
      <ChatWindow messages={messages} debugMode={debugMode} />

      {/* Footer input form */}
      <ChatInput onSendMessage={handleSendMessage} disabled={messages.length > 0 && messages[messages.length - 1].isLoading === true} />

      {/* Slide-out side drawer for "Closet Inventory" */}
      <AnimatePresence>
        {closetOpen && (
          <>
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setClosetOpen(false)}
              className="absolute inset-0 bg-black z-30 cursor-pointer"
            />

            {/* Closet Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-zinc-950 shadow-2xl z-40 border-l border-zinc-100 dark:border-zinc-900 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900/80 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
                <div>
                  <h3 className="font-serif italic font-semibold text-md text-zinc-900 dark:text-zinc-50 tracking-wide flex items-center gap-1.5">
                    <Shirt className="text-pink-400" size={16} />
                    {session.profileName}&apos;s Capsule Vault
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-sans tracking-tight mt-0.5">
                    10 curation pieces registered as wardrobe foundations
                  </p>
                </div>
                <button
                  onClick={() => setClosetOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20">
                <div className="bg-zinc-100/60 dark:bg-zinc-950/80 p-3.5 rounded-2xl flex items-start gap-2 border border-zinc-200/50 dark:border-zinc-900">
                  <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                    Alexis operates under an <b>Elevated Minimalist (92%)</b> style archetype. Everything displayed here is high-versatility cashmere, silk, or premium denim.
                  </p>
                </div>

                {loadingCloset ? (
                  <div className="text-center py-12 text-xs text-zinc-400 font-sans italic">
                    Opening your personalized vault...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {closetItems.map((item: WardrobeItem) => (
                      <div 
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all p-2 flex flex-col group"
                      >
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 dark:opacity-90"
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md text-[8px] text-zinc-100 font-mono px-1 rounded uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-sans font-medium text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-1 leading-tight">
                              {item.name}
                            </h5>
                            <span className="text-[9px] text-zinc-400 block mt-0.5 font-sans">
                              {item.brand || 'Minimal Arch'}
                            </span>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                            <span className="capitalize">{item.color}</span>
                            <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1 py-0.2 rounded font-mono">
                              {item.season.join(', ')}
                            </span>
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
