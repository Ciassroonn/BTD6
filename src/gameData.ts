import { GameMap, TowerStats, PersistentUpgrade, HeroConfig, Achievement, BloonType, TowerType } from './types';

// Normalized grid is 1000 x 1000 for track plotting. Responsive scaled coordinates are calculated during rendering.
export const MAPS: GameMap[] = [
  {
    id: 'monkey_meadow',
    name: 'Monkey Meadow',
    description: 'A classic winding pathway through fresh green grass. Perfect for beginners.',
    theme: 'grass',
    trackWidth: 32,
    bgColor: '#4ade80', // green-400
    trackColor: '#e0a96d', // sandy
    borderColor: '#b45309', // amber-700
    track: [
      { x: 0, y: 150 },
      { x: 250, y: 150 },
      { x: 250, y: 450 },
      { x: 120, y: 450 },
      { x: 120, y: 750 },
      { x: 450, y: 750 },
      { x: 450, y: 450 },
      { x: 650, y: 450 },
      { x: 650, y: 150 },
      { x: 850, y: 150 },
      { x: 850, y: 800 },
      { x: 1000, y: 800 }
    ],
    decorations: [
      { type: 'tree', x: 100, y: 300, size: 40 },
      { type: 'tree', x: 500, y: 200, size: 55 },
      { type: 'tree', x: 750, y: 300, size: 45 },
      { type: 'tree', x: 350, y: 600, size: 50 },
      { type: 'tree', x: 950, y: 450, size: 40 },
      { type: 'rock', x: 50, y: 550, size: 25 },
      { type: 'rock', x: 780, y: 650, size: 30 }
    ]
  },
  {
    id: 'in_the_loop',
    name: 'In the Loop',
    description: 'A sandy loop-the-loop track where Bloons circle back near your active defenses.',
    theme: 'desert',
    trackWidth: 30,
    bgColor: '#fde047', // yellow-300
    trackColor: '#fbbf24', // amber-400
    borderColor: '#92400e', // amber-800
    track: [
      { x: 500, y: 0 },
      { x: 500, y: 250 },
      // Loop begins
      { x: 300, y: 250 },
      { x: 300, y: 550 },
      { x: 700, y: 550 },
      { x: 700, y: 250 },
      { x: 500, y: 250 },
      // Loop ends, continue down
      { x: 500, y: 750 },
      { x: 150, y: 750 },
      { x: 150, y: 1000 }
    ],
    decorations: [
      { type: 'cactus', x: 150, y: 150, size: 30 },
      { type: 'cactus', x: 800, y: 150, size: 35 },
      { type: 'cactus', x: 850, y: 650, size: 30 },
      { type: 'rock', x: 500, y: 400, size: 40 }, // in center of loop
      { type: 'rock', x: 320, y: 850, size: 25 }
    ]
  },
  {
    id: 'cubism',
    name: 'Cubism',
    description: 'A chaotic, geometric layout crossing paths in deep space with multiple intersections.',
    theme: 'space',
    trackWidth: 26,
    bgColor: '#1e1b4b', // indigo-950
    trackColor: '#312e81', // indigo-900
    borderColor: '#6366f1', // indigo-500
    track: [
      { x: 100, y: 0 },
      { x: 100, y: 800 },
      { x: 900, y: 800 },
      { x: 900, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 500 },
      { x: 700, y: 500 },
      { x: 700, y: 650 },
      { x: 0, y: 650 },
      { x: 0, y: 1000 }
    ],
    decorations: [
      { type: 'star', x: 200, y: 100, size: 8 },
      { type: 'star', x: 500, y: 80, size: 12 },
      { type: 'star', x: 750, y: 110, size: 6 },
      { type: 'star', x: 850, y: 600, size: 10 },
      { type: 'star', x: 150, y: 920, size: 7 },
      { type: 'crater', x: 500, y: 350, size: 45 },
      { type: 'crater', x: 800, y: 900, size: 35 },
      { type: 'crater', x: 150, y: 500, size: 40 }
    ]
  },
  {
    id: 'logs',
    name: 'Logs',
    description: 'A woodsy forest wetland track weaving under hollow trunks. Extremely long length.',
    theme: 'water',
    trackWidth: 32,
    bgColor: '#064e3b', // emerald-950
    trackColor: '#27272a', // zinc-800
    borderColor: '#10b981', // emerald-500
    track: [
      { x: 0, y: 900 },
      { x: 900, y: 900 },
      { x: 900, y: 500 },
      { x: 100, y: 500 },
      { x: 100, y: 100 },
      { x: 800, y: 100 },
      { x: 800, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 700 },
      { x: 1000, y: 700 }
    ],
    decorations: [
      { type: 'water', x: 500, y: 600, size: 90 },
      { type: 'tree', x: 50, y: 300, size: 40 },
      { type: 'tree', x: 950, y: 100, size: 45 },
      { type: 'tree', x: 600, y: 200, size: 50 },
      { type: 'rock', x: 450, y: 400, size: 30 }
    ]
  },
  {
    id: 'scorched_crater',
    name: 'Scorched Crater',
    description: 'A brutal volcanic trench with active lava flows and shorter shortcuts. The ultimate layout challenge.',
    theme: 'volcano',
    trackWidth: 34,
    bgColor: '#1c1917', // stone-900
    trackColor: '#451a03', // orange-950 (scorched bridge)
    borderColor: '#ea580c', // orange-600
    track: [
      { x: 0, y: 500 },
      { x: 300, y: 500 },
      { x: 300, y: 150 },
      { x: 700, y: 150 },
      { x: 700, y: 500 },
      { x: 1000, y: 500 }
    ],
    decorations: [
      { type: 'lava', x: 500, y: 500, size: 80 },
      { type: 'lava', x: 150, y: 200, size: 50 },
      { type: 'crater', x: 850, y: 300, size: 40 },
      { type: 'rock', x: 80, y: 800, size: 30 },
      { type: 'rock', x: 900, y: 800, size: 30 },
      { type: 'cactus', x: 500, y: 80, size: 25 }
    ]
  },
  {
    id: 'sandy_shore',
    name: 'Sandy Shore',
    description: 'A tropical paradise where some sections wind directly near beautiful tidal lagoons. Water-based placements are natively supported.',
    theme: 'desert',
    trackWidth: 30,
    bgColor: '#fef08a', // yellow-200
    trackColor: '#ffedd5', // orange-50
    borderColor: '#d97706', // amber-600
    track: [
      { x: 0, y: 150 },
      { x: 600, y: 150 },
      { x: 600, y: 400 },
      { x: 150, y: 400 },
      { x: 150, y: 800 },
      { x: 1000, y: 800 }
    ],
    decorations: [
      { type: 'water', x: 400, y: 550, size: 100 },
      { type: 'tree', x: 400, y: 250, size: 45 },
      { type: 'tree', x: 800, y: 300, size: 40 },
      { type: 'cactus', x: 900, y: 600, size: 30 },
      { type: 'rock', x: 750, y: 900, size: 35 }
    ]
  },
  {
    id: 'cosmic_clover',
    name: 'Cosmic Clover',
    description: 'A geometric clover-leaf pattern in the depth of space. Bloons travel along overlapping triple bypasses.',
    theme: 'space',
    trackWidth: 26,
    bgColor: '#0c0a09', // stone-950
    trackColor: '#3b0764', // purple-950
    borderColor: '#a855f7', // purple-500
    track: [
      { x: 500, y: 0 },
      { x: 500, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 500 },
      { x: 800, y: 500 },
      { x: 800, y: 800 },
      { x: 500, y: 800 },
      { x: 500, y: 1000 }
    ],
    decorations: [
      { type: 'star', x: 100, y: 100, size: 10 },
      { type: 'star', x: 900, y: 150, size: 12 },
      { type: 'star', x: 300, y: 850, size: 8 },
      { type: 'star', x: 700, y: 820, size: 14 },
      { type: 'crater', x: 500, y: 500, size: 60 },
      { type: 'crater', x: 150, y: 650, size: 40 },
      { type: 'crater', x: 850, y: 350, size: 45 }
    ]
  },
  {
    id: 'infernal_spiral',
    name: 'Infernal Spiral',
    description: 'A molten rock maze winding directly towards the volcanic core. Watch out for rapid fast-moving bloon streams.',
    theme: 'volcano',
    trackWidth: 24,
    bgColor: '#1c1917', // stone-900
    trackColor: '#7c2d12', // orange-900
    borderColor: '#ea580c', // orange-600
    track: [
      { x: 0, y: 100 },
      { x: 900, y: 100 },
      { x: 900, y: 900 },
      { x: 200, y: 900 },
      { x: 200, y: 350 },
      { x: 700, y: 350 },
      { x: 700, y: 650 },
      { x: 450, y: 650 },
      { x: 450, y: 500 },
      { x: 1000, y: 500 }
    ],
    decorations: [
      { type: 'lava', x: 450, y: 500, size: 45 },
      { type: 'lava', x: 500, y: 200, size: 55 },
      { type: 'rock', x: 100, y: 500, size: 35 },
      { type: 'rock', x: 800, y: 750, size: 40 },
      { type: 'crater', x: 50, y: 850, size: 30 }
    ]
  }
];

