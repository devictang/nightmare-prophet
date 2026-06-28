import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { CLASS_NAMES } from '../lib/constants';

export default function ResourceBar() {
  const { resources, player, showResourceAnim } = useGameStore();
  const [anim, setAnim] = useState<string | null>(null);

  useEffect(() => {
    if (showResourceAnim) {
      setAnim(showResourceAnim);
      const t = setTimeout(() => setAnim(null), 1500);
      return () => clearTimeout(t);
    }
  }, [showResourceAnim]);

  return (
    <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--text-muted)]">第</span>
          <span className="text-[var(--accent-cyan)] font-bold">{player.dreamLayer}</span>
          <span className="text-[var(--text-muted)]">層</span>
          <span className="mx-1 text-[var(--text-muted)]">|</span>
          <span className="text-[var(--accent-purple)]">Lv.{player.level}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <ResourceIcon icon="⛏️" value={resources.ironOre} color="var(--accent-amber)" />
          <ResourceIcon icon="💎" value={resources.crystal} color="var(--accent-cyan)" />
          <ResourceIcon icon="🌌" value={resources.dreamFragment} color="var(--accent-purple)" />
          <ResourceIcon icon="⚓" value={resources.realityAnchor} color="var(--accent-pink)" />
        </div>

        <div className="text-xs text-[var(--text-secondary)]">
          {CLASS_NAMES[player.playerClass]}
        </div>
      </div>

      <AnimatePresence>
        {anim && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 text-[var(--accent-cyan)] text-xs font-bold pointer-events-none"
          >
            {anim}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceIcon({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-1">
      <span>{icon}</span>
      <span style={{ color }} className="font-mono font-bold">{value.toLocaleString()}</span>
    </span>
  );
}
