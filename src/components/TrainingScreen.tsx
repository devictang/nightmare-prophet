import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { CLASS_NAMES } from '../lib/constants';
import type { PlayerClass } from '../lib/types';

const CLASS_LIST: PlayerClass[] = ['warrior', 'rogue', 'mage', 'ranger'];

export default function TrainingScreen() {
  const { player, talentTrees, addTalentPoint, setScreen } = useGameStore();
  const currentTree = talentTrees[player.playerClass];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-2">
        <button onClick={() => setScreen('camp')} className="text-[var(--text-muted)] text-lg">‹</button>
        <h1 className="text-lg font-bold text-[var(--accent-green)]">🌿 天賦樹</h1>
        <span className="ml-auto text-sm font-bold text-[var(--accent-amber)]">
          🎯 {player.talentPoints} 點
        </span>
      </motion.div>

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {CLASS_LIST.map(cls => (
          <button
            key={cls}
            onClick={() => {
              const store = useGameStore.getState();
              store.player.playerClass = cls;
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              player.playerClass === cls
                ? 'bg-[var(--accent-purple)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)]'
            }`}
          >
            {CLASS_NAMES[cls]}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h3 className="font-bold text-sm mb-3">{currentTree.name}</h3>
        <div className="space-y-3">
          {currentTree.nodes.map(node => {
            const isLocked = node.prerequisite && !currentTree.nodes.find(n => n.id === node.prerequisite)?.rank;
            const isMaxed = node.rank >= node.maxRank;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border transition-all ${
                  isMaxed
                    ? 'border-[var(--accent-green)]/30 bg-green-900/10'
                    : isLocked
                    ? 'border-gray-700/30 bg-gray-800/20 opacity-50'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{node.icon}</span>
                    <div>
                      <span className="text-sm font-bold">{node.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">
                        {node.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: node.maxRank }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < node.rank ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-deep)]'
                        }`}
                      />
                    ))}
                    <button
                      onClick={() => addTalentPoint(player.playerClass, node.id)}
                      disabled={isLocked || isMaxed || player.talentPoints <= 0}
                      className="ml-2 px-2 py-0.5 text-[10px] bg-[var(--accent-purple)] rounded font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
                {node.prerequisite && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    需要：{currentTree.nodes.find(n => n.id === node.prerequisite)?.name}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)]">
        💡 每升 1 級獲得 1 天賦點
      </div>
    </div>
  );
}
