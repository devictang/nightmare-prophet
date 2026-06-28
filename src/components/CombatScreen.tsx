import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { SKILLS } from '../lib/constants';
import type { CombatAction } from '../lib/types';

export default function CombatScreen() {
  const { combat, combatAction, endCombat, player } = useGameStore();
  if (!combat) return null;

  const skills = SKILLS[player.playerClass] || [];

  const canUse = (cost: number): boolean => combat.tempoBar >= cost;
  const skill1 = skills[0];
  const skill2 = skills[1];
  const skill3 = skills[2];
  const skillActions: { label: string; cost: number; action: CombatAction; desc: string }[] = [];
  // Skill 1-3 not used yet, combat uses SKILLS from constants
  if (skill1) skillActions.push({ label: skill1.name, cost: skill1.cost, action: 'skill1' as CombatAction, desc: skill1.description });
  if (skill2) skillActions.push({ label: skill2.name, cost: skill2.cost, action: 'skill2' as CombatAction, desc: skill2.description });
  if (skill3) skillActions.push({ label: skill3.name, cost: skill3.cost, action: 'skill3' as CombatAction, desc: skill3.description });

  if (combat.result !== 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80dvh] p-6 max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <span className="text-6xl">{combat.result === 'victory' ? '🏆' : '💀'}</span>
          <h2 className="text-2xl font-bold mt-4 text-[var(--accent-amber)]">
            {combat.result === 'victory' ? '勝利！' : '敗北...'}
          </h2>
          {combat.result === 'victory' && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {combat.enemy.isBoss ? '✦ 獲得現實錨定劑 ✦' : '獲得夢境破綻'}
            </p>
          )}
          <button
            onClick={endCombat}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] rounded-xl font-bold"
          >
            返回營地
          </button>
        </motion.div>
      </div>
    );
  }

  const hpPct = (combat.playerHp / combat.playerMaxHp) * 100;
  const enemyHpPct = (combat.enemy.hp / combat.enemy.maxHp) * 100;

  return (
    <div className="flex flex-col min-h-[80dvh] p-4 max-w-lg mx-auto">
      {/* Enemy info */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
        <div className="text-4xl mb-1">{combat.enemy.isBoss ? '👹' : '👻'}</div>
        <h2 className="text-lg font-bold">{combat.enemy.name}</h2>
        <p className="text-[10px] text-[var(--text-muted)]">{combat.enemy.tactic}</p>
        <div className="mt-2 bg-[var(--bg-card)] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
            style={{ width: `${enemyHpPct}%` }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{combat.enemy.hp}/{combat.enemy.maxHp}</p>
      </motion.div>

      {/* Player HP */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--accent-green)]">❤️ {combat.playerHp}</span>
          <span className="text-[var(--text-muted)]">{combat.playerMaxHp}</span>
        </div>
        <div className="bg-[var(--bg-card)] rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300" style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* Tempo Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--accent-cyan)]">⚡ 氣力</span>
          <span className="text-[var(--accent-cyan)] font-bold">{combat.tempoBar}/{combat.maxTempo}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: combat.maxTempo }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-200 ${
                i < combat.tempoBar
                  ? 'bg-[var(--accent-cyan)] shadow-[0_0_6px_rgba(6,182,212,0.5)]'
                  : 'bg-[var(--bg-card)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <ActionButton
          label="⚔️ 攻擊"
          desc="+1 氣力"
          onClick={() => combatAction('attack')}
          disabled={!combat.isPlayerTurn || !canUse(1)}
          color="from-red-600 to-red-800"
        />
        <ActionButton
          label="🛡️ 防守"
          desc="受傷減半 +1 氣力"
          onClick={() => combatAction('defend')}
          disabled={!combat.isPlayerTurn}
          color="from-blue-600 to-blue-800"
        />
        <ActionButton
          label="⚡ 蓄勢"
          desc="+3 氣力"
          onClick={() => combatAction('charge')}
          disabled={!combat.isPlayerTurn}
          color="from-amber-600 to-amber-800"
        />
        <ActionButton
          label="💨 撤退"
          desc="返回營地"
          onClick={endCombat}
          color="from-gray-600 to-gray-800"
        />
      </div>

      {/* Skills */}
      {skillActions.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {skillActions.map((s, i) => (
            <ActionButton
              key={s.label}
              label={s.label}
              desc={`${s.cost}格 | ${s.desc}`}
              onClick={() => combatAction(s.action)}
              disabled={!combat.isPlayerTurn || !canUse(s.cost)}
              color={i === 2 ? 'from-purple-600 to-purple-800' : 'from-violet-600 to-violet-800'}
              small
            />
          ))}
        </div>
      )}

      <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
        {combat.isPlayerTurn ? '🎯 選擇行動' : '⏳ 敵人回合...'}
      </p>
    </div>
  );
}

function ActionButton({
  label, desc, onClick, disabled, color, small,
}: {
  label: string; desc: string; onClick: () => void; disabled?: boolean; color: string; small?: boolean;
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-b ${color} rounded-xl ${small ? 'p-2 text-xs' : 'p-3 text-sm'} font-bold
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:brightness-110'}
        border border-white/5 shadow-lg`}
    >
      <div className={small ? 'text-[10px]' : ''}>{label}</div>
      <div className={`${small ? 'hidden' : ''} text-[10px] text-white/60 font-normal`}>{desc}</div>
    </motion.button>
  );
}
