import { useGameStore } from '../stores/gameStore';
import { PRESENCE_AFFIXES } from '../lib/constants';
import type { EquipmentSlot } from '../lib/types';

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: '🗡️ 武器',
  armor: '🛡️ 防具',
  accessory: '📿 飾物',
};

export default function ForgePage() {
  const { equipment, resources, forgeEquipLevel, upgradePresence, craftEquip } = useGameStore();
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

  return (
    <div className="flex flex-col gap-3 p-4 pt-2 max-w-lg mx-auto overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 130px)' }}>
      <div className="text-center mb-1">
        <h2 className="text-sm font-bold text-[var(--accent-amber)]">🔨 鍛造工坊</h2>
        <p className="text-[10px] text-[var(--text-muted)]">消耗資源強化作業</p>
      </div>

      <div className="grid gap-2">
        {slots.map(slot => {
          const eq = equipment[slot];
          const cost = eq ? 30 + eq.level * 10 : (slot === 'accessory' ? 40 : 30);
          const canAfford = resources.ironOre >= cost;
          return (
            <div key={slot} className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{SLOT_NAMES[slot]}</h3>
                {!eq && (
                  <button
                    onClick={() => craftEquip(slot)}
                    disabled={!canAfford}
                    className="text-[10px] px-3 py-1 bg-gradient-to-r from-[var(--accent-amber)] to-orange-700 rounded-lg font-bold disabled:opacity-40"
                  >
                    製作 ⛏️{cost}
                  </button>
                )}
              </div>
              {eq ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[var(--accent-cyan)]">{eq.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ATK {eq.baseAtk + Math.floor(eq.baseAtk * eq.level * 0.5)}
                      {eq.baseDef > 0 && ` DEF ${eq.baseDef + Math.floor(eq.baseDef * eq.level * 0.5)}`}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => forgeEquipLevel(slot)}
                      disabled={resources.ironOre < cost}
                      className="flex-1 text-[10px] bg-[var(--bg-hover)] rounded-lg py-2 disabled:opacity-40"
                    >
                      ⛏️ Lv.{eq.level} → {eq.level + 1}（{cost}）
                    </button>
                    <button
                      onClick={() => upgradePresence(slot)}
                      disabled={eq.presence >= 5 || resources.crystal < (20 + eq.presence * 10) || resources.realityAnchor < (1 + eq.presence)}
                      className="flex-1 text-[10px] bg-[var(--bg-hover)] rounded-lg py-2 disabled:opacity-40"
                    >
                      💎 {eq.presence}/5（晶{20 + eq.presence * 10} 錨{1 + eq.presence}）
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PRESENCE_AFFIXES[eq.presence]?.map((affix, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full ${i === eq.presence - 1 && eq.presence === 5 ? 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]' : 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]'}`}>
                        {affix}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">暫未裝備</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)] pb-2">
        💡 存在感 Lv.5 = 「現實錨點」，轉生保留
      </div>
    </div>
  );
}
