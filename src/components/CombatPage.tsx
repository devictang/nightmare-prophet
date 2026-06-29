import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { ENEMIES, CLASS_ICONS } from '../lib/constants';

export default function CombatPage() {
  const { combat, startCombat, combatAction, endCombat, player } = useGameStore();

  if (!combat) {
    const layerEnemies = ENEMIES[player.dreamLayer] || ENEMIES[1];
    return (
      <div className="flex flex-col gap-4 p-4 pt-4 max-w-lg mx-auto" style={{ maxHeight: 'calc(100dvh - 130px)' }}>
        <div className="text-center mb-2">
          <h2 className="text-sm font-bold text-[var(--accent-red)]">⚔️ 夢境戰鬥</h2>
          <p className="text-[10px] text-[var(--text-muted)]">第 {player.dreamLayer} 層夢境</p>
        </div>

        <div className="grid gap-2">
          {layerEnemies.map((enemy, i) => (
            <motion.div
              key={enemy.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{enemy.isBoss ? '👹' : '👻'}</span>
                  <div>
                    <div className="text-sm font-bold">
                      {enemy.name}
                      {enemy.isBoss && <span className="ml-1 text-[10px] text-[var(--accent-amber)]">👑 BOSS</span>}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{enemy.tactic}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      ❤️ {enemy.hp} · ⚔️ {enemy.atk} · 🛡️ {enemy.def}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startCombat()}
                  className="text-[10px] px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 rounded-lg font-bold"
                >
                  挑戰
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center text-[10px] text-[var(--text-muted)]">
          {CLASS_ICONS[player.playerClass]} Lv.{player.level}
        </div>
      </div>
    );
  }

  // Combat active
  if (combat.result !== 'none') {
    const isWin = combat.result === 'victory';
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 max-w-lg mx-auto" style={{ minHeight: 'calc(100dvh - 130px)' }}>
        <span className="text-6xl">{isWin ? '🏆' : '💀'}</span>
        <h2 className="text-xl font-bold text-[var(--accent-amber)]">{isWin ? '勝利！' : '敗北...'}</h2>
        {isWin && <p className="text-xs text-[var(--text-secondary)]">✦ 獲得夢境破綻 ✦</p>}
        <button onClick={endCombat} className="px-8 py-3 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] rounded-xl font-bold">
          返回
        </button>
      </div>
    );
  }

  const hpPct = (combat.playerHp / combat.playerMaxHp) * 100;
  const enemyHpPct = (combat.enemy.hp / combat.enemy.maxHp) * 100;

  return (
    <div className="flex flex-col gap-3 p-4 pt-2 max-w-lg mx-auto" style={{ minHeight: 'calc(100dvh - 130px)' }}>
      {/* Enemy */}
      <div className="text-center">
        <div className="text-3xl">{combat.enemy.isBoss ? '👹' : '👻'}</div>
        <div className="text-sm font-bold">{combat.enemy.name}</div>
        <div className="bg-[var(--bg-card)] rounded-full h-2 mt-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${enemyHpPct}%` }} />
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">{combat.enemy.hp}/{combat.enemy.maxHp}</span>
      </div>

      {/* Player HP */}
      <div className="bg-[var(--bg-card)] rounded-xl p-2">
        <div className="flex justify-between text-[10px] mb-0.5">
          <span>❤️ {combat.playerHp}</span>
          <span className="text-[var(--text-muted)]">{combat.playerMaxHp}</span>
        </div>
        <div className="bg-[var(--bg-deep)] rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all" style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* Tempo Bar */}
      <div className="flex gap-1">
        {Array.from({ length: combat.maxTempo }).map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < combat.tempoBar ? 'bg-[var(--accent-cyan)] shadow-[0_0_6px_rgba(6,182,212,0.5)]' : 'bg-[var(--bg-card)]'}`} />
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <ActionBtn label="⚔️ 攻擊" desc="+1 氣" onClick={() => combatAction('attack')} disabled={!combat.isPlayerTurn} color="from-red-700 to-red-900" />
        <ActionBtn label="🛡️ 防守" desc="減半 +1 氣" onClick={() => combatAction('defend')} disabled={!combat.isPlayerTurn} color="from-blue-700 to-blue-900" />
        <ActionBtn label="⚡ 蓄勢" desc="+3 氣" onClick={() => combatAction('charge')} disabled={!combat.isPlayerTurn} color="from-amber-700 to-amber-900" />
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)]">
        {combat.isPlayerTurn ? '🎯 選擇行動' : '⏳ 敵人回合...'}
      </div>
    </div>
  );
}

function ActionBtn({ label, desc, onClick, disabled, color }: { label: string; desc: string; onClick: () => void; disabled?: boolean; color: string }) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-b ${color} rounded-xl p-3 text-sm font-bold
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:brightness-110'}
        border border-white/5 shadow-lg`}
    >
      <div>{label}</div>
      <div className="text-[10px] text-white/60 font-normal">{desc}</div>
    </motion.button>
  );
}
