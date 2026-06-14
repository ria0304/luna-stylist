/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { ChatMessage, Outfit, WardrobeItem, StyleDna, GapAnalysis } from '../types';
import OutfitCard from './OutfitCard';
import IntentBadge from './IntentBadge';
import { 
  Sparkles, 
  User, 
  Dna, 
  AlertTriangle, 
  AlertCircle, 
  Layers, 
  Bookmark, 
  Flame, 
  Info,
  Calendar,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChatWindowProps {
  messages: ChatMessage[];
  debugMode: boolean;
}

export default function ChatWindow({ messages, debugMode }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-transparent">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Welcome Hero card when chat is empty */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6 border border-white/40 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-md rounded-3xl max-w-lg mx-auto shadow-xl"
          >
            <div className="h-12 w-12 bg-gradient-to-tr from-[#ebb3d4] to-[#9ae3d1] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/45">
              <Sparkles className="text-zinc-800 h-5 w-5" />
            </div>
            <h3 className="font-serif italic text-xl text-zinc-900 dark:text-zinc-50 tracking-wide">
              your private boutique salon
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
              Enter your styling request, explore signature looks, or analyze wardrobe essentials. Luna coordinates directly with your Capsule Vault.
            </p>
          </motion.div>
        )}

        {/* Message Thread */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar block for Luna */}
              {!isUser && (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] text-zinc-800 flex items-center justify-center text-xs font-serif font-bold shrink-0 shadow-xs border border-white/45">
                  L
                </div>
              )}

              {/* Message content block */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-3.5`}>
                
                {/* Text Bubble */}
                <div 
                  className={`p-4 rounded-2xl text-sm font-sans leading-relaxed border ${
                    isUser 
                      ? 'bg-zinc-900/95 dark:bg-zinc-100 border-zinc-850 dark:border-white/30 text-white dark:text-zinc-950 rounded-tr-none shadow-sm' 
                      : 'bg-white/70 dark:bg-zinc-950/60 border-white/40 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-tl-none shadow-sm backdrop-blur-md'
                  }`}
                >
                  {/* Message body */}
                  <div className="whitespace-pre-line prose prose-sm max-w-none dark:prose-invert">
                    {msg.text}
                  </div>

                  {/* IntentBadge overlay (Metadata indicator) */}
                  {!isUser && msg.intent && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between">
                      <IntentBadge intent={msg.intent} visible={debugMode} />
                    </div>
                  )}
                </div>

                {/* --- RENDER WIDGETS ATTACHED BY BACKEND --- */}
                
                {/* 1. Wardrobe search result items */}
                {!isUser && msg.wardrobeItems && msg.wardrobeItems.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-2 gap-3 p-1 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl"
                  >
                    {msg.wardrobeItems.map((item: WardrobeItem) => (
                      <div 
                        key={item.id}
                        className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                      >
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover dark:opacity-90"
                          />
                          <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white font-mono px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="font-sans font-medium text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{item.brand || 'WYA Style'}</span>
                            <span className="capitalize">{item.color}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* 2. Outfits card layout */}
                {!isUser && msg.outfits && msg.outfits.length > 0 && (
                  <div className="space-y-4">
                    {msg.outfits.map((outfit: Outfit) => (
                      <div key={outfit.id} className="w-full">
                        <OutfitCard outfit={outfit} />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Gorgeous Style DNA Dashboard */}
                {!isUser && msg.styleDna && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900 to-black text-white p-5 rounded-2xl border border-zinc-800 shadow-lg font-sans"
                  >
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-2">
                      <Dna size={12} className="text-rose-400" />
                      WYA Style DNA Blueprint
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-3 border-b border-zinc-800">
                      {/* Left: Archetype label */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-rose-300">Style Archetype</span>
                        <h4 className="font-sans font-semibold text-lg text-rose-100 tracking-tight">{msg.styleDna.archetype}</h4>
                      </div>

                      {/* Right: Circular score */}
                      <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-800 px-3 py-2 rounded-xl">
                        <div className="text-right">
                          <span className="text-[9px] block uppercase font-mono text-zinc-400">Minimalist Score</span>
                          <span className="font-mono text-xs text-zinc-300">Consistent Capsule</span>
                        </div>
                        <div className="text-xl font-mono font-bold text-rose-300">
                          {msg.styleDna.minimalistScore}%
                        </div>
                      </div>
                    </div>

                    <p className="my-4 text-xs text-zinc-300 leading-relaxed font-sans">
                      {msg.styleDna.profile}
                    </p>

                    {/* Bullet specifications */}
                    <div className="space-y-2 mt-4">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Aesthetic Tenets</span>
                      {msg.styleDna.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-sans leading-relaxed">
                          <span className="text-zinc-600 mt-1">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key Values mapping */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
                      {msg.styleDna.explainedValues.map((val, idx) => (
                        <div key={idx} className="bg-zinc-850/50 border border-zinc-800/40 p-2.5 rounded-lg">
                          <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block">{val.label}</span>
                          <span className="text-[11px] font-sans font-medium text-zinc-300 mt-0.5 block leading-tight">{val.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. Gorgeous Wardrobe Gap Analysis Dashboard */}
                {!isUser && msg.gapAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-150"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
                      <div className="flex items-center gap-1.5 font-sans font-medium text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
                        <AlertCircle className="text-zinc-400 dark:text-zinc-500 h-4 w-4" />
                        Capsule Gap Analysis
                      </div>
                      <span className="font-mono text-[10px] uppercase font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar size={10} />
                        {msg.gapAnalysis.season}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed italic mb-4 font-sans bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl">
                      &ldquo;{msg.gapAnalysis.summary}&rdquo;
                    </p>

                    <div className="space-y-3.5">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Identified Omissions</span>
                      {msg.gapAnalysis.gaps.map((gap, idx) => {
                        const priorityColor = 
                          gap.priority === 'high' 
                            ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' 
                            : gap.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/10 dark:text-amber-400 dark:border-amber-900/20'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-155 dark:bg-indigo-950/10 dark:text-indigo-400 dark:border-indigo-900/10';

                        return (
                          <div 
                            key={idx}
                            className="p-3 border border-zinc-100 dark:border-zinc-900/50 rounded-xl relative hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                                {gap.category}
                              </span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase rounded-full tracking-wider ${priorityColor}`}>
                                {gap.priority} priority
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-sans leading-relaxed">
                              {gap.description}
                            </p>
                            <div className="mt-3 pt-2 border-t border-zinc-50 dark:border-zinc-900/80 text-[11px] font-sans text-zinc-500 dark:text-zinc-500 flex items-start gap-1">
                              <span className="text-amber-600 font-bold">WYA Suggestion:</span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{gap.suggestion}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Avatar block for User */}
              {isUser && (
                <div className="h-9 w-9 rounded-full bg-white/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-medium shrink-0 border border-white/50 dark:border-zinc-700/50">
                  <User size={13} />
                </div>
              )}

            </motion.div>
          );
        })}

        {/* Bouncing Triple Loading Dot for Luna Response */}
        {messages.length > 0 && messages[messages.length - 1].isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 justify-start"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] text-zinc-800 flex items-center justify-center text-xs font-serif font-bold shrink-0 shadow-xs border border-white/45">
              L
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/60 border border-white/40 dark:border-zinc-800/60 rounded-tl-none shadow-sm backdrop-blur-md flex items-center gap-1.5 self-center">
              <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
