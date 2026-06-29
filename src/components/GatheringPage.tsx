import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { calcProductionRates, getBuildingCost } from '../lib/gameEngine';

export default function GatheringPage() {
  const { resources, buildings, clickDreamShard, buyBuilding } = useGameStore();
  const rates = calcProductionRates(buildings);

  return (
    <div className="flex flex-col gap-4 p-4 pt-2 max-w-lg mx-auto overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 130px)' }}>
      {/* Click area */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.03 }}
        onClick={clickDreamShard}
        className="bg-gradient-to-b from-purple-800 to-indigo-900 rounded-2xl p-6 flex flex-col items-center gap-2 shadow-lg border border-purple-500/20 active:brightness-125"
      >
        <span className="text-5xl">💠</span>
        <span className="text-lg font-bold text-[var(--accent-purple)]">採集夢境碎片</span>
        <span className="text-xs text-white/60">
          點擊獲得 💠 建造建築
        </span>
      </motion.button>

      {/* Resource summary */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="text-[var(--accent-purple)] font-bold text-sm">{Math.floor(resources.dreamShard)}</div>
          <div className="text-[var(--text-muted)]">💠 碎片</div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="text-[var(--accent-amber)] font-bold text-sm">{Math.floor(resources.ironOre)}</div>
          <div className="text-[var(--text-muted)]">⛏️ 鐵礦</div>
          {rates.orePerSec > 0 && <div className="text-[10px] text-[var(--accent-amber)]/60">+{rates.orePerSec.toFixed(1)}/s</div>}
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="text-[var(--accent-cyan)] font-bold text-sm">{Math.floor(resources.crystal)}</div>
          <div className="text-[var(--text-muted)]">💎 晶石</div>
          {rates.crystalPerSec > 0 && <div className="text-[10px] text-[var(--accent-cyan)]/60">+{rates.crystalPerSec.toFixed(1)}/s</div>}
        </div>
      </div>

      {/* Buildings shop */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] px-1">🏗️ 生產建築</h3>
        {buildings.map((b, i) => {
          const cost = getBuildingCost(b);
          const canAfford = resources.dreamShard >= cost;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-[var(--bg-card)] rounded-xl p-3 border transition-all ${
                canAfford ? 'border-[var(--border-subtle)]' : 'border-gray-800/50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <div className="text-sm font-bold">{b.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{b.description}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      ⛏️ +{b.oreRate}/s · 💎 +{b.crystalRate}/s
                      {b.count > 0 && <span className="ml-2 text-[var(--accent-purple)]">×{b.count}</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => buyBuilding(b.id)}
                  disabled={!canAfford}
                  className="text-[10px] px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-lg font-bold disabled:opacity-40 whitespace-nowrap"
                >
                  💠{cost}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)] pb-2">
        💠 碎片用嚟起建築 · ⛏️💎 用嚟鍛造裝備
      </div>
    </div>
  );
}