export const TOWER_STATS: Record<Exclude<TowerType, 'hero'>, TowerStats> = {
  dart: {
    cost: 200,
    baseRange: 130,
    baseCooldown: 50,
    baseDamage: 1,
    basePierce: 2,
    description: 'Shoots a single straight dart with minor piercing power. Cheap and versatile.',
    upgrades: [
      [
        { id: 'dart_t1_long', name: 'Long Range Darts', cost: 90, description: 'Increases targeting range significantly.', effects: { range: 25 } },
        { id: 'dart_t2_enhanced', name: 'Enhanced Eyesight', cost: 120, description: 'Further boosts range and grants camo vision.', effects: { range: 35, canSeeCamo: true } },
        { id: 'dart_t3_spike', name: 'Spike-o-pult', cost: 300, description: 'Fires heavy spiked balls, increasing damage and pierce.', effects: { pierce: 4, damage: 1 } },
        { id: 'dart_t4_jugger', name: 'Juggernaut', cost: 1000, description: 'Crushes ceramic bloons with great force.', effects: { pierce: 8, damage: 3 } },
        { id: 'dart_t5_ultra', name: 'Ultra-Juggernaut', cost: 3500, description: 'Gigantic spiked balls that split on impact.', effects: { pierce: 15, damage: 8 } }
      ],
      [
        { id: 'dart_m1_quick', name: 'Quick Shots', cost: 100, description: 'Increases attack rate of the monkey.', effects: { cooldownMult: 0.8 } },
        { id: 'dart_m2_very_quick', name: 'Very Quick Shots', cost: 190, description: 'Rapid reloading speed for quick defense.', effects: { cooldownMult: 0.65 } },
        { id: 'dart_m3_triple', name: 'Triple Shots', cost: 400, description: 'Three darts at once, increasing pierce.', effects: { pierce: 1, cooldownMult: 0.8 } },
        { id: 'dart_m4_fan', name: 'Monkey Fan Club', cost: 1800, description: 'Drastically increases basic speed and damage.', effects: { cooldownMult: 0.4, damage: 1 } },
        { id: 'dart_m5_plasma', name: 'Plasma Fan Club Master', cost: 6050, description: 'An elite force firing actual plasma streams.', effects: { cooldownMult: 0.25, damage: 2, pierce: 3 } }
      ],
      [
        { id: 'dart_b1_sharp', name: 'Sharp Shots', cost: 140, description: 'Darts pierce through more bloons.', effects: { pierce: 1 } },
        { id: 'dart_b2_razor', name: 'Razor Sharp Shots', cost: 210, description: 'Slices through groups of bloons easily.', effects: { pierce: 2 } },
        { id: 'dart_b3_crossbow', name: 'Crossbow', cost: 625, description: 'Long range bow with higher damage.', effects: { range: 35, pierce: 2, damage: 1 } },
        { id: 'dart_b4_sharpshooter', name: 'Sharp Shooter', cost: 2000, description: 'High precision and high critical damage.', effects: { range: 50, damage: 3 } },
        { id: 'dart_b5_master', name: 'Crossbow Master', cost: 7500, description: 'Absolute master of archery and speed.', effects: { range: 75, damage: 7, pierce: 5, cooldownMult: 0.5 } }
      ]
    ]
  },
  tack: {
    cost: 280,
    baseRange: 85,
    baseCooldown: 70,
    baseDamage: 1,
    basePierce: 1,
    description: 'Shoots a burst of 8 sharp tacks in circular directions. Best placed in curves.',
    upgrades: [
      [
        { id: 'tack_t1_fast', name: 'Faster Shooting', cost: 150, description: 'Fires tacks at an increased velocity.', effects: { cooldownMult: 0.75 } },
        { id: 'tack_t2_even_fast', name: 'Even Faster Shooting', cost: 300, description: 'Takes attack speed to high levels.', effects: { cooldownMult: 0.55 } },
        { id: 'tack_t3_hot', name: 'Hot Shots', cost: 600, description: 'Shoots fiery hot tacks dealing more damage.', effects: { damage: 1 } },
        { id: 'tack_t4_ring', name: 'Ring of Fire', cost: 2500, description: 'Constantly emits intense heat rings.', effects: { damage: 2, range: 15 } },
        { id: 'tack_t5_inferno', name: 'Inferno Ring', cost: 9500, description: 'An extremely powerful, melt-everything ring.', effects: { damage: 6, range: 30, cooldownMult: 0.4 } }
      ],
      [
        { id: 'tack_m1_long', name: 'Long Range Tacks', cost: 100, description: 'Launches tacks further outwards.', effects: { range: 15 } },
        { id: 'tack_m2_super', name: 'Super Range Tacks', cost: 225, description: 'Vastly amplifies tack shooter reach.', effects: { range: 25 } },
        { id: 'tack_m3_blade', name: 'Blade Shooter', cost: 550, description: 'Converts tacks into razor blades with more pierce.', effects: { pierce: 2, bulletSpeed: 2 } },
        { id: 'tack_m4_mael', name: 'Blade Maelstrom', cost: 2700, description: 'Dramatically increases blade-reloading speeds.', effects: { cooldownMult: 0.5, pierce: 4 } },
        { id: 'tack_m5_super_mael', name: 'Super Maelstrom', cost: 8500, description: 'Extremely fast blade shredding power.', effects: { cooldownMult: 0.3, pierce: 8, damage: 1 } }
      ],
      [
        { id: 'tack_b1_more', name: 'More Tacks', cost: 100, description: 'Packs extra needles per shot.', effects: { pierce: 1 } },
        { id: 'tack_b2_even_more', name: 'Even More Tacks', cost: 225, description: 'Further increases the shot density.', effects: { pierce: 2 } },
        { id: 'tack_b3_sprayer', name: 'Tack Sprayer', cost: 450, description: 'Accelerates tack count and frequency.', effects: { cooldownMult: 0.8 } },
        { id: 'tack_b4_overdrive', name: 'Overdrive', cost: 3200, description: 'Incredibly rapid tack defense.', effects: { cooldownMult: 0.4, pierce: 1 } },
        { id: 'tack_b5_zone', name: 'The Tack Zone', cost: 12000, description: 'Covers the local area in countless tacks.', effects: { cooldownMult: 0.2, pierce: 4, range: 20 } }
      ]
    ]
  },
  sniper: {
    cost: 350,
    baseRange: 9999,
    baseCooldown: 120,
    baseDamage: 2,
    basePierce: 1,
    description: 'Deals massive single-target damage to ANY bloon on screen instantly.',
    upgrades: [
      [
        { id: 'sniper_t1_hardened', name: 'Hardened Darts', cost: 200, description: 'Deals extra damage per shot.', effects: { damage: 1 } },
        { id: 'sniper_t2_fmj', name: 'Full Metal Jacket', cost: 350, description: 'Bullets punch through heavy armor classes.', effects: { damage: 4 } },
        { id: 'sniper_t3_prec', name: 'Deadly Precision', cost: 1200, description: 'High precision shots designed to eliminate bloon layers.', effects: { damage: 8 } },
        { id: 'sniper_t4_maim', name: 'Maim MOAB', cost: 4200, description: 'High-caliber rounds slow down MOABs on hit.', effects: { damage: 15, bulletType: 'cripple' } },
        { id: 'sniper_t5_cripple', name: 'Cripple MOAB', cost: 15000, description: 'Heavy bombardment absolutely disables MOAB structures.', effects: { damage: 40, bulletType: 'cripple' } }
      ],
      [
        { id: 'sniper_m1_night', name: 'Night Vision', cost: 150, description: 'Grants camo-bloon detection ability.', effects: { range: 40, canSeeCamo: true } },
        { id: 'sniper_m2_shrap', name: 'Shrapnel Shot', cost: 450, description: 'Fires shrapnel fragments on hit.', effects: { pierce: 1 } },
        { id: 'sniper_m3_bounce', name: 'Bouncing Bullets', cost: 1500, description: 'Bullets bounce from bloon to bloon.', effects: { damage: 2, pierce: 2 } },
        { id: 'sniper_m4_supply', name: 'Supply Drop Sniper', cost: 5000, description: 'Upgraded payload with faster combat firing.', effects: { cooldownMult: 0.5, damage: 3 } },
        { id: 'sniper_m5_elite', name: 'Elite Sniper', cost: 14500, description: 'Commanding speed and devastating tactical targeting.', effects: { cooldownMult: 0.3, damage: 10, pierce: 3 } }
      ],
      [
        { id: 'sniper_b1_fast', name: 'Fast Firing', cost: 150, description: 'Reduces reload latency.', effects: { cooldownMult: 0.7 } },
        { id: 'sniper_b2_even_fast', name: 'Even Faster Firing', cost: 400, description: 'Dramatically improves rate of fire.', effects: { cooldownMult: 0.5 } },
        { id: 'sniper_b3_semi', name: 'Semi-Automatic', cost: 2200, description: 'Converts rifle to semi-automatic.', effects: { cooldownMult: 0.3 } },
        { id: 'sniper_b4_full_auto', name: 'Full Auto Rifle', cost: 6000, description: 'Constant rain of rapid-fire bullets.', effects: { cooldownMult: 0.15, damage: 1 } },
        { id: 'sniper_b5_defender', name: 'Elite Defender', cost: 17500, description: 'Fires bullets at unmatched, hyper-sonic speeds.', effects: { cooldownMult: 0.06, damage: 2 } }
      ]
    ]
  },
  bomb: {
    cost: 525,
    baseRange: 110,
    baseCooldown: 90,
    baseDamage: 1,
    basePierce: 14,
    description: 'Fires slow explosive bombs that deal area-of-effect splash damage nearby.',
    upgrades: [
      [
        { id: 'bomb_t1_bigger', name: 'Bigger Bombs', cost: 250, description: 'Increases explosion blast radius.', effects: { splashRadius: 20 } },
        { id: 'bomb_t2_heavy', name: 'Heavy Ordnance', cost: 350, description: 'Increases explosion damage.', effects: { damage: 2, splashRadius: 15 } },
        { id: 'bomb_t3_really', name: 'Really Big Bombs', cost: 1200, description: 'Massive blast radius pops large clusters.', effects: { damage: 4, splashRadius: 35 } },
        { id: 'bomb_t4_impact', name: 'Bloon Impact', cost: 3200, description: 'Direct impacts freeze/shock bloons temporarily.', effects: { damage: 6, splashRadius: 50 } },
        { id: 'bomb_t5_crush', name: 'Bloon Crush', cost: 15000, description: 'Absolute devastation crushes any bloon group.', effects: { damage: 18, splashRadius: 80, cooldownMult: 0.7 } }
      ],
      [
        { id: 'bomb_m1_reload', name: 'Faster Reload', cost: 200, description: 'Fires bombs with shorter downtime.', effects: { cooldownMult: 0.75 } },
        { id: 'bomb_m2_missile', name: 'Missile Launcher', cost: 400, description: 'Converts bombs to high velocity missiles.', effects: { cooldownMult: 0.6, range: 20 } },
        { id: 'bomb_m3_mauler', name: 'MOAB Mauler', cost: 900, description: 'Heavily increased damage targeting MOABs.', effects: { damage: 5, range: 25 } },
        { id: 'bomb_m4_assassin', name: 'MOAB Assassin', cost: 3500, description: 'Devastating targeted missile payloads.', effects: { damage: 15, range: 35 } },
        { id: 'bomb_m5_eliminator', name: 'MOAB Eliminator', cost: 18000, description: 'Decimates MOAB class blimps effortlessly.', effects: { damage: 50, range: 55, cooldownMult: 0.45 } }
      ],
      [
        { id: 'bomb_b1_range', name: 'Extra Range', cost: 150, description: 'Fires projectiles further.', effects: { range: 15 } },
        { id: 'bomb_b2_frag', name: 'Frag Bombs', cost: 300, description: 'Launches fragments upon detonation.', effects: { pierce: 1 } },
        { id: 'bomb_b3_cluster', name: 'Cluster Bombs', cost: 800, description: 'Splits on impact into smaller bombs.', effects: { pierce: 3 } },
        { id: 'bomb_b4_recur', name: 'Recursive Cluster', cost: 2800, description: 'Launches waves of secondary explosions.', effects: { pierce: 6, cooldownMult: 0.8 } },
        { id: 'bomb_b5_blitz', name: 'Bomb Blitz', cost: 16500, description: 'Unleashes massive recursive destruction.', effects: { pierce: 12, damage: 10, cooldownMult: 0.5 } }
      ]
    ]
  },
  ice: {
    cost: 300,
    baseRange: 80,
    baseCooldown: 80,
    baseDamage: 0,
    basePierce: 40,
    description: 'Emits a freezing blast that completely freezes nearby bloons in place.',
    upgrades: [
      [
        { id: 'ice_t1_perma', name: 'Permafrost', cost: 150, description: 'Keeps bloons slowed even after thawing.', effects: { freezeTime: 15 } },
        { id: 'ice_t2_snap', name: 'Cold Snap', cost: 350, description: 'Allows freezing of tougher bloons.', effects: { range: 10, freezeTime: 15 } },
        { id: 'ice_t3_shards', name: 'Ice Shards', cost: 1200, description: 'Frozen bloons release sharp ice shards when popped.', effects: { range: 20, damage: 1 } },
        { id: 'ice_t4_embrit', name: 'Embrittlement', cost: 3000, description: 'Weakens bloons so they take more damage.', effects: { range: 30, damage: 3 } },
        { id: 'ice_t5_brittle', name: 'Super Brittle', cost: 14000, description: 'Utterly breaks structure of target groups.', effects: { range: 50, damage: 10, freezeTime: 50 } }
      ],
      [
        { id: 'ice_m1_enhanced', name: 'Enhanced Freeze', cost: 200, description: 'Increases freezing effect radius.', effects: { range: 15 } },
        { id: 'ice_m2_deep', name: 'Deep Freeze', cost: 350, description: 'Holds freezing status for twice as long.', effects: { freezeTime: 35 } },
        { id: 'ice_m3_wind', name: 'Arctic Wind', cost: 1800, description: 'An aura of cold slows down bloons within range.', effects: { range: 30 } },
        { id: 'ice_m4_snow', name: 'Snowstorm', cost: 4000, description: 'Periodically freezes everything nearby.', effects: { range: 55, damage: 1 } },
        { id: 'ice_m5_zero', name: 'Absolute Zero', cost: 16000, description: 'Total freeze lockdown with high damage.', effects: { range: 90, damage: 5, cooldownMult: 0.6 } }
      ],
      [
        { id: 'ice_b1_cryo', name: 'Cryo Blast', cost: 150, description: 'Extremely cold short range burst.', effects: { range: 10 } },
        { id: 'ice_b2_aura', name: 'Freeze Aura', cost: 400, description: 'Constant field of ice drops temperatures.', effects: { range: 20 } },
        { id: 'ice_b3_icicles', name: 'Icicles', cost: 1350, description: 'Sprouts sharp icicles on frozen targets.', effects: { damage: 1, range: 25 } },
        { id: 'ice_b4_impale', name: 'Icicle Impale', cost: 4200, description: 'Icicle spikes deal high pierce damage.', effects: { damage: 6, range: 40, freezeTime: 20 } },
        { id: 'ice_b5_glacier', name: 'Absolute Glacier', cost: 18000, description: 'Giant icicles block whole trails.', effects: { damage: 20, range: 70, freezeTime: 45 } }
      ]
    ]
  },
  super: {
    cost: 2500,
    baseRange: 150,
    baseCooldown: 12,
    baseDamage: 1,
    basePierce: 1,
    description: 'Shoots a rapid stream of energy darts. Extremely expensive but elite.',
    upgrades: [
      [
        { id: 'super_t1_laser', name: 'Laser Blaster', cost: 1250, description: 'Fires high-energy laser beams.', effects: { damage: 1, pierce: 1, bulletType: 'beam' } },
        { id: 'super_t2_plasma', name: 'Plasma Blaster', cost: 2200, description: 'Plasma cut-through speeds up shots.', effects: { damage: 2, pierce: 2, bulletType: 'beam' } },
        { id: 'super_t3_avatar', name: 'Sun Avatar', cost: 8000, description: 'Fires golden energy arcs with massive pierce.', effects: { damage: 4, pierce: 4 } },
        { id: 'super_t4_temple', name: 'Temple of the Sun', cost: 45000, description: 'Unleashes devastating divine blasts.', effects: { damage: 12, pierce: 8, range: 30 } },
        { id: 'super_t5_god', name: 'True Sun God', cost: 150000, description: 'Absolute, final form of popping power.', effects: { damage: 45, pierce: 15, range: 60, cooldownMult: 0.5 } }
      ],
      [
        { id: 'super_m1_range', name: 'Super Range', cost: 1000, description: 'Expands range of darts.', effects: { range: 40 } },
        { id: 'super_m2_epic', name: 'Epic Range', cost: 1500, description: 'Extreme shooting radius.', effects: { range: 80 } },
        { id: 'super_m3_robo', name: 'Robo-Monkey', cost: 7500, description: 'Cybernetic implants double firing speed.', effects: { cooldownMult: 0.5, pierce: 2 } },
        { id: 'super_m4_terror', name: 'Tech Terror', cost: 18000, description: 'Upgraded targeting processors and damage.', effects: { cooldownMult: 0.35, damage: 2 } },
        { id: 'super_m5_annihil', name: 'The Anti-Bloon', cost: 60000, description: 'Anti-matter lasers shred whatever remains.', effects: { cooldownMult: 0.18, damage: 12, pierce: 5 } }
      ],
      [
        { id: 'super_b1_night', name: 'Night Vision', cost: 800, description: 'Grants camo vision and slight range boost.', effects: { range: 20, canSeeCamo: true } },
        { id: 'super_b2_ultravision', name: 'Ultravision Plasma', cost: 1600, description: 'Reveals and vaporizes shielded bloons.', effects: { range: 35, pierce: 1 } },
        { id: 'super_b3_knight', name: 'Dark Knight', cost: 5500, description: 'Throws shadowy blades that slow MOABs.', effects: { damage: 2, pierce: 2 } },
        { id: 'super_b4_champ', name: 'Dark Champion', cost: 19500, description: 'Channels shadows to deal massive damage.', effects: { damage: 8, pierce: 5, range: 45 } },
        { id: 'super_b5_legend', name: 'Legend of the Night', cost: 75000, description: 'He who blocks leaks and commands night sweeps.', effects: { damage: 25, pierce: 10, range: 70, cooldownMult: 0.6 } }
      ]
    ]
  },
  boomerang: {
    cost: 325,
    baseRange: 110,
    baseCooldown: 60,
    baseDamage: 1,
    basePierce: 4,
    description: 'Launches spinning boomerangs that fly in wide arcs and can hit multiple targets over and over.',
    upgrades: [
      [
        { id: 'boom_t1_speed', name: 'Fast Throwing', cost: 100, description: 'Throws boomerangs faster.', effects: { cooldownMult: 0.75 } },
        { id: 'boom_t2_even_fast', name: 'Faster Throwing', cost: 185, description: 'Throws boomerangs much faster.', effects: { cooldownMult: 0.55 } },
        { id: 'boom_t3_glaive', name: 'Glaive Ricochet', cost: 800, description: 'Boomerangs bounce to nearby bloons automatically.', effects: { pierce: 6, damage: 1 } },
        { id: 'boom_t4_moab', name: 'MOAB Press', cost: 1800, description: 'Heavy glaives push back MOAB-class bloons.', effects: { range: 20, damage: 4 } },
        { id: 'boom_t5_lord', name: 'Glaive Lord', cost: 8500, description: 'Orbits three permanent heavy glaives around the tower.', effects: { damage: 10, pierce: 12, range: 40 } }
      ],
      [
        { id: 'boom_m1_long', name: 'Long Range', cost: 75, description: 'Throws further.', effects: { range: 20 } },
        { id: 'boom_m2_red_hot', name: 'Red Hot Rangs', cost: 150, description: 'Ignites boomerangs, letting them pop frozen bloons.', effects: { damage: 1 } },
        { id: 'boom_m3_bionic', name: 'Bionic Boomerang', cost: 750, description: 'Throws boomerangs at cybernetic speeds.', effects: { cooldownMult: 0.4 } },
        { id: 'boom_m4_charge', name: 'Turbo Charge', cost: 2400, description: 'Extreme firing speed upgrade.', effects: { cooldownMult: 0.2, damage: 1 } },
        { id: 'boom_m5_permacharge', name: 'Perma-Charge', cost: 9000, description: 'Unleashes a constant storm of supercharged boomerangs.', effects: { cooldownMult: 0.1, damage: 3, pierce: 3 } }
      ],
      [
        { id: 'boom_b1_kylie', name: 'Kylie Boomerang', cost: 350, description: 'Boomerang travels in straight line, hitting things going and returning.', effects: { pierce: 3 } },
        { id: 'boom_b2_sharp', name: 'Super Sharp Rangs', cost: 220, description: 'Slices through groups with increased pierce.', effects: { pierce: 4 } },
        { id: 'boom_b3_moab_shred', name: 'MOAB Shredder', cost: 1200, description: 'Extra damage against large blimps.', effects: { damage: 6 } },
        { id: 'boom_b4_titan', name: 'Titan Kylie', cost: 3000, description: 'GIANT boomerangs slice anything in their path.', effects: { damage: 12, pierce: 8 } },
        { id: 'boom_b5_dom', name: 'MOAB Domination', cost: 14000, description: 'Utterly dominates MOAB-class bloons with extreme power.', effects: { damage: 35, range: 40, pierce: 10 } }
      ]
    ]
  },
  ninja: {
    cost: 500,
    baseRange: 110,
    baseCooldown: 40,
    baseDamage: 1,
    basePierce: 2,
    description: 'Disciplined fighter who throws fast shurikens and inherently detects Camo bloons.',
    upgrades: [
      [
        { id: 'ninja_t1_ninja_disc', name: 'Ninja Discipline', cost: 250, description: 'Increases attack speed and range.', effects: { cooldownMult: 0.8, range: 15 } },
        { id: 'ninja_t2_sharp', name: 'Sharp Shurikens', cost: 350, description: 'Shurikens can pop more bloons.', effects: { pierce: 2 } },
        { id: 'ninja_t3_double', name: 'Double Shot', cost: 650, description: 'Throws two shurikens at once.', effects: { pierce: 1 } },
        { id: 'ninja_t4_jitsu', name: 'Bloonjitsu', cost: 2400, description: 'Throws 5 shurikens at once for ultimate group coverage.', effects: { pierce: 2, range: 10 } },
        { id: 'ninja_t5_grandmaster', name: 'Grandmaster Ninja', cost: 9500, description: 'An elite ninja throwing incredible quantities of shurikens.', effects: { cooldownMult: 0.3, damage: 1 } }
      ],
      [
        { id: 'ninja_m1_caltrops', name: 'Caltrops', cost: 225, description: 'Throws spikes onto the track periodically.', effects: { range: 10 } },
        { id: 'ninja_m2_coutereye', name: 'Counter-Espionage', cost: 500, description: 'Strips Camo properties from any bloon hit.', effects: { range: 15, canSeeCamo: true } },
        { id: 'ninja_m3_shinobi', name: 'Shinobi Tactics', cost: 900, description: 'Spurs attack speed of nearby ninjas.', effects: { cooldownMult: 0.8 } },
        { id: 'ninja_m4_sabotage', name: 'Bloon Sabotage', cost: 3500, description: 'Weakened states slow emerging bloon speeds.', effects: { cooldownMult: 0.6 } },
        { id: 'ninja_m5_grand_sabo', name: 'Grand Sabotage', cost: 16000, description: 'Skins health layers off MOABs and slows them heavily.', effects: { cooldownMult: 0.4, damage: 10 } }
      ],
      [
        { id: 'ninja_b1_seek', name: 'Seeking Shurikens', cost: 250, description: 'Shurikens track bloons automatically.', effects: { range: 10 } },
        { id: 'ninja_b2_distract', name: 'Distraction', cost: 350, description: 'Shurikens have a chance to push bloons backwards.', effects: { range: 15 } },
        { id: 'ninja_b3_stick', name: 'Sticky Bomb', cost: 400, description: 'Attaches explosive time bombs to MOAB-class bloons.', effects: { damage: 3 } },
        { id: 'ninja_b4_master_bomber', name: 'Master Bomber', cost: 5000, description: 'Constantly throws heavy flash bombs and sticky bombs.', effects: { damage: 15, pierce: 2 } },
        { id: 'ninja_b5_shadow', name: 'Shadow Champion', cost: 21000, description: 'Legendary ninja who commands shadow clones.', effects: { damage: 40, range: 40, cooldownMult: 0.4 } }
      ]
    ]
  },
  glue: {
    cost: 260,
    baseRange: 90,
    baseCooldown: 50,
    baseDamage: 0,
    basePierce: 1,
    description: 'Shoots globs of sticky, slowing glue. Upgradable to dissolve layers.',
    upgrades: [
      [
        { id: 'glue_t1_soak', name: 'Glue Soak', cost: 150, description: 'Glue soaks through all layers.', effects: { range: 10 } },
        { id: 'glue_t2_corrosive', name: 'Corrosive Glue', cost: 300, description: 'Glue constantly melts bloon layers over time.', effects: { damage: 1 } },
        { id: 'glue_t3_dissolve', name: 'Bloon Dissolver', cost: 900, description: 'Melts layers at double frequency.', effects: { damage: 2, range: 10 } },
        { id: 'glue_t4_liquefier', name: 'Bloon Liquefier', cost: 5000, description: 'Rapidly cooks any bloon group to nothingness.', effects: { damage: 5, cooldownMult: 0.8 } },
        { id: 'glue_t5_solver', name: 'The Bloon Solver', cost: 18000, description: 'A massive wave of acid melts everything on the track in seconds.', effects: { damage: 22, range: 30, cooldownMult: 0.5 } }
      ],
      [
        { id: 'glue_m1_bigger', name: 'Bigger Globs', cost: 100, description: 'Splashes glue onto nearby bloons.', effects: { range: 15 } },
        { id: 'glue_m2_splatter', name: 'Glue Splatter', cost: 800, description: 'Vastly increases landing splash area.', effects: { range: 25 } },
        { id: 'glue_m3_hose', name: 'Glue Hose', cost: 1500, description: 'Fires glue at a continuous rate.', effects: { cooldownMult: 0.45 } },
        { id: 'glue_m4_strike', name: 'Glue Strike', cost: 2500, description: 'Glue blankets whole active screen.', effects: { cooldownMult: 0.3 } },
        { id: 'glue_m5_storm', name: 'Glue Storm', cost: 12000, description: 'Unleashes endless sheets of glue rain dealing damage.', effects: { damage: 4, cooldownMult: 0.2 } }
      ],
      [
        { id: 'glue_b1_stickier', name: 'Stickier Glue', cost: 100, description: 'Slows down bloons even more.', effects: { range: 10 } },
        { id: 'glue_b2_stronger', name: 'Stronger Glue', cost: 150, description: 'Glue lasts 3 times longer.', effects: { range: 15 } },
        { id: 'glue_b3_moab', name: 'MOAB Glue', cost: 3400, description: 'Allows glue to coat and slow heavy MOAB-class blimps.', effects: { damage: 2 } },
        { id: 'glue_b4_relent', name: 'Relentless Glue', cost: 4200, description: 'Popped glued bloons drop a pool of glue on the track.', effects: { damage: 4 } },
        { id: 'glue_b5_super', name: 'Super Glue', cost: 22000, description: 'Incredibly sticky glue completely immobilizes bloons on impact.', effects: { damage: 25, range: 40 } }
      ]
    ]
  },
  wizard: {
    cost: 380,
    baseRange: 115,
    baseCooldown: 45,
    baseDamage: 1,
    basePierce: 3,
    description: 'Monkey Wizard who fires mystical heat bolts, flame streams, and magical blasts.',
    upgrades: [
      [
        { id: 'wiz_t1_guided', name: 'Guided Magic', cost: 120, description: 'Magic bolts check paths around obstacles.', effects: { range: 20 } },
        { id: 'wiz_t2_sense', name: 'Arcane Senses', cost: 220, description: 'Detects Camo bloons with mystical eyes.', effects: { range: 15, canSeeCamo: true } },
        { id: 'wiz_t3_spike', name: 'Arcane Spike', cost: 1200, description: 'Fires heavy concentrated bolts dealing extreme damage.', effects: { damage: 3, pierce: 2 } },
        { id: 'wiz_t4_blast', name: 'Arcane Blast', cost: 3500, description: 'Gigantic magic charges crush tough layers.', effects: { damage: 8, range: 15 } },
        { id: 'wiz_t5_archmage', name: 'Archmage', cost: 24000, description: 'Ultimate wizard casting extreme magical bolts, fireballs, and dragon breath.', effects: { damage: 30, pierce: 5, cooldownMult: 0.4 } }
      ],
      [
        { id: 'wiz_m1_fireball', name: 'Fireball', cost: 250, description: 'Launches small explosive fireballs.', effects: { damage: 1 } },
        { id: 'wiz_m2_wall', name: 'Wall of Fire', cost: 950, description: 'Summons static flames on target track spots.', effects: { range: 25 } },
        { id: 'wiz_m3_breath', name: 'Dragons Breath', cost: 3000, description: 'Constantly sprays fire from hands.', effects: { cooldownMult: 0.4, damage: 1 } },
        { id: 'wiz_m4_summon', name: 'Summon Phoenix', cost: 4500, description: 'An elite firebird assists in combat.', effects: { range: 40, damage: 4 } },
        { id: 'wiz_m5_wizard_lord', name: 'Wizard Lord Phoenix', cost: 30000, description: 'Turns into a permanent giant Phoenix deity.', effects: { damage: 60, cooldownMult: 0.25 } }
      ],
      [
        { id: 'wiz_b1_intensify', name: 'Intense Magic', cost: 150, description: 'Faster and wider magical projectiles.', effects: { range: 15 } },
        { id: 'wiz_b2_monkey_sense', name: 'Monkey Sense', cost: 250, description: 'Expands magical combat ranges.', effects: { range: 25 } },
        { id: 'wiz_b3_necromancer', name: 'Necromancer', cost: 2400, description: 'Reanimates popped bloons.', effects: { damage: 3 } },
        { id: 'wiz_b4_prince', name: 'Prince of Darkness', cost: 21000, description: 'Commands huge armies of heavy zombie MOABs.', effects: { damage: 32, range: 45 } },
        { id: 'wiz_b5_soulbind', name: 'Soulbind Coven', cost: 65000, description: 'Exchanges excess lives for absolute black-magic.', effects: { damage: 95, range: 60 } }
      ]
    ]
  },
  alchemist: {
    cost: 550,
    baseRange: 110,
    baseCooldown: 60,
    baseDamage: 1,
    basePierce: 15,
    description: 'Throws highly unstable acid potions that dissolve multiple bloons in splashes.',
    upgrades: [
      [
        { id: 'alc_t1_large', name: 'Larger Potions', cost: 200, description: 'Increases splash impact radius.', effects: { range: 15, damage: 1 } },
        { id: 'alc_t2_acidic', name: 'Acidic Mist', cost: 350, description: 'Coatings deal continuous acidic damage.', effects: { damage: 1 } },
        { id: 'alc_t3_stimulant', name: 'Berserker Brew', cost: 1250, description: 'Stimulates nearest monkeys.', effects: { range: 20 } },
        { id: 'alc_t4_stronger', name: 'Stronger Stimulant', cost: 3000, description: 'Amplifies speed boosts and durations.', effects: { range: 30, damage: 2 } },
        { id: 'alc_t5_brewmaster', name: 'Permanent Brew', cost: 19000, description: 'Nearby monkeys receive permanent mega stat buffs.', effects: { damage: 10, range: 50, cooldownMult: 0.6 } }
      ],
      [
        { id: 'alc_m1_gold', name: 'Lead to Gold', cost: 1000, description: 'Instantly vaporizes lead and awards bonus cash.', effects: { damage: 4 } },
        { id: 'alc_m2_rubber', name: 'Rubber to Gold', cost: 2800, description: 'Potions turn other bloons to gold.', effects: { range: 20 } },
        { id: 'alc_m3_mix', name: 'Unstable Mixture', cost: 3500, description: 'Potions cause hit bloons to explode.', effects: { damage: 10 } },
        { id: 'alc_m4_transform', name: 'Transforming Tonic', cost: 4500, description: 'Turns into a giant laser-eyed monster.', effects: { damage: 20, cooldownMult: 0.4 } },
        { id: 'alc_m5_total', name: 'Total Transformation', cost: 32000, description: 'Transforms up to 5 nearby monkeys.', effects: { damage: 100, range: 40 } }
      ],
      [
        { id: 'alc_b1_faster', name: 'Faster Throwing', cost: 250, description: 'Throws potions quicker.', effects: { cooldownMult: 0.7 } },
        { id: 'alc_b2_acid_pool', name: 'Acid Pools', cost: 600, description: 'Misses leave pools of acid on tracks.', effects: { range: 15 } },
        { id: 'alc_b3_shrink', name: 'Shrink Potion', cost: 3200, description: 'Shrinks spawned ceramic and bloon sizes.', effects: { damage: 12 } },
        { id: 'alc_b4_concoct', name: 'Concoction', cost: 4200, description: 'Devastating blimp exploders.', effects: { damage: 35 } },
        { id: 'alc_b5_acid_lord', name: 'Bloon Acid Master', cost: 28000, description: 'Converts clusters of MOABs to simple classes.', effects: { damage: 80, range: 40 } }
      ]
    ]
  },
  druid: {
    cost: 400,
    baseRange: 110,
    baseCooldown: 50,
    baseDamage: 1,
    basePierce: 1,
    description: 'Nature guardian who throws sharp wooden thorns in multi-directional fans.',
    upgrades: [
      [
        { id: 'dr_t1_hard', name: 'Hard Thorns', cost: 150, description: 'Thorns slice through more bloons.', effects: { pierce: 2 } },
        { id: 'dr_t2_heart', name: 'Heart of Thunder', cost: 350, description: 'Fires heavy chain lightning.', effects: { damage: 1, range: 10 } },
        { id: 'dr_t3_storm', name: 'Druid of the Storm', cost: 1650, description: 'Summons tiny tornados that push bloons backwards.', effects: { range: 25 } },
        { id: 'dr_t4_tornado', name: 'Ball Lightning', cost: 4500, description: 'Launches electric spheres.', effects: { damage: 6, range: 40 } },
        { id: 'dr_t5_avatar', name: 'Superstorm', cost: 32000, description: 'Unleashes massive storms capable of blowing MOABs.', effects: { damage: 35, range: 80 } }
      ],
      [
        { id: 'dr_m1_fast', name: 'Faster Throwing', cost: 150, description: 'Throws spikes faster.', effects: { cooldownMult: 0.7 } },
        { id: 'dr_m2_wild', name: 'Heart of Oak', cost: 305, description: 'Strips regrow properties.', effects: { range: 15 } },
        { id: 'dr_m3_jungle', name: 'Druid of the Jungle', cost: 950, description: 'Summons woodsy vines.', effects: { damage: 2 } },
        { id: 'dr_m4_bounty', name: 'Jungles Bounty', cost: 2000, description: 'Generates bonus cash rounds.', effects: { range: 20 } },
        { id: 'dr_m5_wrath', name: 'Spirit of the Forest', cost: 25000, description: 'Covers entire pathway in sharp thorns.', effects: { damage: 45 } }
      ],
      [
        { id: 'dr_b1_range', name: 'Reach of Nature', cost: 100, description: 'Throws wood thorns further.', effects: { range: 20 } },
        { id: 'dr_b2_sharp', name: 'Very Sharp Thorns', cost: 250, description: 'Boosts spike densities.', effects: { pierce: 2 } },
        { id: 'dr_b3_venge', name: 'Druid of Wrath', cost: 600, description: 'Increases attack speed.', effects: { cooldownMult: 0.8 } },
        { id: 'dr_b4_poplust', name: 'Poplust Coven', cost: 2500, description: 'Buffs all nearby Druids.', effects: { range: 15, damage: 2 } },
        { id: 'dr_b5_avatar_wrath', name: 'Avatar of Wrath', cost: 30000, description: 'Becomes a red-eyed avatar dealing extreme damage.', effects: { damage: 65, cooldownMult: 0.5 } }
      ]
    ]
  },
  farm: {
    cost: 1250,
    baseRange: 60,
    baseCooldown: 300,
    baseDamage: 0,
    basePierce: 0,
    description: 'Banana Farm. Generates solid bonus income cash of +$80 after surviving every wave.',
    upgrades: [
      [
        { id: 'farm_t1_more', name: 'More Bananas', cost: 350, description: 'Increases round payouts.', effects: { range: 5 } },
        { id: 'farm_t2_greater', name: 'Greater Production', cost: 600, description: 'Vastly increases crop outputs.', effects: { range: 5 } },
        { id: 'farm_t3_plantation', name: 'Banana Plantation', cost: 1400, description: 'Highly optimized crop yielding major cash.', effects: { range: 10 } },
        { id: 'farm_t4_facility', name: 'Banana Research Facility', cost: 5500, description: 'Professional research center award.', effects: { range: 15 } },
        { id: 'farm_t5_central', name: 'Banana Central', cost: 28000, description: 'Ultimate conglomerate delivering immense riches.', effects: { range: 40 } }
      ],
      [
        { id: 'farm_m1_long', name: 'Long Life Bananas', cost: 200, description: 'Slight range increase.', effects: { range: 10 } },
        { id: 'farm_m2_val', name: 'Valuable Bananas', cost: 350, description: 'Boosts final sell values.', effects: { range: 10 } },
        { id: 'farm_m3_bank', name: 'Monkey Bank', cost: 2200, description: 'Auto stores interest earnings.', effects: { range: 15 } },
        { id: 'farm_m4_imf', name: 'IMF Loan Office', cost: 6500, description: 'Receive $2000 cash loans.', effects: { range: 25 } },
        { id: 'farm_m5_nomad', name: 'Nomadic Vault', cost: 42000, description: 'Epic hyper-vault compounding massive revenues.', effects: { range: 50 } }
      ],
      [
        { id: 'farm_b1_salvage', name: 'EZ Collect Salvage', cost: 150, description: 'Auto collects crops.', effects: { range: 10 } },
        { id: 'farm_b2_market', name: 'Monkey Marketplace', cost: 400, description: 'Automates direct trade exports.', effects: { range: 15 } },
        { id: 'farm_b3_central_mark', name: 'Central Market', cost: 2105, description: 'Major global distribution exporter.', effects: { range: 20 } },
        { id: 'farm_b4_wall_st', name: 'Monkey Wall Street', cost: 9500, description: 'Generates huge sums of passive capital.', effects: { range: 30 } },
        { id: 'farm_b5_empire', name: 'Banana Empire Trade', cost: 35000, description: 'Unprecedented financial dominion.', effects: { range: 60 } }
      ]
    ]
  },
  sub: {
    cost: 325,
    baseRange: 135,
    baseCooldown: 40,
    baseDamage: 1,
    basePierce: 2,
    description: 'Aquatic submarine. CAN ONLY BE placed on Natural Water or Water Pools. Fires tracking homing torpedoes.',
    upgrades: [
      [
        { id: 'sub_t1_long', name: 'Long Range Sub', cost: 130, description: 'Vastly expanded sonar tracking range.', effects: { range: 35 } },
        { id: 'sub_t2_intel', name: 'Advanced Intel', cost: 350, description: 'Permits tracking bloons anywhere.', effects: { range: 75, canSeeCamo: true } },
        { id: 'sub_t3_submerge', name: 'Submerge Sonar', cost: 800, description: 'Strips camo status from bloons.', effects: { range: 30 } },
        { id: 'sub_t4_reactor', name: 'Nuclear Reactor', cost: 3800, description: 'Emits a radioactive field.', effects: { damage: 4, range: 45 } },
        { id: 'sub_t5_ener', name: 'Energizer Sub', cost: 18050, description: 'Generates extra levels of XP.', effects: { damage: 25, range: 70 } }
      ],
      [
        { id: 'sub_m1_barb', name: 'Barbed Darts', cost: 100, description: 'Torpedoes gain extra pierce.', effects: { pierce: 2 } },
        { id: 'sub_m2_heat', name: 'Heat-Tipped Darts', cost: 185, description: 'Torpedoes can pop lead and frozen classes.', effects: { damage: 1 } },
        { id: 'sub_m3_missile', name: 'Ballistic Missile', cost: 1250, description: 'Launches missile artillery blasts.', effects: { damage: 5, range: 40 } },
        { id: 'sub_m4_first', name: 'First Strike Capability', cost: 8500, description: 'Artillery missiles target heaviest.', effects: { damage: 20, range: 50 } },
        { id: 'sub_m5_preemptive', name: 'Pre-Emptive Strike', cost: 22000, description: 'Automatic missiles at emerging entries.', effects: { damage: 45, cooldownMult: 0.6 } }
      ],
      [
        { id: 'sub_b1_twin', name: 'Twin Guns', cost: 200, description: 'Fires two torpedo darts simultaneously.', effects: { cooldownMult: 0.6 } },
        { id: 'sub_b2_airburst', name: 'Airburst Darts', cost: 500, description: 'Torpedoes detonate into airburst.', effects: { pierce: 3 } },
        { id: 'sub_b3_triple', name: 'Triple Guns', cost: 1205, description: 'Three tracking darts fired.', effects: { cooldownMult: 0.4 } },
        { id: 'sub_b4_armor', name: 'Armor Piercing Darts', cost: 2500, description: 'Darts melt MOAB frames easily.', effects: { damage: 8, range: 15 } },
        { id: 'sub_b5_commander', name: 'Sub Commander', cost: 12000, description: 'Absolute ruler of deep-sea warfare.', effects: { damage: 28, range: 45, cooldownMult: 0.5 } }
      ]
    ]
  },
  buccaneer: {
    cost: 500,
    baseRange: 120,
    baseCooldown: 50,
    baseDamage: 1,
    basePierce: 4,
    description: 'Aquatic pirate warship. CAN ONLY BE placed on Natural Water or Water Pools. Shoots grapes and side cannons.',
    upgrades: [
      [
        { id: 'buc_t1_faster', name: 'Faster Shooting', cost: 150, description: 'Cannons fire quicker.', effects: { cooldownMult: 0.7 } },
        { id: 'buc_t2_double', name: 'Double Shot', cost: 250, description: 'Fires two cannons.', effects: { cooldownMult: 0.5 } },
        { id: 'buc_t3_destroy', name: 'Destroyer Vessel', cost: 2950, description: 'Rapid fire barrage.', effects: { cooldownMult: 0.25 } },
        { id: 'buc_t4_aircraft', name: 'Aircraft Carrier', cost: 6200, description: 'Patrolling mini fighter planes.', effects: { range: 40, damage: 6 } },
        { id: 'buc_t5_flagship', name: 'Carrier Flagship', cost: 18000, description: 'Ultimate combat flagship fleet.', effects: { damage: 32, range: 60, cooldownMult: 0.5 } }
      ],
      [
        { id: 'buc_m1_long', name: 'Long Range Cannons', cost: 120, description: 'Expands nautical range.', effects: { range: 25 } },
        { id: 'buc_m2_crow', name: 'Crows Nest', cost: 250, description: 'Grants camo-bloon detection cap.', effects: { range: 15, canSeeCamo: true } },
        { id: 'buc_m3_grape', name: 'Grape Shot', cost: 500, description: 'Cannons burst grape clusters.', effects: { pierce: 2 } },
        { id: 'buc_m4_cannon', name: 'Cannon Ship', cost: 1200, description: 'Adds heavy explosive cannon side arms.', effects: { damage: 5 } },
        { id: 'buc_m5_plunder', name: 'Pirate Lord', cost: 14000, description: 'Launches steel grappling chains dragging MOABs.', effects: { damage: 35, range: 40 } }
      ],
      [
        { id: 'buc_b1_heavy', name: 'Heavy Darts', cost: 100, description: 'Increases cannonball pierces.', effects: { pierce: 1 } },
        { id: 'buc_b2_sharp', name: 'Very Sharp Darts', cost: 180, description: 'Further boosts pierce metrics.', effects: { pierce: 2 } },
        { id: 'buc_b3_merchant', name: 'Merchantman', cost: 1800, description: 'Generates trade cash after every wave.', effects: { range: 10 } },
        { id: 'buc_b4_fleet', name: 'Favored Trades Fleet', cost: 4200, description: 'Expands wave payouts.', effects: { range: 20 } },
        { id: 'buc_b5_empire_trade', name: 'Trade Empire', cost: 16000, description: 'Legendary naval trade empire.', effects: { damage: 20, range: 45 } }
      ]
    ]
  },
  pool: {
    cost: 150,
    baseRange: 55,
    baseCooldown: 99999,
    baseDamage: 0,
    basePierce: 0,
    description: 'Portable Water Pool. Creates a custom water surface on land allowing water monkeys to be placed anywhere.',
    upgrades: [[], [], []]
  },
  ace: {
    cost: 800,
    baseRange: 9999,
    baseCooldown: 45,
    baseDamage: 1,
    basePierce: 4,
    description: 'Patrols the sky, firing dart streams in circular patrolled patterns.',
    upgrades: [
      [
        { id: 'ace_t1', name: 'Rapid Fire', cost: 150, description: 'Increases dart firing speed.', effects: { cooldownMult: 0.75 } },
        { id: 'ace_t2', name: 'Lots More Darts', cost: 350, description: 'Shoots double streams of darts.', effects: { pierce: 2, cooldownMult: 0.6 } }
      ],
      [
        { id: 'ace_m1', name: 'Spy Plane', cost: 200, description: 'Fitted with advanced night-vision sensors.', effects: { canSeeCamo: true } }
      ],
      [
        { id: 'ace_b1', name: 'Exploding Pineapple', cost: 300, description: 'Drops explosive pineapples periodically.', effects: { damage: 1, pierce: 3 } }
      ]
    ]
  },
  heli: {
    cost: 1200,
    baseRange: 220,
    baseCooldown: 35,
    baseDamage: 1,
    basePierce: 3,
    description: 'Shover and pursuit helicopter firing twin rapid darts.',
    upgrades: [
      [
        { id: 'heli_t1', name: 'Quad Dash', cost: 250, description: 'Fires quad darts instead of twins.', effects: { pierce: 2 } }
      ],
      [
        { id: 'heli_m1', name: 'Pursuit Guidance', cost: 400, description: 'Allows smart automated target pursuing.', effects: { range: 50 } }
      ],
      [
        { id: 'heli_b1', name: 'IFR Cabin Sensors', cost: 250, description: 'Reveals camouflaged bloons.', effects: { canSeeCamo: true } }
      ]
    ]
  },
  mortar: {
    cost: 750,
    baseRange: 9999,
    baseCooldown: 85,
    baseDamage: 2,
    basePierce: 15,
    description: 'Mortar team bombarding a localized track zone with explosive fire.',
    upgrades: [
      [
        { id: 'mortar_t1', name: 'Bigger Bombs', cost: 200, description: 'Increases splash explosion radius.', effects: { splashRadius: 20 } }
      ],
      [
        { id: 'mortar_m1', name: 'Rapid Blast', cost: 250, description: 'Reloads and aligns rapidly.', effects: { cooldownMult: 0.7 } }
      ],
      [
        { id: 'mortar_b1', name: 'Signal Flare', cost: 500, description: 'Reveals and decamos any hit targets.', effects: { canSeeCamo: true } }
      ]
    ]
  },
  dartling: {
    cost: 850,
    baseRange: 9999,
    baseCooldown: 12,
    baseDamage: 1,
    basePierce: 2,
    description: 'Hyper rapid needle shooter aiming in the direction of the cursor.',
    upgrades: [
      [
        { id: 'dartling_t1', name: 'Focused Laser', cost: 300, description: 'Fires focused laser shots.', effects: { pierce: 3 } }
      ],
      [
        { id: 'dartling_m1', name: 'Faster Barrel Spin', cost: 150, description: 'Increases needle speed and recoil rate.', effects: { cooldownMult: 0.75 } }
      ],
      [
        { id: 'dartling_b1', name: 'Depleted Bloontonium', cost: 350, description: 'Hits lead bloons easily.', effects: { damage: 1 } }
      ]
    ]
  },
  spike: {
    cost: 1000,
    baseRange: 90,
    baseCooldown: 60,
    baseDamage: 1,
    basePierce: 8,
    description: 'Drops rows of durable metallic spike traps on the track near itself.',
    upgrades: [
      [
        { id: 'spike_t1', name: 'Long Life Spikes', cost: 200, description: 'Spikes last through the full wave round.', effects: { range: 20 } }
      ],
      [
        { id: 'spike_m1', name: 'Faster Spikes Production', cost: 300, description: 'Assembles spike traps at high speeds.', effects: { cooldownMult: 0.65 } }
      ],
      [
        { id: 'spike_b1', name: 'White Hot Spikes', cost: 255, description: 'Can easily pop lead and ceramic layers.', effects: { damage: 1 } }
      ]
    ]
  },
  village: {
    cost: 1200,
    baseRange: 180,
    baseCooldown: 99999,
    baseDamage: 0,
    basePierce: 0,
    description: 'Increases Range and applies solid upgrade and placement discounts to nearby monkeys.',
    upgrades: [
      [
        { id: 'village_t1', name: 'Grow Fertilizer', cost: 350, description: 'Increases crop yield of nearby farms.', effects: { range: 30 } }
      ],
      [
        { id: 'village_m1', name: 'Radar Scanner', cost: 800, description: 'All monkeys in range can hit and detect Camo.', effects: { canSeeCamo: true } }
      ],
      [
        { id: 'village_b1', name: 'Monkey Business Discount', cost: 400, description: 'Vastly reduces monkey base cost.', effects: { range: 20 } }
      ]
    ]
  },
  engineer: {
    cost: 450,
    baseRange: 130,
    baseCooldown: 45,
    baseDamage: 1,
    basePierce: 3,
    description: 'A handy specialized architect who deploys auxiliary automatic sentry guns.',
    upgrades: [
      [
        { id: 'engineer_t1', name: 'Sentry Expert', cost: 400, description: 'Sentries fire specialty explosive and freeze pins.', effects: { range: 35 } }
      ],
      [
        { id: 'engineer_m1', name: 'Hyper-clock Override', cost: 600, description: 'Buffs self and sentries to fire faster.', effects: { cooldownMult: 0.6 } }
      ],
      [
        { id: 'engineer_b1', name: 'Deconstructions', cost: 250, description: 'Increased damage specifically vs camo and lead.', effects: { canSeeCamo: true } }
      ]
    ]
  },
  beast: {
    cost: 700,
    baseRange: 150,
    baseCooldown: 50,
    baseDamage: 3,
    basePierce: 4,
    description: 'Commands a companion wild dinosaur that chomps raw layers near the coordinates.',
    upgrades: [
      [
        { id: 'beast_t1', name: 'Megalodon Might', cost: 600, description: 'Unleashes aquatic beasts to slice through targets.', effects: { damage: 4 } }
      ],
      [
        { id: 'beast_m1', name: 'Giganotosaurus Roar', cost: 950, description: 'Massive chomps that stun and tear.', effects: { damage: 8, pierce: 3 } }
      ],
      [
        { id: 'beast_b1', name: 'Pouakai Ascent', cost: 500, description: 'Falcon intercepts and carries away bloons.', effects: { range: 45 } }
      ]
    ]
  },
  mermonkey: {
    cost: 600,
    baseRange: 165,
    baseCooldown: 40,
    baseDamage: 2,
    basePierce: 5,
    description: 'Aquatic trident general that uses sonar resonance waves to pop and slow down bloons.',
    upgrades: [
      [
        { id: 'merm_t1', name: 'Abyssal Gaze', cost: 300, description: 'Sonar pulses freeze target layers.', effects: { damage: 1, freezeTime: 12 } }
      ],
      [
        { id: 'merm_m1', name: 'Symphonic Concord', cost: 400, description: 'Fires double sonic currents in waves.', effects: { cooldownMult: 0.7 } }
      ],
      [
        { id: 'merm_b1', name: 'Riptide Pull', cost: 350, description: 'Vents currents to siphon camo status off bloons.', effects: { canSeeCamo: true } }
      ]
    ]
  }
};

