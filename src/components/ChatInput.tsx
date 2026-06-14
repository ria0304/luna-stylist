import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const QUICK_PROMPTS = [
  { label: 'College Outfit',  text: 'What should I wear to college tomorrow?' },
  { label: 'Black Tops',      text: 'Show all my black tops' },
  { label: 'Winter Gaps',     text: 'What am I missing for winter?' },
  { label: 'My Style DNA',    text: 'Why am I a minimalist?' },
];

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText]     = useState('');
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="border-t border-white/20 dark:border-zinc-900/40 bg-white/45 dark:bg-zinc-950/40 backdrop-blur-lg p-4">
      {/* Quick prompts */}
      <div className="max-w-3xl mx-auto mb-3.5 flex flex-wrap gap-2 justify-center sm:justify-start">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={disabled}
            onClick={() => onSendMessage(p.text)}
            className="text-[11px] font-sans font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 bg-white/45 dark:bg-zinc-900/45 hover:bg-white/65 dark:hover:bg-zinc-800/85 border border-white/30 dark:border-zinc-800/40 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={submit} className="max-w-3xl mx-auto flex items-end">
        <div className="w-full bg-white/50 dark:bg-zinc-900/30 border border-white/40 dark:border-zinc-850 rounded-2xl p-2.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-colors duration-200 flex items-end backdrop-blur-md">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Luna is styling…' : 'Ask about your wardrobe…'}
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

      <p className="max-w-3xl mx-auto mt-2 text-center text-[10px] text-zinc-400 font-sans tracking-tight">
        Luna reads your real wardrobe from WYA — nothing is stored here.
      </p>
    </div>
  );
}
