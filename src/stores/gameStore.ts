import { create } from 'zustand';
import type {
  Player, Resources, Equipment, EquipmentSlot, CombatState,
  CombatAction, TalentTree, PlayerClass, WillpowerCard, GameSave,
} from '../lib/types';
import {
  INITIAL_PLAYER, INITIAL_RESOURCES, TALENT_TREES, MAX_TEMPO,
  ENEMIES, WILLPOWER_CARDS,
} from '../lib/constants';
import { calcDamage, expForLevel, randInt } from '../lib/gameEngine';

interface GameStore {
  // Core state
  player: Player;
  resources: Resources;
  equipment: Partial<Record<EquipmentSlot, Equipment>>;
  talentTrees: Record<PlayerClass, TalentTree>;
  activeCards: WillpowerCard[];
  willpowerCards: WillpowerCard[];

  // Combat
  combat: CombatState | null;

  // UI
  screen: 'camp' | 'forge' | 'training' | 'combat' | 'equipment' | 'rebirth' | 'loading';
  showResourceAnim: string | null;
  lastSaveTime: number;

  // Actions
  setScreen: (s: GameStore['screen']) => void;
  clickGather: () => void;
  clickTrain: () => void;
  calcIdleResources: (elapsedMs: number) => void;
  addTalentPoint: (className: PlayerClass, nodeId: string) => void;
  forgeEquip: (slot: EquipmentSlot, type: 'level' | 'presence') => boolean;
  upgradePresence: (slot: EquipmentSlot) => boolean;
  startCombat: () => void;
  combatAction: (action: CombatAction) => void;
  endCombat: () => void;
  doRebirth: () => void;
  buyWillpowerCard: (cardId: string) => void;
  equipItem: (eq: Equipment) => void;
  generateWillpowerCards: () => void;
  newGame: () => void;
  startNewGame: (name: string, playerClass: PlayerClass) => void;
  loadSave: (save: GameSave) => void;
  getSave: () => GameSave;
  tickIdle: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: { ...INITIAL_PLAYER },
  resources: { ...INITIAL_RESOURCES },
  equipment: {},
  talentTrees: JSON.parse(JSON.stringify(TALENT_TREES)),
  activeCards: [],
  willpowerCards: [],
  combat: null,
  screen: 'camp',
  showResourceAnim: null,
  lastSaveTime: Date.now(),

  setScreen: (s) => set({ screen: s }),

  clickGather: () => {
    const { player, resources } = get();
    const layerBonus = 1 + (player.dreamLayer - 1) * 0.2;
    set({
      resources: {
        ...resources,
        ironOre: resources.ironOre + Math.floor(5 * layerBonus),
        crystal: resources.crystal + Math.floor(2 * layerBonus),
      },
      showResourceAnim: '採集',
    });
  },

  clickTrain: () => {
    const { player } = get();
    const expGain = 8 + player.level * 2;
    const newExp = player.exp + expGain;
    const needed = expForLevel(player.level, player.dreamLayer);
    if (newExp >= needed) {
      set({
        player: {
          ...player,
          exp: newExp - needed,
          level: player.level + 1,
          talentPoints: player.talentPoints + 1,
          maxHp: player.maxHp + 10,
          hp: player.maxHp + 10,
          atk: player.atk + 2,
        },
        showResourceAnim: '升級！',
      });
    } else {
      set({
        player: { ...player, exp: newExp },
        showResourceAnim: '訓練',
      });
    }
  },

