export type TowerType = 'dart' | 'tack' | 'sniper' | 'bomb' | 'ice' | 'super' | 'boomerang' | 'ninja' | 'glue' | 'wizard' | 'alchemist' | 'druid' | 'farm' | 'sub' | 'buccaneer' | 'pool' | 'hero' | 'ace' | 'heli' | 'mortar' | 'dartling' | 'spike' | 'village' | 'engineer' | 'beast' | 'mermonkey';

export type TargetMode = 'First' | 'Last' | 'Strong' | 'Close';

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  description: string;
  effects: {
    range?: number;
    cooldownMult?: number;
    damage?: number;
    pierce?: number;
    bulletSpeed?: number;
    splashRadius?: number;
    freezeTime?: number;
    canSeeCamo?: boolean;
    bulletType?: string;
  };
}

export interface TowerStats {
  cost: number;
  baseRange: number;
  baseCooldown: number; // in frames or milliseconds
  baseDamage: number;
  basePierce: number;
  description: string;
  upgrades: [Upgrade[], Upgrade[], Upgrade[]];
}

export type BloonType = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Pink' | 'Black' | 'White' | 'Purple' | 'Lead' | 'Zebra' | 'Rainbow' | 'Ceramic' | 'MOAB' | 'BFB' | 'ZOMG' | 'DDT' | 'BAD';

export interface Bloon {
  id: string;
  type: BloonType;
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  size: number;
  color: string;
  reward: number;
  distanceTraversed: number; // Crucial for sorting target rules (First, Last)
  pathSegmentIndex: number;
  segmentProgress: number; // 0 to 1 between two map points
  isFrozen: boolean;
  freezeTimer: number; // in frames/sec
  isSlowed: boolean;
  slowTimer: number;
  isCeramic: boolean;
  isMoab: boolean;
  isCamo?: boolean;
  isRegrow?: boolean;
  isFortified?: boolean;
  regrowTimer?: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  range: number;
  cooldown: number; // current timer remaining
  baseCooldown: number; // raw value
  damage: number;
  pierce: number;
  cost: number;
  popCount: number;
  targetMode: TargetMode;
  level: number; // Hero level or upgrade level
  upgradeLevels: [number, number, number]; // Levels in Top, Middle, Bottom paths. E.g. [3, 2, 0]
  upgradeIndex: number; // index of next upgrade available
  upgradesPurchased: number; // count
  heroXp?: number; // for heroes
  heroMaxXp?: number;
  lastAngle?: number;
}

export interface Projectile {
  id: string;
  type: 'dart' | 'tack' | 'bullet' | 'bomb' | 'iceRing' | 'beam' | 'boomerang' | 'shuriken' | 'glue' | 'magic' | 'potion' | 'thorn' | 'grape' | 'spike' | 'spikes' | 'plane' | 'rocket' | 'ring' | 'grenade' | 'energy';
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  pierce: number;
  targetBloonId?: string; // for homing or direct hit
  originTowerId?: string; // raw ID of the source tower
  splashRadius?: number;
  rangeRemaining: number; // disappear if too far
  damageType?: 'sharp' | 'explosive' | 'cold' | 'magic' | 'plasma' | 'acid' | 'normal';
  upgradeLevels?: [number, number, number];
}

export interface Part {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number; // lifetime remaining
  maxLife: number;
  size: number;
  type: 'pop' | 'spark' | 'smoke' | 'ice';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'CHIMPS';

export interface GameMap {
  id: string;
  name: string;
  description: string;
  theme: 'grass' | 'desert' | 'water' | 'volcano' | 'space';
  track: { x: number; y: number }[]; // Coordinates on a normalized 0-1000 scale
  trackWidth: number;
  decorations: {
    type: 'tree' | 'rock' | 'cactus' | 'water' | 'lava' | 'star' | 'crater';
    x: number;
    y: number;
    size: number;
  }[];
  bgColor: string;
  trackColor: string;
  borderColor: string;
}

export interface PersistentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  category: 'Monkeys' | 'Economy' | 'Hero';
  effect: {
    startingCashBonus?: number;
    discountMonkeysPercent?: number;
    extraLivesBonus?: number;
    heroXpRateBonus?: number;
  };
}

export type HeroType = 'quincy' | 'gwendolin' | 'obyn';

export interface HeroConfig {
  id: HeroType;
  name: string;
  description: string;
  quote: string;
  primaryColor: string;
  baseCost: number;
  perks: { level: number; desc: string }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardValue: number; // Monkey Money
}

export interface ThemeColors {
  bg: string;
  header: string;
  panel: string;
  subpanel: string;
  accent: string;
  button: string;
}

export interface UserAccount {
  id: string;
  username: string;
  avatarId: string; // avatar identifier (e.g. 'wizard', 'super', 'ninja', 'druid')
  createdAt: string;
  monkeyMoney: number;
  purchasedUpgradeIds: string[];
  achievements: Achievement[];
  themeColors?: ThemeColors;
}

