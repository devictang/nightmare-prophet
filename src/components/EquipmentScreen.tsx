import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { PRESENCE_AFFIXES } from '../lib/constants';
import type { EquipmentSlot } from '../lib/types';

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: '🗡️ 武器',
  armor: '🛡️ 防具',
  accessory: '📿 飾物',
};

const QUALITY_COLORS: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-[var(--accent-cyan)]',
  2: 'text-[var(--accent-blue)]',
  3: 'text-[var(--accent-purple)]',
  4: 'text-[var(--accent-amber)]',
  5: 'text-[var(--accent-pink)]',
};

export default function EquipmentScreen() {
  const { equipment, setScreen } = useGameStore();
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-2">
        <button onClick={() => setScreen('camp')} className="text-[var(--text-muted)] text-lg">‹</button>
        <h1 className="text-lg font-bold text-[var(--accent-blue)]">🎒 裝備</h1>
      </motion.div>

      <div className="grid gap-3">
        {slots.map(slot => {
          const eq = equipment[slot];
          return (
            <div key={slot} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{SLOT_NAMES[slot]}</h3>
              </div>
              {eq ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${QUALITY_COLORS[eq.presence]}`}>{eq.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Lv.{eq.level}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                    <span>⚔️ ATK {eq.baseAtk + Math.floor(eq.baseAtk * eq.level * 0.5)}</span>
                    {eq.baseDef > 0 && <span>🛡️ DEF {eq.baseDef + Math.floor(eq.baseDef * eq.level * 0.5)}</span>}
                    <span className={QUALITY_COLORS[eq.presence]}>
                      ✦ 存在感 {eq.presence}/5
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PRESENCE_AFFIXES[eq.presence]?.map((affix, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          i === eq.presence - 1
                            ? 'bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]'
                            : 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]'
                        }`}
                      >
                        {affix}
                      </span>
                    ))}
                  </div>
                  {eq.isAnchored && (
                    <div className="text-[10px] text-[var(--accent-pink)] font-bold mt-1">
                      ⚓ 現實錨點 — 轉生保留
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">🔴 空槽 — 前往鍛造製作</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Anchored equipment count */}
      {Object.values(equipment).filter(e => e?.isAnchored).length > 0 && (
        <div className="text-center text-xs text-[var(--accent-pink)] bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--accent-pink)]/20">
          ⚓ 已錨定裝備：{Object.values(equipment).filter(e => e?.isAnchored).length} 件，將隨轉生保留
        </div>
      )}
    </div>
  );
}
