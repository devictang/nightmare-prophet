import type { TalentTree, EquipmentTemplate, Enemy, PlayerClass } from './types';

export const CLASS_NAMES: Record<PlayerClass, string> = {
  warrior: '⚔️ 戰士',
  rogue: '🗡️ 刺客',
  mage: '🔮 法師',
  ranger: '🏹 遊俠',
};

export const CLASS_DESCRIPTIONS: Record<PlayerClass, string> = {
  warrior: '正面交鋒，高防禦高爆發',
  rogue: '節奏破壞，連擊與暴擊',
  mage: '元素控制，法術壓制',
  ranger: '多面適應，精準與續航',
};

export const INITIAL_RESOURCES = {
  ironOre: 100,
  crystal: 50,
  dreamFragment: 0,
  realityAnchor: 0,
};

export const INITIAL_PLAYER = {
  name: '先知',
  level: 1,
  exp: 0,
  expToNext: 100,
  playerClass: 'warrior' as PlayerClass,
  dreamLayer: 1,
  hp: 100,
  maxHp: 100,
  atk: 12,
  def: 5,
  talentPoints: 0,
  willpower: 0,
};

export const MAX_TEMPO = 6;

export const PRESENCE_AFFIXES: Record<number, string[]> = {
  1: ['基礎數值 +10%'],
  2: ['基礎數值 +10%', '暴擊率 +3%'],
  3: ['基礎數值 +10%', '暴擊率 +3%', '技能冷卻 -5%'],
  4: ['基礎數值 +10%', '暴擊率 +3%', '技能冷卻 -5%', '特殊詞條解鎖'],
  5: ['基礎數值 +10%', '暴擊率 +3%', '技能冷卻 -5%', '特殊詞條解鎖', '✨ 現實錨點 — 不可溶解'],
};

export const EXPERIENCE_CURVE = (layer: number): number => {
  return Math.floor(100 * Math.pow(1.15, layer - 1));
};

export const TALENT_TREES: Record<PlayerClass, TalentTree> = {
  warrior: {
    className: 'warrior',
    name: '⚔️ 戰士 — 鐵血',
    nodes: [
      { id: 'w1', name: '鐵壁', description: '防禦 +5/點', maxRank: 5, rank: 0, effect: 'def', icon: '🛡️' },
      { id: 'w2', name: '狂怒', description: '攻擊 +8/點', maxRank: 5, rank: 0, effect: 'atk', icon: '💢' },
      { id: 'w3', name: '戰吼', description: '技能傷害 +6%/點', maxRank: 3, rank: 0, effect: 'skill_dmg', icon: '🔔', prerequisite: 'w2' },
      { id: 'w4', name: '不屈', description: '低血量時減傷 +5%/點', maxRank: 3, rank: 0, effect: 'tenacity', icon: '💪', prerequisite: 'w1' },
    ],
  },
  rogue: {
    className: 'rogue',
    name: '🗡️ 刺客 — 暗影',
    nodes: [
      { id: 'r1', name: '暗影', description: '暴擊率 +3%/點', maxRank: 5, rank: 0, effect: 'crit', icon: '🌫️' },
      { id: 'r2', name: '毒刃', description: '暴擊傷害 +8%/點', maxRank: 5, rank: 0, effect: 'crit_dmg', icon: '💉' },
      { id: 'r3', name: '疾風', description: '連擊機率 +6%/點', maxRank: 3, rank: 0, effect: 'combo', icon: '⚡', prerequisite: 'r2' },
      { id: 'r4', name: '暗步', description: '閃避率 +4%/點', maxRank: 3, rank: 0, effect: 'dodge', icon: '🌪️', prerequisite: 'r1' },
    ],
  },
  mage: {
    className: 'mage',
    name: '🔮 法師 — 元素',
    nodes: [
      { id: 'm1', name: '烈焰', description: '法術傷害 +6%/點', maxRank: 5, rank: 0, effect: 'magic_dmg', icon: '🔥' },
      { id: 'm2', name: '冰霜', description: '法力上限 +1/點', maxRank: 5, rank: 0, effect: 'mana', icon: '❄️' },
      { id: 'm3', name: '祕法', description: '技能消耗 -5%/點', maxRank: 3, rank: 0, effect: 'cost_reduce', icon: '📖', prerequisite: 'm2' },
      { id: 'm4', name: '元素親和', description: '元素傷害 +5%/點', maxRank: 3, rank: 0, effect: 'elemental', icon: '🌊', prerequisite: 'm1' },
    ],
  },
  ranger: {
    className: 'ranger',
    name: '🏹 遊俠 — 野性',
    nodes: [
      { id: 'h1', name: '精準', description: '命中率 +4%/點', maxRank: 5, rank: 0, effect: 'accuracy', icon: '🎯' },
      { id: 'h2', name: '獸群', description: '召喚物傷害 +10%/點', maxRank: 5, rank: 0, effect: 'pet_dmg', icon: '🐺' },
      { id: 'h3', name: '自然治癒', description: '每回合回血 +3%/點', maxRank: 3, rank: 0, effect: 'regen', icon: '🌿', prerequisite: 'h2' },
      { id: 'h4', name: '本能', description: '迴避 +4%/點', maxRank: 3, rank: 0, effect: 'instinct', icon: '🦅', prerequisite: 'h1' },
    ],
  },
};

