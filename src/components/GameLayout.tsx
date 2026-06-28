import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import ResourceBar from './ResourceBar';
import Camp from './Camp';
import CombatScreen from './CombatScreen';
import ForgeScreen from './ForgeScreen';
import TrainingScreen from './TrainingScreen';
import EquipmentScreen from './EquipmentScreen';
import RebirthScreen from './RebirthScreen';

export default function GameLayout() {
  const screen = useGameStore(s => s.screen);
  const [loaded, setLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

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
    setTimeout(() => setShowIntro(false), 2000);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--bg-deep)]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl"
        >
          🌌
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] flex flex-col">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-deep)]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🌌</div>
              <h1 className="text-2xl font-bold text-[var(--accent-purple)]">夢魘先知</h1>
              <p className="text-sm text-[var(--text-muted)] mt-2">Nightmare Prophet</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] text-[var(--text-muted)] mt-4"
              >
                每一次醒來，都只是另一層夢境的開始...
              </motion.p>
            </motion.div>
          </motion.div>
        ) : screen === 'combat' ? (
          <CombatScreen />
        ) : (
          <>
            <ResourceBar />
            {screen === 'camp' && <Camp />}
            {screen === 'forge' && <ForgeScreen />}
            {screen === 'training' && <TrainingScreen />}
            {screen === 'equipment' && <EquipmentScreen />}
            {screen === 'rebirth' && <RebirthScreen />}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
