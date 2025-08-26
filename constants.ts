import { GridCellType, TowerType, EnemyType, TowerStats, EnemyStats, Vector2D, WaveConfig, TowerAbilityType } from './types';

export const TILE_SIZE = 40;
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 15;

export const GAME_MAP: GridCellType[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
].map(row => row.map(cell => cell === 0 ? GridCellType.PATH : GridCellType.TOWER_SPOT));

export const ENEMY_PATH: Vector2D[] = [
  { x: -1, y: 2 },
  { x: 6, y: 2 },
  { x: 6, y: 7 },
  { x: 9, y: 7 },
  { x: 9, y: 4 },
  { x: 16, y: 4 },
  { x: 16, y: 7 },
  { x: 12, y: 7 },
  { x: 12, y: 10 },
  { x: 2, y: 10 },
  { x: 2, y: 15 },
];

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  [TowerType.POISON_ARCHER]: {
    name: "Poison Archer",
    cost: 80,
    damage: 15,
    range: 3.5,
    fireRate: 2,
    projectileColor: '#a3e635',
    projectileSpeed: 10,
    projectileVisual: 'arrow',
    pixelArt: [
      ['#0000', '#5a6331', '#5a6331', '#0000'],
      ['#4f4229', '#5a6331', '#9ca3af', '#0000'],
      ['#4f4229', '#5a6331', '#9ca3af', '#0000'],
      ['#0000', '#5a6331', '#5a6331', '#0000'],
    ],
    ability: { type: TowerAbilityType.POISON, dps: 20, duration: 3 },
    description: "Shots poison enemies, dealing damage over time.",
  },
  [TowerType.CANNON]: {
    name: "Cannon",
    cost: 180,
    damage: 50,
    range: 2.5,
    fireRate: 0.75,
    projectileColor: '#4b5563',
    projectileSpeed: 7,
    projectileVisual: 'circle',
    pixelArt: [
      ['#0000', '#6b7280', '#6b7280', '#0000'],
      ['#9ca3af', '#9ca3af', '#9ca3af', '#9ca3af'],
      ['#d1d5db', '#d1d5db', '#d1d5db', '#d1d5db'],
      ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb'],
    ],
    ability: { type: TowerAbilityType.SPLASH, radius: 1.5 },
    description: "Deals splash damage to enemies near the target.",
  },
  [TowerType.CHAIN_WIZARD]: {
    name: "Chain Wizard",
    cost: 300,
    damage: 40,
    range: 4,
    fireRate: 1.25,
    projectileColor: '#8b5cf6',
    projectileSpeed: 8,
    projectileVisual: 'spark',
    pixelArt: [
      ['#0000', '#4c1d95', '#0000', '#0000'],
      ['#0000', '#6d28d9', '#6d28d9', '#0000'],
      ['#c4b5fd', '#8b5cf6', '#8b5cf6', '#c4b5fd'],
      ['#0000', '#4a044e', '#4a044e', '#0000'],
    ],
    ability: { type: TowerAbilityType.CHAIN, targets: 3, range: 3, damageFalloff: 0.7 },
    description: "Magic bolt chains to multiple nearby enemies.",
  },
  [TowerType.ICE_MAGE]: {
    name: "Ice Mage",
    cost: 220,
    damage: 20,
    range: 3,
    fireRate: 1,
    projectileColor: '#7dd3fc',
    projectileSpeed: 9,
    projectileVisual: 'spark',
    pixelArt: [
        ['#0000', '#38bdf8', '#38bdf8', '#0000'],
        ['#7dd3fc', '#e0f2fe', '#e0f2fe', '#7dd3fc'],
        ['#0000', '#38bdf8', '#38bdf8', '#0000'],
        ['#0000', '#075985', '#075985', '#0000'],
    ],
    ability: { type: TowerAbilityType.SLOW, factor: 0.5, duration: 2 },
    description: "Slows enemies, making them easier to hit.",
  },
  [TowerType.FIRE_MAGE]: {
    name: "Fire Mage",
    cost: 260,
    damage: 30,
    range: 3.5,
    fireRate: 1.5,
    projectileColor: '#fb923c',
    projectileSpeed: 8,
    projectileVisual: 'spark',
    pixelArt: [
      ['#0000', '#9a3412', '#0000', '#0000'],
      ['#0000', '#c2410c', '#c2410c', '#0000'],
      ['#fcd34d', '#f97316', '#f97316', '#fcd34d'],
      ['#0000', '#451a03', '#451a03', '#0000'],
    ],
    ability: { type: TowerAbilityType.BURN, dps: 35, duration: 2 },
    description: "Burns enemies, dealing heavy damage over time.",
  },
};

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  [EnemyType.GOBLIN]: {
    health: 100,
    speed: 2.4,
    goldValue: 5,
    pixelArt: [
        ['#0000', '#166534', '#166534', '#0000'],
        ['#16a34a', '#4ade80', '#4ade80', '#16a34a'],
        ['#0000', '#16a34a', '#16a34a', '#0000'],
        ['#0000', '#78350f', '#78350f', '#0000'],
    ],
  },
  [EnemyType.ORC]: {
    health: 300,
    speed: 1.6,
    goldValue: 15,
     pixelArt: [
        ['#525252', '#737373', '#737373', '#525252'],
        ['#737373', '#a3a3a3', '#a3a3a3', '#737373'],
        ['#a3a3a3', '#a3a3a3', '#a3a3a3', '#a3a3a3'],
        ['#543210', '#543210', '#543210', '#543210'],
    ],
  },
   [EnemyType.BOSS]: {
    health: 5000,
    speed: 1.0,
    goldValue: 100,
     pixelArt: [
        ['#7f1d1d', '#b91c1c', '#b91c1c', '#7f1d1d'],
        ['#b91c1c', '#ef4444', '#ef4444', '#b91c1c'],
        ['#ef4444', '#fca5a5', '#fca5a5', '#ef4444'],
        ['#450a0a', '#450a0a', '#450a0a', '#450a0a'],
    ],
  },
};

