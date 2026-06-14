/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outfit, WardrobeItem } from '../types';
import { Shirt, Tag, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface OutfitCardProps {
  outfit: Outfit;
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  return (
    <motion.div
      id={`outfit-card-${outfit.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Header and Details */}
      <div className="p-5 border-b border-zinc-50 dark:border-zinc-800/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-sans font-medium text-base text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
              <Shirt className="text-zinc-500 h-4 w-4" />
              {outfit.name}
            </h4>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium uppercase font-sans tracking-wider text-zinc-400 dark:text-zinc-500">
              <MapPin className="h-3 w-3" />
              {outfit.occasion}
            </div>
          </div>
          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
            Capsule
          </span>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
          {outfit.description}
        </p>
      </div>

      {/* Grid of Clothes Items */}
      <div className="p-5 bg-zinc-50/50 dark:bg-zinc-950/20 flex-1">
        <div className="grid grid-cols-2 gap-3.5">
          {outfit.items.map((item: WardrobeItem) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Clothing Photo Area */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white font-mono px-1.5 py-0.5 rounded-md">
                  {item.category}
                </div>
              </div>
              
              {/* Product Label */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-sans font-medium text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-1">
                    {item.name}
                  </div>
                  {item.brand && (
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans mt-0.5">
                      {item.brand}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span 
                      className="h-2 w-2 rounded-full border border-black/10" 
                      style={{ backgroundColor: item.color.toLowerCase() === 'white' ? '#fff' : item.color.toLowerCase() === 'black' ? '#000' : item.color.toLowerCase() === 'charcoal' ? '#333' : item.color.toLowerCase() === 'indigo' ? '#1e3a8a' : item.color.toLowerCase() === 'tan' ? '#d97706' : item.color.toLowerCase() === 'gray' ? '#6b7280' : item.color.toLowerCase() === 'olive' ? '#3f6212' : '#888' }}
                    />
                    <span className="text-[9px] text-zinc-400 font-mono capitalize">{item.color}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