export const HEROES: HeroConfig[] = [
  {
    id: 'quincy',
    name: 'Quincy',
    description: 'A proud, rapid archer who targets first-bloons with complete precision.',
    quote: '"Nothing gets past my bow!"',
    primaryColor: '#f97316', // orange-500
    baseCost: 500,
    perks: [
      { level: 1, desc: 'Base fast ranged single-target physical arrows' },
      { level: 3, desc: 'Rapid Shot: Fires 2x speed arrows dynamically' },
      { level: 7, desc: 'Arrow Pierce: Arrows pop 2 bloons simultaneously' },
      { level: 15, desc: 'MOAB Slayer: x3 damage multiplier vs MOABs' }
    ]
  },
  {
    id: 'gwendolin',
    name: 'Gwendolin',
    description: 'A pyrotechnic scientist who blasts rows of fire and burns entire clusters.',
    quote: '"Is it hot in here, or is it just me?"',
    primaryColor: '#ef4444', // red-500
    baseCost: 750,
    perks: [
      { level: 1, desc: 'Shoots fireballs dealing modest area splash damage' },
      { level: 4, desc: 'Heat Waves: Ignites popped bloons to burn nearby ones' },
      { level: 8, desc: 'Fire Ring: Periodically shoots fireballs in all directions' },
      { level: 15, desc: 'Supernova Blast: Explodes nearby bloons on pop' }
    ]
  },
  {
    id: 'obyn',
    name: 'Obyn Greenfoot',
    description: 'A quiet nature guardian who plants explosive thorns and slows down fast bloons.',
    quote: '"The spirits of the forest guide us."',
    primaryColor: '#10b981', // emerald-500
    baseCost: 650,
    perks: [
      { level: 1, desc: 'Shoots nature spirits which pop multiple targets' },
      { level: 5, desc: 'Nature Shield: Slows down Yellow and Pink bloons by 20% in passive range' },
      { level: 10, desc: 'Wall of Brambles: Seeds spikes on the track to pop 15 bloons automatically' },
      { level: 15, desc: 'Magic Buff: Grants nearby magical/ice towers +25% range' }
    ]
  }
];

