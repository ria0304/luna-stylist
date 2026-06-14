import React, { useRef, useEffect } from 'react';
import { ChatMessage, Outfit, WardrobeItem, StyleDna, GapAnalysis } from '../types';
import OutfitCard from './OutfitCard';
import IntentBadge from './IntentBadge';
import { Sparkles, User, Dna, AlertCircle, Shirt } from 'lucide-react';
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

        {/* Empty state */}
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
              talk to your wardrobe
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
              Ask what to wear, what you're missing, or what your style says about you.
              Luna pulls from your real WYA wardrobe.
            </p>
          </motion.div>
        )}

        {/* Messages */}
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
              {/* Luna avatar */}
              {!isUser && (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] text-zinc-800 flex items-center justify-center text-xs font-serif font-bold shrink-0 shadow-xs border border-white/45">
                  l
                </div>
              )}

              <div className="max-w-[85%] sm:max-w-[75%] space-y-3.5">

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm font-sans leading-relaxed border ${
                    isUser
                      ? 'bg-zinc-900/95 dark:bg-zinc-100 border-zinc-850 dark:border-white/30 text-white dark:text-zinc-950 rounded-tr-none shadow-sm'
                      : 'bg-white/70 dark:bg-zinc-950/60 border-white/40 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-tl-none shadow-sm backdrop-blur-md'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {!isUser && msg.intent && debugMode && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-50 dark:border-zinc-900">
                      <IntentBadge intent={msg.intent} visible={debugMode} />
                    </div>
                  )}
                </div>

                {/* Wardrobe items grid */}
                {!isUser && msg.wardrobeItems && msg.wardrobeItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-2 gap-3 p-1 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl"
                  >
                    {msg.wardrobeItems.map((item: WardrobeItem) => (
                      <div
                        key={item.item_id}
                        className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs"
                      >
                        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                              <Shirt size={24} />
                            </div>
                          )}
                          <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white font-mono px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="font-sans font-medium text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-zinc-400 font-mono capitalize">
                            {item.color}{item.fabric ? ` · ${item.fabric}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Outfits */}
                {!isUser && msg.outfits && msg.outfits.length > 0 && (
                  <div className="space-y-4">
                    {msg.outfits.map((outfit: Outfit) => (
                      <OutfitCard key={outfit.id} outfit={outfit} />
                    ))}
                  </div>
                )}

                {/* Style DNA */}
                {!isUser && msg.styleDna && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900 to-black text-white p-5 rounded-2xl border border-zinc-800 shadow-lg font-sans"
                  >
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-3">
                      <Dna size={12} className="text-rose-400" />
                      Style DNA
                    </div>

                    <h4 className="font-sans font-semibold text-lg text-rose-100 tracking-tight">
                      {msg.styleDna.primaryStyle}
                    </h4>

                    {msg.styleDna.comfortLevel && (
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        Comfort level: {msg.styleDna.comfortLevel}
                      </p>
                    )}

                    {msg.styleDna.summary && (
                      <p className="mt-3 text-xs text-zinc-300 leading-relaxed">
                        {msg.styleDna.summary}
                      </p>
                    )}

                    {msg.styleDna.styles.length > 1 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.styleDna.styles.map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Gap analysis */}
                {!isUser && msg.gapAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
                      <div className="flex items-center gap-1.5 font-sans font-medium text-sm text-zinc-900 dark:text-zinc-50">
                        <AlertCircle className="text-zinc-400 h-4 w-4" />
                        Wardrobe Gaps
                      </div>
                      {msg.gapAnalysis.primaryAesthetic && (
                        <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full capitalize">
                          {msg.gapAnalysis.primaryAesthetic}
                        </span>
                      )}
                    </div>

                    {msg.gapAnalysis.summary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl leading-relaxed">
                        {msg.gapAnalysis.summary}
                      </p>
                    )}

                    <div className="space-y-3">
                      {msg.gapAnalysis.gaps.map((gap, idx) => {
                        const color =
                          gap.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                            : gap.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/10 dark:text-amber-400'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/10 dark:text-indigo-400';

                        return (
                          <div
                            key={idx}
                            className="p-3 border border-zinc-100 dark:border-zinc-900/50 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                                {gap.category}
                              </span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase rounded-full tracking-wider ${color}`}>
                                {gap.priority}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                              {gap.description}
                            </p>
                            {gap.reason && (
                              <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 italic">
                                {gap.reason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* User avatar */}
              {isUser && (
                <div className="h-9 w-9 rounded-full bg-white/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-medium shrink-0 border border-white/50 dark:border-zinc-700/50">
                  <User size={13} />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Loading indicator */}
        {messages.length > 0 && messages[messages.length - 1].isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 justify-start"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] text-zinc-800 flex items-center justify-center text-xs font-serif font-bold shrink-0 border border-white/45">
              l
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/60 border border-white/40 dark:border-zinc-800/60 rounded-tl-none backdrop-blur-md flex items-center gap-1.5">
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
