export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Calculate idle resource production */
export function calcIdleProduction(
  elapsedMs: number,
  level: number,
  dreamLayer: number
): { ironOre: number; crystal: number } {
  const hours = elapsedMs / 3600000;
  const baseRate = 10 + level * 2;
  const layerMultiplier = 1 + (dreamLayer - 1) * 0.2;
  return {
    ironOre: Math.floor(hours * baseRate * layerMultiplier),
    crystal: Math.floor(hours * (baseRate * 0.4) * layerMultiplier),
  };
}

/** Experience needed for next level */
export function expForLevel(level: number, dreamLayer: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1) * Math.pow(1.1, dreamLayer - 1));
}

/** Combat damage calculation */
export function calcDamage(
  atk: number,
  def: number,
  multiplier: number,
  isDefending: boolean
): { damage: number; isCrit: boolean } {
  const critChance = 0.05 + atk * 0.001;
  const isCrit = Math.random() < critChance;
  const critMulti = isCrit ? 1.5 : 1;
  const defenseReduction = isDefending ? 0.5 - Math.min(def * 0.002, 0.45) : 0;
  const defenseMulti = isDefending ? defenseReduction : 1;
  const raw = atk * multiplier * critMulti;
  const final = Math.max(1, Math.floor(raw * defenseMulti));
  return { damage: final, isCrit };
}

/** Total stat calculation from equipment + talents */
export function calcTotalStats(
  baseAtk: number,
  baseDef: number,
  baseHp: number,
  equipment: Record<string, { level: number; presence: number; baseAtk: number; baseDef: number } | undefined>,
  talentEffects: Record<string, number>
): { atk: number; def: number; maxHp: number } {
  let atk = baseAtk;
  let def = baseDef;
  let hp = baseHp;

  for (const eq of Object.values(equipment)) {
    if (!eq) continue;
    const presenceBonus = 1 + eq.presence * 0.1;
    atk += Math.floor(eq.baseAtk * (1 + eq.level * 0.5) * presenceBonus);
    def += Math.floor(eq.baseDef * (1 + eq.level * 0.5) * presenceBonus);
  }

  if (talentEffects.atk) atk += atk * (talentEffects.atk * 0.08);
  if (talentEffects.def) def += def * (talentEffects.def * 0.05);

  return { atk: Math.floor(atk), def: Math.floor(def), maxHp: hp };
}
