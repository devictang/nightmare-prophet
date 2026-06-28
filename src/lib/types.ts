/* ──── 夢魘先知 — Game Types ──── */

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type Equipment = {
  id: string;
  slot: EquipmentSlot;
  name: string;
  level: number;
  presence: number; // 0-5
  baseAtk: number;
  baseDef: number;
  affixes: string[];
  isAnchored: boolean; // presence Lv5 → survives rebirth
};

export type EquipmentTemplate = {
  id: string;
  slot: EquipmentSlot;
  name: string;
  baseAtk: number;
  baseDef: number;
  affixPool: string[];
  description: string;
};

export type PlayerClass = 'warrior' | 'rogue' | 'mage' | 'ranger';

export type Player = {
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  playerClass: PlayerClass;
  dreamLayer: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  talentPoints: number;
  willpower: number;
};

export type TalentNode = {
  id: string;
  name: string;
  description: string;
  maxRank: number;
  rank: number;
  effect: string;
  prerequisite?: string;
  icon: string;
};

export type TalentTree = {
  className: PlayerClass;
  name: string;
  nodes: TalentNode[];
};

export type Resources = {
  ironOre: number;
  crystal: number;
  dreamFragment: number;
  realityAnchor: number;
};

export type ResourceKey = keyof Resources;

export type Enemy = {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  tactic: string;
  description: string;
  isBoss: boolean;
};

export type CombatAction = 'attack' | 'defend' | 'charge' | 'skill1' | 'skill2' | 'skill3';

export type CombatState = {
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  tempoBar: number;
  maxTempo: number;
  cooldowns: Record<string, number>;
  turn: number;
  isPlayerTurn: boolean;
  isActive: boolean;
  result: 'none' | 'victory' | 'defeat';
};

export type WillpowerCard = {
  id: string;
  name: string;
  quality: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  effect: string;
  cost: number;
  icon: string;
  color: string;
};

export type GameSave = {
  player: Player;
  resources: Resources;
  equipment: Partial<Record<EquipmentSlot, Equipment>>;
  talentTrees: Record<PlayerClass, TalentTree>;
  lastSavedAt: number;
};