export const WAVE_CONFIG: WaveConfig[] = [
  { enemies: [{ type: EnemyType.GOBLIN, count: 10, spawnDelay: 1000 }], timeLimit: 45 },
  { enemies: [{ type: EnemyType.GOBLIN, count: 15, spawnDelay: 800 }], timeLimit: 50 },
  { enemies: [{ type: EnemyType.GOBLIN, count: 20, spawnDelay: 700 }, { type: EnemyType.ORC, count: 3, spawnDelay: 3000 }], timeLimit: 60 },
  { enemies: [{ type: EnemyType.ORC, count: 10, spawnDelay: 1500 }], timeLimit: 60 },
  { enemies: [{ type: EnemyType.GOBLIN, count: 30, spawnDelay: 500 }, { type: EnemyType.ORC, count: 5, spawnDelay: 2500 }], timeLimit: 75 },
  { enemies: [{ type: EnemyType.ORC, count: 15, spawnDelay: 1000 }], timeLimit: 75 },
  { enemies: [{ type: EnemyType.GOBLIN, count: 20, spawnDelay: 400 }, { type: EnemyType.ORC, count: 10, spawnDelay: 1200 }, { type: EnemyType.BOSS, count: 1, spawnDelay: 15000 }], timeLimit: 90 },
];

export const CARD_POOL = [
    TowerType.POISON_ARCHER, TowerType.POISON_ARCHER, 
    TowerType.CANNON, TowerType.CANNON, 
    TowerType.CHAIN_WIZARD, 
    TowerType.ICE_MAGE, TowerType.ICE_MAGE,
    TowerType.FIRE_MAGE
];

export const INITIAL_PLAYER_HEALTH = 20;
export const INITIAL_PLAYER_GOLD = 200;
export const INITIAL_REROLL_COST = 25;