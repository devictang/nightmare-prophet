import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { EQUIPMENT_TEMPLATES, PRESENCE_AFFIXES } from '../lib/constants';
import type { EquipmentSlot } from '../lib/types';

const SLOT_NAMES: Record<EquipmentSlot, string> = {
  weapon: '🗡️ 武器',
  armor: '🛡️ 防具',
  accessory: '📿 飾物',
};

export default function ForgeScreen() {
  const { equipment, resources, forgeEquip, upgradePresence, setScreen, equipItem } = useGameStore();

  const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

  const craftEquip = (slot: EquipmentSlot) => {
    const template = EQUIPMENT_TEMPLATES.find(t => t.slot === slot && !equipment[slot]);
    if (!template) return;
    const cost = slot === 'accessory' ? 40 : 30;
    if (resources.ironOre < cost) return;
    equipItem({
      id: `${template.id}_${Date.now()}`,
      slot: template.slot,
      name: template.name,
      level: 1,
      presence: 0,
      baseAtk: template.baseAtk,
      baseDef: template.baseDef,
      affixes: [],
      isAnchored: false,
    });
    useGameStore.getState().clickGather();
    // deduct resource manually
    const state = useGameStore.getState();
    state.resources.ironOre -= cost;
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-2">
        <button onClick={() => setScreen('camp')} className="text-[var(--text-muted)] text-lg">‹</button>
        <h1 className="text-lg font-bold text-[var(--accent-amber)]">🔨 鍛造工坊</h1>
      </motion.div>

      <div className="grid gap-3">
        {slots.map(slot => {
          const eq = equipment[slot];
          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{SLOT_NAMES[slot]}</h3>
                {!eq && (
                  <button
                    onClick={() => craftEquip(slot)}
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-[var(--accent-amber)] to-orange-600 rounded-lg font-bold"
                  >
                    製作 (⛏️{slot === 'accessory' ? 40 : 30})
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

                  <div className="flex gap-2">
                    {/* Level upgrade */}
                    <button
                      onClick={() => forgeEquip(slot, 'level')}
                      disabled={resources.ironOre < (30 + eq.level * 10)}
                      className="flex-1 text-xs bg-[var(--bg-hover)] rounded-lg py-2 disabled:opacity-40"
                    >
                      ⛏️ 升級 Lv.{eq.level}
                      <br /><span className="text-[10px] text-[var(--text-muted)]">(鐵礦×{30 + eq.level * 10})</span>
                    </button>

                    {/* Presence upgrade */}
                    <button
                      onClick={() => upgradePresence(slot)}
                      disabled={eq.presence >= 5 || resources.crystal < (20 + eq.presence * 10) || resources.realityAnchor < (1 + eq.presence)}
                      className="flex-1 text-xs bg-[var(--bg-hover)] rounded-lg py-2 disabled:opacity-40"
                    >
                      💎 存在感 {eq.presence}/5
                      <br /><span className="text-[10px] text-[var(--text-muted)]">
                        (晶×{20 + eq.presence * 10} 錨×{1 + eq.presence})
                      </span>
                    </button>
                  </div>

                  {/* Affixes display */}
                  <div className="flex flex-wrap gap-1">
                    {PRESENCE_AFFIXES[eq.presence]?.map((affix, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${i === eq.presence - 1 && eq.presence === 5 ? 'bg-[var(--accent-pink)]/20 text-[var(--accent-pink)]' : 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]'}`}>
                        {affix}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">暫未裝備</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center text-[10px] text-[var(--text-muted)] mt-2">
        💡 存在感 Lv.5 = 「現實錨點」，轉生時永久保留
      </div>
    </div>
  );
}