export const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  // Weapons
  { id: 'iron_sword', slot: 'weapon', name: '鐵劍', baseAtk: 12, baseDef: 0, affixPool: ['攻擊力 +5', '暴擊率 +2%'], description: '樸實的鐵製長劍' },
  { id: 'crystal_staff', slot: 'weapon', name: '晶石法杖', baseAtk: 10, baseDef: 0, affixPool: ['法術傷害 +8%', '法力上限 +1'], description: '嵌有夢境晶石的法杖' },
  { id: 'shadow_blade', slot: 'weapon', name: '暗影匕首', baseAtk: 8, baseDef: 0, affixPool: ['暴擊率 +5%', '暴擊傷害 +15%'], description: '薄刃淬毒，無聲奪命' },
  { id: 'hunters_bow', slot: 'weapon', name: '獵人弓', baseAtk: 10, baseDef: 0, affixPool: ['命中率 +5%', '暴擊傷害 +10%'], description: '輕巧的狩獵長弓' },
  // Armor
  { id: 'iron_armor', slot: 'armor', name: '鐵甲', baseAtk: 0, baseDef: 10, affixPool: ['防禦力 +5', 'HP +20'], description: '厚重的鐵製護甲' },
  { id: 'cloth_robe', slot: 'armor', name: '法袍', baseAtk: 0, baseDef: 5, affixPool: ['法力上限 +1', '法術傷害 +5%'], description: '輕柔的祕法長袍' },
  { id: 'leather_vest', slot: 'armor', name: '皮甲', baseAtk: 0, baseDef: 7, affixPool: ['閃避率 +3%', 'HP +15'], description: '輕便的皮製護甲' },
  // Accessories
  { id: 'power_ring', slot: 'accessory', name: '力量指環', baseAtk: 5, baseDef: 0, affixPool: ['攻擊力 +8', '暴擊率 +2%'], description: '注入戰意的古老指環' },
  { id: 'guardian_amulet', slot: 'accessory', name: '守護項鏈', baseAtk: 0, baseDef: 5, affixPool: ['防禦力 +5', 'HP +30'], description: '展開微弱防護力場' },
  { id: 'speed_brooch', slot: 'accessory', name: '疾風胸針', baseAtk: 3, baseDef: 0, affixPool: ['開局 +1 格氣力', '閃避率 +4%'], description: '蘊含風元素能量' },
];

export const ENEMIES: Record<number, Enemy[]> = {
  1: [
    { name: '夢魘士兵', hp: 30, maxHp: 30, atk: 6, def: 2, tactic: '普通攻擊', description: '最低階的夢境守衛', isBoss: false },
    { name: '幻影斥候', hp: 20, maxHp: 20, atk: 8, def: 1, tactic: '快速連擊，每 3 回合爆發一次', description: '敏捷的巡邏者', isBoss: false },
    { name: '夢境織者', hp: 60, maxHp: 60, atk: 10, def: 4, tactic: '每 2 回合施放一次範圍攻擊', description: '初層夢境守關Boss', isBoss: true },
  ],
  2: [
    { name: '深淵獵犬', hp: 50, maxHp: 50, atk: 10, def: 3, tactic: '攻擊附帶流血', description: '遊蕩在深層的魔獸', isBoss: false },
    { name: '迷失騎士', hp: 80, maxHp: 80, atk: 12, def: 6, tactic: '高防禦，防守反擊', description: '墮落的夢境騎士', isBoss: true },
  ],
};

