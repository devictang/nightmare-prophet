import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { CLASS_NAMES, CLASS_DESCRIPTIONS, CLASS_ICONS } from '../lib/constants';
import type { PlayerClass } from '../lib/types';

const CLASS_LIST: PlayerClass[] = ['warrior', 'rogue', 'mage', 'ranger'];

export default function TrainingPage() {
  const { player, trainingClass, setTrainingClass, talentTrees, addTalentPoint } = useGameStore();
  const tree = talentTrees[trainingClass];
  const expNeeded = expForLevel(player.level, player.dreamLayer);

  return (
    <div className="flex flex-col gap-3 p-4 pt-2 max-w-lg mx-auto overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 130px)' }}>
      {/* Current training info */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <div className="text-center">
          <div className="text-2xl">{CLASS_ICONS[trainingClass]}</div>
          <div className="font-bold text-sm mt-1">
            {CLASS_NAMES[trainingClass]} · Lv.{player.level}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">{CLASS_DESCRIPTIONS[trainingClass]}</div>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1">
            🎯 可用天賦點: <span className="text-[var(--accent-amber)] font-bold">{player.talentPoints}</span>
          </p>
        </div>
        {/* EXP bar */}
        <div className="mt-2 bg-[var(--bg-deep)] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] transition-all duration-300"
            style={{ width: `${Math.min(100, (player.exp / expNeeded) * 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-[var(--text-muted)] text-center mt-1">
          EXP {Math.floor(player.exp)}/{expNeeded} · 自動訓練中...
        </div>
      </div>

      {/* Class selector */}
      <div>
        <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-2 px-1">轉職訓練</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {CLASS_LIST.map(cls => (
            <button
              key={cls}
              onClick={() => {
                setTrainingClass(cls);
                useGameStore.getState().player.playerClass = cls;
                useGameStore.setState({ player: { ...useGameStore.getState().player, playerClass: cls } });
              }}
              className={`p-2 rounded-xl border text-center transition-all ${
                trainingClass === cls
                  ? 'border-[var(--accent-purple)] bg-purple-900/20'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
              }`}
            >
              <span className="text-lg">{CLASS_ICONS[cls]}</span>
              <div className="text-[10px] font-bold mt-0.5">{CLASS_NAMES[cls].slice(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Talent tree */}
      <div>
        <h3 className="text-xs font-bold text-[var(--text-secondary)] mb-2 px-1">{tree.name} 天賦</h3>
        <div className="space-y-2">
          {tree.nodes.map((node) => {
            const isLocked = node.prerequisite && !tree.nodes.find(n => n.id === node.prerequisite)?.rank;
            const isMaxed = node.rank >= node.maxRank;
            return (
              <motion.div
                key={node.id}
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
                    <span>{node.icon}</span>
                    <div>
                      <span className="text-sm font-bold">{node.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-2">{node.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: node.maxRank }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < node.rank ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-deep)]'}`} />
                    ))}
                    <button
                      onClick={() => addTalentPoint(trainingClass, node.id)}
                      disabled={isLocked || isMaxed || player.talentPoints <= 0}
                      className="ml-2 px-2 py-0.5 text-[10px] bg-[var(--accent-purple)] rounded font-bold disabled:opacity-30"
                    >+</button>
                  </div>
                </div>
                {node.prerequisite && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    需要：{tree.nodes.find(n => n.id === node.prerequisite)?.name}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)] pb-2">
        💡 天賦點提升訓練速度 · 隨時可以轉職
      </div>
    </div>
  );
}

function expForLevel(level: number, layer: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1) * Math.pow(1.1, layer - 1));
}