export const PERSISTENT_UPGRADES: PersistentUpgrade[] = [
  {
    id: 'extra_starting_cash',
    name: 'Wealthy Beginnings',
    description: 'Start every campaign with +$150 additional starting cash.',
    cost: 150,
    purchased: false,
    category: 'Economy',
    effect: { startingCashBonus: 150 }
  },
  {
    id: 'btd_discount',
    name: 'Military Trade deals',
    description: 'Get an automatic 8% discount on placing monkeys of all tiers.',
    cost: 250,
    purchased: false,
    category: 'Monkeys',
    effect: { discountMonkeysPercent: 8 }
  },
  {
    id: 'extra_lives',
    name: 'Sturdy Shields',
    description: 'Boost starting shields/lives by +30 points to handle fast leakage.',
    cost: 120,
    purchased: false,
    category: 'Economy',
    effect: { extraLivesBonus: 30 }
  },
  {
    id: 'hero_mentorship',
    name: 'Hero Guild Mentorship',
    description: 'Heroes accumulate experience points 30% quicker, leveling up in no time.',
    cost: 220,
    purchased: false,
    category: 'Hero',
    effect: { heroXpRateBonus: 1.3 }
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'pop_1000',
    title: 'First Blood',
    description: 'Pop a total of 1,000 Bloons across any number of games.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1000,
    rewardValue: 100
  },
  {
    id: 'pop_10000',
    title: 'Balloon Massacre',
    description: 'Pop a total of 10,000 Bloons! Unlocks elite visual prestige.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10000,
    rewardValue: 250
  },
  {
    id: 'round_40',
    title: 'Wave Survivor',
    description: 'Successfully conquer Round 40 and survive the first MOAB.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 40,
    rewardValue: 200
  },
  {
    id: 'buy_super',
    title: 'Elite Sponsor',
    description: 'Acquire and place a highly prestigious Sun Disc Super Monkey.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    rewardValue: 150
  },
  {
    id: 'unlock_all_maps',
    title: 'Global Explorer',
    description: 'Conquer at least 3 maps on any difficulty levels.',
    isUnlocked: false,
    progress: 0,
    maxProgress: 3,
    rewardValue: 300
  }
];