export const WILLPOWER_CARDS = [
  { id: 'wp1', name: '天生戰士', quality: 'epic' as const, description: '戰士熟練度獲取速率永久 +300%', effect: 'warrior_mastery_x3', cost: 180, icon: '⚔️', color: '#a855f7' },
  { id: 'wp2', name: '清醒夢者', quality: 'legendary' as const, description: '所有招式 Cooldown 縮短 20%', effect: 'cooldown_reduce', cost: 250, icon: '🧠', color: '#f59e0b' },
  { id: 'wp3', name: '大富大貴', quality: 'rare' as const, description: '營地基礎建築價格永久降低 15%', effect: 'cost_reduce_15', cost: 100, icon: '💰', color: '#3b82f6' },
  { id: 'wp4', name: '暗影血脈', quality: 'epic' as const, description: '刺客技能暴擊率 +15%', effect: 'rogue_crit', cost: 160, icon: '🗡️', color: '#a855f7' },
  { id: 'wp5', name: '元素共鳴', quality: 'rare' as const, description: '法師技能傷害 +20%', effect: 'mage_dmg', cost: 120, icon: '🔮', color: '#3b82f6' },
  { id: 'wp6', name: '鋼鐵意志', quality: 'common' as const, description: '夢境層數經驗 +10%', effect: 'exp_bonus', cost: 60, icon: '💪', color: '#64748b' },
  { id: 'wp7', name: '幸運星', quality: 'common' as const, description: '裝備掉落率 +15%', effect: 'loot_bonus', cost: 50, icon: '⭐', color: '#64748b' },
  { id: 'wp8', name: '夢境行者', quality: 'epic' as const, description: '戰鬥中氣力回復速度 +30%', effect: 'tempo_regen', cost: 200, icon: '🌌', color: '#a855f7' },
  { id: 'wp9', name: '不滅之火', quality: 'legendary' as const, description: '死亡時 20% 機率滿血復活（每夢境一次）', effect: 'revive_chance', cost: 300, icon: '🔥', color: '#f59e0b' },
  { id: 'wp10', name: '建造大師', quality: 'rare' as const, description: '採集資源產量 +25%', effect: 'gathering_boost', cost: 90, icon: '🏗️', color: '#3b82f6' },
];

export const SKILLS: Record<PlayerClass, { id: string; name: string; cost: number; cooldown: number; damage: number; description: string }[]> = {
  warrior: [
    { id: 'ws1', name: '破甲斬', cost: 2, cooldown: 2, damage: 1.5, description: '無視 50% 防禦' },
    { id: 'ws2', name: '旋風斬', cost: 3, cooldown: 3, damage: 1.8, description: '全體攻擊' },
    { id: 'ws3', name: '戰吼', cost: 1, cooldown: 4, damage: 0.5, description: '提升攻擊力 30% 持續 2 回合' },
  ],
  rogue: [
    { id: 'rs1', name: '暗影步', cost: 1, cooldown: 2, damage: 1.8, description: '必定暴擊' },
    { id: 'rs2', name: '毒刃', cost: 2, cooldown: 3, damage: 1.3, description: '附加流血 3 回合' },
    { id: 'rs3', name: '終結技', cost: 4, cooldown: 4, damage: 3.0, description: '消耗所有氣力，每格 +50% 傷害' },
  ],
  mage: [
    { id: 'ms1', name: '火球術', cost: 2, cooldown: 2, damage: 1.6, description: '附帶燃燒 2 回合' },
    { id: 'ms2', name: '冰風暴', cost: 3, cooldown: 3, damage: 1.4, description: '全體攻擊 + 減速' },
    { id: 'ms3', name: '祕法衝擊', cost: 4, cooldown: 4, damage: 2.8, description: '單體爆發' },
  ],
  ranger: [
    { id: 'hs1', name: '貫穿箭', cost: 2, cooldown: 2, damage: 1.5, description: '無視防守' },
    { id: 'hs2', name: '連射', cost: 2, cooldown: 3, damage: 1.2, description: '連續攻擊 2 次' },
    { id: 'hs3', name: '終極狩獵', cost: 4, cooldown: 4, damage: 2.5, description: '對低血量敵人額外 +50% 傷害' },
  ],
};
