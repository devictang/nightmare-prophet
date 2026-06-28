import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

export default function RebirthScreen() {
  const { player, willpowerCards, activeCards, buyWillpowerCard, setScreen, doRebirth } = useGameStore();

  const handleRebirth = () => {
    doRebirth();
    setScreen('camp');
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <span className="text-5xl">🌌</span>
        <h1 className="text-xl font-bold text-[var(--accent-pink)] mt-2">靈魂結算</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          你將進入第 <span className="text-[var(--accent-cyan)] font-bold">{player.dreamLayer + 1}</span> 層夢境
        </p>
        <div className="mt-3 bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--accent-pink)]/20">
          <p className="text-sm">
            💀 意志點：<span className="text-[var(--accent-amber)] font-bold text-lg">{player.willpower}</span>
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            目前 Lv.{player.level} · 第 {player.dreamLayer} 層
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRebirth}
            className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-[var(--accent-pink)] to-purple-700 rounded-xl font-bold text-sm"
          >
            💤 進入下一層夢境
          </motion.button>
        </div>
      </motion.div>

      {/* Active cards */}
      {activeCards.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--accent-green)]/20">
          <h3 className="text-sm font-bold text-[var(--accent-green)] mb-2">✨ 已激活靈魂天賦</h3>
          <div className="flex flex-wrap gap-2">
            {activeCards.map(card => (
              <span
                key={card.id}
                className="text-[10px] px-2 py-1 rounded-full"
                style={{ backgroundColor: card.color + '20', color: card.color, borderColor: card.color + '40' }}
              >
                {card.icon} {card.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Willpower cards */}
      {willpowerCards.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--accent-amber)] mb-2">🎴 命運天賦抽卡</h3>
          <p className="text-[10px] text-[var(--text-muted)] mb-3">
            購買天賦帶入下一層夢境（僅限一層）
          </p>
          <div className="space-y-2">
            {willpowerCards.map((card, i) => {
              const owned = !!activeCards.find(c => c.id === card.id);
              const canAfford = player.willpower >= card.cost;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[var(--bg-card)] rounded-xl p-3 border"
                  style={{
                    borderColor: card.color + '30',
                    boxShadow: owned ? `0 0 10px ${card.color}30` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{card.icon}</span>
                      <div>
                        <span className="text-sm font-bold" style={{ color: card.color }}>{card.name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] ml-2">
                          {card.quality === 'legendary' ? '🌟 傳說' : card.quality === 'epic' ? '💜 史詩' : card.quality === 'rare' ? '💙 稀有' : '🤍 普通'}
                        </span>
                        <p className="text-[10px] text-[var(--text-secondary)]">{card.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => buyWillpowerCard(card.id)}
                      disabled={owned || !canAfford}
                      className={`text-[10px] px-3 py-1.5 rounded-lg font-bold whitespace-nowrap ${
                        owned
                          ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                          : canAfford
                          ? 'bg-gradient-to-r from-[var(--accent-amber)] to-orange-600'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {owned ? '✓ 已購' : `💀 ${card.cost}`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setScreen('camp')}
        className="text-xs text-[var(--text-muted)] py-3"
      >
        ← 返回營地（完成結算後再進入下層）
      </motion.button>
    </div>
  );
}
