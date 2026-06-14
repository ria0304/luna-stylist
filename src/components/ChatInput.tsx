/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize input box as text flows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const quickPrompts = [
    { label: "College Outfit", text: "What should I wear to college tomorrow?" },
    { label: "Black Tops", text: "Show all my black styles" },
    { label: "Winter Gaps", text: "What am I missing for winter?" },
    { label: "Explain DNA", text: "Explain why I am a minimalist style archetype" },
  ];

  return (
    <div className="border-t border-white/20 dark:border-zinc-900/40 bg-white/45 dark:bg-zinc-950/40 backdrop-blur-lg p-4">
      {/* Quick suggestions layout */}
      <div className="max-w-3xl mx-auto mb-3.5 flex flex-wrap gap-2 justify-center sm:justify-start">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => {
              onSendMessage(p.text);
            }}
            className="text-[11px] font-sans font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 bg-white/45 dark:bg-zinc-900/45 hover:bg-white/65 dark:hover:bg-zinc-800/85 border border-white/30 dark:border-zinc-800/40 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Actual Input form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-end">
        <div className="w-full bg-white/50 dark:bg-zinc-900/30 border border-white/40 dark:border-zinc-850 rounded-2xl p-2.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-colors duration-200 flex items-end backdrop-blur-md">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Luna is styling..." : "Talk to your closet space..."}
            disabled={disabled}
            className="flex-1 max-h-[120px] bg-transparent text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none resize-none px-2.5 py-1.5 leading-relaxed font-sans disabled:opacity-50"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!text.trim() || disabled}
            className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
              text.trim() && !disabled
                ? 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:opacity-90 cursor-pointer shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </form>
      
      <div className="max-w-3xl mx-auto mt-2 text-center">
        <span className="text-[10px] text-zinc-400 font-sans tracking-tight">
          Luna connects dynamically to WYA's Style Intelligence REST endpoints.
        </span>
      </div>
    </div>
  );
}
