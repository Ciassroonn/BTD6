import React, { useEffect, useRef, useState } from 'react';
import { GameMap, Tower, Bloon, BloonType, Projectile, Part, FloatingText, Difficulty, TowerType, TargetMode, ThemeColors } from '../types';
import { PRESETS } from './SettingsScreen';
import { MAPS, TOWER_STATS, HEROES, getBloonStyle, getChildBloonType, getChildCount, generateWave } from '../gameData';
import {
  drawMap,
  drawBloon,
  drawTower,
  drawProjectile,
  drawParticle,
  drawFloatingText,
  drawRangeIndicator,
} from '../canvasDrawer';
import {
  playPop,
  playShoot,
  playSniperShoot,
  playExplosion,
  playIceFreeze,
  playLaserZap,
  playLevelUp,
  resumeAudio,
  toggleMute,
  getMuted,
} from '../audio';
import {
  Heart,
  Coins,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  ChevronUp,
  X,
  Clock,
  Settings,
  HelpCircle,
  TrendingUp,
  Sliders,
  DollarSign,
  Flame,
  Trophy,
  Palette,
  Save,
  Copy,
  Check,
} from 'lucide-react';

import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

export const TOWER_VISUALS: Record<string, { emoji: string; color: string; tag: string }> = {
  dart: { emoji: '🐒', color: '#b45309', tag: 'Primary Popper' },
  tack: { emoji: '⚙️', color: '#6b7280', tag: '360° Burst' },
  sniper: { emoji: '🎯', color: '#15803d', tag: 'Infinite Range' },
  bomb: { emoji: '💣', color: '#1f2937', tag: 'Heavy Exploder' },
  ice: { emoji: '🥶', color: '#0ea5e9', tag: 'Cryo Freeze' },
  super: { emoji: '🦸', color: '#4f46e5', tag: 'Magic Legend' },
  boomerang: { emoji: '🪃', color: '#c2410c', tag: 'Curve Pierce' },
  ninja: { emoji: '🥷', color: '#374151', tag: 'Stealth Pierce' },
  glue: { emoji: '🧪', color: '#a3e635', tag: 'Acid/Glue Slow' },
  wizard: { emoji: '🧙', color: '#7c3aed', tag: 'Flame/Spells' },
  alchemist: { emoji: '🧪', color: '#db2777', tag: 'Buff Brews' },
  druid: { emoji: '🌳', color: '#16a34a', tag: 'Nature Wrath' },
  farm: { emoji: '🍌', color: '#eab308', tag: 'Economy Crop' },
  sub: { emoji: '⚓', color: '#0284c7', tag: 'Aquatic Sonar' },
  buccaneer: { emoji: '⛵', color: '#0369a1', tag: 'Pirate Grapes' },
  pool: { emoji: '🏊', color: '#0d9488', tag: 'Water Surface' },
};

interface GameScreenProps {
  mapId: string;
  heroType: string;
  difficulty: Difficulty;
  gameMode: 'campaign' | 'endless' | 'sandbox' | 'battles2';
  startingCashBonus: number;
  discountPercent: number;
  extraLivesBonus: number;
  heroXpRateBonus: number;
  onGameOver: (roundsCompleted: number, monkeyMoneyEarned: number, totalPopped: number) => void;
  onNavigateHome: () => void;
  themeColors?: ThemeColors;
  onChangeTheme?: (colors: ThemeColors) => void;
}

interface SendableBloonConfig {
  type: BloonType;
  emoji: string;
  cost: number;
  eco: number;
  unlockRound: number;
}

export const SENDABLE_BLOONS: SendableBloonConfig[] = [
  { type: 'Red', emoji: '🔴', cost: 20, eco: 1.0, unlockRound: 1 },
  { type: 'Blue', emoji: '🔵', cost: 25, eco: 1.2, unlockRound: 2 },
  { type: 'Green', emoji: '🟢', cost: 35, eco: 1.4, unlockRound: 3 },
  { type: 'Yellow', emoji: '🟡', cost: 45, eco: 1.6, unlockRound: 4 },
  { type: 'Pink', emoji: '🌸', cost: 60, eco: 2.0, unlockRound: 5 },
  { type: 'Purple', emoji: '🟣', cost: 70, eco: 2.2, unlockRound: 6 },
  { type: 'Black', emoji: '⚫', cost: 80, eco: 2.4, unlockRound: 8 },
  { type: 'White', emoji: '⚪', cost: 85, eco: 2.5, unlockRound: 9 },
  { type: 'Lead', emoji: '🛡️', cost: 100, eco: 3.0, unlockRound: 10 },
  { type: 'Zebra', emoji: '🦓', cost: 110, eco: 3.2, unlockRound: 12 },
  { type: 'Rainbow', emoji: '🌈', cost: 130, eco: 3.5, unlockRound: 14 },
  { type: 'Ceramic', emoji: '🗿', cost: 180, eco: 4.5, unlockRound: 16 },
  { type: 'MOAB', emoji: '🛸', cost: 350, eco: 6.0, unlockRound: 18 },
  { type: 'BFB', emoji: '🎈', cost: 700, eco: 10.0, unlockRound: 20 },
  { type: 'ZOMG', emoji: '💀', cost: 1500, eco: 18.0, unlockRound: 22 },
  { type: 'DDT', emoji: '🚀', cost: 1800, eco: 22.0, unlockRound: 24 },
  { type: 'BAD', emoji: '👑', cost: 3000, eco: 35.5, unlockRound: 26 },
];

// Math Utility: Calculate shortest distance from point (px, py) to line segment (ax, ay) -> (bx, by)
function getDistanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const nearestX = ax + t * dx;
  const nearestY = ay + t * dy;
  return Math.hypot(px - nearestX, py - nearestY);
}

// BTD6-style Late Game health & speed scaling after Round 80 (Cumulative exponential per round)
function getLateGameMultiplier(r: number): { hp: number; speed: number } {
  let hpMult = 1.0;
  let speedMult = 1.0;
  if (r <= 80) {
    return { hp: 1.0, speed: 1.0 };
  }
  
  for (let i = 81; i <= r; i++) {
    if (i <= 100) {
      hpMult *= 1.02;
      speedMult *= 1.02;
    } else if (i <= 124) {
      hpMult *= 1.05;
      speedMult *= 1.05;
    } else if (i <= 151) {
      hpMult *= 1.15;
      speedMult *= 1.15;
    } else {
      hpMult *= 1.35;
      speedMult *= 1.35;
    }
  }
  return { hp: hpMult, speed: speedMult };
}

// BTD6-style Income reduction per pop as game rounds progress
function getIncomeMultiplier(r: number): number {
  if (r <= 50) return 1.0;
  if (r <= 60) return 0.50;  // After round 50 (50% value)
  if (r <= 85) return 0.20;  // After round 60 (20% value)
  if (r <= 100) return 0.10; // After round 85 (10% value)
  if (r <= 121) return 0.05; // After round 100 (5% value)
  return 0.02;               // After round 121 (2% value)
}

// Map tower to its current BTD6 damage type based on installed upgrade paths
export function getTowerDamageType(t: Tower, heroId: string): 'sharp' | 'explosive' | 'cold' | 'magic' | 'plasma' | 'acid' | 'normal' {
  const lv = t.upgradeLevels || [0, 0, 0];
  
  switch (t.type) {
    case 'dart':
      if (lv[0] >= 3) return 'normal'; // Spike-o-pult / Juggernaut
      if (lv[1] >= 5) return 'plasma'; // Plasma Fan Club
      return 'sharp';
      
    case 'tack':
      if (lv[0] >= 3) return 'normal'; // Hot Shots / Ring of Fire / Inferno fire normal
      return 'sharp';
      
    case 'sniper':
      if (lv[0] >= 2) return 'normal'; // Full Metal Jacket / Deadly Precision
      return 'sharp';
      
    case 'bomb':
      return 'explosive';
      
    case 'ice':
      if (lv[0] >= 4) return 'normal'; // Embrittlement/Super Brittle normal ice
      return 'cold';
      
    case 'super':
      if (lv[0] >= 4) return 'normal'; // Sun Temple / True Sun God
      if (lv[0] >= 2 || lv[2] >= 2) return 'plasma'; // Plasma Blaster, Ultravision Plasma
      if (lv[0] === 1) return 'magic'; // Lasers can pop frozen, block on purple, not lead
      return 'sharp';
      
    case 'boomerang':
      if (lv[1] >= 2) return 'normal'; // Red Hot Rangs melts lead & frozen
      return 'sharp';
      
    case 'ninja':
      return 'sharp';
      
    case 'glue':
      return 'acid';
      
    case 'wizard':
      if (lv[0] >= 3 || lv[1] >= 3) return 'normal'; // Fireball, Dragon's Breath normal
      return 'magic';
      
    case 'alchemist':
      return 'acid';
      
    case 'druid':
      if (lv[1] >= 3) return 'normal'; // Druid of the Jungle
      return 'sharp';
      
    case 'sub':
      if (lv[1] >= 2) return 'normal'; // Heat-Tipped Darts
      return 'sharp';
      
    case 'buccaneer':
      if (lv[0] >= 4 || lv[1] >= 2) return 'normal'; // Aircraft Carrier / Grape hot shots
      return 'sharp';
      
    case 'hero':
      if (heroId === 'gwendolin') return 'normal';
      if (heroId === 'obyn') return 'magic';
      if (heroId === 'quincy' && t.level >= 10) return 'normal';
      return 'sharp';
      
    default:
      return 'sharp';
  }
}

