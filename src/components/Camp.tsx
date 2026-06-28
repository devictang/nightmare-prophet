import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { CLASS_NAMES } from '../lib/constants';

export default function Camp() {
  const {
    clickGather, clickTrain, startCombat, setScreen,
    player,
  } = useGameStore();

  useIdleTick();

  const buttons = [
    { label: '⛏️ 採集', desc: `鐵礦 +${Math.floor((10 + player.level * 2) * (1 + (player.dreamLayer - 1) * 0.2))}`, action: clickGather, color: 'from-amber-700 to-amber-900' },
    { label: '🏋️ 訓練', desc: `經驗 +${8 + player.level * 2}`, action: clickTrain, color: 'from-blue-700 to-blue-900' },
    { label: '⚔️ 戰鬥', desc: '獲得夢境破綻', action: startCombat, color: 'from-red-700 to-red-900' },
    { label: '🔨 鍛造', desc: '強化作業', action: () => setScreen('forge'), color: 'from-purple-700 to-purple-900' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h1 className="text-lg font-bold text-[var(--accent-purple)]">🌌 築夢前哨</h1>
        <p className="text-xs text-[var(--text-muted)]">第 {player.dreamLayer} 層夢境 — {CLASS_NAMES[player.playerClass]} Lv.{player.level}</p>
        <div className="mt-2 bg-[var(--bg-card)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] transition-all duration-300"
            style={{ width: `${(player.exp / expForLevel(player.level, player.dreamLayer)) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          EXP {player.exp}/{expForLevel(player.level, player.dreamLayer)}
          {player.talentPoints > 0 && `  🎯 可用天賦點: ${player.talentPoints}`}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {buttons.map((b) => (
          <motion.button
            key={b.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={b.action}
            className={`bg-gradient-to-b ${b.color} rounded-xl p-4 flex flex-col items-center gap-1 shadow-lg active:brightness-110 border border-white/5`}
          >
            <span className="text-2xl">{b.label.split(' ')[0]}</span>
            <span className="text-sm font-bold">{b.label.slice(2)}</span>
            <span className="text-[10px] text-white/60">{b.desc}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        {[
          { label: '🎒 裝備', action: () => setScreen('equipment'), color: 'border-[var(--accent-blue)] text-[var(--accent-blue)]' },
          { label: '🌿 天賦', action: () => setScreen('training'), color: 'border-[var(--accent-green)] text-[var(--accent-green)]' },
          { label: player.willpower > 0 ? '💀 轉生' : '💤 入夢', action: () => {
            const store = useGameStore.getState();
            if (player.dreamLayer > 1 || player.willpower > 0) setScreen('rebirth');
            else store.doRebirth();
          }, color: 'border-[var(--accent-pink)] text-[var(--accent-pink)]' },
        ].map((b) => (
          <motion.button
            key={b.label}
            whileTap={{ scale: 0.95 }}
            onClick={b.action}
            className={`flex-1 bg-[var(--bg-card)] border ${b.color} rounded-lg py-2.5 text-xs font-bold`}
          >
            {b.label}
          </motion.button>
        ))}
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)] mt-4 leading-relaxed">
        ⚡ 離線時資源會持續生產<br />
        每 3 秒自動產出少量資源
      </div>
    </div>
  );
}

function expForLevel(level: number, layer: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1) * Math.pow(1.1, layer - 1));
}

function useIdleTick() {
  useEffect(() => {
    // Calc on mount
    const state = useGameStore.getState();
    const lastSave = state.lastSaveTime;
    if (lastSave) {
      const elapsed = Date.now() - lastSave;
      if (elapsed > 10000) {
        state.calcIdleResources(elapsed);
      }
    }
    const interval = setInterval(() => {
      useGameStore.getState().tickIdle();
    }, 3000);
    const saveInterval = setInterval(() => {
      try {
        const s = useGameStore.getState().getSave();
        localStorage.setItem('nightmare_prophet_save', JSON.stringify(s));
      } catch {}
    }, 15000);
    return () => { clearInterval(interval); clearInterval(saveInterval); };
  }, []);
}
