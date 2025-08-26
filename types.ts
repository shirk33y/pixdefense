export enum GameState {
  SETUP = 'SETUP',
  WAVE_ACTIVE = 'WAVE_ACTIVE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export enum GridCellType {
  PATH = 'PATH',
  TOWER_SPOT = 'TOWER_SPOT',
  OBSTACLE = 'OBSTACLE',
}

export interface Vector2D {
  x: number;
  y: number;
}

export enum TowerType {
  POISON_ARCHER = 'POISON_ARCHER',
  CANNON = 'CANNON',
  CHAIN_WIZARD = 'CHAIN_WIZARD',
  ICE_MAGE = 'ICE_MAGE',
  FIRE_MAGE = 'FIRE_MAGE',
}

export enum TowerAbilityType {
  POISON = 'POISON',
  BURN = 'BURN',
  SLOW = 'SLOW',
  SPLASH = 'SPLASH',
  CHAIN = 'CHAIN',
}

export type TowerAbility = 
  | { type: TowerAbilityType.POISON; dps: number; duration: number }
  | { type: TowerAbilityType.BURN; dps: number; duration: number }
  | { type: TowerAbilityType.SLOW; factor: number; duration: number }
  | { type: TowerAbilityType.SPLASH; radius: number }
  | { type: TowerAbilityType.CHAIN; targets: number; range: number, damageFalloff: number };

export interface TowerStats {
  name: string;
  cost: number;
  damage: number;
  range: number; // in grid units
  fireRate: number; // attacks per second
  pixelArt: string[][];
  projectileColor: string;
  projectileSpeed: number; // grid units per second
  projectileVisual: ProjectileVisual;
  ability: TowerAbility;
  description: string;
}

export interface PlacedTower {
  id: string;
  type: TowerType;
  position: Vector2D; // grid coordinates
  cooldown: number; // time until next shot
}

export enum EnemyType {
  GOBLIN = 'GOBLIN',
  ORC = 'ORC',
  BOSS = 'BOSS',
}

export interface EnemyStats {
  health: number;
  speed: number; // grid units per second
  goldValue: number;
  pixelArt: string[][];
}

export enum StatusEffectType {
  POISON = 'POISON',
  BURN = 'BURN',
  SLOW = 'SLOW',
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  startedAt: number;
  // For DoT
  dps?: number;
  // For Slow
  slowFactor?: number;
}


export interface ActiveEnemy {
  id:string;
  type: EnemyType;
  position: Vector2D; // pixel coordinates
  health: number;
  maxHealth: number;
  pathIndex: number;
  statusEffects: StatusEffect[];
}

export interface Card {
  id: string;
  type: TowerType;
  locked: boolean;
}

export type ProjectileVisual = 'circle' | 'arrow' | 'spark';

export interface Projectile {
  id: string;
  position: Vector2D; // pixel coordinates
  targetId: string;
  damage: number;
  color: string;
  speed: number; // pixels per second
  velocity: Vector2D;
  visual: ProjectileVisual;
  rotation: number;
  abilityData: TowerAbility;
}

export interface DeathEffect {
  id: string;
  position: Vector2D;
  createdAt: number;
}

export interface WaveConfig {
  enemies: { type: EnemyType; count: number; spawnDelay: number }[];
  timeLimit: number;
}

export interface ChainLightningEffect {
  id: string;
  from: Vector2D;
  to: Vector2D;
  createdAt: number;
}