// Returns an array of bloon types representing the sequence of bloons to spawn for a given round
export function generateWave(round: number): { delay: number; type: BloonType; isCamo?: boolean; isRegrow?: boolean; isFortified?: boolean }[] {
  const wave: { delay: number; type: BloonType; isCamo?: boolean; isRegrow?: boolean; isFortified?: boolean }[] = [];

  // Pacing logic mimics Bloons TD 6 incremental build-up
  if (round === 1) {
    // Round 1: Just slow Red bloons
    for (let i = 0; i < 20; i++) {
      wave.push({ delay: 35, type: 'Red' });
    }
  } else if (round === 2) {
    for (let i = 0; i < 35; i++) {
      wave.push({ delay: 28, type: 'Red' });
    }
  } else if (round < 5) {
    // Round 3-4: Mix block of Reds and Blues
    const redCount = 20 + round * 5;
    const blueCount = 8 + round * 2;
    for (let i = 0; i < redCount; i++) wave.push({ delay: 25, type: 'Red' });
    for (let i = 0; i < blueCount; i++) wave.push({ delay: 35, type: 'Blue' });
  } else if (round < 10) {
    // Round 5-9: Introduced Green bloons
    const greenCount = round * 3;
    const blueCount = 15;
    const redCount = 20;
    for (let i = 0; i < redCount; i++) wave.push({ delay: 22, type: 'Red' });
    for (let i = 0; i < blueCount; i++) wave.push({ delay: 25, type: 'Blue' });
    for (let i = 0; i < greenCount; i++) wave.push({ delay: 30, type: 'Green' });
  } else if (round === 10) {
    // Green and Blue clumps plus early Yellows
    for (let i = 0; i < 15; i++) wave.push({ delay: 18, type: 'Blue' });
    for (let i = 0; i < 15; i++) wave.push({ delay: 18, type: 'Green' });
    for (let i = 0; i < 3; i++) wave.push({ delay: 40, type: 'Yellow' }); // First high speed
  } else if (round < 15) {
    // Introduce Yellows and Pink rushes, and early Blacks/Whites
    const yellowCount = (round - 10) * 3 + 2;
    const greenCount = 10;
    for (let i = 0; i < greenCount; i++) wave.push({ delay: 20, type: 'Green' });
    for (let i = 1; i <= yellowCount; i++) wave.push({ delay: 18, type: 'Yellow' });
    for (let i = 0; i < 3; i++) wave.push({ delay: 25, type: 'Pink' });
    if (round >= 13) {
      for (let i = 0; i < 3; i++) wave.push({ delay: 20, type: 'Black' });
      for (let i = 0; i < 3; i++) wave.push({ delay: 20, type: 'White' });
    }
  } else if (round === 15) {
    // IMMUNITY TUTORIAL: Introduce Leads (sharp-immune) & Purples (magic-immune) gently
    for (let i = 0; i < 4; i++) wave.push({ delay: 45, type: 'Lead' }); // Leads!
    for (let i = 0; i < 4; i++) wave.push({ delay: 25, type: 'Purple' }); // Purples!
    for (let i = 0; i < 10; i++) wave.push({ delay: 20, type: 'Yellow' });
  } else if (round < 20) {
    // Lead + Purple rushes alongside standard blacks and whites
    for (let i = 0; i < 5; i++) wave.push({ delay: 35, type: 'Lead' });
    for (let i = 0; i < 6; i++) wave.push({ delay: 22, type: 'Purple' });
    for (let i = 0; i < 8; i++) wave.push({ delay: 15, type: 'Pink' });
  } else if (round === 20) {
    // INTRODUCING ZEBRAS (combined freeze + explosion immunities)
    for (let i = 0; i < 6; i++) wave.push({ delay: 20, type: 'Zebra' });
    for (let i = 0; i < 3; i++) wave.push({ delay: 30, type: 'Lead' });
    for (let i = 0; i < 6; i++) wave.push({ delay: 12, type: 'Pink' });
  } else if (round < 25) {
    // Introduces Camo (Crested) and Regrow properties!
    const multiplier = round - 20;
    // Camo Greens and Yellows
    for (let i = 0; i < 3 * multiplier; i++) {
      wave.push({ delay: 20, type: 'Green', isCamo: true });
    }
    // Regrow Reds and Blues
    for (let i = 0; i < 5 * multiplier; i++) {
      wave.push({ delay: 15, type: 'Blue', isRegrow: true });
    }
    // Mix in Zebras and Rainbows
    for (let i = 0; i < 1 * multiplier + 1; i++) {
      wave.push({ delay: 25, type: 'Rainbow' });
    }
  } else if (round === 25) {
    // First high-hp Ceramic bloon!
    for (let i = 0; i < 12; i++) wave.push({ delay: 12, type: 'Pink' });
    wave.push({ delay: 120, type: 'Ceramic' }); // Heavy shell!
    for (let i = 0; i < 4; i++) wave.push({ delay: 20, type: 'Rainbow' });
  } else if (round < 30) {
    // Rainbows, Zebras, and Fortified modifiers!
    const multiplier = round - 25;
    for (let i = 0; i < 4; i++) {
      wave.push({ delay: 25, type: 'Lead', isFortified: true }); // Steel-plated leads!
    }
    for (let i = 0; i < 2 * multiplier; i++) {
      wave.push({ delay: 20, type: 'Rainbow', isRegrow: true });
    }
    const ceramicCount = Math.max(1, Math.floor(multiplier * 1.2));
    for (let i = 0; i < ceramicCount; i++) {
      wave.push({ delay: 40, type: 'Ceramic' });
    }
  } else if (round === 30) {
    // Rainbow Regrow Rush + Fortified Ceramics
    for (let i = 0; i < 10; i++) wave.push({ delay: 12, type: 'Rainbow', isRegrow: true });
    for (let i = 0; i < 2; i++) wave.push({ delay: 60, type: 'Ceramic', isFortified: true });
    for (let i = 0; i < 6; i++) wave.push({ delay: 15, type: 'Pink', isCamo: true });
  } else if (round < 40) {
    // Camo, Regrow, Fortified Ceramics and Rainbow clumps
    const ceramicCount = Math.floor((round - 30) * 1.1) + 1;
    for (let i = 0; i < ceramicCount; i++) {
      wave.push({ delay: 45, type: 'Ceramic', isFortified: i % 2 === 0 });
    }
    for (let i = 0; i < 8; i++) {
      wave.push({ delay: 15, type: 'Rainbow', isCamo: true });
    }
    for (let i = 0; i < 6; i++) {
      wave.push({ delay: 20, type: 'Zebra', isRegrow: true });
    }
  } else if (round === 40) {
    // MOAB Wave (Mother of All Bloons BOSS)
    for (let i = 0; i < 8; i++) wave.push({ delay: 18, type: 'Pink', isCamo: true });
    for (let i = 0; i < 3; i++) wave.push({ delay: 45, type: 'Ceramic', isRegrow: true });
    wave.push({ delay: 180, type: 'MOAB' }); // Boss blimp!
  } else if (round <= 50) {
    // Post-round 40 linear progression up to first BFB
    // Intro to MOABs gradually (Rounds 41-50)
    if (round === 41) {
      for (let i = 0; i < 15; i++) wave.push({ delay: 15, type: 'Rainbow' });
      for (let i = 0; i < 5; i++) wave.push({ delay: 35, type: 'Ceramic' });
    } else if (round === 42) {
      for (let i = 0; i < 10; i++) wave.push({ delay: 12, type: 'Rainbow', isRegrow: true });
      for (let i = 0; i < 6; i++) wave.push({ delay: 30, type: 'Ceramic' });
    } else if (round === 43) {
      // Intro to stealth lead (Camo Leads) clumps
      for (let i = 0; i < 6; i++) wave.push({ delay: 20, type: 'Lead', isCamo: true });
      for (let i = 0; i < 10; i++) wave.push({ delay: 15, type: 'Rainbow' });
      wave.push({ delay: 120, type: 'MOAB' });
    } else if (round === 45) {
      // Dual MOAB rush
      for (let i = 0; i < 10; i++) wave.push({ delay: 15, type: 'Pink', isCamo: true });
      wave.push({ delay: 100, type: 'MOAB' });
      wave.push({ delay: 100, type: 'MOAB' });
    } else {
      // Math-based smooth ramp-up for 44, 46, 47, 48, 49, 50
      const mult = round - 40;
      for (let i = 0; i < mult + 2; i++) {
        wave.push({ delay: 35, type: 'Ceramic', isFortified: i % 2 === 0 });
      }
      for (let i = 0; i < 10; i++) {
        wave.push({ delay: 15, type: 'Rainbow', isRegrow: true });
      }
      if (round >= 47) {
        wave.push({ delay: 120, type: 'MOAB' });
      }
    }
  } else if (round <= 60) {
    // Leads up to first BFB at Round 60
    if (round === 55) {
      // Landmark wave: Triple MOAB challenge
      for (let i = 0; i < 8; i++) wave.push({ delay: 15, type: 'Ceramic', isFortified: true });
      wave.push({ delay: 90, type: 'MOAB' });
      wave.push({ delay: 90, type: 'MOAB' });
      wave.push({ delay: 90, type: 'MOAB' });
    } else if (round === 60) {
      // Medium Final Boss: First BFB (Big Fat Bloon - 400 HP)!
      for (let i = 0; i < 12; i++) wave.push({ delay: 15, type: 'Rainbow', isRegrow: true });
      for (let i = 0; i < 4; i++) wave.push({ delay: 35, type: 'Ceramic', isFortified: true });
      wave.push({ delay: 220, type: 'BFB' });
    } else {
      const mult = round - 50;
      for (let i = 0; i < mult + 1; i++) {
        wave.push({ delay: 30, type: 'Ceramic', isFortified: true });
      }
      wave.push({ delay: 100, type: 'MOAB' });
      if (mult % 3 === 0) {
        wave.push({ delay: 120, type: 'MOAB', isFortified: true });
      }
    }
  } else if (round <= 80) {
    // Leads up to first ZOMG at Round 80
    if (round === 63) {
      // Iconic Round 63: 3 extreme density ceramic batches
      for (let i = 0; i < 30; i++) wave.push({ delay: 4, type: 'Lead' });
      for (let i = 0; i < 25; i++) wave.push({ delay: 6, type: 'Ceramic' });
      for (let i = 0; i < 20; i++) wave.push({ delay: 8, type: 'Rainbow', isRegrow: true });
      for (let i = 0; i < 25; i++) wave.push({ delay: 6, type: 'Ceramic' });
    } else if (round === 70) {
      // Multi-BFB block
      wave.push({ delay: 100, type: 'BFB' });
      wave.push({ delay: 100, type: 'BFB' });
      for (let i = 0; i < 3; i++) wave.push({ delay: 70, type: 'MOAB' });
    } else if (round === 78) {
      // Iconic Round 78: Big Camo-Regrow Rainbow rush followed by nested ceramics
      for (let i = 0; i < 45; i++) wave.push({ delay: 5, type: 'Rainbow', isRegrow: true, isCamo: true });
      for (let i = 0; i < 15; i++) wave.push({ delay: 12, type: 'Ceramic' });
      wave.push({ delay: 120, type: 'BFB' });
    } else if (round === 80) {
      // Hard Final Boss: First ZOMG (Zeppelin Of Mighty Gargantuaness - 800 HP)!
      for (let i = 0; i < 4; i++) wave.push({ delay: 60, type: 'MOAB' });
      wave.push({ delay: 250, type: 'ZOMG' });
    } else {
      // Steady flow of MOABs and BFBs
      const mult = round - 60;
      if (mult % 4 === 0) {
        wave.push({ delay: 150, type: 'BFB' });
      } else {
        wave.push({ delay: 100, type: 'MOAB', isFortified: true });
        wave.push({ delay: 110, type: 'MOAB' });
      }
      for (let i = 0; i < 5; i++) wave.push({ delay: 25, type: 'Ceramic', isFortified: true });
    }
  } else if (round <= 100) {
    // Leads up to first BAD at Round 100
    if (round === 90) {
      // Intro to DDT (Dark Dirigible Titan: 150 HP, speed 3.2, lead and camo properties)!
      for (let i = 0; i < 15; i++) wave.push({ delay: 12, type: 'Lead', isCamo: true });
      wave.push({ delay: 80, type: 'DDT' });
      wave.push({ delay: 80, type: 'DDT' });
      wave.push({ delay: 80, type: 'DDT' });
    } else if (round === 95) {
      // Landmark wave 95: Mass DDT rush! Excellent challenge for Camo/Lead piercing!
      for (let i = 0; i < 30; i++) wave.push({ delay: 6, type: 'Purple', isCamo: true });
      for (let i = 0; i < 6; i++) wave.push({ delay: 50, type: 'DDT' });
    } else if (round === 98) {
      // Iconic Wave 98: Colossal density of BFBs and ZOMGs
      for (let i = 0; i < 8; i++) wave.push({ delay: 45, type: 'BFB' });
      wave.push({ delay: 120, type: 'ZOMG' });
      wave.push({ delay: 120, type: 'ZOMG' });
    } else if (round === 99) {
      // Fortified DDTs right before the boss!
      wave.push({ delay: 60, type: 'DDT', isFortified: true });
      wave.push({ delay: 60, type: 'DDT', isFortified: true });
    } else if (round === 100) {
      // CHIMPS Final Boss: The BAD (Big Airship of Doom: 1500 HP)!
      wave.push({ delay: 120, type: 'ZOMG' });
      wave.push({ delay: 120, type: 'ZOMG' });
      wave.push({ delay: 300, type: 'BAD' });
    } else {
      const mult = round - 80;
      if (mult % 5 === 0) {
        wave.push({ delay: 140, type: 'ZOMG' });
      } else if (mult % 3 === 0) {
        wave.push({ delay: 100, type: 'BFB', isFortified: true });
        wave.push({ delay: 90, type: 'DDT' });
      } else {
        wave.push({ delay: 80, type: 'MOAB', isFortified: true });
        wave.push({ delay: 80, type: 'MOAB', isFortified: true });
      }
    }
  } else {
    // Post-round 100 infinite play Scaling
    const extra = round - 100;
    
    if (extra % 10 === 0) {
      wave.push({ delay: 300, type: 'BAD' });
    } else if (extra % 5 === 0) {
      wave.push({ delay: 180, type: 'ZOMG' });
      wave.push({ delay: 140, type: 'DDT' });
    } else {
      wave.push({ delay: 120, type: 'BFB', isFortified: true });
      wave.push({ delay: 100, type: 'DDT' });
      wave.push({ delay: 90, type: 'MOAB', isFortified: true });
    }

    const ceramicCount = Math.min(25, 5 + Math.floor(extra / 2));
    for (let i = 0; i < ceramicCount; i++) {
      wave.push({ delay: 35, type: 'Ceramic', isFortified: i % 2 === 0 });
    }
    for (let i = 0; i < 20; i++) {
      wave.push({ delay: 12, type: 'Rainbow', isRegrow: true });
    }
  }

  return wave;
}