  calcIdleResources: (elapsedMs) => {
    const { player, resources } = get();
    const hours = elapsedMs / 3600000;
    if (hours < 0.01) return;
    const baseRate = 10 + player.level * 2;
    const layerMultiplier = 1 + (player.dreamLayer - 1) * 0.2;
    set({
      resources: {
        ...resources,
        ironOre: resources.ironOre + Math.floor(hours * baseRate * layerMultiplier),
        crystal: resources.crystal + Math.floor(hours * (baseRate * 0.4) * layerMultiplier),
      },
      lastSaveTime: Date.now(),
    });
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

  forgeEquip: (slot, type) => {
    const { resources, equipment } = get();
    if (type === 'level') {
      const cost = 30 + ((equipment[slot]?.level || 0) * 10);
      if (resources.ironOre < cost) return false;
      const eq = equipment[slot];
      if (!eq) return false;
      set({
        resources: { ...resources, ironOre: resources.ironOre - cost },
        equipment: { ...equipment, [slot]: { ...eq, level: eq.level + 1 } },
        showResourceAnim: '鍛造升級',
      });
      return true;
    }
    return false;
  },

  upgradePresence: (slot) => {
    const { resources, equipment } = get();
    const eq = equipment[slot];
    if (!eq || eq.presence >= 5) return false;
    const cost = 20 + eq.presence * 10;
    const anchorCost = 1 + eq.presence;
    if (resources.crystal < cost || resources.realityAnchor < anchorCost) return false;
    const isAnchored = eq.presence + 1 >= 5;
    set({
      resources: {
        ...resources,
        crystal: resources.crystal - cost,
        realityAnchor: resources.realityAnchor - anchorCost,
      },
      equipment: {
        ...equipment,
        [slot]: { ...eq, presence: eq.presence + 1, isAnchored },
      },
      showResourceAnim: '存在感提升',
    });
    return true;
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
        cooldowns: {},
        turn: 0,
        isPlayerTurn: true,
        isActive: true,
        result: 'none',
      },
      screen: 'combat',
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
      const isDead = newEnemy.hp <= 0;
      if (isDead) {
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
      set({
        combat: { ...combat, enemy: newEnemy, isPlayerTurn: false, tempoBar: newTempo },
      });
      // Enemy turn
      setTimeout(() => doEnemyTurn(get, set), 400);
    } else if (action === 'defend') {
      set({
        combat: {
          ...combat,
          tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 1),
          isPlayerTurn: false,
        },
      });
      setTimeout(() => doEnemyTurn(get, set), 400);
    } else if (action === 'charge') {
      set({
        combat: {
          ...combat,
          tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 3),
          isPlayerTurn: false,
        },
      });
      setTimeout(() => doEnemyTurn(get, set), 400);
    }
  },

  endCombat: () => {
    set({ combat: null, screen: 'camp' });
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
      resources: { ...INITIAL_RESOURCES },
      equipment: anchored,
      talentTrees: JSON.parse(JSON.stringify(TALENT_TREES)),
      screen: 'rebirth',
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

  equipItem: (eq) => {
    const { equipment } = get();
    set({
      equipment: { ...equipment, [eq.slot]: eq },
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
      screen: 'camp',
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
      screen: 'camp',
    });
  },

  loadSave: (save) => {
    set({
      player: save.player,
      resources: save.resources,
      equipment: save.equipment,
      talentTrees: save.talentTrees,
      lastSaveTime: save.lastSavedAt,
    });
  },

  getSave: () => {
    const { player, resources, equipment, talentTrees, lastSaveTime } = get();
    return {
      player,
      resources: { ...resources },
      equipment: { ...equipment },
      talentTrees: JSON.parse(JSON.stringify(talentTrees)),
      lastSavedAt: lastSaveTime,
    } as GameSave;
  },

  tickIdle: () => {
    const { player, resources } = get();
    const baseRate = 10 + player.level * 2;
    const layerMultiplier = 1 + (player.dreamLayer - 1) * 0.2;
    set({
      resources: {
        ...resources,
        ironOre: resources.ironOre + Math.floor(baseRate * layerMultiplier * 0.05),
        crystal: resources.crystal + Math.floor((baseRate * 0.4) * layerMultiplier * 0.05),
      },
    });
  },
}));

function doEnemyTurn(get: () => GameStore, set: (partial: Partial<GameStore>) => void) {
  const state = get();
  const combat = state.combat;
  if (!combat || !combat.isActive) return;
  const isDefending = false; // player chose defend in previous action
  const { damage } = calcDamage(combat.enemy.atk, 0, 1, isDefending);
  const newHp = Math.max(0, combat.playerHp - damage);
  if (newHp <= 0) {
    set({
      combat: { ...combat, playerHp: 0, isActive: false, result: 'defeat' },
    });
    return;
  }
  set({
    combat: {
      ...combat,
      playerHp: newHp,
      tempoBar: Math.min(combat.maxTempo, combat.tempoBar + 1),
      turn: combat.turn + 1,
      isPlayerTurn: true,
    },
  });
}
