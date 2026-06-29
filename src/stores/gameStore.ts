import { create } from 'zustand';
import type {
  Player, Resources, Equipment, EquipmentSlot, CombatState,
  CombatAction, TalentTree, PlayerClass, WillpowerCard, GameSave,
  ProductionBuilding, TabId,
} from '../lib/types';
import {
  INITIAL_PLAYER, INITIAL_RESOURCES, TALENT_TREES, MAX_TEMPO,
  ENEMIES, BUILDING_DEFS, WILLPOWER_CARDS,
} from '../lib/constants';
import { calcDamage, expForLevel, randInt, getBuildingCost } from '../lib/gameEngine';

interface GameStore {
  player: Player;
  resources: Resources;
  equipment: Partial<Record<EquipmentSlot, Equipment>>;
  talentTrees: Record<PlayerClass, TalentTree>;
  activeCards: WillpowerCard[];
  willpowerCards: WillpowerCard[];
  combat: CombatState | null;
  buildings: ProductionBuilding[];
  activeTab: TabId;
  trainingClass: PlayerClass;
  showResourceAnim: string | null;
  lastSaveTime: number;

  setActiveTab: (t: TabId) => void;
  setTrainingClass: (cls: PlayerClass) => void;
  clickDreamShard: () => void;
  buyBuilding: (id: string) => void;
  tickProduction: (deltaMs: number) => void;
  tickTraining: (deltaMs: number) => void;
  addTalentPoint: (className: PlayerClass, nodeId: string) => void;
  forgeEquipLevel: (slot: EquipmentSlot) => boolean;
  upgradePresence: (slot: EquipmentSlot) => boolean;
  equipItem: (eq: Equipment) => void;
  craftEquip: (slot: EquipmentSlot) => void;
  startCombat: () => void;
  combatAction: (action: CombatAction) => void;
  endCombat: () => void;
  doRebirth: () => void;
  buyWillpowerCard: (cardId: string) => void;
  generateWillpowerCards: () => void;
  newGame: () => void;
  startNewGame: (name: string, playerClass: PlayerClass) => void;
  loadSave: (save: GameSave) => void;
  getSave: () => GameSave;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: { ...INITIAL_PLAYER },
  resources: { ...INITIAL_RESOURCES },
  equipment: {},
  talentTrees: JSON.parse(JSON.stringify(TALENT_TREES)),
  activeCards: [],
  willpowerCards: [],
  combat: null,
  buildings: JSON.parse(JSON.stringify(BUILDING_DEFS)),
  activeTab: 'gather',
  trainingClass: 'warrior',
  showResourceAnim: null,
  lastSaveTime: Date.now(),

  setActiveTab: (t) => set({ activeTab: t }),

  setTrainingClass: (cls) => set({ trainingClass: cls }),

  clickDreamShard: () => {
    const { player, resources } = get();
    const gain = 1 + (player.dreamLayer - 1) * 0.5;
    set({
      resources: { ...resources, dreamShard: resources.dreamShard + Math.floor(gain) },
      showResourceAnim: `+${Math.floor(gain)} 💠`,
    });
  },

  buyBuilding: (id) => {
    const { resources, buildings } = get();
    const idx = buildings.findIndex(b => b.id === id);
    if (idx === -1) return;
    const def = buildings[idx];
    const cost = getBuildingCost(def);
    if (resources.dreamShard < cost) return;
    const newBuildings = [...buildings];
    newBuildings[idx] = { ...def, count: def.count + 1 };
    set({
      resources: { ...resources, dreamShard: resources.dreamShard - cost },
      buildings: newBuildings,
      showResourceAnim: `🏗️ ${def.name}`,
    });
  },

  tickProduction: (deltaMs) => {
    const { buildings, resources } = get();
    const secs = deltaMs / 1000;
    let ore = 0;
    let crystal = 0;
    for (const b of buildings) {
      ore += b.oreRate * b.count * secs;
      crystal += b.crystalRate * b.count * secs;
    }
    if (ore < 0.001 && crystal < 0.001) return;
    set({
      resources: {
        ...resources,
        ironOre: resources.ironOre + ore,
        crystal: resources.crystal + crystal,
      },
    });
  },

  tickTraining: (deltaMs) => {
    const { player, trainingClass, talentTrees } = get();
    const secs = deltaMs / 1000;
    const baseSpeed = 0.5 + player.level * 0.1;
    // Bonus from talent points in training class
    const tree = talentTrees[trainingClass];
    const totalRanks = tree.nodes.reduce((sum, n) => sum + n.rank, 0);
    const talentBonus = 1 + totalRanks * 0.05;
    const expGain = baseSpeed * secs * talentBonus;
    if (expGain < 0.01) return;
    const newExp = player.exp + expGain;
    const needed = expForLevel(player.level, player.dreamLayer);
    if (newExp >= needed) {
      const overflow = newExp - needed;
      set({
        player: {
          ...player,
          level: player.level + 1,
          exp: overflow,
          talentPoints: player.talentPoints + 1,
          maxHp: player.maxHp + 10,
          hp: player.maxHp + 10,
          atk: player.atk + 2,
        },
      });
    } else {
      set({ player: { ...player, exp: newExp } });
    }
  },

