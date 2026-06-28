import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { CLASS_NAMES, CLASS_DESCRIPTIONS } from '../lib/constants';
import type { PlayerClass } from '../lib/types';

const CLASS_LIST: PlayerClass[] = ['warrior', 'rogue', 'mage', 'ranger'];
const CLASS_ICONS: Record<string, string> = {
  warrior: '⚔️',
  rogue: '🗡️',
  mage: '🔮',
  ranger: '🏹',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('warrior');
  const [playerName, setPlayerName] = useState('夢魘先知');

  const startGame = () => {
    const store = useGameStore.getState();
    store.newGame();
    store.startNewGame(playerName, selectedClass);
    navigate('/game');
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-7xl mb-4"
        >
          🌌
        </motion.div>
        <h1 className="text-3xl font-bold text-[var(--accent-purple)]">夢魘先知</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Nightmare Prophet</p>
        <p className="text-xs text-[var(--text-muted)] mt-4 max-w-xs leading-relaxed">
          一部分人類一覺醒來，發現進入了一個奇怪的黑暗世界。<br />
          每一次打破夢境「醒來」，都只是進入了另一層更深的夢境...
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">先知之名</label>
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-purple)]"
            placeholder="輸入你的名字"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--text-muted)] mb-2 block">選擇職業</label>
          <div className="grid grid-cols-2 gap-2">
            {CLASS_LIST.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedClass === cls
                    ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10 shadow-[var(--glow-purple)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
                }`}
              >
                <span className="text-2xl">{CLASS_ICONS[cls]}</span>
                <p className="text-xs font-bold mt-1">{CLASS_NAMES[cls]}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{CLASS_DESCRIPTIONS[cls]}</p>
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={startGame}
          className="w-full py-4 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] rounded-xl font-bold text-sm shadow-lg"
        >
          🌌 進入夢境
        </motion.button>

        <div className="text-center">
          <button
            onClick={() => {
              try {
                const raw = localStorage.getItem('nightmare_prophet_save');
                if (raw) {
                  const save = JSON.parse(raw);
                  useGameStore.getState().loadSave(save);
                  navigate('/game');
                }
              } catch {}
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-purple)]"
          >
            📂 讀取存檔
          </button>
        </div>
      </motion.div>
    </div>
  );
}
