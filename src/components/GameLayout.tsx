import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import GatheringPage from './GatheringPage';
import TrainingPage from './TrainingPage';
import CombatPage from './CombatPage';
import ForgePage from './ForgePage';
import type { TabId } from '../lib/types';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'gather', label: '採集', icon: '💠' },
  { id: 'training', label: '訓練', icon: '🏋️' },
  { id: 'combat', label: '戰鬥', icon: '⚔️' },
  { id: 'forge', label: '鍛造', icon: '🔨' },
];

export default function GameLayout() {
  const navigate = useNavigate();
  const { player, resources, activeTab, setActiveTab } = useGameStore();
  const [loaded, setLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastTick = useRef(Date.now());

  // Load save on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nightmare_prophet_save');
      if (raw) {
        const save = JSON.parse(raw);
        useGameStore.getState().loadSave(save);
      }
    } catch {}
    setLoaded(true);
    lastTick.current = Date.now();
  }, []);

  // Auto-run loop: production + training tick every 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      if (delta > 0 && delta < 5000) {
        useGameStore.getState().tickProduction(delta);
        useGameStore.getState().tickTraining(delta);
      }
      // Save every 15s
      try {
        const s = useGameStore.getState().getSave();
        localStorage.setItem('nightmare_prophet_save', JSON.stringify(s));
      } catch {}
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--bg-deep)]">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">🌌</motion.div>
      </div>
    );
  }

  const layer = player.dreamLayer;

  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] flex flex-col">
      {/* Top bar */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 py-1.5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => setShowMenu(true)} className="text-sm">🌌</button>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[var(--accent-cyan)]">第{layer}</span>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--accent-purple)]">Lv.{player.level}</span>
            <span className="text-[var(--text-muted)]">|</span>
            <span>💠{Math.floor(resources.dreamShard)}</span>
            <span className="text-[var(--accent-amber)]">⛏️{Math.floor(resources.ironOre)}</span>
            <span className="text-[var(--accent-cyan)]">💎{Math.floor(resources.crystal)}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{player.name}</span>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === 'gather' && <GatheringPage />}
            {activeTab === 'training' && <TrainingPage />}
            {activeTab === 'combat' && <CombatPage />}
            {activeTab === 'forge' && <ForgePage />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] safe-area-bottom">
        <div className="flex max-w-lg mx-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-1.5 text-[10px] transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent-purple)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-bold mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--bg-surface)] rounded-t-2xl p-5 w-full max-w-lg border-t border-[var(--border-subtle)]"
            >
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <h3 className="text-sm font-bold text-center mb-3">🌌 夢魘先知</h3>
              <div className="space-y-2">
                <MenuBtn icon="🎒" label="裝備檢視" onClick={() => { setShowMenu(false); /* navigate to equip */ }} />
                <MenuBtn icon="💀" label="轉生（意志點: {player.willpower}）" onClick={() => { setShowMenu(false); /* navigate to rebirth */ }} />
                <MenuBtn icon="🏠" label="返回首頁" onClick={() => { setShowMenu(false); navigate('/'); }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 bg-[var(--bg-card)] rounded-xl text-sm font-bold">
      {icon} {label}
    </button>
  );
}