// BTD6 Unified Immunity and collision permission matrix
export function canAttackBloon(
  damageType: 'sharp' | 'explosive' | 'cold' | 'magic' | 'plasma' | 'acid' | 'normal',
  bloonType: string,
  isFrozen: boolean
): boolean {
  if (bloonType === 'BAD') return true; // Boss is susceptible to everything!
  
  // 1. Lead Immunity (Immune to Sharp and Cold)
  if (bloonType === 'Lead') {
    if (damageType === 'sharp' || damageType === 'cold') return false;
  }
  
  // 2. Frozen state (Immune to Sharp physical attacks)
  if (isFrozen) {
    if (damageType === 'sharp') return false;
  }
  
  // 3. Black, Zebra and DDT Immunity to Explosive damage
  if (bloonType === 'Black' || bloonType === 'Zebra' || bloonType === 'DDT') {
    if (damageType === 'explosive') return false;
  }
  
  // 4. White and Zebra Immunity to Cold freezing damage
  if (bloonType === 'White' || bloonType === 'Zebra') {
    if (damageType === 'cold') return false;
  }
  
  // 5. Purple Immunity to magical energy / plasma beams
  if (bloonType === 'Purple') {
    if (damageType === 'magic' || damageType === 'plasma') return false;
  }
  
  // 6. DDT has Lead elements (Immune to Sharp)
  if (bloonType === 'DDT') {
    if (damageType === 'sharp') return false;
  }
  
  return true;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mapId,
  heroType,
  difficulty,
  gameMode,
  startingCashBonus,
  discountPercent,
  extraLivesBonus,
  heroXpRateBonus,
  onGameOver,
  onNavigateHome,
  themeColors,
  onChangeTheme,
}) => {
  const selectedMap = MAPS.find((m) => m.id === mapId) || MAPS[0];
  const heroConfig = HEROES.find((h) => h.id === heroType) || HEROES[0];

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const opponentCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game State Variables
  const maxRounds = gameMode === 'battles2' ? 150 : (difficulty === 'Easy' ? 40 : difficulty === 'Medium' ? 60 : difficulty === 'Hard' ? 80 : 100);
  const victoryRewardsValue = difficulty === 'Easy' ? 150 : difficulty === 'Medium' ? 250 : difficulty === 'Hard' ? 350 : 500;

  // Get active upgrade cost with discount and difficulty multiplier
  const getUpgradeCost = (baseCost: number): number => {
    const actualDiscountPercent = difficulty === 'CHIMPS' ? 0 : discountPercent;
    const discounted = baseCost * (1 - actualDiscountPercent / 100);
    let factor = 1.0;
    if (difficulty === 'Easy') factor = 0.75; // lowered from 0.85
    if (difficulty === 'Hard' || difficulty === 'CHIMPS') factor = 1.2;
    return Math.round(discounted * factor);
  };

  const [cash, setCash] = useState<number>(() => {
    let base = 650;
    if (difficulty === 'Easy') base = 1000; // was 850
    if (difficulty === 'Medium') base = 800; // was 650
    if (difficulty === 'Hard') base = 700; // was 650
    if (difficulty === 'CHIMPS') base = 650;
    const actualStartingCashBonus = difficulty === 'CHIMPS' ? 0 : startingCashBonus;
    return base + actualStartingCashBonus;
  });

  const [lives, setLives] = useState<number>(() => {
    if (difficulty === 'CHIMPS') return 1; // 1 HP only (No Hearts Lost)
    let base = 150;
    if (difficulty === 'Easy') base = 250; // was 200
    if (difficulty === 'Medium') base = 180; // was 150
    if (difficulty === 'Hard') base = 120; // was 100
    const actualExtraLivesBonus = difficulty === 'CHIMPS' ? 0 : extraLivesBonus;
    return base + actualExtraLivesBonus;
  });

  // Sandbox spawners
  const spawnSingleBloon = (type: string, isCamo = false, isRegrow = false, isFortified = false) => {
    const spec = getBloonStyle(type as any);
    const pathStart = selectedMap.track[0];
    if (!pathStart) return;

    let speedMultiplierByDiff = 1.0;
    if (difficulty === 'Easy') speedMultiplierByDiff = 0.85;
    else if (difficulty === 'Hard' || difficulty === 'CHIMPS') speedMultiplierByDiff = 1.15;

    const lateScale = getLateGameMultiplier(round);
    const initialHp = (isFortified ? (type === 'Lead' ? spec.hp * 4 : spec.hp * 2) : spec.hp) * lateScale.hp;

    const inst: Bloon = {
      id: `sandbox_bloon_${Date.now()}_${Math.random()}`,
      type: type as any,
      x: pathStart.x,
      y: pathStart.y,
      speed: spec.speed * speedMultiplierByDiff * lateScale.speed,
      hp: initialHp,
      maxHp: initialHp,
      size: spec.size,
      color: spec.color,
      reward: spec.reward,
      distanceTraversed: 0,
      pathSegmentIndex: 0,
      segmentProgress: 0,
      isFrozen: false,
      freezeTimer: 0,
      isSlowed: false,
      slowTimer: 0,
      isCeramic: type === 'Ceramic',
      isMoab: ['MOAB', 'BFB', 'ZOMG', 'DDT', 'BAD'].includes(type),
      isCamo: isCamo,
      isRegrow: isRegrow,
      isFortified: isFortified,
    };

    bloonsRef.current.push(inst);
  };

  const [round, setRound] = useState<number>(1);
  const [roundInProgress, setRoundInProgress] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  // Sandbox mode controller states
  const [sandboxTab, setSandboxTab] = useState<'spawn' | 'cheats'>('spawn');
  const [sandboxCamo, setSandboxCamo] = useState<boolean>(false);
  const [sandboxRegrow, setSandboxRegrow] = useState<boolean>(false);
  const [sandboxFortified, setSandboxFortified] = useState<boolean>(false);
  
  // Infinite play & victory milestones
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [freePlayActive, setFreePlayActive] = useState<boolean>(false);

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(getMuted());
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // Fast Forward multiplier: 1, 2, 3
  const [mySpeedVote, setMySpeedVote] = useState<number>(1);
  const [opponentSpeedVote, setOpponentSpeedVote] = useState<number>(1);
  const [myPauseVote, setMyPauseVote] = useState<boolean>(false);
  const [opponentPauseVote, setOpponentPauseVote] = useState<boolean>(false);
  const [totalPopCount, setTotalPopCount] = useState<number>(0);

  // Selection & Placement States
  const [selectedShopTower, setSelectedShopTower] = useState<TowerType | null>(null);
  const [selectedPlacementTowerCost, setSelectedPlacementTowerCost] = useState<number>(0);
  const [selectedPlacedTowerId, setSelectedPlacedTowerId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showGameSettingsModal, setShowGameSettingsModal] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [exportedCodeString, setExportedCodeString] = useState<string>('');
  const [pastedCode, setPastedCode] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  // Live mutable entities refs (to prevent reactivation re-renders and jitter in high-frequency anims)
  const towersRef = useRef<Tower[]>([]);
  const bloonsRef = useRef<Bloon[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Part[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Wave spawn queues
  const spawnQueueRef = useRef<{ delay: number; type: string }[]>([]);
  const spawnTimerRef = useRef<number>(0);
  const roundInProgressRef = useRef<boolean>(false);

  const battlesOpponentSpawnQueueRef = useRef<{ delay: number; type: string }[]>([]);
  const battlesOpponentSpawnTimerRef = useRef<number>(0);

  // --- BATTLES 2 STATE & REFS ---
  const [battlesEco, setBattlesEco] = useState<number>(250);
  const [battlesOpponentEco, setBattlesOpponentEco] = useState<number>(250);
  const [battlesOpponentCash, setBattlesOpponentCash] = useState<number>(650);
  const [battlesOpponentLives, setBattlesOpponentLives] = useState<number>(150);

  const [autoSendBloon, setAutoSendBloon] = useState<BloonType | null>(null);
  const autoSendBloonRef = useRef<BloonType | null>(null);
  useEffect(() => {
    autoSendBloonRef.current = autoSendBloon;
  }, [autoSendBloon]);

  const [battlesPeerId, setBattlesPeerId] = useState<string>('');
  const [battlesJoinCode, setBattlesJoinCode] = useState<string>('');
  const [isMultiplayerConnected, setIsMultiplayerConnected] = useState<boolean>(false);
  const [mpRole, setMpRole] = useState<'host' | 'client' | null>(null);
  const [mpStatus, setMpStatus] = useState<string>('');
  
  const [customServerUrl, setCustomServerUrl] = useState<string>('');
  const [showServerSettings, setShowServerSettings] = useState<boolean>(false);

  const getMpServerUrl = (): string => {
    if (customServerUrl.trim()) {
      return customServerUrl.trim();
    }
    
    let host = 'localhost:3000';
    try {
      host = window.location.host || window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    } catch (err) {
      console.warn('Iframe blocked window.location.host access, using fallback.');
    }

    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0');
    const isPreview = host.includes('run.app');

    if (!isLocal && !isPreview) {
      return 'wss://ais-pre-7dufymqhvbwim43rqg4h27-707267944988.us-east1.run.app/ws';
    }

    let builtInAppUrl = '';
    try {
      builtInAppUrl = (process.env as any).APP_URL || '';
    } catch (err) {}

    if (builtInAppUrl && !isLocal) {
      const cleanUrl = builtInAppUrl.replace(/^http/, 'ws');
      return cleanUrl.endsWith('/') ? `${cleanUrl}ws` : `${cleanUrl}/ws`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${host || 'localhost:3000'}/ws`;
    }
  };

  const [mpEngine, setMpEngine] = useState<'firebase' | 'websocket'>('firebase');
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(2, 9));

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: null,
        email: null,
      }
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const startBattlesFirebaseHost = async () => {
    try {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setBattlesPeerId(pin);
      setMpRole('host');
      setMpStatus('Creating real-time room in Firestore...');

      const roomRef = doc(db, 'battles_rooms', pin);
      
      await setDoc(roomRef, {
        roomId: pin,
        hostSessionId: sessionIdRef.current,
        clientSessionId: '',
        status: 'waiting',
        updatedAt: Date.now()
      });

      console.log('Firebase room created, PIN:', pin);
      setMpStatus('Waiting for your opponent to join...');

      const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data.status === 'connected' && data.clientSessionId) {
          resetBattlesMatch();
          setIsMultiplayerConnected(true);
          setMpStatus('Opponent connected! Fight!');
        } else if (data.status === 'disconnected') {
          setIsMultiplayerConnected(false);
          setMpStatus('Opponent disconnected. Match paused.');
        }
      }, (error) => {
        handleFirestoreError(error, 'get', `battles_rooms/${pin}`);
      });

      const eventsRef = collection(db, 'battles_rooms', pin, 'events');
      const processedEventIds = new Set<string>();

      const unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
        const sortedDocs = snapshot.docChanges()
          .filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, data: change.doc.data() }))
          .sort((a, b) => (a.data.timestamp || 0) - (b.data.timestamp || 0));

        sortedDocs.forEach(({ id, data }) => {
          if (processedEventIds.has(id)) return;
          processedEventIds.add(id);

          if (data.sender === 'client') {
            handleIncomingMpData(data);
          }
        });
      }, (error) => {
        handleFirestoreError(error, 'list', `battles_rooms/${pin}/events`);
      });

      connRef.current = {
        send: async (data: any) => {
          try {
            await addDoc(eventsRef, {
              sender: 'host',
              timestamp: Date.now(),
              ...data
            });
          } catch (error) {
            handleFirestoreError(error, 'write', `battles_rooms/${pin}/events`);
          }
        },
        close: async () => {
          try {
            unsubscribeRoom();
            unsubscribeEvents();
            await updateDoc(roomRef, {
              status: 'disconnected',
              updatedAt: Date.now()
            });
          } catch (e) {
            console.warn('Silent close error:', e);
          }
        }
      };

    } catch (error) {
      console.error('Failed to host Firebase Battles Room:', error);
      setMpStatus('Error creating Firebase Room. Try again.');
    }
  };

  const joinBattlesFirebaseRoom = async (code: string) => {
    const pin = code.trim();
    if (!pin) {
      setMpStatus('Please enter a valid PIN.');
      return;
    }

    try {
      setMpRole('client');
      setMpStatus(`Joining room ${pin} in Firestore...`);

      const roomRef = doc(db, 'battles_rooms', pin);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setMpStatus('Room does not exist. Double check the PIN!');
        return;
      }

      const roomData = roomSnap.data();
      if (roomData.status === 'connected') {
        setMpStatus('Room is already full!');
        return;
      }

      await updateDoc(roomRef, {
        clientSessionId: sessionIdRef.current,
        status: 'connected',
        updatedAt: Date.now()
      });

      const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data.status === 'disconnected') {
          setIsMultiplayerConnected(false);
          setMpStatus('Disconnected by peer.');
        }
      }, (error) => {
        handleFirestoreError(error, 'get', `battles_rooms/${pin}`);
      });

      const eventsRef = collection(db, 'battles_rooms', pin, 'events');
      const processedEventIds = new Set<string>();

      const unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
        const sortedDocs = snapshot.docChanges()
          .filter(change => change.type === 'added')
          .map(change => ({ id: change.doc.id, data: change.doc.data() }))
          .sort((a, b) => (a.data.timestamp || 0) - (b.data.timestamp || 0));

        sortedDocs.forEach(({ id, data }) => {
          if (processedEventIds.has(id)) return;
          processedEventIds.add(id);

          if (data.sender === 'host') {
            handleIncomingMpData(data);
          }
        });
      }, (error) => {
        handleFirestoreError(error, 'list', `battles_rooms/${pin}/events`);
      });

      resetBattlesMatch();
      setIsMultiplayerConnected(true);
      setMpStatus('Loaded in! Connected with host, Fight!');

      connRef.current = {
        send: async (data: any) => {
          try {
            await addDoc(eventsRef, {
              sender: 'client',
              timestamp: Date.now(),
              ...data
            });
          } catch (error) {
            handleFirestoreError(error, 'write', `battles_rooms/${pin}/events`);
          }
        },
        close: async () => {
          try {
            unsubscribeRoom();
            unsubscribeEvents();
            await updateDoc(roomRef, {
              status: 'disconnected',
              updatedAt: Date.now()
            });
          } catch (e) {
            console.warn('Silent close error:', e);
          }
        }
      };

    } catch (error) {
      console.error('Failed to join Firebase Battles Room:', error);
      setMpStatus('Error joining room. Try again.');
    }
  };

  const battlesEcoRef = useRef<number>(250);
  const battlesOpponentEcoRef = useRef<number>(250);
  const battlesOpponentCashRef = useRef<number>(650);
  const battlesOpponentLivesRef = useRef<number>(150);
  const cashRef = useRef<number>(650);
  const livesRef = useRef<number>(150);

  const battlesOpponentTowersRef = useRef<Tower[]>([]);
  const battlesOpponentBloonsRef = useRef<Bloon[]>([]);
  const battlesOpponentProjectilesRef = useRef<Projectile[]>([]);
  const battlesOpponentParticlesRef = useRef<Part[]>([]);
  const battlesOpponentFloatingTextsRef = useRef<FloatingText[]>([]);

  const peerRef = useRef<any>(null);
  const connRef = useRef<any>(null);

  // Monkey pop counter updates mapping (for active pop-count panels syncing)
  const [triggerPopCountUpdate, setTriggerPopCountUpdate] = useState<number>(0);

  // Game active state loop key
  const [isGameOverOrFinished, setIsGameOverOrFinished] = useState<boolean>(false);

  // Sync refs to avoid breaking standard RAF loops
  const roundRef = useRef<number>(round);
  const selectedShopTowerRef = useRef<TowerType | null>(selectedShopTower);
  const mousePosRef = useRef<{ x: number; y: number }>(mousePos);
  const speedMultiplierRef = useRef<number>(speedMultiplier);
  const isGameOverOrFinishedRef = useRef<boolean>(isGameOverOrFinished);
  const showVictoryModalRef = useRef<boolean>(showVictoryModal);
  const gameModeRef = useRef<string>(gameMode);
  const freePlayActiveRef = useRef<boolean>(freePlayActive);
  const heroTypeRef = useRef<string>(heroType);

  const isGamePaused = gameMode === 'battles2'
    ? (isMultiplayerConnected ? (myPauseVote && opponentPauseVote) : myPauseVote)
    : myPauseVote;

  const isGamePausedRef = useRef<boolean>(isGamePaused);
  useEffect(() => { isGamePausedRef.current = isGamePaused; }, [isGamePaused]);

  // Synchronise speed voting changes to speed multiplier
  useEffect(() => {
    if (gameMode === 'battles2') {
      if (isMultiplayerConnected) {
        if (mySpeedVote === opponentSpeedVote) {
          setSpeedMultiplier(mySpeedVote);
        } else {
          setSpeedMultiplier(1);
        }
      } else {
        setSpeedMultiplier(mySpeedVote);
      }
    }
  }, [mySpeedVote, opponentSpeedVote, gameMode, isMultiplayerConnected]);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { selectedShopTowerRef.current = selectedShopTower; }, [selectedShopTower]);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
  useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);
  useEffect(() => { isGameOverOrFinishedRef.current = isGameOverOrFinished; }, [isGameOverOrFinished]);
  useEffect(() => { showVictoryModalRef.current = showVictoryModal; }, [showVictoryModal]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { freePlayActiveRef.current = freePlayActive; }, [freePlayActive]);
  useEffect(() => { heroTypeRef.current = heroType; }, [heroType]);

  useEffect(() => { battlesEcoRef.current = battlesEco; }, [battlesEco]);
  useEffect(() => { battlesOpponentEcoRef.current = battlesOpponentEco; }, [battlesOpponentEco]);
  useEffect(() => { battlesOpponentCashRef.current = battlesOpponentCash; }, [battlesOpponentCash]);
  useEffect(() => { battlesOpponentLivesRef.current = battlesOpponentLives; }, [battlesOpponentLives]);
  useEffect(() => { cashRef.current = cash; }, [cash]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  // Handle resizing accurately
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Get active tower cost with discount applied
  const getTowerCost = (type: TowerType): number => {
    if (type === 'hero') return heroConfig.baseCost;
    const base = TOWER_STATS[type].cost;
    const actualDiscountPercent = difficulty === 'CHIMPS' ? 0 : discountPercent;
    const discounted = base * (1 - actualDiscountPercent / 100);
    // Easy: 15% off, Medium: 1.0, Hard/CHIMPS: 1.2x
    let factor = 1.0;
    if (difficulty === 'Easy') factor = 0.75;
    if (difficulty === 'Hard' || difficulty === 'CHIMPS') factor = 1.2;
    return Math.round(discounted * factor);
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    window.addEventListener('resize', handleResize);
    // Trigger initially
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- BATTLES 2 MP HELPERS ---
  const resetBattlesMatch = () => {
    towersRef.current = [];
    bloonsRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    spawnQueueRef.current = [];
    spawnTimerRef.current = 0;
    roundInProgressRef.current = false;

    battlesOpponentTowersRef.current = [];
    battlesOpponentBloonsRef.current = [];
    battlesOpponentProjectilesRef.current = [];
    battlesOpponentParticlesRef.current = [];
    battlesOpponentFloatingTextsRef.current = [];
    battlesOpponentSpawnQueueRef.current = [];
    battlesOpponentSpawnTimerRef.current = 0;

    cashRef.current = 650;
    livesRef.current = 150;
    battlesEcoRef.current = 250;
    battlesOpponentCashRef.current = 650;
    battlesOpponentLivesRef.current = 150;
    battlesOpponentEcoRef.current = 250;

    setRound(1);
    roundRef.current = 1;
    setRoundInProgress(false);
    setCash(650);
    setLives(150);
    setBattlesEco(250);

    setBattlesOpponentCash(650);
    setBattlesOpponentLives(150);
    setBattlesOpponentEco(250);
    setTriggerPopCountUpdate((prev) => prev + 1);
    setMySpeedVote(1);
    setOpponentSpeedVote(1);
    setMyPauseVote(false);
    setOpponentPauseVote(false);
    setSpeedMultiplier(1);
  };

  const startBattlesHost = () => {
    console.log("startBattlesHost clicked!");
    if (mpEngine === 'firebase') {
      startBattlesFirebaseHost();
      return;
    }
    try {
      const pin = Math.floor(100000 + Math.random() * 900005).toString(); // 6 digit PIN
      setBattlesPeerId(pin);
      setMpRole('host');
      
      const wsUrl = getMpServerUrl();
      
      setMpStatus(`Connecting to multiplayer server via ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      peerRef.current = ws; // Store the WebSocket object in peerRef

      ws.onopen = () => {
        console.log('WS Connection opened as host');
        setMpStatus('Registering Room on server...');
        ws.send(JSON.stringify({ type: 'host', room: pin }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'host-success') {
            setBattlesPeerId(pin);
            setMpStatus('Waiting for your opponent to join...');
            console.log('WebSocket Host setup complete, PIN:', pin);
          } else if (message.type === 'companion-connected') {
            resetBattlesMatch();
            setIsMultiplayerConnected(true);
            setMpStatus('Opponent connected! Fight!');
          } else if (message.type === 'companion-disconnected') {
            setIsMultiplayerConnected(false);
            setMpStatus('Opponent disconnected. Match paused.');
          } else {
            handleIncomingMpData(message);
          }
        } catch (err) {
          console.error('Error handling host WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Host Error:', err);
        setMpStatus('Connection failed. Please check connection and try again.');
      };

      ws.onclose = () => {
        setIsMultiplayerConnected(false);
        setMpStatus('Connection closed.');
      };

      connRef.current = {
        send: (data: any) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
          }
        },
        close: () => {
          ws.close();
        }
      };

    } catch (e: any) {
      console.error(e);
      setMpStatus(`Error creating connection: ${e?.message || e}`);
    }
  };

  const joinBattlesRoom = (code: string) => {
    console.log("joinBattlesRoom clicked with PIN:", code);
    if (mpEngine === 'firebase') {
      joinBattlesFirebaseRoom(code);
      return;
    }
    try {
      const pin = code.trim();
      if (!pin) {
        setMpStatus('Please enter a valid PIN.');
        return;
      }
      setMpRole('client');
      setMpStatus('Connecting to multiplayer server...');

      const wsUrl = getMpServerUrl();

      setMpStatus(`Joining Room ${pin} via ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      peerRef.current = ws; // Store the WebSocket object in peerRef

      ws.onopen = () => {
        console.log('WS Connection opened as client');
        setMpStatus(`Joining Room ${pin}...`);
        ws.send(JSON.stringify({ type: 'join', room: pin }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'join-success') {
            setBattlesPeerId(pin);
            setMpStatus('Successfully joined! Waiting for host to load game...');
            console.log('WebSocket Client successfully joined room:', pin);
          } else if (message.type === 'companion-connected') {
            resetBattlesMatch();
            setIsMultiplayerConnected(true);
            setMpStatus('Opponent connected! Fight!');
          } else if (message.type === 'companion-disconnected') {
            setIsMultiplayerConnected(false);
            setMpStatus('Opponent disconnected. Match paused.');
          } else {
            handleIncomingMpData(message);
          }
        } catch (err) {
          console.error('Error handling guest WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Guest Error:', err);
        setMpStatus('Connection failed. Please check connection and try again.');
      };

      ws.onclose = () => {
        setIsMultiplayerConnected(false);
        setMpStatus('Connection closed.');
      };

      connRef.current = {
        send: (data: any) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
          }
        },
        close: () => {
          ws.close();
        }
      };

    } catch (e) {
      console.error(e);
      setMpStatus('Error joining room.');
    }
  };

  const handleIncomingMpData = (data: any) => {
    if (!data) return;
    console.log('MP Data received:', data);

    if (data.type === 'place') {
      battlesOpponentTowersRef.current.push(data.tower);
    } else if (data.type === 'upgrade') {
      const t = battlesOpponentTowersRef.current.find((x) => x.id === data.towerId);
      if (t) {
        t.upgradeLevels = data.upgradeLevels;
        t.damage = data.damage;
        t.range = data.range;
        t.baseCooldown = data.baseCooldown;
      }
    } else if (data.type === 'sell') {
      battlesOpponentTowersRef.current = battlesOpponentTowersRef.current.filter((x) => x.id !== data.towerId);
    } else if (data.type === 'send-bloon') {
      // Spawn sent bloon at our spawning queue
      spawnQueueRef.current.push({ delay: 5, type: data.bloonType });
    } else if (data.type === 'start-round') {
      console.log('Client received synchronized start-round from host:', data.round);
      setRound(data.round);
      roundRef.current = data.round;

      // Clear in-flight projectiles and setup clean arrays
      projectilesRef.current = [];
      battlesOpponentProjectilesRef.current = [];

      const seq = generateWave(data.round);
      spawnQueueRef.current = [...seq];
      spawnTimerRef.current = 0;

      battlesOpponentSpawnQueueRef.current = [...seq];
      battlesOpponentSpawnTimerRef.current = 0;

      roundInProgressRef.current = true;
      setRoundInProgress(true);
    } else if (data.type === 'state') {
      setBattlesOpponentLives(data.lives);
      setBattlesOpponentCash(data.cash);
      setBattlesOpponentEco(data.eco);
      battlesOpponentEcoRef.current = data.eco;
      battlesOpponentCashRef.current = data.cash;
      battlesOpponentLivesRef.current = data.lives;
    } else if (data.type === 'speed-vote') {
      setOpponentSpeedVote(data.speed);
    } else if (data.type === 'pause-vote') {
      setOpponentPauseVote(data.paused);
    } else if (data.type === 'activate-ability') {
      const t = battlesOpponentTowersRef.current.find((x) => x.id === data.towerId);
      if (t) {
        t.abilityCooldown = data.cooldown;
        t.abilityActiveTimer = data.activeTimer;
        // Float opponent text indicator
        battlesOpponentFloatingTextsRef.current.push({
          id: `opp_ab_${Date.now()}_${Math.random()}`,
          x: t.x,
          y: t.y - 15,
          text: `📣 OPP ABILITY ACTIVE`,
          color: '#fbbf24',
          life: 50
        });
      }
    }
  };

  const findActiveTargetForTower = (t: Tower): Bloon | undefined => {
    // Find first bloon in range of tower
    const inRange = bloonsRef.current.filter((b) => {
      const dx = b.x - t.x;
      const dy = b.y - t.y;
      return dx * dx + dy * dy < t.range * t.range;
    });
    return inRange[0];
  };

  const activateTowerAbility = (towerType: TowerType) => {
    // Find our capable tower of this type with Middle path upgraded to Level 3 or more, and not on cooldown
    const capable = towersRef.current.find(
      (t) =>
        t.type === towerType &&
        t.upgradeLevels &&
        t.upgradeLevels[1] >= 3 &&
        (!t.abilityCooldown || t.abilityCooldown <= 0)
    );

    if (!capable) return;

    playLevelUp();

    // Set timers based on standard configs
    if (towerType === 'village') {
      capable.abilityCooldown = 1800; // 30 seconds at 60fps
      capable.abilityActiveTimer = 600; // 10 seconds
      floatingTextsRef.current.push({
        id: `ab_ctb_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '📣 CALL TO ARMS ACTIVE!',
        color: '#a3e635',
        life: 60
      });
    } else if (towerType === 'tack') {
      capable.abilityCooldown = 900; // 15 seconds
      capable.abilityActiveTimer = 0; // Instant burst

      // Radial Tack Storm of 100 fast-flying needle projectiles!
      for (let angleDeg = 0; angleDeg < 360; angleDeg += 3.6) {
        const rads = (angleDeg * Math.PI) / 180;
        projectilesRef.current.push({
          id: `tack_storm_${capable.id}_${Date.now()}_${angleDeg}`,
          type: 'tack',
          x: capable.x,
          y: capable.y,
          vx: Math.cos(rads) * 9,
          vy: Math.sin(rads) * 9,
          speed: 9,
          damage: 3,
          pierce: 3,
          rangeRemaining: 260,
          originTowerId: capable.id,
          upgradeLevels: [0, 3, 0]
        });
      }

      floatingTextsRef.current.push({
        id: `ab_tack_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '🌪️ TACK STORM ACTIVATED!',
        color: '#fb7185',
        life: 55
      });
    } else if (towerType === 'sniper') {
      capable.abilityCooldown = 1200; // 20 seconds
      capable.abilityActiveTimer = 0; // Instant drop

      setCash((c) => c + 1200);

      // Cute falling crate particles
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          id: `bx_part_${Date.now()}_${i}`,
          x: 480 + (Math.random() * 40 - 20),
          y: 350 + (Math.random() * 40 - 20),
          vx: Math.random() * 3 - 1.5,
          vy: Math.random() * 1 + 1,
          color: '#a16250',
          size: 4,
          life: 30,
          maxLife: 30,
          type: 'smoke'
        });
      }

      floatingTextsRef.current.push({
        id: `ab_snip_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '📦 SUPPLY DROP +$1200 airlift!',
        color: '#22c55e',
        life: 65
      });
    } else if (towerType === 'bomb') {
      capable.abilityCooldown = 720; // 12 seconds
      capable.abilityActiveTimer = 0; // Instant rocket launch

      let target = bloonsRef.current.find((b) => b.isMoab);
      if (!target && bloonsRef.current.length > 0) {
        target = [...bloonsRef.current].sort((a, b) => b.hp - a.hp)[0];
      }

      if (target) {
        const rads = Math.atan2(target.y - capable.y, target.x - capable.x);
        projectilesRef.current.push({
          id: `moab_assassin_${capable.id}_${Date.now()}`,
          type: 'rocket',
          x: capable.x,
          y: capable.y,
          vx: Math.cos(rads) * 16,
          vy: Math.sin(rads) * 16,
          speed: 16,
          damage: 1800,
          pierce: 1,
          splashRadius: 100,
          rangeRemaining: 1500,
          originTowerId: capable.id,
          targetBloonId: target.id,
          upgradeLevels: [0, 3, 0]
        });

        floatingTextsRef.current.push({
          id: `ab_bomb_${Date.now()}`,
          x: capable.x,
          y: capable.y - 18,
          text: '🚀 MOAB ASSASSIN EXECUTED!',
          color: '#f43f5e',
          life: 60
        });
      }
    } else if (towerType === 'ice') {
      capable.abilityCooldown = 1080; // 18 seconds
      capable.abilityActiveTimer = 0; // Instant absolute freeze override

      bloonsRef.current.forEach((b) => {
        b.hp -= 12;
        b.isFrozen = true;
        b.freezeTimer = Math.max(b.freezeTimer || 0, 240); // 4 seconds freeze

        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            id: `sn_${b.id}_${Date.now()}_${i}`,
            x: b.x,
            y: b.y,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            color: '#93c5fd',
            size: 3.5,
            life: 20,
            maxLife: 20,
            type: 'ice'
          });
        }
      });

      floatingTextsRef.current.push({
        id: `ab_ice_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '❄️ SNOW BLIZZARD FREEZE!',
        color: '#67e8f9',
        life: 60
      });
    } else if (towerType === 'wizard') {
      capable.abilityCooldown = 1800; // 30 seconds
      capable.abilityActiveTimer = 720; // 12 seconds

      floatingTextsRef.current.push({
        id: `ab_wiz_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '🔥 PHOENIX HELPER SUMMONED!',
        color: '#f97316',
        life: 60
      });
    } else if (towerType === 'ninja') {
      capable.abilityCooldown = 1500; // 25 seconds
      capable.abilityActiveTimer = 600; // 10 seconds

      floatingTextsRef.current.push({
        id: `ab_nin_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '🐉 BLOON SABOTAGE ACTIVATED!',
        color: '#a855f7',
        life: 60
      });
    } else if (towerType === 'alchemist') {
      capable.abilityCooldown = 1440; // 24 seconds
      capable.abilityActiveTimer = 480; // 8 seconds

      floatingTextsRef.current.push({
        id: `ab_alc_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '🧪 CHYMIC MUTATION MUTATED!',
        color: '#22c55e',
        life: 60
      });
    } else if (towerType === 'super') {
      capable.abilityCooldown = 1800; // 30 seconds
      capable.abilityActiveTimer = 360; // 6 seconds

      floatingTextsRef.current.push({
        id: `ab_sup_${Date.now()}`,
        x: capable.x,
        y: capable.y - 18,
        text: '⚡ ROBO-PLASMA STORM ACTIVE!',
        color: '#eab308',
        life: 60
      });
    }

    // Multiplayer Active Ability Dispatcher syncs
    if (isMultiplayerConnected && connRef.current) {
      connRef.current.send({
        type: 'activate-ability',
        towerId: capable.id,
        cooldown: capable.abilityCooldown,
        activeTimer: capable.abilityActiveTimer
      });
    }

    // Direct re-render trigger
    setTriggerPopCountUpdate((prev) => prev + 1);
  };

  const renderTacticalAbilitiesDeck = () => {
    const ABILITY_CONFIGS = [
      { type: 'village', name: 'Call to Arms', icon: '📣', color: 'from-lime-500 to-emerald-600', desc: 'Screams motivational words, reducing shot reload cooldowns of all towers by 2x for 10s!' },
      { type: 'tack', name: 'Tack Storm', icon: '🌪️', color: 'from-rose-500 to-pink-600', desc: 'Blasts a massive radial nova of 100 fast-flying tacks in all directions!' },
      { type: 'sniper', name: 'Supply Drop', icon: '📦', color: 'from-emerald-500 to-green-650', desc: 'Calls an airlift cargo drop, instantly adding +$1200 cash!' },
      { type: 'bomb', name: 'MOAB Assassin', icon: '🚀', color: 'from-orange-500 to-red-650', desc: 'Fires a high-speed targeted rocket dealing 1800 massive damage to the strongest bloon!' },
      { type: 'ice', name: 'Blizzard Freeze', icon: '❄️', color: 'from-cyan-400 to-blue-600', desc: 'Instantly flash-freezes and Cryo-shocks all bloons on-screen for 4 seconds!' },
      { type: 'wizard', name: 'Summon Phoenix', icon: '🔥', color: 'from-amber-400 to-orange-600', desc: 'Summons a majestic burning helper phoenix firing plasma fireballs for 12s!' },
      { type: 'ninja', name: 'Sabotage', icon: '🐉', color: 'from-purple-500 to-indigo-600', desc: 'Active Sabotage slashes the speed of all existing and oncoming bloons by 50% for 10s!' },
      { type: 'alchemist', name: 'Transform Tonic', icon: '🧪', color: 'from-green-500 to-teal-600', desc: 'Mutates alchemist into a high-powered beast shooting gold lasers with 4x damage for 8s!' },
      { type: 'super', name: 'Plasma Storm', icon: '⚡', color: 'from-yellow-400 to-amber-600', desc: 'Unleashes high-density radial robo-beams in 8 directions continuously for 6s!' }
    ] as const;

    return (
      <div className="w-full max-w-2xl bg-slate-950/90 border-2 border-slate-900 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-400">
            <span className="animate-pulse">⚡</span>
            <span>Tactical Activated Abilities Area</span>
          </div>
          <span className="text-[8px] text-white/40 font-bold uppercase">Middle Path (Speed/Abils) Tier 3+ unlocks abilities!</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
          {ABILITY_CONFIGS.map((config) => {
            // Check status on board
            const hasAny = towersRef.current.some((t) => t.type === config.type);
            const activeTowers = towersRef.current.filter(
              (t) => t.type === config.type && t.upgradeLevels && t.upgradeLevels[1] >= 3
            );
            const hasUpgraded = activeTowers.length > 0;

            // Find first ready or lowest cooldown tower
            const readyTower = activeTowers.find((t) => !t.abilityCooldown || t.abilityCooldown <= 0);
            const activeChargingTower = activeTowers.find((t) => t.abilityActiveTimer && t.abilityActiveTimer > 0);
            
            const isReady = hasUpgraded && !!readyTower;
            const isActive = hasUpgraded && !!activeChargingTower;
            
            // Cooldown math
            const maxCooldown = activeTowers.length > 0 ? activeTowers.map((t) => t.abilityCooldown || 0).sort((a,b) => a - b)[0] : 0;
            const secondsLeft = Math.ceil(maxCooldown / 60);

            // Active remaining duration math
            const activeDurationLeft = activeChargingTower?.abilityActiveTimer || 0;
            const activeSecondsLeft = Math.ceil(activeDurationLeft / 60);

            return (
              <div key={config.type} className="relative group flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => activateTowerAbility(config.type)}
                  className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all select-none ${
                    isReady
                      ? `bg-gradient-to-br ${config.color} border-white/20 shadow-lg hover:scale-105 active:scale-95 cursor-pointer`
                      : isActive
                      ? 'bg-slate-900 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)] animate-pulse'
                      : hasAny
                      ? 'bg-slate-900/60 border-indigo-500/20 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-900 opacity-30 cursor-not-allowed'
                  }`}
                >
                  {/* Cooldown Layer Overlay */}
                  {hasUpgraded && maxCooldown > 0 && !isActive && (
                    <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center font-mono text-[10px] font-black text-rose-405">
                      <span>{secondsLeft}s</span>
                    </div>
                  )}

                  {/* Active Timer Overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-yellow-500/10 flex flex-col items-center justify-center font-mono text-[9px] font-black text-yellow-300">
                      <span className="text-[8px] uppercase tracking-wider text-yellow-400">ACTIVE</span>
                      <span>{activeSecondsLeft}s</span>
                    </div>
                  )}

                  <span className="text-xl filter drop-shadow-md">{config.icon}</span>

                  {/* Status Indicator Pill */}
                  {!hasAny && (
                    <span className="absolute top-0.5 right-0.5 text-[6px] bg-slate-905 text-white/40 px-0.5 rounded uppercase font-black font-sans">
                      None
                    </span>
                  )}
                  {hasAny && !hasUpgraded && (
                    <span className="absolute top-0.5 right-0.5 text-[6px] bg-amber-500/10 text-amber-400 px-0.5 rounded uppercase font-black font-sans border border-amber-500/20">
                      Lock
                    </span>
                  )}
                  {isReady && (
                    <span className="absolute bottom-0.5 text-[6.5px] bg-black/60 text-green-300 px-1 rounded uppercase tracking-widest font-black font-sans border border-green-505/10">
                      READY
                    </span>
                  )}
                </button>

                <span className="text-[7.5px] text-white/50 font-black mt-1 uppercase text-center truncate w-full tracking-tighter">
                  {config.name}
                </span>

                {/* Micro hover tooltip system */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col w-52 p-2 bg-slate-950 border border-slate-805 text-white text-[8.5px] rounded-lg shadow-2xl z-50 pointer-events-none gap-1 font-sans">
                  <div className="flex items-center gap-1 font-black text-[9px] text-yellow-400 uppercase border-b border-white/5 pb-0.5">
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed font-bold">{config.desc}</p>
                  <div className="mt-1 border-t border-white/5 pt-1 text-[7.5px] font-black flex flex-col gap-0.5 uppercase">
                    {!hasAny && (
                      <span className="text-rose-450">❌ Build a {config.type} Monkey to unlock!</span>
                    )}
                    {hasAny && !hasUpgraded && (
                      <span className="text-amber-400 flex flex-col">
                        <span>⚠️ UPGRADE REQUIRED:</span>
                        <span className="text-white/60">Middle Path (Speed/Abils) needs Tier 3!</span>
                      </span>
                    )}
                    {isReady && (
                      <span className="text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                        <span>Click to activate! Ready.</span>
                      </span>
                    )}
                    {isActive && (
                      <span className="text-yellow-400">⚡ Channeling right now!</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sendBloonToOpponent = (bloonType: string) => {
    if (isGamePausedRef.current) return;
    const config = SENDABLE_BLOONS.find((b) => b.type === bloonType);
    if (!config) return;

    if (roundRef.current < config.unlockRound) return;

    const ecoCost = config.cost;
    const ecoAdd = config.eco;

    if (!isMultiplayerConnected) return;

    if (cashRef.current >= ecoCost) {
      setCash((c) => {
        if (c < ecoCost) return c; // Double check buffer
        return c - ecoCost;
      });
      setBattlesEco((e) => e + ecoAdd);

      if (connRef.current) {
        connRef.current.send({
          type: 'send-bloon',
          bloonType: bloonType
        });
        // Queue the sent bloon locally for our simulated opponent board display so we can visualize it!
        battlesOpponentSpawnQueueRef.current.push({ delay: 5, type: bloonType });
      }
    }
  };

  useEffect(() => {
    if (gameMode !== 'battles2' || !isMultiplayerConnected) return;

    const interval = setInterval(() => {
      if (autoSendBloonRef.current && !isGameOverOrFinishedRef.current) {
        sendBloonToOpponent(autoSendBloonRef.current);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [gameMode, isMultiplayerConnected]);

  // Sync volume controller
  const handleToggleMute = () => {
    const state = toggleMute();
    setIsAudioMuted(state);
  };

  // Check Placement legality (distance from track logic)
  const checkPlacementValidity = (x: number, y: number): boolean => {
    // 1. Boundaries check (out of normalized map space)
    if (x < 35 || x > 965 || y < 35 || y > 965) return false;

    // 2. Track Collision Check
    for (let i = 0; i < selectedMap.track.length - 1; i++) {
      const ax = selectedMap.track[i].x;
      const ay = selectedMap.track[i].y;
      const bx = selectedMap.track[i + 1].x;
      const by = selectedMap.track[i + 1].y;

      const trackDist = getDistanceToSegment(x, y, ax, ay, bx, by);
      // Track width margin check is track width + padding clearance
      const padding = (selectedShopTower === 'sub' || selectedShopTower === 'buccaneer') ? 12 : 18;
      if (trackDist < selectedMap.trackWidth + padding) {
        return false;
      }
    }

    // 3. Water Monkey Placement restrictions
    if (selectedShopTower === 'sub' || selectedShopTower === 'buccaneer') {
      // Must be placed INSIDE a water area (water decoration or water pool tower)
      let insideWater = false;

      // Check natural water decorations
      for (const dec of selectedMap.decorations) {
        if (dec.type === 'water') {
          const dist = Math.hypot(dec.x - x, dec.y - y);
          if (dist < dec.size - 5) {
            insideWater = true;
            break;
          }
        }
      }

      // Check placed water pools
      if (!insideWater) {
        for (const t of towersRef.current) {
          if (t.type === 'pool') {
            const dist = Math.hypot(t.x - x, t.y - y);
            if (dist < 42) {
              insideWater = true;
              break;
            }
          }
        }
      }

      if (!insideWater) {
        return false; // Water monkeys can only go in water!
      }

      // Overlap checks for water monkey: must not collide with other monkeys (excluding the pool itself)
      for (const t of towersRef.current) {
        if (t.type === 'pool') continue; // of course it overlaps with its pool
        const dist = Math.hypot(t.x - x, t.y - y);
        if (dist < 26) {
          return false;
        }
      }
    } else {
      // Land tower or pool itself placement rules
      // 1. Overlap with existing towers
      for (const t of towersRef.current) {
        const dist = Math.hypot(t.x - x, t.y - y);
        // If placing a pool, don't overlap too close to other towers
        const minOverlap = selectedShopTower === 'pool' ? 45 : 35;
        if (dist < minOverlap) {
          return false;
        }
      }

      // 2. Decoration blockages
      for (const dec of selectedMap.decorations) {
        if (dec.type === 'lava' || dec.type === 'water') {
          const dist = Math.hypot(dec.x - x, dec.y - y);
          if (dist < dec.size + 15) {
            return false;
          }
        }
      }

      // 3. For land towers, cannot be placed on top of placed pools
      if (selectedShopTower !== 'pool') {
        for (const t of towersRef.current) {
          if (t.type === 'pool') {
            const dist = Math.hypot(t.x - x, t.y - y);
            if (dist < 45) {
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  const restartMatch = () => {
    setRound(1);
    roundInProgressRef.current = false;
    setRoundInProgress(false);
    setAutoPlay(false);
    setTotalPopCount(0);
    setIsGameOverOrFinished(false);
    setShowVictoryModal(false);
    setFreePlayActive(false);

    let baseCash = 650;
    if (difficulty === 'Easy') baseCash = 850;
    if (difficulty === 'Medium') baseCash = 650;
    if (difficulty === 'Hard') baseCash = 650;
    if (difficulty === 'CHIMPS') baseCash = 650;
    const actualStartingCashBonus = difficulty === 'CHIMPS' ? 0 : startingCashBonus;
    setCash(baseCash + actualStartingCashBonus);

    let baseLives = 150;
    if (difficulty === 'Easy') baseLives = 200;
    if (difficulty === 'Medium') baseLives = 150;
    if (difficulty === 'Hard') baseLives = 100;
    if (difficulty === 'CHIMPS') baseLives = 1;
    const actualExtraLivesBonus = difficulty === 'CHIMPS' ? 0 : extraLivesBonus;
    setLives(baseLives + actualExtraLivesBonus);

    towersRef.current = [];
    bloonsRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    spawnQueueRef.current = [];
    spawnTimerRef.current = 0;

    setSelectedShopTower(null);
    setSelectedPlacedTowerId(null);
    setTriggerPopCountUpdate((prev) => prev + 1);
    setShowGameSettingsModal(false);
  };

  // Trigger Spawning round mechanism
  const startRound = () => {
    if (roundInProgressRef.current) return;
    resumeAudio();

    // Compile spawn sequences procedurally mimicking real rounds
    const seq = generateWave(round);
    spawnQueueRef.current = [...seq];
    spawnTimerRef.current = 0;

    if (gameModeRef.current === 'battles2') {
      battlesOpponentSpawnQueueRef.current = [...seq];
      battlesOpponentSpawnTimerRef.current = 0;
    }

    roundInProgressRef.current = true;
    setRoundInProgress(true);

    if (gameModeRef.current === 'battles2' && mpRole === 'host' && isMultiplayerConnected && connRef.current) {
      connRef.current.send({
        type: 'start-round',
        round: roundRef.current
      });
    }
  };

  // Place a Monkey
  const handlePlacementClick = () => {
    if (isGamePausedRef.current) return;
    if (!selectedShopTower) return;
    if (!checkPlacementValidity(mousePos.x, mousePos.y)) return;

    const actualCost = getTowerCost(selectedShopTower);
    if (cash < actualCost) return;

    // If attempting hero placement, verify limit 1 hero per arena
    if (selectedShopTower === 'hero') {
      const alreadyHasHero = towersRef.current.some((t) => t.type === 'hero');
      if (alreadyHasHero) {
        alert('You can only deploy exactly one command Hero per match!');
        setSelectedShopTower(null);
        return;
      }
    }

    // Place tower
    const newTower: Tower = {
      id: `${selectedShopTower}_${Date.now()}`,
      type: selectedShopTower,
      x: mousePos.x,
      y: mousePos.y,
      range: selectedShopTower === 'hero' ? 140 : TOWER_STATS[selectedShopTower].baseRange,
      baseCooldown: selectedShopTower === 'hero' ? 45 : TOWER_STATS[selectedShopTower].baseCooldown,
      cooldown: 0,
      damage: selectedShopTower === 'hero' ? 1 : TOWER_STATS[selectedShopTower].baseDamage,
      pierce: selectedShopTower === 'hero' ? 2 : TOWER_STATS[selectedShopTower].basePierce,
      cost: actualCost,
      popCount: 0,
      targetMode: 'First',
      level: 1,
      upgradeLevels: [0, 0, 0],
      upgradeIndex: 0,
      upgradesPurchased: 0,
    };

    towersRef.current.push(newTower);
    setCash((prev) => prev - actualCost);
    setSelectedShopTower(null);
    playShoot(); // nice responsive validation sound!

    // Immediately select placed tower
    setSelectedPlacedTowerId(newTower.id);

    if (isMultiplayerConnected && connRef.current) {
      connRef.current.send({
        type: 'place',
        tower: newTower
      });
    }

    // Achievements evaluation: check super monkey placed
    if (newTower.type === 'super') {
      assessAchievementProgress('buy_super', 1);
    }
  };

  // Canvas Mouse trackers
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const computedX = ((e.clientX - rect.left) / rect.width) * 1000;
    const computedY = ((e.clientY - rect.top) / rect.height) * 1000;

    setMousePos({ x: Math.round(computedX), y: Math.round(computedY) });
  };

  const handleCanvasMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    if (gameModeRef.current === 'battles2' && !isMultiplayerConnected) {
      console.log('Interaction blocked: Waiting for opponent...');
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 1000;
    const cy = ((e.clientY - rect.top) / rect.height) * 1000;

    // Check if clicking on any already placed tower to inspect/upgrade first
    let clickedTowerId: string | null = null;
    for (const t of towersRef.current) {
      const dist = Math.hypot(t.x - cx, t.y - cy);
      if (dist < 32) {
        clickedTowerId = t.id;
        break;
      }
    }

    if (clickedTowerId) {
      // User clicked an existing tower on the grid: open the upgrade/inspect panel and cancel shop placement mode
      setSelectedPlacedTowerId(clickedTowerId);
      setSelectedShopTower(null);
    } else {
      // Clicked empty space
      if (selectedShopTower) {
        // Placement mode active, attempt to place/buy
        handlePlacementClick();
      } else {
        // Otherwise, deselect the currently inspected tower
        setSelectedPlacedTowerId(null);
      }
    }
  };

  // Achievements progression handler
  const assessAchievementProgress = (achId: string, increment: number) => {
    // Read from local storage
    try {
      const saved = localStorage.getItem('btd_achievements');
      if (saved) {
        const achs = JSON.parse(saved);
        const item = achs.find((a: any) => a.id === achId);
        if (item && !item.isUnlocked) {
          item.progress = Math.min(item.maxProgress, item.progress + increment);
          localStorage.setItem('btd_achievements', JSON.stringify(achs));
        }
      }
    } catch (e) {}
  };

  // Leveling up Heroes / Monkey upgrades triggered inside UI
  const upgradeTower = (tower: Tower, pathIndex?: number) => {
    if (isGamePausedRef.current) return;
    if (tower.type === 'hero') {
      // Manual hero training leveling costs cash, boosts range and attack speeds
      const lvCost = Math.round(250 * tower.level * 1.2);
      if (cash < lvCost) return;

      setCash((prev) => prev - lvCost);
      tower.level += 1;
      tower.range += 12;
      tower.baseCooldown = Math.max(15, tower.baseCooldown * 0.92);
      tower.popCount += 0; // Trigger redraw

      // Dynamic perk descriptions matching perks definition
      playLevelUp();
      setTriggerPopCountUpdate((t) => t + 1);

      if (isMultiplayerConnected && connRef.current) {
        connRef.current.send({
          type: 'upgrade',
          towerId: tower.id,
          upgradeLevels: [tower.level, 0, 0],
          damage: tower.damage,
          range: tower.range,
          baseCooldown: tower.baseCooldown
        });
      }
      return;
    }

    if (pathIndex === undefined) return;

    // Standard monkey upgrades
    const spec = TOWER_STATS[tower.type];
    const lvls = tower.upgradeLevels || [0, 0, 0];
    const currentLvl = lvls[pathIndex];
    if (currentLvl >= 5) return; // already maxed this path

    // Check rules
    // Rule 1: max 2 paths can be non-zero
    const activePaths = lvls.filter((l) => l > 0).length;
    if (currentLvl === 0 && activePaths >= 2) {
      return; // third path locked
    }
    // Rule 2: only 1 path can go above level 2 (reach 3, 4, 5)
    if (currentLvl === 2) {
      const hasOtherPathAbove2 = lvls.some((l, idx) => idx !== pathIndex && l >= 3);
      if (hasOtherPathAbove2) {
        return; // capped at 2 because another path is primary
      }
    }

    const upg = spec.upgrades[pathIndex][currentLvl];
    if (!upg) return;

    const finalUpgradeCost = getUpgradeCost(upg.cost);
    if (cash < finalUpgradeCost) return;

    setCash((prev) => prev - finalUpgradeCost);
    
    // Update levels
    const nextLevels = [...lvls] as [number, number, number];
    nextLevels[pathIndex] += 1;
    tower.upgradeLevels = nextLevels;
    
    // Compute total upgrades purchased
    tower.upgradesPurchased = nextLevels[0] + nextLevels[1] + nextLevels[2];
    tower.cost += finalUpgradeCost; // Add to cost of the tower for sells

    // Apply upgrade effects
    if (upg.effects.range) tower.range += upg.effects.range;
    if (upg.effects.cooldownMult) tower.baseCooldown *= upg.effects.cooldownMult;
    if (upg.effects.damage) tower.damage += upg.effects.damage;
    if (upg.effects.pierce) tower.pierce += upg.effects.pierce;

    playLevelUp();
    setTriggerPopCountUpdate((t) => t + 1);

    if (isMultiplayerConnected && connRef.current) {
      connRef.current.send({
        type: 'upgrade',
        towerId: tower.id,
        upgradeLevels: tower.upgradeLevels,
        damage: tower.damage,
        range: tower.range,
        baseCooldown: tower.baseCooldown
      });
    }
  };

  // Sell visual Tower
  const sellTower = (tower: Tower) => {
    if (isGamePausedRef.current) return;
    if (difficulty === 'CHIMPS') return;
    const refundValue = Math.round(tower.cost * 0.72);
    setCash((prev) => prev + refundValue);
    towersRef.current = towersRef.current.filter((t) => t.id !== tower.id);
    setSelectedPlacedTowerId(null);
    playPop();

    if (isMultiplayerConnected && connRef.current) {
      connRef.current.send({
        type: 'sell',
        towerId: tower.id
      });
    }
  };

  // Main Loop Handler using Canvas ticks
  useEffect(() => {
    let animationFrameId: number;
    let framesCounter = 0;
    let lastTickTime = Date.now();

    const gameTick = () => {
      lastTickTime = Date.now();
      const canvas = canvasRef.current;
      if (!canvas || isGameOverOrFinishedRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure clear draw cycles
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Fast forward speed loops are computed by repeating update loops inside each single frames loop!
      // This increases performance without lag!
      // If paused, update loops become 0, so movement/firing/spawning is completely frozen!
      const loopsRatio = isGamePausedRef.current ? 0 : speedMultiplierRef.current;

      for (let step = 0; step < loopsRatio; step++) {
        // --- SECTION A: SPAWNING BLOCKS ---
        if (roundInProgressRef.current) {
          if (spawnQueueRef.current.length > 0) {
            spawnTimerRef.current -= 1;
            if (spawnTimerRef.current <= 0) {
              const item = spawnQueueRef.current.shift();
              if (item) {
                // Instantiating a new Bloon setup on path segment coordinate index zero
                const spec = getBloonStyle(item.type as any);
                const pathStart = selectedMap.track[0];

                let speedMultiplierByDiff = 1.0;
                if (difficulty === 'Easy') speedMultiplierByDiff = 0.85;
                else if (difficulty === 'Hard' || difficulty === 'CHIMPS') speedMultiplierByDiff = 1.15;

                // Fortified double-hp modifier
                const lateScale = getLateGameMultiplier(roundRef.current);
                const initialHp = (item.isFortified ? (item.type === 'Lead' ? spec.hp * 4 : spec.hp * 2) : spec.hp) * lateScale.hp;

                const inst: Bloon = {
                  id: `bloon_${Date.now()}_${Math.random()}`,
                  type: item.type as any,
                  x: pathStart.x,
                  y: pathStart.y,
                  speed: spec.speed * speedMultiplierByDiff * lateScale.speed,
                  hp: initialHp,
                  maxHp: initialHp,
                  size: spec.size,
                  color: spec.color,
                  reward: spec.reward,
                  distanceTraversed: 0,
                  pathSegmentIndex: 0,
                  segmentProgress: 0,
                  isFrozen: false,
                  freezeTimer: 0,
                  isSlowed: false,
                  slowTimer: 0,
                  isCeramic: item.type === 'Ceramic',
                  isMoab: ['MOAB', 'BFB', 'ZOMG', 'DDT', 'BAD'].includes(item.type),
                  isCamo: item.isCamo,
                  isRegrow: item.isRegrow,
                  isFortified: item.isFortified,
                };

                bloonsRef.current.push(inst);
                spawnTimerRef.current = item.delay;
              }
            }
          } else {
            // Check if all bloons are dead to close the round successfully!
            if (bloonsRef.current.length === 0) {
              roundInProgressRef.current = false;
              setRoundInProgress(false);
              
              // Passive income from Banana Farms and Merchant Buccaneers
              let totalFarmCash = 0;
              towersRef.current.forEach((t) => {
                if (t.type === 'farm') {
                  let payout = 100;
                  const lv = t.upgradeLevels || [0, 0, 0];
                  payout += lv[0] * 50; // top path
                  payout += lv[1] * 35; // middle path
                  payout += lv[2] * 25; // bottom path
                  totalFarmCash += payout;
                  t.popCount += payout; // Track cash generated as "pops"
                  
                  floatingTextsRef.current.push({
                    id: `farm_${t.id}_${Date.now()}`,
                    x: t.x,
                    y: t.y - 12,
                    text: `+$${payout}`,
                    color: '#eab308', // Gold
                    life: 45,
                  });
                } else if (t.type === 'buccaneer') {
                  const lv = t.upgradeLevels || [0, 0, 0];
                  if (lv[2] >= 3) {
                    let merchantCash = 120;
                    if (lv[2] === 4) merchantCash = 300;
                    if (lv[2] === 5) merchantCash = 600;
                    totalFarmCash += merchantCash;
                    t.popCount += merchantCash;
                    
                    floatingTextsRef.current.push({
                      id: `merchant_${t.id}_${Date.now()}`,
                      x: t.x,
                      y: t.y - 12,
                      text: `+$${merchantCash} Trade`,
                      color: '#eab308', // Gold
                      life: 45,
                    });
                  }
                }
              });

              if (totalFarmCash > 0) {
                setCash((prev) => prev + totalFarmCash);
              }

              // Level up placed heroes upon wave complete!
              towersRef.current.forEach((t) => {
                if (t.type === 'hero' && t.level < 20) {
                  t.level += 1;
                  t.range += 12;
                  t.baseCooldown = Math.max(15, t.baseCooldown * 0.92);
                  t.heroXp = 0;
                  t.heroMaxXp = Math.round((t.heroMaxXp || 100) * 1.5);
                  if (t.level % 3 === 0) {
                    t.damage += 1;
                  }
                  
                  floatingTextsRef.current.push({
                    id: `hero_lv_${t.id}_${Date.now()}`,
                    x: t.x,
                    y: t.y - 20,
                    text: `Hero Rank Up! LV ${t.level}`,
                    color: '#fbbf24', // Yellow-500
                    life: 55,
                  });
                  playLevelUp();
                }
              });

              // Give bonus Round end Cash!
              const bonus = difficulty === 'CHIMPS' ? 0 : 100 + roundRef.current * 10;
              if (bonus > 0) {
                setCash((prev) => prev + bonus);
              }
              // Float text end round
              floatingTextsRef.current.push({
                id: `ft_end_${Date.now()}`,
                x: 500,
                y: 500,
                text: difficulty === 'CHIMPS' ? `Wave ${roundRef.current} Complete!` : `Round Completed! Bonus +$${bonus}`,
                color: '#10b981', // Clean Emerald Green
                life: 60,
              });

              assessmentRoundCompletes(roundRef.current);

              // Campaign ends at maxRounds; if completed, trigger victory dialog before transitioning to free play
              if (roundRef.current === maxRounds && gameModeRef.current === 'campaign' && !freePlayActiveRef.current) {
                setShowVictoryModal(true);
              } else {
                setRound((r) => r + 1);
              }
            }
          }
        }

        // --- SECTION B: UPDATE ACTIVE BLOONS ---
        for (let bIdx = bloonsRef.current.length - 1; bIdx >= 0; bIdx--) {
          const b = bloonsRef.current[bIdx];

          // Slow/freeze decrementers
          if (b.isFrozen) {
            b.freezeTimer -= 1;
            if (b.freezeTimer <= 0) {
              b.isFrozen = false;
            }
          }

          if (b.isSlowed) {
            b.slowTimer -= 1;
            if (b.slowTimer <= 0) {
              b.isSlowed = false;
            }
          }

          // Regrow Layer Healing Logic
          if (b.isRegrow) {
            b.regrowTimer = (b.regrowTimer || 0) + 1;
            if (b.regrowTimer > 90) { // every 1.5 seconds
              b.regrowTimer = 0;
              const style = getBloonStyle(b.type);
              const maxPossibleHp = b.isFortified ? (b.type === 'Lead' ? style.hp * 4 : style.hp * 2) : style.hp;
              if (b.hp < maxPossibleHp) {
                b.hp += 1;
                particlesRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: 0,
                  vy: -0.6,
                  color: '#22c55e',
                  life: 12,
                  maxLife: 12,
                  size: 2.5,
                  type: 'spark',
                });
              } else {
                // grows back layers (Red -> Blue -> Green -> Yellow -> Pink)
                const nextTier = b.type === 'Red' ? 'Blue' :
                                  b.type === 'Blue' ? 'Green' :
                                  b.type === 'Green' ? 'Yellow' :
                                  b.type === 'Yellow' ? 'Pink' : null;
                if (nextTier) {
                  b.type = nextTier;
                  const nextStyle = getBloonStyle(nextTier);
                  b.color = nextStyle.color;
                  const newMax = b.isFortified ? (((nextTier as string) === 'Lead') ? nextStyle.hp * 4 : nextStyle.hp * 2) : nextStyle.hp;
                  b.hp = newMax;
                  b.maxHp = newMax;
                  b.size = nextStyle.size;
                  b.speed = nextStyle.speed;
                  particlesRef.current.push({
                    x: b.x,
                    y: b.y,
                    vx: 0,
                    vy: -1.0,
                    color: '#22c55e',
                    life: 18,
                    maxLife: 18,
                    size: 4.0,
                    type: 'spark',
                  });
                }
              }
            }
          }

          // Compute Speed mod
          let activeSpeed = b.speed;
          if (b.isFrozen) activeSpeed = 0.0;
          else if (b.isSlowed) activeSpeed *= 0.5;

          // Ninja Sabotage active speed penalty: slashes entire field movement speed by half!
          const isSabotageActive = towersRef.current.some(
            (nt) => nt.type === 'ninja' && nt.abilityActiveTimer && nt.abilityActiveTimer > 0
          );
          if (isSabotageActive) {
            activeSpeed *= 0.5;
          }

          // Hero Obyn Greenfoot nature passive slowing card check (level 5 Obyn perk)
          const obynTower = towersRef.current.find((t) => t.type === 'hero' && t.level >= 5);
          if (obynTower && (b.type === 'Yellow' || b.type === 'Pink')) {
            const dx = b.x - obynTower.x;
            const dy = b.y - obynTower.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < obynTower.range * obynTower.range) {
              activeSpeed *= 0.75; // slow fast guys down
            }
          }

          // Advance Bloon along the segments coordinate index path list
          const nextSegmentIdx = b.pathSegmentIndex + 1;
          if (nextSegmentIdx < selectedMap.track.length) {
            const startPt = selectedMap.track[b.pathSegmentIndex];
            const endPt = selectedMap.track[nextSegmentIdx];
            const segmentDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);

            // Increment segment progress float
            const stepRatio = activeSpeed / segmentDist;
            b.segmentProgress += stepRatio;
            b.distanceTraversed += activeSpeed;

            if (b.segmentProgress >= 1.0) {
              b.pathSegmentIndex = nextSegmentIdx;
              b.segmentProgress = 0.0;
            } else {
              b.x = startPt.x + b.segmentProgress * (endPt.x - startPt.x);
              b.y = startPt.y + b.segmentProgress * (endPt.y - startPt.y);
            }
          } else {
            // Leakage! Bloon has fully traversed the track list and escaped
            const leakDamage = gameModeRef.current === 'battles2' ? 1 : (b.isMoab ? 40 : b.maxHp);
            if (gameModeRef.current !== 'sandbox') {
              setLives((curr) => {
                const remaining = curr - leakDamage;
                if (remaining <= 0) {
                  // Defeat triggered!
                  setIsGameOverOrFinished(true);
                  assessAchievementProgress('round_40', roundRef.current); // track round max on fail as progress
                  onGameOver(roundRef.current - 1, Math.min(600, roundRef.current * 12), totalPopCount);
                  
                  if (gameModeRef.current === 'battles2' && isMultiplayerConnected && connRef.current) {
                    connRef.current.send({
                      type: 'state',
                      lives: 0,
                      cash: cashRef.current,
                      eco: battlesEcoRef.current
                    });
                  }
                  return 0;
                }

                if (gameModeRef.current === 'battles2' && isMultiplayerConnected && connRef.current) {
                  connRef.current.send({
                    type: 'state',
                    lives: remaining,
                    cash: cashRef.current,
                    eco: battlesEcoRef.current
                  });
                }
                return remaining;
              });
            }

            // Splat sound on leak
            playExplosion();

            // Screen leakage prompt text
            floatingTextsRef.current.push({
              id: `leak_${Date.now()}_${Math.random()}`,
              x: 500,
              y: 500,
              text: `-${leakDamage} Shield Leak!`,
              color: '#f87171',
              life: 45,
            });

            // Eliminate bloon from tracking list
            bloonsRef.current.splice(bIdx, 1);
          }
        }

        // --- SECTION C: PROJECTILES & TOWER SHOOTING TRACKS ---
        towersRef.current.forEach((t) => {
          // Decrement ability cooldowns and active states frame-by-frame
          if (t.abilityCooldown && t.abilityCooldown > 0) {
            t.abilityCooldown -= 1;
          }
          if (t.abilityActiveTimer && t.abilityActiveTimer > 0) {
            t.abilityActiveTimer -= 1;
          }

          if (t.cooldown > 0) {
            let decrement = 1;

            // Monkey Village Call to Arms buff: reduces shot reload cooldown by 2x!
            const isCallToArmsActive = towersRef.current.some(
              (vt) => vt.type === 'village' && vt.abilityActiveTimer && vt.abilityActiveTimer > 0
            );
            if (isCallToArmsActive) {
              decrement *= 2;
            }

            // Alchemist Mutated Transforming Tonic: shoots 3.5x faster!
            if (t.type === 'alchemist' && t.abilityActiveTimer && t.abilityActiveTimer > 0) {
              decrement *= 3.5;
            }

            t.cooldown = Math.max(0, t.cooldown - decrement);
          }

          // Super Monkey: Robo-Monkey Plasma Storm active projectile bursts!
          if (t.type === 'super' && t.abilityActiveTimer && t.abilityActiveTimer > 0) {
            if (t.abilityActiveTimer % 8 === 0) {
              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4 + (t.abilityActiveTimer * 0.05);
                projectilesRef.current.push({
                  id: `super_laser_${t.id}_${t.abilityActiveTimer}_${i}`,
                  type: 'energy',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle) * 14,
                  vy: Math.sin(angle) * 14,
                  speed: 14,
                  damage: 12,
                  pierce: 6,
                  rangeRemaining: 400,
                  damageType: 'plasma',
                  originTowerId: t.id
                });
              }
            }
          }

          // Wizard fire phoenix active helper projectile blasts!
          if (t.type === 'wizard' && t.abilityActiveTimer && t.abilityActiveTimer > 0) {
            if (t.abilityActiveTimer % 12 === 0) {
              const target = findActiveTargetForTower(t);
              if (target) {
                const angleToTarget = Math.atan2(target.y - t.y, target.x - t.x);
                projectilesRef.current.push({
                  id: `wizard_phoenix_${t.id}_${t.abilityActiveTimer}`,
                  type: 'beam',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angleToTarget) * 12,
                  vy: Math.sin(angleToTarget) * 12,
                  speed: 12,
                  damage: 8,
                  pierce: 4,
                  rangeRemaining: 555,
                  damageType: 'plasma',
                  originTowerId: t.id
                });

                // Spawning floating phoenix embers
                particlesRef.current.push({
                  id: `phoenix_ember_${Date.now()}_${Math.random()}`,
                  x: t.x + Math.sin(Date.now() * 0.04) * 45,
                  y: t.y + Math.cos(Date.now() * 0.04) * 45,
                  vx: 0,
                  vy: -1.2,
                  color: '#f97316',
                  size: 3.5,
                  life: 18,
                  maxLife: 18,
                  type: 'spark'
                });
              }
            }
          }

          // Active harvesting yields for Banana Farm
          if (t.type === 'farm') {
            if (roundInProgressRef.current) {
              // Custom frame harvest timer
              if (!t.cooldown || t.cooldown <= 0) {
                t.cooldown = 360; // reset payout interval: 6 seconds

                const lv = t.upgradeLevels || [0, 0, 0];
                let payout = 35; // base payout of surviving step

                // Top path multipliers
                if (lv[0] === 1) payout = 50;
                else if (lv[0] === 2) payout = 85;
                else if (lv[0] === 3) payout = 165;
                else if (lv[0] === 4) payout = 450;
                else if (lv[0] >= 5) payout = 1750;

                // Middle path boosts
                if (lv[1] === 1) payout += 15;
                else if (lv[1] === 2) payout += 35;
                else if (lv[1] === 3) payout += 105;
                else if (lv[1] === 4) payout += 320;
                else if (lv[1] >= 5) payout += 1400;

                // Bottom path automations
                if (lv[2] === 1) payout += 18;
                else if (lv[2] === 2) payout += 40;
                else if (lv[2] === 3) payout += 125;
                else if (lv[2] === 4) payout += 450;
                else if (lv[2] >= 5) payout += 2100;

                setCash((prev) => prev + payout);
                t.popCount += payout; // Track total cash yield as Pop Count indicators!

                // Text feedback
                floatingTextsRef.current.push({
                  id: `farm_active_${t.id}_${Date.now()}`,
                  x: t.x + (Math.random() * 20 - 10),
                  y: t.y - 12,
                  text: `+$${payout}`,
                  color: '#fbbf24', // Gold
                  life: 45
                });

                // Spark cute little yellow banana flying particles!
                for (let i = 0; i < 4; i++) {
                  particlesRef.current.push({
                    id: `banana_part_${Date.now()}_${Math.random()}`,
                    x: t.x,
                    y: t.y,
                    vx: Math.random() * 3 - 1.5,
                    vy: -Math.random() * 2 - 1.5,
                    color: '#eab308', // banana yellow
                    size: 2.5,
                    life: 25,
                    maxLife: 25,
                    type: 'pop'
                  });
                }
                playShoot(); // soft audio cue
              }
            }
            return;
          }

          if (t.type === 'pool') {
            return;
          }

          // Look for targets based on targeting configurations (Close, First, Last, Strong)
          const inRangeBloons = bloonsRef.current.filter((b) => {
            const dx = b.x - t.x;
            const dy = b.y - t.y;
            const distSq = dx * dx + dy * dy;
            const insideRange = distSq < t.range * t.range;
            if (!insideRange) return false;

            // Camo invisible block check
            if (b.isCamo) {
              if (t.type === 'ninja') return true;
              // Check if tower has any active Camo upgrade purchased
              const spec = TOWER_STATS[t.type as Exclude<TowerType, 'hero'>];
              if (!spec) return false;
              const lvls = t.upgradeLevels || [0, 0, 0];
              let canSeeCamo = false;
              for (let pt = 0; pt < 3; pt++) {
                const currentLvl = lvls[pt];
                for (let k = 0; k < currentLvl; k++) {
                  const upg = spec.upgrades[pt]?.[k];
                  if (upg?.effects?.canSeeCamo) {
                    canSeeCamo = true;
                    break;
                  }
                }
                if (canSeeCamo) break;
              }
              return canSeeCamo;
            }

            return true;
          });

          if (inRangeBloons.length === 0) return;

          // Perform targeting calculations
          let target: Bloon | undefined = undefined;
          if (t.targetMode === 'First') {
            // Sort by traversed distance descending
            inRangeBloons.sort((a, b) => b.distanceTraversed - a.distanceTraversed);
            target = inRangeBloons[0];
          } else if (t.targetMode === 'Last') {
            inRangeBloons.sort((a, b) => a.distanceTraversed - b.distanceTraversed);
            target = inRangeBloons[0];
          } else if (t.targetMode === 'Strong') {
            // HP descending, then distance traversed descending
            inRangeBloons.sort((a, b) => b.hp - a.hp || b.distanceTraversed - a.distanceTraversed);
            target = inRangeBloons[0];
          } else if (t.targetMode === 'Close') {
            // Distance to tower ascending
            inRangeBloons.sort((a, b) => {
              const dxA = a.x - t.x;
              const dyA = a.y - t.y;
              const dxB = b.x - t.x;
              const dyB = b.y - t.y;
              return (dxA * dxA + dyA * dyA) - (dxB * dxB + dyB * dyB);
            });
            target = inRangeBloons[0];
          }

          if (!target) return;

          // Shoot projectile if cooldown clears!
          if (t.cooldown <= 0) {
            const targetX = target.x;
            const targetY = target.y;
            const dx = targetX - t.x;
            const dy = targetY - t.y;
            const angle = Math.atan2(dy, dx);

            // Special Sniper logic: Instantly hit target (no projectile delay!)
            if (t.type === 'sniper') {
              playSniperShoot();
              
              const dmgType = getTowerDamageType(t, heroType);
              if (!canAttackBloon(dmgType, target.type, target.isFrozen)) {
                floatingTextsRef.current.push({
                  id: `imm_${Date.now()}`,
                  x: target.x,
                  y: target.y - 15,
                  text: 'Immune!',
                  color: '#f87171',
                  life: 15,
                });
                t.cooldown = t.baseCooldown;
                return;
              }

              damageAndPopBloon(target, t.damage, t);
              // Cripple shot slow
              const upgL = t.upgradesPurchased;
              if (upgL >= 3) {
                target.isSlowed = true;
                target.slowTimer = 180; // 3 seconds freeze duration
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Tack shooters emit 8 tacks outwards simultaneously!
            if (t.type === 'tack') {
              playShoot();
              for (let i = 0; i < 8; i++) {
                const tackAngle = (i * Math.PI) / 4;
                projectilesRef.current.push({
                  id: `tack_${Date.now()}_${Math.random()}`,
                  type: 'tack',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(tackAngle) * 5,
                  vy: Math.sin(tackAngle) * 5,
                  speed: 5,
                  damage: t.damage,
                  pierce: t.pierce,
                  rangeRemaining: t.range * 1.8,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Ice freeze creates an immediate 360% range freezing blast wave!
            if (t.type === 'ice') {
              playIceFreeze();
              inRangeBloons.forEach((b) => {
                b.isFrozen = true;
                const freezeBonus = t.upgradesPurchased >= 2 ? 80 : 45;
                b.freezeTimer = freezeBonus;
                // Deal tick damage if cryo-charged (T3 upgrade)
                if (t.upgradesPurchased >= 3) {
                  damageAndPopBloon(b, t.damage, t);
                }
              });

              // Create frost waves glowing particles expansion
              for (let anglePart = 0; anglePart < Math.PI * 2; anglePart += 0.45) {
                particlesRef.current.push({
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(anglePart) * 3.5,
                  vy: Math.sin(anglePart) * 3.5,
                  color: '#e0f2fe',
                  life: 15,
                  maxLife: 15,
                  size: 4,
                  type: 'ice',
                });
              }

              t.cooldown = t.baseCooldown;
              return;
            }

            // Ninjas can throw multiple shurikens at once! (Triple/Bloonjitsu)
            if (t.type === 'ninja') {
              playShoot();
              const lv = t.upgradeLevels || [0, 0, 0];
              let count = 1;
              if (lv[0] >= 4) count = 5; // Bloonjitsu
              else if (lv[0] >= 3) count = 2; // Double Shot

              const spreadAngle = 0.12; // angle separation
              for (let i = 0; i < count; i++) {
                const offset = (i - (count - 1) / 2) * spreadAngle;
                projectilesRef.current.push({
                  id: `ninja_${Date.now()}_${i}_${Math.random()}`,
                  type: 'shuriken',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle + offset) * 8.5,
                  vy: Math.sin(angle + offset) * 8.5,
                  speed: 8.5,
                  damage: t.damage,
                  pierce: t.pierce,
                  rangeRemaining: t.range * 2.0,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Druids throw a fan of 3 thorns!
            if (t.type === 'druid') {
              playShoot();
              const spreadAngle = 0.14;
              for (let i = 0; i < 3; i++) {
                const offset = (i - 1) * spreadAngle;
                projectilesRef.current.push({
                  id: `druid_${Date.now()}_${i}_${Math.random()}`,
                  type: 'thorn',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle + offset) * 6.5,
                  vy: Math.sin(angle + offset) * 6.5,
                  speed: 6.5,
                  damage: t.damage,
                  pierce: t.pierce,
                  rangeRemaining: t.range * 2.0,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Buccaneers unleash grapes!
            if (t.type === 'buccaneer') {
              playShoot();
              const lv = t.upgradeLevels || [0, 0, 0];
              const count = lv[1] >= 3 ? 5 : 2; // Grape Shot gives 5 grapes, else 2
              for (let i = 0; i < count; i++) {
                const offset = (i - (count - 1) / 2) * 0.12;
                projectilesRef.current.push({
                  id: `buc_${Date.now()}_${i}_${Math.random()}`,
                  type: 'grape',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle + offset) * 6.0,
                  vy: Math.sin(angle + offset) * 6.0,
                  speed: 6.0,
                  damage: t.damage,
                  pierce: t.pierce,
                  rangeRemaining: t.range * 2.0,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Dart Monkey Shooting Block
            if (t.type === 'dart') {
              playShoot();
              const lv = t.upgradeLevels || [0, 0, 0];
              
              if (lv[1] >= 3) {
                // Triple Shots or Fan Clubs fire 3 darts/beams at once!
                const isPlasma = lv[1] >= 5;
                const projType = isPlasma ? 'beam' : 'dart';
                const damageMult = isPlasma ? 3 : 1;
                const count = 3;
                const spreadAngle = 0.12;

                for (let i = 0; i < count; i++) {
                  const offset = (i - 1) * spreadAngle;
                  projectilesRef.current.push({
                    id: `dart_${Date.now()}_${i}_${Math.random()}`,
                    type: projType,
                    x: t.x,
                    y: t.y,
                    vx: Math.cos(angle + offset) * (isPlasma ? 11.0 : 8.0),
                    vy: Math.sin(angle + offset) * (isPlasma ? 11.0 : 8.0),
                    speed: isPlasma ? 11.0 : 8.0,
                    damage: t.damage * damageMult,
                    pierce: t.pierce,
                    rangeRemaining: t.range * 2.0,
                    originTowerId: t.id,
                    damageType: isPlasma ? 'plasma' : getTowerDamageType(t, heroType),
                    upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                  });
                }
              } else {
                // Standard single shot
                // Check if Spiker or Crossbow Bolt
                const isSpike = lv[0] >= 3;
                const isCrossbow = lv[2] >= 3;
                let speed = 7.5;
                if (isCrossbow) speed = 9.5;
                else if (isSpike) speed = 6.5;

                projectilesRef.current.push({
                  id: `dart_${Date.now()}_${Math.random()}`,
                  type: 'dart',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  speed,
                  damage: t.damage,
                  pierce: t.pierce,
                  rangeRemaining: t.range * 2.5,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }

              t.cooldown = t.baseCooldown;
              return;
            }

            // Bomb / Cannon Shooting Block
            if (t.type === 'bomb') {
              playShoot();
              const lv = t.upgradeLevels || [0, 0, 0];
              const isMissile = lv[1] >= 2;
              const speed = isMissile ? 9.5 : 5.5;
              const splashRadiusBase = lv[0] >= 3 ? 85 : (lv[0] >= 1 ? 75 : 60);

              projectilesRef.current.push({
                id: `bomb_${Date.now()}_${Math.random()}`,
                type: 'bomb',
                x: t.x,
                y: t.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                speed,
                damage: t.damage,
                pierce: t.pierce,
                splashRadius: splashRadiusBase,
                rangeRemaining: t.range * 2.5,
                originTowerId: t.id,
                damageType: getTowerDamageType(t, heroType),
                upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
              });

              t.cooldown = t.baseCooldown;
              return;
            }

            // Submarine Shooting Block
            if (t.type === 'sub') {
              playShoot();
              const lv = t.upgradeLevels || [0, 0, 0];
              let count = 1;
              if (lv[2] >= 3) count = 3;      // Triple Guns
              else if (lv[2] >= 1) count = 2; // Twin Guns

              const spreadAngle = 0.10;
              for (let i = 0; i < count; i++) {
                const offset = (i - (count - 1) / 2) * spreadAngle;
                projectilesRef.current.push({
                  id: `sub_${Date.now()}_${i}_${Math.random()}`,
                  type: 'dart',
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(angle + offset) * 8.0,
                  vy: Math.sin(angle + offset) * 8.0,
                  speed: 8.0,
                  damage: t.damage,
                  pierce: t.pierce,
                  targetBloonId: target.id, // home on target
                  rangeRemaining: t.range * 2.5,
                  originTowerId: t.id,
                  damageType: getTowerDamageType(t, heroType),
                  upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
                });
              }
              t.cooldown = t.baseCooldown;
              return;
            }

            // Standard Bullet Dart, Bombs, or Super Energy beams / other custom projectiles
            let projectileType: 'dart' | 'bomb' | 'beam' | 'boomerang' | 'glue' | 'magic' | 'potion' = 'dart';
            let speed = 7.5;
            let splash: number | undefined = undefined;

            if (t.type === 'bomb') {
              projectileType = 'bomb';
              speed = 5;
              splash = 65;
            } else if (t.type === 'super') {
              projectileType = 'beam';
              speed = 10;
              playLaserZap();
            } else if (t.type === 'boomerang') {
              projectileType = 'boomerang';
              speed = 6.0;
              playShoot();
            } else if (t.type === 'glue') {
              projectileType = 'glue';
              speed = 6.5;
              playShoot();
            } else if (t.type === 'wizard') {
              projectileType = 'magic';
              speed = 7.0;
              playLaserZap();
            } else if (t.type === 'alchemist') {
              if (t.abilityActiveTimer && t.abilityActiveTimer > 0) {
                // Mutated form fires extremely rapid laser energy!
                projectileType = 'beam';
                speed = 11.0;
                splash = 0;
                playLaserZap();
              } else {
                projectileType = 'potion';
                speed = 5.5;
                splash = 60;
                playShoot();
              }
            } else {
              playShoot();
            }

            // Hero Quincy bow projectile is dart, Obyn or Gwendolin customized
            if (t.type === 'hero' && heroConfig.id === 'gwendolin') {
              projectileType = 'bomb'; // fire explosion
              splash = 65;
              playShoot();
            }

            projectilesRef.current.push({
              id: `proj_${Date.now()}_${Math.random()}`,
              type: projectileType,
              x: t.x,
              y: t.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              speed,
              damage: (t.type === 'alchemist' && t.abilityActiveTimer && t.abilityActiveTimer > 0) ? t.damage * 4.0 : t.damage,
              pierce: t.pierce,
              splashRadius: splash,
              targetBloonId: (t.type === 'sub') ? target.id : undefined, // submarine uses homing
              rangeRemaining: t.range * 2.5,
              originTowerId: t.id,
              damageType: getTowerDamageType(t, heroType),
              upgradeLevels: t.upgradeLevels ? [...t.upgradeLevels] : [0, 0, 0],
            });

            t.cooldown = t.baseCooldown;
          }
        });

        // --- SECTION D: MOVE & COLLIDE ACTIVE PROJECTILES ---
        for (let pIdx = projectilesRef.current.length - 1; pIdx >= 0; pIdx--) {
          const p = projectilesRef.current[pIdx];

          // Submarine homing torpedo guidance: home in on the targeted bloon ID if alive
          if (p.targetBloonId) {
            const targeted = bloonsRef.current.find((b) => b.id === p.targetBloonId);
            if (targeted) {
              const dx = targeted.x - p.x;
              const dy = targeted.y - p.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 5) {
                p.vx = (dx / dist) * p.speed;
                p.vy = (dy / dist) * p.speed;
              }
            } else {
              // Target is popped, look for the closest bloon in range to re-home
              let closestB: Bloon | null = null;
              let minDist = 300;
              bloonsRef.current.forEach((b) => {
                const bDist = Math.hypot(b.x - p.x, b.y - p.y);
                if (bDist < minDist) {
                  minDist = bDist;
                  closestB = b;
                }
              });
              if (closestB) {
                p.targetBloonId = (closestB as Bloon).id;
              }
            }
          }

          // Advance projectile coordinate velocities
          p.x += p.vx;
          p.y += p.vy;
          p.rangeRemaining -= p.speed;

          // Eliminate if range limits exceeded
          if (p.rangeRemaining <= 0) {
            projectilesRef.current.splice(pIdx, 1);
            continue;
          }

          // Check direct hits with bloons
          let projectileHit = false;
          for (let bIdx = bloonsRef.current.length - 1; bIdx >= 0; bIdx--) {
            const b = bloonsRef.current[bIdx];
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            const distSq = dx * dx + dy * dy;
            const r = b.size + 10;

            // Hit radius detection
            if (distSq < r * r) {
              projectileHit = true;

              if (p.type === 'bomb' || p.type === 'potion') {
                // Splash explosive/potion triggers!
                playExplosion();
                
                if (p.type === 'potion') {
                  // Splash toxic lime-green sparkles!
                  for (let c = 0; c < 10; c++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3 + 1.5;
                    particlesRef.current.push({
                      x: p.x,
                      y: p.y,
                      vx: Math.cos(angle) * speed,
                      vy: Math.sin(angle) * speed,
                      color: '#22c55e', // acid green-500
                      life: 18,
                      maxLife: 18,
                      size: 2.5,
                      type: 'spark',
                    });
                  }
                  // Dissolving acidic splash damage
                  triggerExplosionSplash(p.x, p.y, p.splashRadius || 60, p.damage, p.originTowerId, p.upgradeLevels);
                } else {
                  triggerExplosionSplash(p.x, p.y, p.splashRadius || 50, p.damage, p.originTowerId, p.upgradeLevels);
                }

                projectilesRef.current.splice(pIdx, 1);
                break;
              } else {
                // Glue effect slows the target bloon
                if (p.type === 'glue') {
                  b.isSlowed = true;
                  b.slowTimer = 180; // 3 seconds of heavy gooey slow
                }

                // Simple pierce-reduction projectile hits IMMUNITIES CHECK
                let baseDmg = p.damage;
                let dmgMult = 1.0;

                if (b.type === 'BAD') {
                  b.isFrozen = false;
                  b.isSlowed = false;
                }

                const dmgType = p.damageType || 'sharp';
                if (!canAttackBloon(dmgType, b.type, b.isFrozen)) {
                  dmgMult = 0.0;
                }

                const damageDealt = baseDmg * dmgMult;
                
                if (damageDealt > 0) {
                  const originTower = p.originTowerId ? towersRef.current.find((t) => t.id === p.originTowerId) : undefined;
                  damageAndPopBloon(b, damageDealt, originTower);
                } else {
                  // Text warning immune
                  floatingTextsRef.current.push({
                    id: `imm_${Date.now()}`,
                    x: b.x,
                    y: b.y,
                    text: 'Immune!',
                    color: '#f87171',
                    life: 15,
                  });
                }

                p.pierce -= 1;
                if (p.pierce <= 0) {
                  projectilesRef.current.splice(pIdx, 1);
                  break;
                }
              }
            }
          }
        }

        // --- SECTION E: ACCUMULATE DUST & SPARKLE PARTICLES PHYSICS ---
        for (let ptIdx = particlesRef.current.length - 1; ptIdx >= 0; ptIdx--) {
          const pt = particlesRef.current[ptIdx];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 1;
          if (pt.life <= 0) {
            particlesRef.current.splice(ptIdx, 1);
          }
        }

        // --- BATTLES 2 IN-FLIGHT SIMULATION ---
        if (gameModeRef.current === 'battles2' && !isGameOverOrFinishedRef.current) {
          // A: Spawning Opponent Queue entries
          if (battlesOpponentSpawnQueueRef.current.length > 0) {
            battlesOpponentSpawnTimerRef.current -= 1;
            if (battlesOpponentSpawnTimerRef.current <= 0) {
              const item = battlesOpponentSpawnQueueRef.current.shift();
              if (item) {
                const spec = getBloonStyle(item.type as any);
                const pathStart = selectedMap.track[0];

                let speedMultiplierByDiff = 1.0;
                if (difficulty === 'Easy') speedMultiplierByDiff = 0.85;
                else if (difficulty === 'Hard' || difficulty === 'CHIMPS') speedMultiplierByDiff = 1.15;

                const lateScale = getLateGameMultiplier(roundRef.current);
                const initialHp = (item.isFortified ? (item.type === 'Lead' ? spec.hp * 4 : spec.hp * 2) : spec.hp) * lateScale.hp;

                const inst: Bloon = {
                  id: `opp_b_${Date.now()}_${Math.random()}`,
                  type: item.type as any,
                  x: pathStart.x,
                  y: pathStart.y,
                  speed: spec.speed * speedMultiplierByDiff * lateScale.speed,
                  hp: initialHp,
                  maxHp: initialHp,
                  size: spec.size,
                  color: spec.color,
                  reward: spec.reward,
                  distanceTraversed: 0,
                  pathSegmentIndex: 0,
                  segmentProgress: 0,
                  isFrozen: false,
                  freezeTimer: 0,
                  isSlowed: false,
                  slowTimer: 0,
                  isCeramic: item.type === 'Ceramic',
                  isMoab: ['MOAB', 'BFB', 'ZOMG', 'DDT', 'BAD'].includes(item.type),
                  isCamo: item.isCamo,
                  isRegrow: item.isRegrow,
                  isFortified: item.isFortified,
                };

                battlesOpponentBloonsRef.current.push(inst);
                battlesOpponentSpawnTimerRef.current = item.delay;
              }
            }
          }

          // B: Eco payouts (every 360 frames)
          if (framesCounter > 0 && framesCounter % 360 === 0) {
            setCash((c) => c + battlesEcoRef.current);
            setBattlesOpponentCash((c) => {
              const next = c + battlesOpponentEcoRef.current;
              battlesOpponentCashRef.current = next;
              return next;
            });
            floatingTextsRef.current.push({
              id: `eco_${Date.now()}`,
              x: 500,
              y: 400,
              text: `+$${battlesEcoRef.current} ECO`,
              color: '#10b981',
              life: 45
            });
            battlesOpponentFloatingTextsRef.current.push({
              id: `opp_eco_${Date.now()}`,
              x: 500,
              y: 400,
              text: `+$${battlesOpponentEcoRef.current} ECO`,
              color: '#10b981',
              life: 45
            });

            // If Peer connected, let's sync state over connection
            if (isMultiplayerConnected && connRef.current) {
              connRef.current.send({
                type: 'state',
                lives: livesRef.current,
                cash: cashRef.current,
                eco: battlesEcoRef.current
              });
            }
          }

          // C: Opponent Bloons updates
          const oBloons = battlesOpponentBloonsRef.current;
          for (let i = oBloons.length - 1; i >= 0; i--) {
            const b = oBloons[i];
            let activeSpeed = b.speed;
            if (b.isFrozen) activeSpeed = 0;
            else if (b.isSlowed) activeSpeed *= 0.5;

            // Opponent Sabotage active speed checking on their own course (half speed)
            const isOpponentSabotageActive = battlesOpponentTowersRef.current.some(
              (nt) => nt.type === 'ninja' && nt.abilityActiveTimer && nt.abilityActiveTimer > 0
            );
            if (isOpponentSabotageActive) {
              activeSpeed *= 0.5;
            }

            const nextSegmentIdx = b.pathSegmentIndex + 1;
            if (nextSegmentIdx < selectedMap.track.length) {
              const startPt = selectedMap.track[b.pathSegmentIndex];
              const endPt = selectedMap.track[nextSegmentIdx];
              const segmentDist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);

              const stepRatio = activeSpeed / segmentDist;
              b.segmentProgress += stepRatio;
              b.distanceTraversed += activeSpeed;

              if (b.segmentProgress >= 1.0) {
                b.pathSegmentIndex += 1;
                b.segmentProgress = 0.0;
              } else {
                b.x = startPt.x + b.segmentProgress * (endPt.x - startPt.x);
                b.y = startPt.y + b.segmentProgress * (endPt.y - startPt.y);
              }
            } else {
              // Opponent leaks!
              const leakDamage = gameModeRef.current === 'battles2' ? 1 : (b.isMoab ? 40 : b.maxHp);
              oBloons.splice(i, 1);

              setBattlesOpponentLives((curr) => {
                const next = curr - leakDamage;
                if (next <= 0) {
                  setIsGameOverOrFinished(true);
                  setShowVictoryModal(true); // Victory!
                  return 0;
                }
                return next;
              });

              battlesOpponentFloatingTextsRef.current.push({
                id: `opp_leak_${Date.now()}_${Math.random()}`,
                x: 500,
                y: 500,
                text: `-${leakDamage} Shield Leak!`,
                color: '#f87171',
                life: 45
              });
            }
          }

          // D: Opponent Towers weapon cool-downs and shooting
          battlesOpponentTowersRef.current.forEach((t) => {
            if (t.cooldown > 0) t.cooldown--;
            if (oBloons.length === 0) return;

            // Target nearest/first
            const target = oBloons[0];
            const rangeDist = Math.hypot(target.x - t.x, target.y - t.y);
            if (rangeDist <= t.range && t.cooldown <= 0) {
              t.cooldown = t.baseCooldown;
              t.lastAngle = Math.atan2(target.y - t.y, target.x - t.x);

              const dx = target.x - t.x;
              const dy = target.y - t.y;
              const angle = Math.atan2(dy, dx);

              // Spawn bullet trace
              battlesOpponentProjectilesRef.current.push({
                id: `opp_p_${Date.now()}_${Math.random()}`,
                type: 'dart',
                x: t.x + Math.cos(angle) * 15,
                y: t.y + Math.sin(angle) * 15,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                speed: 12,
                damage: t.damage || 1,
                pierce: t.pierce || 2,
                rangeRemaining: 200,
                targetBloonId: target.id
              });
            }
          });

          // E: Opponent Projectiles step movement
          const oProjs = battlesOpponentProjectilesRef.current;
          for (let i = oProjs.length - 1; i >= 0; i--) {
            const p = oProjs[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rangeRemaining -= 1;

            let hit = false;
            for (let j = oBloons.length - 1; j >= 0; j--) {
              const b = oBloons[j];
              const dist = Math.hypot(b.x - p.x, b.y - p.y);
              if (dist < b.size + 15) {
                b.hp -= p.damage;
                hit = true;

                // Splash spark spark
                battlesOpponentParticlesRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: b.colorByHp || b.color || '#ef4444',
                  life: 15,
                  maxLife: 15,
                  size: 3.5,
                  type: 'pop'
                });

                if (b.hp <= 0) {
                  oBloons.splice(j, 1);
                  setBattlesOpponentCash((c) => {
                    battlesOpponentCashRef.current = c + b.reward;
                    return battlesOpponentCashRef.current;
                  });
                  battlesOpponentFloatingTextsRef.current.push({
                    id: `opp_pop_${Date.now()}_${Math.random()}`,
                    x: b.x,
                    y: b.y,
                    text: `+$${b.reward}`,
                    color: '#22c55e',
                    life: 25
                  });
                }
                break;
              }
            }

            if (hit || p.rangeRemaining <= 0) {
              oProjs.splice(i, 1);
            }
          }

          // F: AI Strategic Autonomic Decisions (Removed as requested)

          // G: Deaccelerate opponent floating texts and particles
          const oParts = battlesOpponentParticlesRef.current;
          for (let i = oParts.length - 1; i >= 0; i--) {
            const pt = oParts[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= 1;
            if (pt.life <= 0) oParts.splice(i, 1);
          }

          const oTexts = battlesOpponentFloatingTextsRef.current;
          for (let i = oTexts.length - 1; i >= 0; i--) {
            const ft = oTexts[i];
            ft.y -= 0.6;
            ft.life -= 1;
            if (ft.life <= 0) oTexts.splice(i, 1);
          }
        }

        // --- SECTION F: FLOATING TEXT DECELERATORS ---
        for (let ftIdx = floatingTextsRef.current.length - 1; ftIdx >= 0; ftIdx--) {
          const ft = floatingTextsRef.current[ftIdx];
          ft.y -= 0.6; // rise upwards
          ft.life -= 1;
          if (ft.life <= 0) {
            floatingTextsRef.current.splice(ftIdx, 1);
          }
        }

        // Capping particles and floating texts to prevent rendering or processing lag
        if (particlesRef.current.length > 150) {
          particlesRef.current.length = 150;
        }
        if (floatingTextsRef.current.length > 40) {
          floatingTextsRef.current.length = 40;
        }
      } // End speed multiplier steps loop

      // --- SECTION G: PAINT MAIN ELEMENT GRAPHICS ON HIGH-DPI CANVAS ---
      const minCanvasDim = Math.min(canvas.width, canvas.height);

      // Refresh background
      drawMap(ctx, selectedMap, canvas.width, canvas.height);

      // Render Projectiles
      projectilesRef.current.forEach((p) => {
        drawProjectile(ctx, p, canvas.width, canvas.height);
      });

      // Render Bloons
      bloonsRef.current.forEach((b) => {
        drawBloon(ctx, b, canvas.width, canvas.height);
      });

      // Render Towers
      towersRef.current.forEach((t) => {
        const matchingTarget = findActiveTargetForTower(t);
        drawTower(ctx, t, canvas.width, canvas.height, matchingTarget);
      });

      // Render Range Indicator preview hovered/selected
      if (selectedPlacedTowerId) {
        const activeTower = towersRef.current.find((t) => t.id === selectedPlacedTowerId);
        if (activeTower) {
          drawRangeIndicator(
            ctx,
            activeTower.x,
            activeTower.y,
            activeTower.range,
            true,
            canvas.width,
            canvas.height
          );
        }
      }

      // Render drag-and-drop placement phantom indicator
      if (selectedShopTowerRef.current) {
        const mouseValidity = checkPlacementValidity(mousePosRef.current.x, mousePosRef.current.y);
        const range = selectedShopTowerRef.current === 'hero' ? 140 : TOWER_STATS[selectedShopTowerRef.current].baseRange;
        drawRangeIndicator(
          ctx,
          mousePosRef.current.x,
          mousePosRef.current.y,
          range,
          mouseValidity,
          canvas.width,
          canvas.height
        );

        // Render transparent ghost tower preview under the mouse
        if (mousePosRef.current.x >= 0 && mousePosRef.current.x <= 1000 && mousePosRef.current.y >= 0 && mousePosRef.current.y <= 1000) {
          const previewTower: Tower = {
            id: 'placement_preview',
            type: selectedShopTowerRef.current,
            x: mousePosRef.current.x,
            y: mousePosRef.current.y,
            range: range,
            baseCooldown: selectedShopTowerRef.current === 'hero' ? 45 : TOWER_STATS[selectedShopTowerRef.current].baseCooldown,
            cooldown: 0,
            damage: selectedShopTowerRef.current === 'hero' ? 1 : TOWER_STATS[selectedShopTowerRef.current].baseDamage,
            pierce: selectedShopTowerRef.current === 'hero' ? 2 : TOWER_STATS[selectedShopTowerRef.current].basePierce,
            cost: selectedShopTowerRef.current === 'hero' ? 0 : TOWER_STATS[selectedShopTowerRef.current].cost,
            popCount: 0,
            targetMode: 'First',
            level: 1,
            upgradeLevels: [0, 0, 0],
            upgradeIndex: 0,
            upgradesPurchased: 0,
            lastAngle: 0, // Faces right by default during preview
          };

          ctx.save();
          ctx.globalAlpha = 0.55;
          // Render the actual monkey preview to the canvas!
          drawTower(ctx, previewTower, canvas.width, canvas.height);
          ctx.restore();
        }
      }

      // Render Pop Particles
      particlesRef.current.forEach((pt) => {
        drawParticle(ctx, pt, canvas.width, canvas.height);
      });

      // Render Floating popped Cash overlays
      floatingTextsRef.current.forEach((ft) => {
        drawFloatingText(ctx, ft, canvas.width, canvas.height);
      });

      // --- RENDER OPPONENT BOARD CANVAS (BATTLES 2) ---
      if (gameModeRef.current === 'battles2' && opponentCanvasRef.current) {
        const oCanvas = opponentCanvasRef.current;
        const oCtx = oCanvas.getContext('2d');
        if (oCtx) {
          drawMap(oCtx, selectedMap, oCanvas.width, oCanvas.height);

          battlesOpponentProjectilesRef.current.forEach((p) => {
            drawProjectile(oCtx, p, oCanvas.width, oCanvas.height);
          });

          battlesOpponentBloonsRef.current.forEach((b) => {
            drawBloon(oCtx, b, oCanvas.width, oCanvas.height);
          });

          battlesOpponentTowersRef.current.forEach((t) => {
            drawTower(oCtx, t, oCanvas.width, oCanvas.height);
          });

          battlesOpponentParticlesRef.current.forEach((pt) => {
            drawParticle(oCtx, pt, oCanvas.width, oCanvas.height);
          });

          battlesOpponentFloatingTextsRef.current.forEach((ft) => {
            drawFloatingText(oCtx, ft, oCanvas.width, oCanvas.height);
          });
        }
      }

      // Maintain Loop ticker
      framesCounter++;
      animationFrameId = requestAnimationFrame(gameTick);
    };

    animationFrameId = requestAnimationFrame(gameTick);

    // Dynamic background runner for battles2 to never drop connections/simulation ticks in hidden tabs
    const fallbackInterval = setInterval(() => {
      if (gameModeRef.current === 'battles2') {
        const timeSinceLastTick = Date.now() - lastTickTime;
        if (timeSinceLastTick >= 33) { // 30fps fallback while backgrounded
          gameTick();
        }
      }
    }, 33);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(fallbackInterval);
    };
  }, [dimensions]);

  // Autoplay handler to fix the "autoplay doesn't work" bug
  useEffect(() => {
    if (autoPlay && !roundInProgress && !isGameOverOrFinished && !showVictoryModal) {
      // Battles mode matchmaking gates: do not start any automatic wave until both players connect!
      if (gameModeRef.current === 'battles2') {
        if (!isMultiplayerConnected) {
          console.log('Battles mode: Waiting for both players to connect before starting automatic waves.');
          return;
        }
        if (mpRole === 'client') {
          console.log('Battles client: Waiting for Host start-round message.');
          return;
        }
      }

      // Small 1.2 second delay represents natural round completion grace pacing
      const timer = setTimeout(() => {
        if (!roundInProgress && !isGameOverOrFinished && !showVictoryModal) {
          startRound();
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, roundInProgress, isGameOverOrFinished, round, showVictoryModal, isMultiplayerConnected, mpRole]);



  // Inflict damage, trigger splits or pop children
  const damageAndPopBloon = (b: Bloon, dmg: number, originTower?: Tower) => {
    b.hp -= dmg;

    if (b.hp <= 0) {
      // Bloon completely popped!
      playPop();
      setTotalPopCount((p) => {
        const incremented = p + 1;
        assessAchievementProgress('pop_1000', 1);
        assessAchievementProgress('pop_10000', 1);
        return incremented;
      });

      if (originTower) {
        originTower.popCount += 1;
        // Hero gains experience upon pops!
        if (originTower.type === 'hero' && originTower.level < 20) {
          const xpBonus = 1.0 * (difficulty === 'CHIMPS' ? 1.0 : heroXpRateBonus);
          originTower.heroXp = (originTower.heroXp || 0) + xpBonus;
          originTower.heroMaxXp = originTower.heroMaxXp || 100;
          if (originTower.heroXp >= originTower.heroMaxXp) {
            originTower.level += 1;
            originTower.heroXp -= originTower.heroMaxXp;
            originTower.heroMaxXp = Math.round(originTower.heroMaxXp * 1.5);
            // Floating level up text
            floatingTextsRef.current.push({
              id: `lvup_${Date.now()}`,
              x: originTower.x,
              y: originTower.y - 15,
              text: 'Level Up!',
              color: '#34d399', // Emerald, zero yellow
              life: 45,
            });
            playLevelUp();
          }
        }
      }

      // Give Cash reward (scales downward as rounds progress) - disabled in Battles 2
      if (gameModeRef.current !== 'battles2') {
        const incomeScale = getIncomeMultiplier(round);
        const finalReward = b.reward * incomeScale;
        setCash((c) => c + finalReward);

        // Create floating text cash
        floatingTextsRef.current.push({
          id: `c_${Date.now()}_${Math.random()}`,
          x: b.x,
          y: b.y,
          text: `+$${finalReward.toFixed(2).replace(/\.00$/, '')}`,
          color: '#22c55e',
          life: 30,
        });
      }

      // Pop splash particles
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push({
          x: b.x,
          y: b.y,
          vx: (Math.random() * 2 - 1) * 3,
          vy: (Math.random() * 2 - 1) * 3,
          color: b.color,
          life: 18,
          maxLife: 18,
          size: 3,
          type: 'pop',
        });
      }

      // Check Children release splits
      const childType = getChildBloonType(b.type);
      if (childType) {
        let siblings: { type: BloonType; isCamo?: boolean; isRegrow?: boolean; isFortified?: boolean }[] = [];
        
        if (b.type === 'Zebra') {
          siblings = [
            { type: 'Black', isCamo: b.isCamo, isRegrow: b.isRegrow },
            { type: 'White', isCamo: b.isCamo, isRegrow: b.isRegrow }
          ];
        } else if (b.type === 'BAD') {
          siblings = [
            { type: 'ZOMG' }, { type: 'ZOMG' },
            { type: 'DDT' }, { type: 'DDT' }, { type: 'DDT' }
          ];
        } else if (b.type === 'DDT') {
          siblings = [
            { type: 'Ceramic', isCamo: true, isRegrow: true },
            { type: 'Ceramic', isCamo: true, isRegrow: true },
            { type: 'Ceramic', isCamo: true, isRegrow: true },
            { type: 'Ceramic', isCamo: true, isRegrow: true }
          ];
        } else {
          const count = getChildCount(b.type);
          for (let i = 0; i < count; i++) {
            siblings.push({
              type: childType,
              isCamo: b.isCamo,
              isRegrow: b.isRegrow,
              isFortified: b.isFortified && childType !== 'Ceramic' && !childType.includes('MOAB') && childType !== 'BFB' && childType !== 'ZOMG' && childType !== 'DDT' && childType !== 'BAD'
            });
          }
        }

        siblings.forEach((sib, i) => {
          const childStyle = getBloonStyle(sib.type);
          // Separate multiple siblings slightly along track to prevent overlapping stacks
          const separationOffset = (i * 12) + 5;

          let childSpeedByDiff = childStyle.speed;
          if (difficulty === 'Easy') childSpeedByDiff *= 0.85;
          else if (difficulty === 'Hard' || difficulty === 'CHIMPS') childSpeedByDiff *= 1.15;

          const lateScale = getLateGameMultiplier(round);
          const childInitialHp = (sib.isFortified ? (sib.type === 'Lead' ? childStyle.hp * 4 : childStyle.hp * 2) : childStyle.hp) * lateScale.hp;

          const child: Bloon = {
            id: `bloon_child_${Date.now()}_${Math.random()}`,
            type: sib.type,
            x: b.x,
            y: b.y,
            speed: childSpeedByDiff * lateScale.speed,
            hp: childInitialHp,
            maxHp: childInitialHp,
            size: childStyle.size,
            color: childStyle.color,
            reward: childStyle.reward,
            distanceTraversed: Math.max(0, b.distanceTraversed - separationOffset),
            pathSegmentIndex: b.pathSegmentIndex,
            segmentProgress: Math.max(0, b.segmentProgress - 0.015),
            isFrozen: false,
            freezeTimer: 0,
            isSlowed: false,
            slowTimer: 0,
            isCeramic: sib.type === 'Ceramic',
            isMoab: ['MOAB', 'BFB', 'ZOMG', 'DDT', 'BAD'].includes(sib.type),
            isCamo: sib.isCamo,
            isRegrow: sib.isRegrow,
            isFortified: sib.isFortified,
          };

          bloonsRef.current.push(child);
        });
      }

      // Remove popped parent bloon
      bloonsRef.current = bloonsRef.current.filter((it) => it.id !== b.id);
    }
  };

  // Explosive bomb explosion damage sweep radius function
  const triggerExplosionSplash = (
    ex: number,
    ey: number,
    rad: number,
    dmg: number,
    originTowerId?: string,
    upgradeLevels?: [number, number, number]
  ) => {
    // Spark & smoke particles
    for (let c = 0; c < 8; c++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x: ex,
        y: ey,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#f97316', // orange spark
        life: 20,
        maxLife: 20,
        size: 3,
        type: 'spark',
      });
    }

    // Smoke puffer
    particlesRef.current.push({
      x: ex,
      y: ey,
      vx: 0,
      vy: -0.5,
      color: '#64748b',
      life: 30,
      maxLife: 30,
      size: 15,
      type: 'smoke',
    });

    const [top, mid, bot] = upgradeLevels || [0, 0, 0];

    // Frag Bombs (bot === 2)
    if (bot === 2) {
      for (let i = 0; i < 8; i++) {
        const angleFrag = (i * Math.PI) / 4;
        projectilesRef.current.push({
          id: `frag_${Date.now()}_${i}_${Math.random()}`,
          type: 'tack',
          x: ex,
          y: ey,
          vx: Math.cos(angleFrag) * 7.0,
          vy: Math.sin(angleFrag) * 7.0,
          speed: 7.0,
          damage: 1,
          pierce: 2,
          rangeRemaining: 65,
          originTowerId,
          damageType: 'sharp',
        });
      }
    }

    // Cluster Bombs (bot >= 3)
    if (bot >= 3) {
      const clusterCount = bot >= 4 ? 8 : 4;
      for (let i = 0; i < clusterCount; i++) {
        const angleCluster = Math.random() * Math.PI * 2;
        const speedCluster = Math.random() * 3.5 + 2.0;
        projectilesRef.current.push({
          id: `cluster_${Date.now()}_${i}_${Math.random()}`,
          type: 'bomb',
          x: ex,
          y: ey,
          vx: Math.cos(angleCluster) * speedCluster,
          vy: Math.sin(angleCluster) * speedCluster,
          speed: speedCluster,
          damage: Math.max(1, Math.round(dmg * 0.5)),
          pierce: 1,
          splashRadius: 35,
          rangeRemaining: Math.random() * 25 + 15,
          originTowerId,
          upgradeLevels: [top, mid, 0], // avoid infinite recursive clusters
        });
      }
    }

    // Inflict splash damage on close targets with explosive immunities
    const originTower = originTowerId ? towersRef.current.find((t) => t.id === originTowerId) : undefined;
    bloonsRef.current.forEach((b) => {
      const dx = b.x - ex;
      const dy = b.y - ey;
      const distSq = dx * dx + dy * dy;
      if (distSq < rad * rad) { // inside blast radius
        if (b.type === 'Black' || b.type === 'Zebra' || b.type === 'DDT') {
          return; // Immune to explosions!
        }

        // Bloon Impact or Bloon Crush stun
        if (top >= 4 && b.type !== 'BAD') {
          b.isFrozen = true;
          b.freezeTimer = top >= 5 ? 140 : 65;
        }

        // MOAB Mauler heavy damage
        let finalDmg = dmg;
        if (b.isMoab && mid >= 3) {
          finalDmg = mid === 3 ? dmg + 15 : mid === 4 ? dmg + 40 : dmg + 100;
        }

        damageAndPopBloon(b, finalDmg, originTower);
      }
    });
  };

  // Achievements tracking - round completing
  const assessmentRoundCompletes = (completedRound: number) => {
    if (completedRound === 40) {
      assessAchievementProgress('round_40', 40);
    }

    // Unlocks next levels if necessary (handled by lobby unlock IDs)
    try {
      const conqueredArray = JSON.parse(localStorage.getItem('btd_conquered_maps') || '[]');
      if (!conqueredArray.includes(mapId)) {
        conqueredArray.push(mapId);
        localStorage.setItem('btd_conquered_maps', JSON.stringify(conqueredArray));
        assessAchievementProgress('unlock_all_maps', 1);
      }
    } catch (e) {}
  };

  // Highlight and inspect Selected Tower Card elements inside sidebars
  const activePlacedTower = towersRef.current.find((t) => t.id === selectedPlacedTowerId);

  return (
    <div className="flex flex-col h-screen bg-[var(--app-bg)] font-sans text-white overflow-hidden select-none">
      {/* HUD Top-bar Displays */}
      <div className="relative bg-[var(--app-header)] text-white border-b-4 border-black/20 px-6 py-2.5 flex justify-between items-center z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            id="hud-home-btn"
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer rounded-lg shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Lobby
          </button>
          
          <div className="hidden sm:flex flex-col text-slate-100">
            <span className="text-[9px] uppercase font-black leading-none opacity-80">Battle Ground</span>
            <span className="text-xs font-black uppercase tracking-tight text-white">{selectedMap.name}</span>
          </div>

          <div className="px-2 py-0.5 bg-black/30 border border-white/20 rounded text-[9px] text-[var(--app-accent)] font-black uppercase tracking-wider hidden md:inline">
            {difficulty}
          </div>
        </div>

        {/* Live Metrics: Lives and Cash matching Design HTML with integrated Controls */}
        <div className="flex items-center gap-4 xl:gap-6 flex-wrap justify-center">
          {/* Lives indicator styled like the design HTML layout with red circle */}
          <div className="flex items-center gap-2 animate-pulse" title="Monkey Lives">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black leading-none opacity-80">Lives</span>
              <span id="hud-lives" className="text-base font-black leading-none">{lives} HP</span>
            </div>
          </div>

           {/* Cash indicator styled like the design HTML layout with emerald dollar sign */}
          <div className="flex items-center gap-2" title="Current Combat Cash">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white font-black">
              $
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black leading-none opacity-80">Cash</span>
              <span id="hud-cash" className="text-base font-black leading-none">${Math.floor(cash)}</span>
            </div>
          </div>

          {/* Wave/Round indicator styled like wave banner */}
          <div className="bg-black/30 px-5 py-1.5 rounded-full border-2 border-white/20 shrink-0" title="Battle Round">
            <span id="hud-round" className="text-base font-black uppercase text-white">
              WAVE <span className="text-emerald-300">{round}</span> / {maxRounds}
            </span>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block h-6 w-[2px] bg-white/25"></div>

          {/* Relocated active wave, fast forward, and autoplay controls bar */}
          <div className="flex items-center gap-2.5">
            {/* Play Round Trigger / Status Badge */}
            <div
              id="active-round-trigger"
              className={`px-3.5 py-1.5 font-black font-sans text-xs rounded-xl flex items-center gap-1.5 border-b-4 uppercase transition-all select-none ${
                roundInProgress
                  ? 'bg-slate-800 text-cyan-400 border-slate-950/40'
                  : 'bg-emerald-600 text-emerald-100 border-emerald-800 animate-pulse'
              }`}
            >
              {roundInProgress ? (
                <>
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span>Defending Wave {round}...</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Next Wave starting...</span>
                </>
              )}
            </div>

            {/* Fast Forward Speed Factor */}
            <button
              id="btn-fast-forward"
              onClick={() => {
                if (gameMode === 'battles2') {
                  const nextVote = mySpeedVote === 1 ? 2 : mySpeedVote === 2 ? 3 : 1;
                  setMySpeedVote(nextVote);
                  if (isMultiplayerConnected && connRef.current) {
                    connRef.current.send({
                      type: 'speed-vote',
                      speed: nextVote
                    });
                  }
                } else {
                  const next = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 3 : 1;
                  setSpeedMultiplier(next);
                  setMySpeedVote(next);
                }
              }}
              className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-400 border-b-2 border-blue-700 text-white text-xs font-black rounded-lg cursor-pointer uppercase font-sans whitespace-nowrap transition-all"
              title="Toggle speed multiplier"
            >
              {gameMode === 'battles2' ? (
                mySpeedVote === opponentSpeedVote
                  ? `${speedMultiplier}x Speed`
                  : `${mySpeedVote}x (Wait ${opponentSpeedVote}x)`
              ) : (
                `${speedMultiplier}x Speed`
              )}
            </button>

            {/* Pause Button */}
            <button
              id="btn-pause-toggle"
              onClick={() => {
                const nextPause = !myPauseVote;
                setMyPauseVote(nextPause);
                if (gameMode === 'battles2' && isMultiplayerConnected && connRef.current) {
                  connRef.current.send({
                    type: 'pause-vote',
                    paused: nextPause
                  });
                }
              }}
              className={`px-2.5 py-1.5 ${
                myPauseVote 
                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-850' 
                  : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700'
              } border-b-2 text-white text-xs font-black rounded-lg cursor-pointer uppercase font-sans whitespace-nowrap transition-all`}
              title="Pause/Resume Game"
            >
              {myPauseVote ? '⏸️ Proposed Pause' : '⏸️ Pause'}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-black uppercase font-sans select-none bg-cyan-950/40 px-2.5 py-1.5 rounded-lg border border-cyan-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>AUTO START ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Audio / Auto Settings */}
        <div className="flex items-center gap-2 relative">
          <button
            id="btn-sound-toggle"
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-600 border-rose-800 text-white shadow'
                : 'bg-[var(--app-button)] border-b-2 border-black/30 hover:brightness-110 text-white'
            }`}
            title={isAudioMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            id="btn-help-modal"
            onClick={() => setShowHelpModal(true)}
            className="p-2 bg-[var(--app-button)] border-b-2 border-black/30 hover:brightness-110 text-white rounded-lg cursor-pointer shadow"
            title="Read Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="game-settings-trigger"
            onClick={() => {
              try {
                const saveObj = {
                  monkey_money: localStorage.getItem('btd_monkey_money') || '350',
                  purchased_perks: localStorage.getItem('btd_purchased_perks') || '[]',
                  achievements: localStorage.getItem('btd_achievements') || '[]',
                  timestamp: Date.now()
                };
                const code = btoa(unescape(encodeURIComponent(JSON.stringify(saveObj))));
                setExportedCodeString(code);
              } catch (e) {}
              setShowGameSettingsModal((prev) => !prev);
            }}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              showGameSettingsModal
                ? 'bg-amber-500 border-amber-700 text-white shadow'
                : 'bg-[var(--app-button)] border-b-2 border-black/30 hover:brightness-110 text-white'
            }`}
            title="Options & Themes"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Settings absolute dropdown menu inside top bar */}
          {showGameSettingsModal && (
            <div className="absolute right-0 top-[48px] bg-[var(--app-panel)] rounded-2xl border-4 border-black/25 w-80 text-white p-4 shadow-2xl flex flex-col gap-3 z-50 animate-scale-up max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-xs font-black text-yellow-300 flex items-center gap-1.5 uppercase italic">
                  <Settings className="w-4 h-4 text-yellow-400" />
                  Arena Settings
                </h2>
                <button
                  onClick={() => {
                    setShowGameSettingsModal(false);
                    setImportStatus(null);
                    setPastedCode('');
                  }}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Theme Configuration */}
              {themeColors && onChangeTheme && (
                <div className="flex flex-col gap-1.5 bg-black/25 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-yellow-300 font-sans font-black uppercase tracking-widest flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-pink-400" /> Custom UI Theme
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onChangeTheme(p.colors)}
                        className={`px-2 py-1 text-[9px] font-black rounded border text-left transition-all cursor-pointer ${
                          themeColors.bg === p.colors.bg
                            ? 'bg-emerald-500/20 border-emerald-450 text-emerald-300 shadow'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-650 text-slate-200'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Audio Settings inline */}
              <div className="flex flex-col gap-1.5 bg-black/25 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-yellow-300 font-sans font-black uppercase tracking-widest flex items-center gap-1">
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />} Audio Sound FX
                </span>
                <div className="flex items-center justify-between mt-0.5 text-[10px]">
                  <span className="text-white/70 font-bold">Synthesizer:</span>
                  <button
                    onClick={handleToggleMute}
                    className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border transition-all cursor-pointer ${
                      isAudioMuted
                        ? 'bg-rose-600/25 border-rose-500 text-rose-350'
                        : 'bg-emerald-500/25 border-emerald-450 text-emerald-300'
                    }`}
                  >
                    {isAudioMuted ? 'Muted' : 'Sound On'}
                  </button>
                </div>
              </div>

              {/* 3. Backup Settings Save Transfer */}
              <div className="flex flex-col gap-1.5 bg-black/25 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-yellow-300 font-sans font-black uppercase tracking-widest flex items-center gap-1">
                  <Save className="w-3.5 h-3.5 text-blue-400" /> Save Code Operations
                </span>

                {/* Export code row */}
                <div className="flex flex-col gap-1">
                  <button
                    id="btn-export-game-settings"
                    onClick={() => {
                      try {
                        const saveObj = {
                          monkey_money: localStorage.getItem('btd_monkey_money') || '350',
                          purchased_perks: localStorage.getItem('btd_purchased_perks') || '[]',
                          achievements: localStorage.getItem('btd_achievements') || '[]',
                          timestamp: Date.now()
                        };
                        const code = btoa(unescape(encodeURIComponent(JSON.stringify(saveObj))));
                        setExportedCodeString(code);
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(code);
                          setCopyFeedback(true);
                          setTimeout(() => setCopyFeedback(false), 3000);
                        }
                      } catch (e) {}
                    }}
                    className="w-full py-1 bg-slate-700 hover:bg-slate-650 border border-slate-600 text-white font-sans font-black text-[9px] tracking-wide rounded uppercase flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-350" />}
                    {copyFeedback ? 'Copied code!' : 'Export Backup'}
                  </button>
                  {exportedCodeString && (
                    <textarea
                      readOnly
                      value={exportedCodeString}
                      className="w-full text-[8px] bg-black/50 p-1 border border-white/10 rounded text-emerald-300 font-mono resize-none focus:outline-none focus:ring-0 select-all"
                      rows={2}
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                  )}
                </div>

                {/* Import code row */}
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Paste backup code..."
                    value={pastedCode}
                    onChange={(e) => setPastedCode(e.target.value)}
                    className="w-full text-[9px] bg-black/45 border border-white/10 rounded py-1 px-2 text-white placeholder-white/30 focus:ring-0 focus:outline-none"
                  />
                  <button
                    id="btn-import-game-settings"
                    onClick={() => {
                      setImportStatus(null);
                      if (!pastedCode.trim()) {
                        setImportStatus({ error: "Paste backup text first!" });
                        return;
                      }
                      try {
                        const raw = decodeURIComponent(escape(atob(pastedCode.trim())));
                        const saveObj = JSON.parse(raw);
                        if (saveObj && typeof saveObj === 'object') {
                          localStorage.setItem('btd_monkey_money', saveObj.monkey_money || '350');
                          localStorage.setItem('btd_purchased_perks', saveObj.purchased_perks || '[]');
                          localStorage.setItem('btd_achievements', saveObj.achievements || '[]');
                          setImportStatus({ success: true });
                          setPastedCode('');
                          setTimeout(() => {
                            setImportStatus(null);
                            window.location.reload();
                          }, 1200);
                        } else {
                          setImportStatus({ error: "Invalid layout format!" });
                        }
                      } catch (e) {
                        setImportStatus({ error: "Failed to parse layout!" });
                      }
                    }}
                    className="w-full py-1 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500 text-white font-sans font-black text-[9px] tracking-wide rounded uppercase transition-all cursor-pointer"
                  >
                    Apply & Reload
                  </button>
                  {importStatus?.success && (
                    <span className="text-[8px] text-emerald-400 font-bold block text-center animate-pulse">
                      ✓ Success! Restarting...
                    </span>
                  )}
                  {importStatus?.error && (
                    <span className="text-[8px] text-rose-400 font-bold block text-center">
                      ✕ {importStatus.error}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Match Controls */}
              <div className="flex flex-col gap-1.5 bg-black/25 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-yellow-300 font-sans font-black uppercase tracking-widest flex items-center gap-1">
                  ⚔️ Area Operations
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <button
                    onClick={restartMatch}
                    className="py-1 px-2 bg-blue-650 hover:bg-blue-500 border-b-2 border-blue-800 text-white font-sans font-black text-[9px] tracking-wider rounded uppercase transition-all cursor-pointer shadow flex items-center justify-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Restart
                  </button>
                  <button
                    onClick={() => {
                      setShowGameSettingsModal(false);
                      onNavigateHome();
                    }}
                    className="py-1 px-2 bg-rose-650 hover:bg-rose-500 border-b-2 border-rose-800 text-white font-sans font-black text-[9px] tracking-wider rounded uppercase transition-all cursor-pointer shadow flex items-center justify-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Quit Map
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Core Area: Left sidebar, Center Canvas Arena, Right sidebar shop cards */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        
        {/* Left Drawer / Selected Inspection detail bar */}
        <div className={`w-full lg:w-72 bg-[var(--app-panel)] border-b lg:border-b-0 lg:border-r-4 border-black/20 p-4 flex flex-col gap-4 text-white shrink-0 overflow-y-auto ${!activePlacedTower ? 'hidden lg:flex' : ''}`}>
          {activePlacedTower ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-405 text-yellow-950 border border-white flex items-center justify-center font-black">
                    {activePlacedTower.type[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white capitalize tracking-tight">{activePlacedTower.type} Monkey</h3>
                    <p className="text-[10px] text-[var(--app-accent)] font-bold uppercase">Targeting Closest Trails</p>
                  </div>
                </div>
                <button
                  id="btn-close-inspect"
                  onClick={() => setSelectedPlacedTowerId(null)}
                  className="p-1 hover:bg-white/10 text-white/80 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats card */}
              <div className="flex flex-col gap-2.5 bg-black/30 p-3 rounded-xl border border-white/10 shadow-inner text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[var(--app-accent)] uppercase font-black">Combat Pops</span>
                    <span className="text-sm font-black text-emerald-400">{activePlacedTower.popCount} Pops</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[var(--app-accent)] uppercase font-black">
                      {activePlacedTower.type === 'hero' ? 'Upgrade Rank' : 'Crosspath Code'}
                    </span>
                    <span className="text-sm font-black text-indigo-300">
                      {activePlacedTower.type === 'hero'
                        ? `Level ${activePlacedTower.level}`
                        : `${activePlacedTower.upgradeLevels ? activePlacedTower.upgradeLevels.join('-') : '0-0-0'}`}
                    </span>
                  </div>
                </div>

                {activePlacedTower.type !== 'farm' && activePlacedTower.type !== 'pool' && (
                  <div className="grid grid-cols-3 gap-1 border-t border-white/10 pt-2 text-center">
                    <div className="bg-white/5 p-1 rounded">
                      <div className="text-[8px] uppercase text-amber-400 font-extrabold leading-tight">Damage</div>
                      <div className="text-xs font-black">{activePlacedTower.damage}</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <div className="text-[8px] uppercase text-cyan-400 font-extrabold leading-tight">Pierce</div>
                      <div className="text-xs font-black">{activePlacedTower.pierce}</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <div className="text-[8px] uppercase text-rose-450 font-extrabold leading-tight">Rate</div>
                      <div className="text-xs font-black">
                        {activePlacedTower.baseCooldown > 1000 ? 'N/A' : `${(60 / activePlacedTower.baseCooldown).toFixed(1)}/s`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Mode buttons */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--app-accent)] uppercase font-black tracking-wider">Target Priority Mode:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['First', 'Last', 'Strong', 'Close'] as TargetMode[]).map((mode) => {
                    const isMode = activePlacedTower.targetMode === mode;
                    return (
                      <button
                        key={mode}
                        id={`target-mode-${mode}`}
                        onClick={() => {
                          activePlacedTower.targetMode = mode;
                          setTriggerPopCountUpdate((t) => t + 1);
                        }}
                        className={`py-1.5 px-2 text-[10px] font-black rounded-lg border uppercase transition-all text-center cursor-pointer ${
                          isMode
                            ? 'bg-blue-500 border-b-2 border-blue-700 text-white font-black shadow'
                            : 'bg-[var(--app-subpanel)]/50 border border-black/20 hover:brightness-110 text-white/80'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upgrades panel */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <span className="text-[10px] text-[var(--app-accent)] uppercase font-black tracking-wider">Ability Enhancements:</span>
                
                {activePlacedTower.type === 'hero' ? (
                   // Hero Leveling display
                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1.5 font-bold">
                      <span className="text-emerald-450 uppercase">XP: {Math.floor(activePlacedTower.heroXp || 0)} / {activePlacedTower.heroMaxXp || 100}</span>
                      <span className="text-[var(--app-accent)]">MAX LV. 20</span>
                    </div>

                    <button
                      id="btn-inspect-upgrade-hero"
                      disabled={cash < Math.round(250 * activePlacedTower.level * 1.2)}
                      onClick={() => upgradeTower(activePlacedTower)}
                      className={`w-full py-2 px-3 text-xs font-black rounded-xl border-b-4 flex justify-between items-center transition-all uppercase ${
                        cash >= Math.round(250 * activePlacedTower.level * 1.2)
                          ? 'bg-yellow-400 hover:bg-yellow-300 border-yellow-700 text-yellow-950 cursor-pointer shadow'
                          : 'bg-[var(--app-subpanel)] text-white/40 border border-black/35 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex flex-col text-left">
                        <span className="font-black text-[11px]">Hero Training</span>
                        <span className="text-[8px] text-yellow-950/70 lowercase font-bold leading-none">Instant Rank-up</span>
                      </span>
                      <span className="font-black text-sm">${Math.round(250 * activePlacedTower.level * 1.2)}</span>
                    </button>
                  </div>
                ) : (
                  // Normal Monkey Upgrades (3 Custom Paths!)
                  (() => {
                    const spec = TOWER_STATS[activePlacedTower.type];
                    const lvls = activePlacedTower.upgradeLevels || [0, 0, 0];
                    const pathLabels = ['Top Path (Damage/Range)', 'Middle Path (Speed/Abils)', 'Bottom Path (Utility/Pierce)'];

                    return (
                      <div className="flex flex-col gap-3">
                        {lvls.map((currentLvl, pIndex) => {
                          const pathLabel = pathLabels[pIndex];
                          const nextUpgrade = spec.upgrades[pIndex][currentLvl];
                          
                          // Rule evaluation
                          let isCompleted = currentLvl >= 5;
                          let isLocked = false;
                          let lockReason = "";

                          const activePathsCount = lvls.filter((l) => l > 0).length;
                          const isCurrentlyActive = currentLvl > 0;

                          if (!isCompleted && nextUpgrade) {
                            if (!isCurrentlyActive && activePathsCount >= 2) {
                              isLocked = true;
                              lockReason = "Locked (Max 2 Paths)";
                            } else if (currentLvl >= 2) {
                              const hasOtherPathAbove2 = lvls.some((l, idx) => idx !== pIndex && l >= 3);
                              if (hasOtherPathAbove2) {
                                isLocked = true;
                                lockReason = "Locked (Capped at T2)";
                              }
                            }
                          }

                          return (
                            <div key={pIndex} className="bg-[var(--app-subpanel)]/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5 shadow-sm">
                              {/* Path Title & Tier Dots */}
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-yellow-300 uppercase tracking-tight">{pathLabel}</span>
                                {/* Dots */}
                                <div className="flex gap-1 inline-flex items-center">
                                  {Array.from({ length: 5 }).map((_, dIdx) => {
                                    const dotNum = dIdx + 1;
                                    const isActive = dotNum <= currentLvl;
                                    const isDotLocked = dotNum > 2 && lvls.some((l, idx) => idx !== pIndex && l >= 3);
                                    
                                    return (
                                      <div
                                        key={dIdx}
                                        className={`w-2 h-2 rounded-full border transition-all ${
                                          isActive
                                            ? 'bg-emerald-450 border-emerald-300'
                                            : isDotLocked
                                            ? 'bg-rose-950/80 border-rose-800/40'
                                            : 'bg-black/40 border-white/10'
                                        }`}
                                        title={isActive ? `Tier ${dotNum} Active` : isDotLocked ? "Locked: Another path is primary" : `Tier ${dotNum}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action area */}
                              {isCompleted ? (
                                <div className="py-1 px-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-center rounded-lg text-[9px] font-black uppercase tracking-wide">
                                  🏆 Path Maxed (Tier 5)
                                </div>
                              ) : isLocked ? (
                                <div className="py-1 px-2 bg-slate-900 border border-rose-900/30 text-rose-350 text-center rounded-lg text-[9px] font-bold uppercase tracking-wide">
                                  🔒 {lockReason}
                                </div>
                              ) : nextUpgrade ? (
                                <div className="flex flex-col gap-1.5 w-full">
                                  {(() => {
                                    const canAfford = cash >= nextUpgrade.cost;
                                    return (
                                      <button
                                        id={`btn-upgrade-p${pIndex}-lvl${currentLvl}`}
                                        disabled={!canAfford}
                                        onClick={() => upgradeTower(activePlacedTower, pIndex)}
                                        className={`w-full py-1.5 px-2 text-[10px] font-black rounded-lg border-b-2 flex justify-between items-center transition-all uppercase cursor-pointer ${
                                          canAfford
                                            ? 'bg-blue-600 hover:bg-blue-500 border-blue-800 text-white shadow'
                                            : 'bg-[var(--app-subpanel)] border border-black/25 text-white/30 cursor-not-allowed'
                                        }`}
                                      >
                                        <span className="flex flex-col text-left max-w-[130px]">
                                          <span className="font-sans font-black text-[9.5px] text-white leading-tight line-clamp-1">{nextUpgrade.name}</span>
                                          <span className="text-[7px] font-bold text-white opacity-80 line-clamp-1 leading-none">{nextUpgrade.description}</span>
                                        </span>
                                        <span className="font-sans font-black text-[10.5px] text-yellow-300 shrink-0">${nextUpgrade.cost}</span>
                                      </button>
                                    );
                                  })()}

                                  {/* Stat Badges for Next Upgrade */}
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {nextUpgrade.effects.damage && (
                                      <span className="text-[7.5px] leading-none bg-amber-950/60 border border-amber-500/40 text-amber-300 px-1 py-0.5 rounded font-black uppercase">
                                        +{nextUpgrade.effects.damage} DMG
                                      </span>
                                    )}
                                    {nextUpgrade.effects.pierce && (
                                      <span className="text-[7.5px] leading-none bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 px-1 py-0.5 rounded font-black uppercase">
                                        +{nextUpgrade.effects.pierce} Pierce
                                      </span>
                                    )}
                                    {nextUpgrade.effects.range && (
                                      <span className="text-[7.5px] leading-none bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 px-1 py-0.5 rounded font-black uppercase">
                                        +{nextUpgrade.effects.range} Range
                                      </span>
                                    )}
                                    {nextUpgrade.effects.cooldownMult && (
                                      <span className="text-[7.5px] leading-none bg-rose-950/60 border border-rose-500/40 text-rose-305 px-1 py-0.5 rounded font-black uppercase">
                                        +{Math.round((1 - nextUpgrade.effects.cooldownMult) * 100)}% Speed
                                      </span>
                                    )}
                                    {nextUpgrade.effects.canSeeCamo && (
                                      <span className="text-[7.5px] leading-none bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-1 py-0.5 rounded font-black uppercase">
                                        👁 Camo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Sell Button */}
              <button
                id="btn-sell-placed-tower"
                onClick={() => sellTower(activePlacedTower)}
                className="w-full mt-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl border-b-4 border-rose-800 transition-all uppercase cursor-pointer"
              >
                Assemble Sell for ${Math.round(activePlacedTower.cost * 0.72)} (72% refund)
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-white/70">
              <Sliders className="w-8 h-8 text-[var(--app-accent)] mb-3 animate-pulse" />
              <h3 className="text-xs font-black uppercase text-white tracking-tight">Inspector Terminal</h3>
              <p className="text-[11px] mt-1 text-white/50 max-w-[180px] leading-relaxed font-bold">
                Click any placed tower on the grid to inspect stats, upgrade tier abilities, change targeting modes, or sell.
              </p>
            </div>
          )}

          {/* Rules/Wave guide inside layout */}
          <div className="mt-auto hidden lg:flex flex-col p-3.5 bg-[var(--app-subpanel)] rounded-xl border border-white/5 text-[11px] text-white/75 gap-2 leading-relaxed">
            <span className="font-black text-white uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" /> Wave Schedule Guide
            </span>
            <div className="flex flex-col gap-1 text-[10px] font-bold uppercase text-white/60">
              <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Reds/Blues</span> <span className="text-white">Wave 1+</span></div>
              <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Greens/Yellows</span> <span className="text-white">Wave 5+</span></div>
              <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Pinks/Ceramics</span> <span className="text-white">Wave 20+</span></div>
              <div className="flex justify-between text-yellow-300 font-black"><span>★ MOAB BOSS blimp</span> <span className="text-yellow-405">Wave 40</span></div>
            </div>
          </div>
        </div>

        {/* Center Sandbox Canvas Game Stage or Battles Split Stages */}
        <div
          id="game-stage-container"
          ref={containerRef}
          className={`flex-1 bg-[var(--app-bg)]/85 relative flex items-center justify-center p-3 overflow-hidden ${
            gameMode === 'sandbox' || gameMode === 'battles2' ? 'flex-col overflow-y-auto' : ''
          }`}
        >
          {gameMode === 'battles2' ? (
            <div className="flex flex-col gap-5 w-full h-full max-w-6xl items-center pb-8">
              {/* Battles 2 Setup / Connection Control Panel */}
              <div className="w-full bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-3 font-sans shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 font-black uppercase text-xs tracking-wider text-cyan-400">
                    <span>🎈</span>
                    <span>Battles 2 Multiplayer Hub</span>
                  </div>
                  {isMultiplayerConnected ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Connected ({mpRole})
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Waiting for Connection
                    </span>
                  )}
                </div>

                {mpStatus && (
                  <div className="text-[10px] text-cyan-300 font-bold bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/25 text-center uppercase tracking-wide">
                    🌐 Status: {mpStatus}
                  </div>
                )}

                {/* Connection Engine Selector */}
                <div className="bg-black/25 rounded-xl border border-white/5 p-2 px-3 flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block">🌍 Server Sync Engine:</span>
                  <div className="flex gap-1.5 p-1 bg-black/40 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setMpEngine('firebase');
                        setMpStatus('');
                      }}
                      className={`flex-1 py-1 px-3 rounded text-[11px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        mpEngine === 'firebase'
                          ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/35 font-extrabold'
                          : 'text-white/40 border border-transparent hover:text-white/70 font-semibold'
                      }`}
                    >
                      🔥 Firebase Realtime Engine
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMpEngine('websocket');
                        setMpStatus('');
                      }}
                      className={`flex-1 py-1 px-3 rounded text-[11px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        mpEngine === 'websocket'
                          ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/35 font-extrabold'
                          : 'text-white/40 border border-transparent hover:text-white/70 font-semibold'
                      }`}
                    >
                      📡 WebSockets Engine
                    </button>
                  </div>
                  <span className="text-[9px] text-white/45 leading-normal">
                    {mpEngine === 'firebase' 
                      ? "⚡ Highly Recommended: Firebase Firestore handles real-time streams across any domain limit (like GitHub Pages or rigid firewalls)."
                      : "🧑‍💻 Developer Option: Localhost:3000 WebSockets. Requires setting up custom secure WebSocket URL if serving from static providers."
                    }
                  </span>
                </div>

                {/* Advanced Server Settings section (WebSockets only) */}
                {mpEngine === 'websocket' && (
                  <div className="bg-black/25 rounded-xl border border-white/5 p-2 px-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50 uppercase font-black tracking-wider flex items-center gap-1">
                        📡 Server Endpoint: <span className="text-cyan-400 font-mono text-[9px] lowercase font-normal">{getMpServerUrl()}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowServerSettings(!showServerSettings)}
                        className="text-[9px] text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider font-bold bg-transparent border-0 cursor-pointer"
                      >
                        {showServerSettings ? 'Hide Config' : 'Configure Server'}
                      </button>
                    </div>
                    {showServerSettings && (
                      <div className="flex flex-col gap-1.5 mt-1 border-t border-white/5 pt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. wss://your-server.com/ws"
                            value={customServerUrl}
                            onChange={(e) => setCustomServerUrl(e.target.value)}
                            className="flex-1 bg-slate-950 border border-white/10 px-2.5 py-1 rounded text-white text-[11px] font-mono focus:outline-none focus:border-cyan-500"
                          />
                          {customServerUrl && (
                            <button
                              type="button"
                              onClick={() => setCustomServerUrl('')}
                              className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 text-[10px] rounded uppercase font-bold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] text-white/40 leading-relaxed">
                          Default fallback is auto-routed to our active cloud container on <code>run.app</code> when played from static domains such as GitHub Pages. Enter a secure WebSockets URL above to override server routing.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!isMultiplayerConnected ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs relative z-30">
                    {/* Column 1: Host Room */}
                    <div className="bg-black/35 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 justify-center">
                      <button
                        id="btn-host-online-room"
                        type="button"
                        onClick={startBattlesHost}
                        className="py-2.5 px-4 bg-cyan-600 border-b-4 border-cyan-800 hover:bg-cyan-500 active:translate-y-0.5 text-white font-black rounded-lg transition-all text-center cursor-pointer uppercase text-xs shadow-md"
                      >
                        🌐 Host Online Room
                      </button>
                      {battlesPeerId && (
                        <div className="text-center mt-1">
                          <span className="text-white/60 font-black uppercase text-[9px] block">YOUR ROOM PIN:</span>
                          <span className="text-xl font-black text-cyan-400 tracking-widest bg-cyan-500/15 px-4 py-1.5 rounded-lg border border-cyan-500/35 inline-block mt-1 font-mono">{battlesPeerId}</span>
                          <span className="text-[9px] text-white/50 block mt-1">Share this PIN with your friend to connect!</span>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Join Room */}
                    <div className="bg-black/35 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5 justify-center">
                      <div className="flex gap-1 flex-row">
                        <input
                          type="text"
                          placeholder="Room PIN"
                          value={battlesJoinCode}
                          onChange={(e) => setBattlesJoinCode(e.target.value)}
                          className="flex-1 min-w-0 bg-slate-950 border border-white/15 px-3 py-1.5 rounded-lg text-white font-black uppercase text-center focus:outline-none focus:border-cyan-500 text-xs"
                        />
                        <button
                          id="btn-join-battles-room"
                          type="button"
                          onClick={() => joinBattlesRoom(battlesJoinCode)}
                          className="py-2.5 px-3 bg-emerald-600 border-b-4 border-emerald-800 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black rounded-lg transition-all cursor-pointer uppercase text-xs shadow-md"
                        >
                          Join PIN
                        </button>
                      </div>
                      <span className="text-[9px] text-white/40 text-center">Standard multiplayer matches require connection. Enter a friend's PIN to fight!</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-emerald-400 font-bold uppercase py-1">
                    Match in progress. Tower placements & upgrading synchronizes automatically across devices!
                  </div>
                )}
              </div>

              {/* DUAL SCREEN ARENAS DISPLAY */}
              <div className="flex flex-col lg:flex-row gap-5 w-full justify-center items-center relative">
                {!isMultiplayerConnected && (
                  <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-white/10 gap-3">
                    <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-3xl animate-bounce mb-1 text-cyan-400">
                      📡
                    </div>
                    <h3 className="text-sm font-black uppercase text-cyan-400 tracking-wider">
                      Waiting for both players to enter room
                    </h3>
                    <p className="text-white/60 text-xs max-w-md leading-relaxed">
                      Please Host an Online Room and share your Peer PIN, or enter your friend's Peer PIN and click Join! Game starting synchronization triggers automatically once both players enter the lobby.
                    </p>
                  </div>
                )}

                {isGamePaused && (
                  <div className="absolute inset-0 z-45 bg-black/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-yellow-500/30 gap-4">
                    <div className="w-20 h-20 bg-yellow-500/10 border-4 border-yellow-500 rounded-full flex items-center justify-center text-4xl animate-pulse text-yellow-400">
                      ⏸️
                    </div>
                    <h2 className="text-2xl font-black uppercase text-yellow-400 tracking-wider">
                      GAME PAUSED
                    </h2>
                    <p className="text-white/80 text-sm max-w-md leading-relaxed font-semibold">
                      The game is paused. Resume when you are ready!
                    </p>
                    <button
                      onClick={() => {
                        setMyPauseVote(false);
                      }}
                      className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-sm rounded-xl border-b-4 border-yellow-700 shadow-xl select-none transition-all cursor-pointer uppercase tracking-wider"
                    >
                      ▶️ Resume Match
                    </button>
                  </div>
                )}

                {!isGamePaused && myPauseVote && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-45 bg-amber-500/90 text-slate-950 border border-amber-405 px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl text-[10px] font-black uppercase tracking-wider animate-bounce select-none">
                    <span className="w-2 h-2 bg-slate-950 rounded-full animate-ping"></span>
                    <span>PAUSE REQUESTED - Waiting for opponent (1/2)</span>
                  </div>
                )}

                {!isGamePaused && opponentPauseVote && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-45 bg-cyan-500/95 text-slate-950 border border-cyan-450 px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl text-[10px] font-black uppercase tracking-wider animate-bounce select-none">
                    <span className="w-2 h-2 bg-slate-950 rounded-full animate-ping"></span>
                    <span>Opponent requested Pause - Click PAUSE to accept!</span>
                  </div>
                )}

                {/* YOUR SCREEN */}
                <div className="flex flex-col gap-1.5 items-center w-full max-w-[480px]">
                  <div className="w-full flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    <span>🛡️ YOUR BOARD</span>
                    <span>LIVES: {lives}</span>
                    <span>CASH: \${cash}</span>
                    <span>ECO: +\${battlesEco}</span>
                  </div>
                  <canvas
                    id="arena-canvas"
                    ref={canvasRef}
                    width={1000}
                    height={1000}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    onClick={handleCanvasClick}
                    className="w-full aspect-square bg-slate-900 border-4 border-emerald-500/50 rounded-2xl cursor-crosshair shadow-2xl block"
                  />
                </div>

                {/* OPPONENT SCREEN */}
                <div className="flex flex-col gap-1.5 items-center w-full max-w-[480px]">
                  <div className="w-full flex justify-between items-center bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-rose-450">
                    <span>🎯 OPPONENT BOARD</span>
                    <span>LIVES: {battlesOpponentLives}</span>
                    <span>CASH: \${battlesOpponentCash}</span>
                    <span>ECO: +\${battlesOpponentEco}</span>
                  </div>
                  <canvas
                    id="opponent-arena-canvas"
                    ref={opponentCanvasRef}
                    width={1000}
                    height={1000}
                    className="w-full aspect-square bg-slate-900 border-4 border-rose-500/50 rounded-2xl cursor-not-allowed shadow-2xl block"
                  />
                </div>
              </div>

              {/* TACTICAL ACTIVE ABILITIES */}
              <div className="w-full flex justify-center">
                {renderTacticalAbilitiesDeck()}
              </div>

              {/* RUSH OPPONENT CONTROLS */}
              <div className="w-full bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl flex flex-col gap-3 font-sans shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-2 gap-1.5 font-display">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    ⚔️ ECO RUSH OPPONENT (SEND BLOON WAVES TO GAIN INCOME & OVERWHELM DEFS)
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] text-white/50 bg-black/35 px-2.5 py-1 rounded-lg border border-white/5">
                    <span>STATUS:</span>
                    {autoSendBloon ? (
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        AUTO STREAMING {autoSendBloon.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">IDLE (CLICK 🔄 AUTO)</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5 w-full">
                  {SENDABLE_BLOONS.map((b) => {
                    const isLocked = round < b.unlockRound;
                    const canAfford = cash >= b.cost;
                    const isAutoActive = autoSendBloon === b.type;

                    return (
                      <div
                        key={b.type}
                        className={`relative rounded-xl border p-1 flex flex-col justify-between transition-all select-none ${
                          isLocked 
                            ? 'bg-slate-950/40 border-slate-900 opacity-50' 
                            : isAutoActive
                              ? 'bg-emerald-950/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Single Send Action Group (Upper Part) */}
                        <button
                          disabled={isLocked || !canAfford}
                          onClick={() => sendBloonToOpponent(b.type)}
                          className={`w-full py-1 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all ${
                            isLocked 
                              ? 'cursor-not-allowed text-white/20' 
                              : canAfford
                                ? 'hover:bg-white/5 active:scale-95 cursor-pointer text-white'
                                : 'opacity-40 cursor-not-allowed text-white'
                          }`}
                        >
                          <span className="text-base">{b.emoji}</span>
                          <span className="text-[9px] font-black tracking-tight leading-none">{b.type}</span>
                          <span className={`text-[8px] font-extrabold ${isLocked ? 'text-slate-500' : 'text-yellow-400'}`}>
                            {isLocked ? `R${b.unlockRound}` : `\$\${b.cost}`}
                          </span>
                        </button>

                        {/* Auto-Send Toggle Button (Lower Part) */}
                        {!isLocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAutoSendBloon(prev => prev === b.type ? null : b.type);
                            }}
                            className={`mt-1 py-0.5 font-sans font-black text-[7.5px] uppercase tracking-wider rounded-md border transition-all cursor-pointer text-center w-full block ${
                              isAutoActive 
                                ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white font-extrabold' 
                                : 'bg-slate-900 hover:bg-slate-800 border-white/5 text-slate-400'
                            }`}
                          >
                            {isAutoActive ? 'ACTIVE' : 'AUTO 🔄'}
                          </button>
                        ) : (
                          <div className="mt-1 py-0.5 text-center text-slate-600 text-[7px] font-mono tracking-wider bg-black/40 rounded-md border border-slate-900">
                            🔒 R{b.unlockRound}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative w-full max-w-2xl aspect-square">
                <canvas
                  id="arena-canvas"
                  ref={canvasRef}
                  width={1000}
                  height={1000}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  onClick={handleCanvasClick}
                  className="w-full h-full bg-slate-900 border-4 border-black/30 rounded-3xl cursor-crosshair shadow-2xl block"
                />
                {isGamePaused && (
                  <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-6 border border-yellow-500/30 gap-4">
                    <div className="w-20 h-20 bg-yellow-500/10 border-4 border-yellow-500 rounded-full flex items-center justify-center text-4xl animate-pulse text-yellow-400">
                      ⏸️
                    </div>
                    <h2 className="text-2xl font-black uppercase text-yellow-400 tracking-wider">
                      GAME PAUSED
                    </h2>
                    <p className="text-white/80 text-sm max-w-md leading-relaxed font-semibold">
                      The game is paused. Resume when you are ready!
                    </p>
                    <button
                      onClick={() => {
                        setMyPauseVote(false);
                      }}
                      className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-sm rounded-xl border-b-4 border-yellow-700 shadow-xl select-none transition-all cursor-pointer uppercase tracking-wider"
                    >
                      ▶️ Resume Match
                    </button>
                  </div>
                )}
              </div>
              {renderTacticalAbilitiesDeck()}
            </div>
          )}

                    {gameMode === 'sandbox' && (
            <div
              id="sandbox-admin-panel"
              className="w-full xl:w-96 bg-slate-950/95 border-4 border-amber-500/35 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 font-sans shrink-0 backdrop-blur text-white border-b-8"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">👩‍🔬</span>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Sandbox Laboratory</span>
                </div>
                <span className="text-[9px] bg-amber-500/10 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest animate-pulse">
                  Creative active
                </span>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-black/25 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSandboxTab('spawn')}
                  className={`py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                    sandboxTab === 'spawn'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎈 Spawn Bloons
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxTab('cheats')}
                  className={`py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                    sandboxTab === 'cheats'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⚡ Cheat Panel
                </button>
              </div>

              {sandboxTab === 'spawn' ? (
                <div className="flex flex-col gap-3">
                  {/* Modifiers checkboxes */}
                  <div className="grid grid-cols-3 gap-1 bg-black/15 p-2 rounded-xl border border-white/5 text-[10px] uppercase font-black">
                    <label className="flex items-center justify-center gap-1.5 cursor-pointer text-blue-300 hover:brightness-110">
                      <input
                        type="checkbox"
                        checked={sandboxCamo}
                        onChange={(e) => setSandboxCamo(e.target.checked)}
                        className="rounded accent-blue-500 cursor-pointer"
                      />
                      <span>Camo</span>
                    </label>
                    <label className="flex items-center justify-center gap-1.5 cursor-pointer text-emerald-300 hover:brightness-110">
                      <input
                        type="checkbox"
                        checked={sandboxRegrow}
                        onChange={(e) => setSandboxRegrow(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span>Regrow</span>
                    </label>
                    <label className="flex items-center justify-center gap-1.5 cursor-pointer text-rose-300 hover:brightness-110">
                      <input
                        type="checkbox"
                        checked={sandboxFortified}
                        onChange={(e) => setSandboxFortified(e.target.checked)}
                        className="rounded accent-rose-500 cursor-pointer"
                      />
                      <span>Fortified</span>
                    </label>
                  </div>

                  {/* Bloons Grid */}
                  <div className="grid grid-cols-3 gap-1.5 overflow-y-auto max-h-56 pr-1 border border-white/5 bg-black/15 p-2 rounded-xl">
                    {[
                      { type: 'Red', emoji: '🔴', colorClass: 'hover:bg-red-500/20 hover:border-red-500/55' },
                      { type: 'Blue', emoji: '🔵', colorClass: 'hover:bg-blue-500/20 hover:border-blue-500/55' },
                      { type: 'Green', emoji: '🟢', colorClass: 'hover:bg-green-500/20 hover:border-green-500/55' },
                      { type: 'Yellow', emoji: '🟡', colorClass: 'hover:bg-yellow-500/20 hover:border-yellow-500/55' },
                      { type: 'Pink', emoji: '🌸', colorClass: 'hover:bg-pink-500/20 hover:border-pink-500/55' },
                      { type: 'Black', emoji: '⚫', colorClass: 'hover:bg-slate-500/20 hover:border-slate-500/55' },
                      { type: 'White', emoji: '⚪', colorClass: 'hover:bg-neutral-200/20 hover:border-neutral-200/55' },
                      { type: 'Purple', emoji: '🟪', colorClass: 'hover:bg-purple-500/20 hover:border-purple-500/55' },
                      { type: 'Lead', emoji: '🌪️', colorClass: 'hover:bg-zinc-600/30 hover:border-zinc-500/55' },
                      { type: 'Zebra', emoji: '🏁', colorClass: 'hover:bg-zinc-400/20 hover:border-zinc-400/55' },
                      { type: 'Rainbow', emoji: '🌈', colorClass: 'hover:bg-indigo-500/20 hover:border-indigo-500/55' },
                      { type: 'Ceramic', emoji: '🧱', colorClass: 'hover:bg-amber-600/20 hover:border-amber-600/55' },
                      { type: 'MOAB', emoji: '🛸', colorClass: 'hover:bg-cyan-500/20 hover:border-cyan-500/55' },
                      { type: 'BFB', emoji: '🎈', colorClass: 'hover:border-red-600 hover:bg-red-600/20' },
                      { type: 'ZOMG', emoji: '🛸', colorClass: 'hover:border-green-600 hover:bg-green-600/20' },
                      { type: 'DDT', emoji: '👾', colorClass: 'hover:border-slate-600 hover:bg-slate-600/20' },
                      { type: 'BAD', emoji: '🦖', colorClass: 'hover:border-purple-600 hover:bg-purple-600/20' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => spawnSingleBloon(item.type, sandboxCamo, sandboxRegrow, sandboxFortified)}
                        className={`p-1.5 bg-slate-900 border border-white/5 rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer ${item.colorClass}`}
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="text-[8px] font-black tracking-wider text-slate-300 uppercase mt-1 truncate max-w-full">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCash((c) => c + 100000);
                      floatingTextsRef.current.push({
                        id: `cash_${Date.now()}`,
                        x: 500,
                        y: 300,
                        text: '+$100,000 Cash',
                        color: '#34d399',
                        life: 30,
                      });
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 font-display font-black tracking-wider text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border-b-4 border-emerald-800 shadow cursor-pointer text-[10px] uppercase italic"
                  >
                    <Coins className="w-3.5 h-3.5" /> Inject +$100,000 Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLives((l) => l + 5000);
                      floatingTextsRef.current.push({
                        id: `lives_${Date.now()}`,
                        x: 500,
                        y: 320,
                        text: '+5,000 Lives',
                        color: '#f87171',
                        life: 30,
                      });
                    }}
                    className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 font-display font-black tracking-wider text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border-b-4 border-rose-800 shadow cursor-pointer text-[10px] uppercase italic"
                  >
                    <Heart className="w-3.5 h-3.5 animate-pulse" /> Inject +5,000 Lives
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      bloonsRef.current = [];
                    }}
                    className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 font-display font-black tracking-wider text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border-b-4 border-indigo-800 shadow cursor-pointer text-[10px] uppercase italic"
                  >
                    <X className="w-3.5 h-3.5" /> Vaporize active Bloons
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      towersRef.current = [];
                      bloonsRef.current = [];
                      projectilesRef.current = [];
                      particlesRef.current = [];
                      setCash(1000000);
                      setLives(100000);
                      setRound(1);
                      roundInProgressRef.current = false;
                      setRoundInProgress(false);
                      setSelectedShopTower(null);
                      setSelectedPlacedTowerId(null);
                    }}
                    className="w-full py-3 px-3 mt-1.5 bg-amber-600 hover:bg-amber-500 font-display font-black tracking-wider text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border-b-4 border-amber-800 shadow cursor-pointer text-[10px] uppercase italic"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Wipe sandbox Board
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Monkey Store (Deploy options list) */}
        <div className="w-full lg:w-80 bg-[var(--app-panel)] border-t lg:border-t-0 lg:border-l border-slate-700/50 p-4 flex flex-col gap-4 text-white shrink-0 overflow-y-auto">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
            Monkey Defense Arsenal
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2.5">
            {/* Deploy Hero card (Limit 1!) */}
            {(() => {
              const actualCost = getTowerCost('hero');
              const canAfford = cash >= actualCost;
              const hasHeroOnGrid = towersRef.current.some((t) => t.type === 'hero');
              const isSelected = selectedShopTower === 'hero';

              return (
                <button
                  id="deploy-card-hero"
                  disabled={hasHeroOnGrid}
                  onClick={() => {
                    setSelectedShopTower(isSelected ? null : 'hero');
                    if (!isSelected) {
                      setSelectedPlacedTowerId(null);
                    }
                  }}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    hasHeroOnGrid
                      ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-[var(--app-accent)] bg-[var(--app-button)]/15 shadow-sm ring-2 ring-[var(--app-accent)]/25'
                      : canAfford
                      ? 'bg-slate-700 border-slate-600 hover:border-slate-500 hover:translate-y-[-1px] shadow-sm'
                      : 'bg-slate-750 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-xs">{heroConfig.name}</span>
                    <span className="text-[8px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-1.5 rounded-full font-bold">HERO</span>
                  </div>

                  {/* Hero Image representation on top of description */}
                  {(() => {
                    const heroEmojis: Record<string, string> = {
                      quincy: '🏹',
                      gwendolin: '🔥',
                      obyn: '🌳',
                    };
                    const emojiValue = heroEmojis[heroConfig.id] || '👑';
                    return (
                      <div className="w-full h-16 rounded-xl mb-1.5 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 border border-white/5 shadow-inner p-1">
                        <div 
                          className="absolute inset-0 opacity-15 blur-sm"
                          style={{ backgroundColor: heroConfig.primaryColor }}
                        />
                        <span className="text-2xl relative z-10 filter drop-shadow-md select-none">
                          {emojiValue}
                        </span>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[7px] text-amber-450 tracking-wide font-black uppercase">
                          Captain
                        </span>
                      </div>
                    );
                  })()}

                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-1 shadow-sm leading-relaxed text-[10px]">{heroConfig.description}</p>
                  
                  {hasHeroOnGrid ? (
                    <span className="text-[9px] text-rose-400 font-bold mt-auto">DEPLOYED</span>
                  ) : (
                    <span className="text-xs font-black text-amber-400 mt-auto flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      {actualCost}
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Standard Towers */}
            {(Object.keys(TOWER_STATS) as TowerType[]).map((type) => {
              const actualCost = getTowerCost(type);
              const canAfford = cash >= actualCost;
              const isSelected = selectedShopTower === type;

              return (
                <button
                  key={type}
                  id={`deploy-card-${type}`}
                  onClick={() => {
                    setSelectedShopTower(isSelected ? null : type);
                    if (!isSelected) {
                      setSelectedPlacedTowerId(null);
                    }
                  }}
                  className={`flex flex-col text-left p-3 rounded-2xl border-4 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[var(--app-accent)] bg-[var(--app-button)] shadow-md ring-2 ring-[var(--app-accent)]/20'
                      : canAfford
                      ? 'bg-[var(--app-button)] border-b-4 border-black/40 hover:brightness-110 hover:translate-y-[-1px] shadow-lg text-white'
                      : 'bg-[var(--app-subpanel)] opacity-60 border border-black/25 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <span className="font-sans font-black text-xs capitalize leading-none mb-1 tracking-tight">{type}</span>

                  {/* Tower Image representation on top of description */}
                  {(() => {
                    const vis = TOWER_VISUALS[type] || { emoji: '🐒', color: '#4b5563', tag: 'Popper Unit' };
                    return (
                      <div className="w-full h-16 rounded-xl mb-1.5 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 border border-white/5 shadow-inner p-1">
                        <div 
                          className="absolute inset-0 opacity-15 blur-sm"
                          style={{ backgroundColor: vis.color }}
                        />
                        <span className="text-2xl relative z-10 filter drop-shadow-md select-none">
                          {vis.emoji}
                        </span>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[7px] text-slate-300 tracking-wide font-black uppercase">
                          {vis.tag}
                        </span>
                      </div>
                    );
                  })()}

                  <p className="text-[9px] text-white/80 leading-normal line-clamp-2 mb-2 flex-1 font-bold">{TOWER_STATS[type].description}</p>
                  
                  <span className="text-xs font-black text-yellow-300 mt-auto flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
                    {actualCost}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--app-panel)] rounded-3xl border-4 border-black/20 max-w-md w-full text-white p-6 relative shadow-2xl">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-yellow-300 flex items-center gap-2 mb-3 uppercase italic">
              <Sliders className="w-5 h-5 text-yellow-400" />
              Bloons Defending Academy
            </h2>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-white/90 font-bold">
              <p>
                Welcome to the battlefield! Your task is to defend the pathways and prevent bloons from leaking. Here is what you need to know:
              </p>
              <div>
                <span className="font-sans font-black text-white uppercase tracking-wider text-[11px] block border-b border-white/10 pb-1 mb-1.5">🔥 Towers Strengths:</span>
                <ul className="list-disc pl-4 mt-1 flex flex-col gap-1">
                  <li><span className="text-white font-black">Dart Monkey:</span> Cheap basic single target piercer.</li>
                  <li><span className="text-white font-black">Tack Shooter:</span> Fires 8 circular spikes. Goldmine in bends!</li>
                  <li><span className="text-white font-black">Sniper Monkey:</span> Global range, perfect for heavy Ceramics.</li>
                  <li><span className="text-white font-black">Bomb Shooter:</span> Splashes damage. Pop groups at once.</li>
                  <li><span className="text-white font-black">Ice Monkey:</span> support freezes groups instantly.</li>
                  <li><span className="text-white font-black">Super Monkey:</span> Infinite firing plasma stream. Elite sponsor.</li>
                </ul>
              </div>

              <div>
                <span className="font-sans font-black text-white uppercase tracking-wider text-[11px] block border-b border-white/10 pb-1 mb-1.5">👑 Heroes:</span>
                <p className="mt-1">
                  Deploy your chosen command Hero! They gain experience points (XP) automatically for pops, leveling up and increasing stats with no extra cost.
                </p>
              </div>

              <div className="p-3 bg-[var(--app-subpanel)] border border-white/10 rounded-xl mt-1 text-[10px] text-white/70 shadow-inner">
                <span className="font-sans font-black text-white block mb-0.5">Note:</span>
                Survival is complete on Round 40. Keep upgrading towers and managing targeting priorities (First, Last, Close, Strong) to survive.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Victory Modal (Wave 40 Beaten!) */}
      {showVictoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-b from-[var(--app-panel)] to-[var(--app-subpanel)] rounded-3xl border-4 border-yellow-400 max-w-sm w-full text-white p-6 relative shadow-2xl text-center flex flex-col gap-4">
            <div className="mx-auto p-4 bg-yellow-400 text-yellow-950 rounded-full shadow-lg border-2 border-white animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-black text-yellow-300 uppercase tracking-tight italic font-sans">
              🏆 Wave 40 Beat!
            </h2>
            <p className="text-xs text-white/90 font-bold leading-relaxed">
              Incredible work! You popped the massive <span className="text-yellow-300 font-sans font-black">MOAB BOSS blimp</span> and successfully defended the landscape!
            </p>

            <div className="bg-black/30 p-3 rounded-2xl border border-white/10 text-[11px] font-bold text-white/80">
              <span className="text-[9px] text-yellow-400 uppercase font-black tracking-widest block mb-0.5">Defenders Bonus Reward</span>
              <span>• Earn +$250 MM Victory Cash!</span><br/>
              <span>• Unlocked Endless Free Play on this Arena!</span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                id="btn-victory-claim"
                onClick={() => {
                  setShowVictoryModal(false);
                  onGameOver(40, 250, totalPopCount); // Returns to lobby with MM rewards
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white font-sans font-black text-xs tracking-wider rounded-xl uppercase transition-all cursor-pointer shadow-lg active:scale-98"
              >
                Claim Victory & Return
              </button>

              <button
                id="btn-victory-freeplay"
                onClick={() => {
                  setFreePlayActive(true);
                  setShowVictoryModal(false);
                  setRound((r) => r + 1); // transition to round 41!
                }}
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 border-b-4 border-yellow-600 text-yellow-950 font-sans font-black text-xs tracking-wider rounded-xl uppercase transition-all cursor-pointer shadow-md active:scale-98"
              >
                🌌 Continue in Free Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