// Bloon specifications metadata helper
export function getBloonStyle(type: BloonType): {
  speed: number;
  hp: number;
  size: number;
  color: string;
  reward: number;
  label: string;
} {
  switch (type) {
    case 'Red':
      return { speed: 1.1, hp: 1, size: 9, color: '#ef4444', reward: 1, label: 'Red' };
    case 'Blue':
      return { speed: 1.4, hp: 1, size: 10, color: '#3b82f6', reward: 1, label: 'Blue' };
    case 'Green':
      return { speed: 1.8, hp: 1, size: 11, color: '#10b981', reward: 1, label: 'Green' };
    case 'Yellow':
      return { speed: 3.2, hp: 1, size: 11, color: '#facc15', reward: 1, label: 'Yellow' };
    case 'Pink':
      return { speed: 4.0, hp: 1, size: 11, color: '#ec4899', reward: 1, label: 'Pink' };
    case 'Black':
      return { speed: 1.8, hp: 1, size: 10, color: '#1e293b', reward: 2, label: 'Black' };
    case 'White':
      return { speed: 2.0, hp: 1, size: 10, color: '#f8fafc', reward: 2, label: 'White' };
    case 'Purple':
      return { speed: 3.0, hp: 1, size: 10, color: '#a855f7', reward: 2, label: 'Purple' };
    case 'Lead':
      return { speed: 1.0, hp: 1, size: 11, color: '#64748b', reward: 2, label: 'Lead' };
    case 'Zebra':
      return { speed: 1.8, hp: 1, size: 11, color: '#f1f5f9', reward: 2, label: 'Zebra' };
    case 'Rainbow':
      return { speed: 2.2, hp: 1, size: 12, color: '#fb7185', reward: 3, label: 'Rainbow' };
    case 'Ceramic':
      return { speed: 2.5, hp: 10, size: 13, color: '#b45309', reward: 4, label: 'Ceramic' };
    case 'MOAB':
      return { speed: 0.75, hp: 200, size: 26, color: '#06b6d4', reward: 15, label: 'MOAB' };
    case 'BFB':
      return { speed: 0.65, hp: 400, size: 30, color: '#ef4444', reward: 25, label: 'BFB' };
    case 'ZOMG':
      return { speed: 0.5, hp: 800, size: 34, color: '#16a34a', reward: 55, label: 'ZOMG' };
    case 'DDT':
      return { speed: 3.2, hp: 150, size: 26, color: '#334155', reward: 35, label: 'DDT' };
    case 'BAD':
      return { speed: 0.4, hp: 1500, size: 38, color: '#d946ef', reward: 100, label: 'BAD' };
  }
}

