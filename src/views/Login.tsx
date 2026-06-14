/**
 * Luna — Login View
 * Authenticates against WYA's real JWT backend.
 */

import React, { useState } from 'react';
import { wyaApi } from '../services/api';
import { saveSession } from '../services/auth';
import { mapUserSession, UserSession } from '../types';
import { Key, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { access_token, user } = await wyaApi.login(email.trim(), password.trim());
      const session = mapUserSession(access_token, user);
      saveSession(access_token, user);
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Could not connect to WYA. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-white/20 dark:bg-zinc-100/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-white/10 dark:bg-zinc-100/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/75 dark:bg-zinc-950/50 border border-white/50 dark:border-zinc-800/60 rounded-3xl overflow-hidden p-8 shadow-2xl relative z-10 backdrop-blur-2xl"
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-tr from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] text-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold italic text-xl select-none shadow-md border border-white/50">
            l
          </div>
          <h2 className="text-2xl font-serif italic font-bold tracking-wide text-zinc-900 dark:text-zinc-50">
            luna
          </h2>
          <p className="mt-2.5 text-xs text-zinc-600 dark:text-zinc-450 tracking-normal px-4 leading-relaxed font-sans">
            Sign in with your WYA account to talk to your wardrobe.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3.5 py-2.5 rounded-xl text-xs font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans tracking-wider text-zinc-400 dark:text-zinc-500 block font-medium">
              WYA Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-purple-300 dark:focus:border-zinc-700 transition-colors font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans tracking-wider text-zinc-400 dark:text-zinc-500 block font-medium">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-purple-300 dark:focus:border-zinc-700 transition-colors font-sans font-mono"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 text-white rounded-xl py-3 px-4 text-sm font-sans font-semibold tracking-tight mt-6 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin h-3.5 w-3.5 text-pink-300" />
                Connecting to WYA...
              </>
            ) : (
              'Sign in with WYA'
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-200/25 dark:border-zinc-800/80 flex items-start gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal font-sans italic">
          <Sparkles size={11} className="shrink-0 mt-0.5 text-pink-400" />
          <span>
            Luna connects to your WYA wardrobe. You need a WYA account to continue.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
