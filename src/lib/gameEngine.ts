import type { ProductionBuilding } from './types';

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function expForLevel(level: number, dreamLayer: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1) * Math.pow(1.1, dreamLayer - 1));
}

export function calcProductionRates(buildings: ProductionBuilding[]): { orePerSec: number; crystalPerSec: number } {
  let ore = 0;
  let crystal = 0;
  for (const b of buildings) {
    ore += b.oreRate * b.count;
    crystal += b.crystalRate * b.count;
  }
  return { orePerSec: ore, crystalPerSec: crystal };
}

export function getBuildingCost(def: ProductionBuilding): number {
  return Math.floor(def.cost * Math.pow(def.costMultiplier, def.count));
}

export function calcClickPower(dreamLayer: number): number {
  return 1 + (dreamLayer - 1) * 0.5;
}

export function calcTrainingSpeed(level: number): number {
  return 0.5 + level * 0.1;
}

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