// Child Bloon Spawn definition
export function getChildBloonType(type: BloonType): BloonType | null {
  switch (type) {
    case 'BAD': return 'ZOMG'; // Spawns 2 ZOMG & 3 DDTs (handled in splitting loops)
    case 'ZOMG': return 'BFB';
    case 'BFB': return 'MOAB';
    case 'MOAB': return 'Ceramic';
    case 'DDT': return 'Ceramic'; // Spawns 4 ceramics
    case 'Ceramic': return 'Rainbow';
    case 'Rainbow': return 'Zebra';
    case 'Zebra': return 'White'; // Zebra splits into Black and White (handled in splitting loops)
    case 'Lead': return 'Black';
    case 'Purple': return 'Pink';
    case 'White': return 'Pink';
    case 'Black': return 'Pink';
    case 'Pink': return 'Yellow';
    case 'Yellow': return 'Green';
    case 'Green': return 'Blue';
    case 'Blue': return 'Red';
    case 'Red': return null;
  }
}

// Get the quantity of child bloons when popped
export function getChildCount(type: BloonType): number {
  switch (type) {
    case 'BAD': return 5;
    case 'ZOMG': return 4;
    case 'BFB': return 4;
    case 'MOAB': return 4;
    case 'DDT': return 4;
    case 'Ceramic': return 2;
    case 'Rainbow': return 2;
    case 'Zebra': return 2;
    case 'Lead': return 2;
    case 'Purple': return 2;
    case 'White': return 2;
    case 'Black': return 2;
    case 'Pink': return 1;
    case 'Yellow': return 1;
    case 'Green': return 1;
    case 'Blue': return 1;
    case 'Red': return 0;
  }
}