  addTalentPoint: (className, nodeId) => {
    const { player, talentTrees } = get();
    if (player.talentPoints <= 0) return;
    const tree = talentTrees[className];
    if (!tree) return;
    const node = tree.nodes.find(n => n.id === nodeId);
    if (!node || node.rank >= node.maxRank) return;
    if (node.prerequisite) {
      const prereq = tree.nodes.find(n => n.id === node.prerequisite);
      if (!prereq || prereq.rank <= 0) return;
    }
    set({
      player: { ...player, talentPoints: player.talentPoints - 1 },
      talentTrees: {
        ...talentTrees,
        [className]: {
          ...tree,
          nodes: tree.nodes.map(n => n.id === nodeId ? { ...n, rank: n.rank + 1 } : n),
        },
      },
    });
  },

  forgeEquipLevel: (slot) => {
    const { resources, equipment } = get();
    const eq = equipment[slot];
    if (!eq) { get().craftEquip(slot); return true; }
    const cost = 30 + eq.level * 10;
    if (resources.ironOre < cost) return false;
    set({
      resources: { ...resources, ironOre: resources.ironOre - cost },
      equipment: { ...equipment, [slot]: { ...eq, level: eq.level + 1 } },
      showResourceAnim: '⚒️ 升級',
    });
    return true;
  },

  upgradePresence: (slot) => {
    const { resources, equipment } = get();
    const eq = equipment[slot];
    if (!eq || eq.presence >= 5) return false;
    const cost = 20 + eq.presence * 10;
    const anchorCost = 1 + eq.presence;
    if (resources.crystal < cost || resources.realityAnchor < anchorCost) return false;
    set({
      resources: {
        ...resources,
        crystal: resources.crystal - cost,
        realityAnchor: resources.realityAnchor - anchorCost,
      },
      equipment: {
        ...equipment,
        [slot]: { ...eq, presence: eq.presence + 1, isAnchored: eq.presence + 1 >= 5 },
      },
      showResourceAnim: '✨ 存在感提升',
    });
    return true;
  },

  craftEquip: (slot) => {
    const { resources, equipment } = get();
    const cost = slot === 'accessory' ? 40 : 30;
    if (resources.ironOre < cost) return;
    const baseMap: Record<string, { n: string; a: number; d: number }> = {
      weapon: { n: '鐵劍', a: 12, d: 0 },
      armor: { n: '鐵甲', a: 0, d: 10 },
      accessory: { n: '力量指環', a: 5, d: 0 },
    };
    const b = baseMap[slot];
    if (!b) return;
    const eq: Equipment = {
      id: `${slot}_${Date.now()}_${randInt(0,999)}`,
      slot,
      name: b.n,
      level: 1,
      presence: 0,
      baseAtk: b.a,
      baseDef: b.d,
      affixes: [],
      isAnchored: false,
    };
    set({
      resources: { ...resources, ironOre: resources.ironOre - cost },
      equipment: { ...equipment, [slot]: eq },
      showResourceAnim: `🔨 打造 ${b.n}`,
    });
  },

  equipItem: (eq) => {
    const { equipment } = get();
    set({ equipment: { ...equipment, [eq.slot]: eq } });
  },

  startCombat: () => {
    const { player } = get();
    const layerEnemies = ENEMIES[player.dreamLayer] || ENEMIES[1];
    const enemy = layerEnemies[randInt(0, layerEnemies.length - 1)];
    set({
      combat: {
        enemy,
        playerHp: player.hp,
        playerMaxHp: player.maxHp,
        tempoBar: 2,
        maxTempo: MAX_TEMPO,
        turn: 0,
        isPlayerTurn: true,
        isActive: true,
        result: 'none',
      },
    });
  },

