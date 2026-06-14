/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Login from './views/Login';
import Chat from './views/Chat';
import { getSavedSession, isLoggedIn } from './services/auth';
import { UserSession } from './types';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    // Audit current browser node credentials on startup
    if (isLoggedIn()) {
      const saved = getSavedSession();
      if (saved) {
        setSession(saved);
      }
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="text-center">
          <div className="h-10 w-10 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg animate-pulse">
            L
          </div>
          <p className="text-xs text-zinc-400 font-mono tracking-tight uppercase">
            Loading Luna intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-[#ebb3d4] via-[#c2caf5] to-[#9ae3d1] dark:from-[#2b1827] dark:via-[#16132b] dark:to-[#10211f] transition-colors duration-300">
      <AnimatePresence mode="wait">
        {session ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Chat 
              session={session} 
              onLogout={() => setSession(null)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Login 
              onLoginSuccess={(newSession) => setSession(newSession)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
