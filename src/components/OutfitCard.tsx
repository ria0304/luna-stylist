import { Outfit, WardrobeItem } from '../types';
import { Shirt, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface OutfitCardProps {
  outfit: Outfit;
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-5 border-b border-zinc-50 dark:border-zinc-800/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-sans font-medium text-base text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
              <Shirt className="text-zinc-500 h-4 w-4" />
              {outfit.name}
            </h4>
            {outfit.occasion && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium uppercase font-sans tracking-wider text-zinc-400 dark:text-zinc-500">
                <MapPin className="h-3 w-3" />
                {outfit.occasion}
              </div>
            )}
          </div>
          {outfit.vibe && (
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
              {outfit.vibe}
            </span>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="p-5 bg-zinc-50/50 dark:bg-zinc-950/20 flex-1">
        <div className="grid grid-cols-2 gap-3.5">
          {outfit.items.map((item: WardrobeItem) => (
            <motion.div
              key={item.item_id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <Shirt size={28} />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-white font-mono px-1.5 py-0.5 rounded-md">
                  {item.category}
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div className="font-sans font-medium text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-1">
                  {item.name}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono capitalize">
                  <span>{item.color}</span>
                  {item.fabric && <><span className="opacity-40">·</span><span>{item.fabric}</span></>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