  combatAction: (action) => {
    const state = get();
    const combat = state.combat;
    if (!combat || !combat.isActive) return;
    if (action === 'attack') {
      const { damage } = calcDamage(state.player.atk, combat.enemy.def, 1, false);
      const newEnemy = { ...combat.enemy, hp: Math.max(0, combat.enemy.hp - damage) };
      const newTempo = Math.min(combat.maxTempo, combat.tempoBar + 1);
      if (newEnemy.hp <= 0) {
        const reward = combat.enemy.isBoss
          ? { dreamFragment: state.resources.dreamFragment + randInt(5, 10), realityAnchor: state.resources.realityAnchor + 1 }
          : { dreamFragment: state.resources.dreamFragment + randInt(1, 3) };
        set({
          combat: { ...combat, enemy: newEnemy, isActive: false, result: 'victory', tempoBar: newTempo },
          resources: { ...state.resources, ...reward },
          player: { ...state.player, exp: state.player.exp + randInt(10, 20) },
        });
        return;
      }
      set({ combat: { ...combat, enemy: newEnemy, isPlayerTurn: false, tempoBar: newTempo } });
      setTimeout(doEnemyTurn, 400);
    } else if (action === 'defend') {
      set({ combat: { ...combat, tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 1), isPlayerTurn: false } });
      setTimeout(doEnemyTurn, 400);
    } else if (action === 'charge') {
      set({ combat: { ...combat, tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 3), isPlayerTurn: false } });
      setTimeout(doEnemyTurn, 400);
    }
  },

  endCombat: () => {
    set({ combat: null });
  },

  doRebirth: () => {
    const { player, equipment, resources } = get();
    const anchored = Object.fromEntries(
      Object.entries(equipment).filter(([_, eq]) => eq?.isAnchored)
    ) as Partial<Record<EquipmentSlot, Equipment>>;
    const soulWillpower = Math.floor(
      player.level * 3 +
      resources.dreamFragment * 0.5 +
      (player.dreamLayer - 1) * 10
    );
    set({
      player: {
        ...INITIAL_PLAYER,
        willpower: player.willpower + soulWillpower,
        dreamLayer: player.dreamLayer + 1,
        name: player.name,
      },
      resources: { ...INITIAL_RESOURCES, dreamShard: resources.dreamShard },
      buildings: JSON.parse(JSON.stringify(BUILDING_DEFS)),
      equipment: anchored,
      talentTrees: JSON.parse(JSON.stringify(TALENT_TREES)),
    });
    get().generateWillpowerCards();
  },

  buyWillpowerCard: (cardId) => {
    const { player, willpowerCards, activeCards } = get();
    const card = willpowerCards.find(c => c.id === cardId);
    if (!card || player.willpower < card.cost) return;
    if (activeCards.find(c => c.id === cardId)) return;
    set({
      player: { ...player, willpower: player.willpower - card.cost },
      activeCards: [...activeCards, card],
      willpowerCards: willpowerCards.filter(c => c.id !== cardId),
    });
  },

  generateWillpowerCards: () => {
    const shuffled = [...WILLPOWER_CARDS].sort(() => Math.random() - 0.5);
    set({ willpowerCards: shuffled.slice(0, 6) });
  },

  newGame: () => {
    set({
      player: { ...INITIAL_PLAYER },
      resources: { ...INITIAL_RESOURCES },
      equipment: {},
      talentTrees: JSON.parse(JSON.stringify(TALENT_TREES)),
      activeCards: [],
      willpowerCards: [],
      combat: null,
      buildings: JSON.parse(JSON.stringify(BUILDING_DEFS)),
      activeTab: 'gather',
      trainingClass: 'warrior',
    });
  },

  startNewGame: (name, playerClass) => {
    set({
      player: {
        ...INITIAL_PLAYER,
        name,
        playerClass,
        maxHp: playerClass === 'warrior' ? 130 : playerClass === 'rogue' ? 90 : 100,
        hp: playerClass === 'warrior' ? 130 : playerClass === 'rogue' ? 90 : 100,
        atk: playerClass === 'mage' ? 15 : playerClass === 'ranger' ? 14 : playerClass === 'rogue' ? 10 : 12,
        def: playerClass === 'warrior' ? 8 : playerClass === 'rogue' ? 3 : 4,
      },
      trainingClass: playerClass,
      activeTab: 'gather',
      resources: { ...INITIAL_RESOURCES, dreamShard: 50 },
    });
  },

  loadSave: (save) => {
    set({
      player: save.player,
      resources: save.resources,
      equipment: save.equipment,
      talentTrees: save.talentTrees,
      buildings: save.buildings || JSON.parse(JSON.stringify(BUILDING_DEFS)),
      trainingClass: save.trainingClass || save.player.playerClass,
      lastSaveTime: save.lastSavedAt,
    });
  },

  getSave: () => {
    const { player, resources, equipment, talentTrees, buildings, trainingClass, lastSaveTime } = get();
    return {
      player,
      resources: { ...resources },
      equipment: { ...equipment },
      talentTrees: JSON.parse(JSON.stringify(talentTrees)),
      buildings: JSON.parse(JSON.stringify(buildings)),
      trainingClass,
      lastSavedAt: lastSaveTime,
    } as GameSave;
  },
}));

function doEnemyTurn() {
  const state = useGameStore.getState();
  const combat = state.combat;
  if (!combat || !combat.isActive) return;
  const { damage } = calcDamage(combat.enemy.atk, 0, 1, false);
  const newHp = Math.max(0, combat.playerHp - damage);
  if (newHp <= 0) {
    useGameStore.setState({ combat: { ...combat, playerHp: 0, isActive: false, result: 'defeat' } });
    return;
  }
  useGameStore.setState({
    combat: {
      ...combat,
      playerHp: newHp,
      tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 1),
      turn: combat.turn + 1,
      isPlayerTurn: true,
    },
  });
}
