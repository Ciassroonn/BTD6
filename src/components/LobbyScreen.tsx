import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameMap, HeroConfig, Difficulty, HeroType } from '../types';
import { MAPS, HEROES } from '../gameData';
import { Trophy, ShoppingBag, Coins, Play, Sparkles, MapPin, Layers, Award, Settings, LogOut } from 'lucide-react';
import { AVATARS } from './AccountScreen';
import { MiniMapPreview } from './MiniMapPreview';

interface LobbyScreenProps {
  monkeyMoney: number;
  unlockedMapIds: string[];
  onStartGame: (mapId: string, hero: HeroType, difficulty: Difficulty, gameMode: 'campaign' | 'endless' | 'sandbox' | 'battles2') => void;
  onNavigateToShop: () => void;
  onNavigateToAchievements: () => void;
  onNavigateToSettings: () => void;
  activeAccountName?: string | null;
  activeAvatarId?: string | null;
  onLogoutAccount?: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  monkeyMoney,
  unlockedMapIds,
  onStartGame,
  onNavigateToShop,
  onNavigateToAchievements,
  onNavigateToSettings,
  activeAccountName = 'Guest Account',
  activeAvatarId = 'guest',
  onLogoutAccount,
}) => {

  const [selectedMapId, setSelectedMapId] = useState<string>('monkey_meadow');
  const [selectedHero, setSelectedHero] = useState<HeroType>('quincy');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [selectedGameMode, setSelectedGameMode] = useState<'campaign' | 'endless' | 'sandbox' | 'battles2'>('campaign');

  // Multi-computer save storage states
  const selectedMap = MAPS.find((m) => m.id === selectedMapId) || MAPS[0];
  const currentHero = HEROES.find((h) => h.id === selectedHero) || HEROES[0];

  const activeAvatar = AVATARS.find(a => a.id === activeAvatarId);
  const avatarEmoji = activeAvatar ? activeAvatar.emoji : '🎮';
  const avatarBg = activeAvatar ? activeAvatar.bgColor : 'bg-indigo-600';

  const handleStart = () => {
    onStartGame(selectedMapId, selectedHero, selectedDifficulty, selectedGameMode);
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'grass': return '🌸 Grassy Meadow';
      case 'desert': return '🏜️ Desert Sandstorm';
      case 'space': return '🌌 Hyperspace Void';
      case 'water': return '🌊 Forest Wetlands';
      case 'volcano': return '🌋 Scorched Lava';
      default: return '📍 Arena Path';
    }
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[var(--app-bg)] text-white font-sans overflow-y-auto duration-200 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Top Navigation Row */}
      <div className="bg-[var(--app-header)] border-b-4 border-black/20 px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-4 shadow-lg z-10 text-white duration-200 transition-colors">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-2.5 bg-emerald-605 text-white rounded-2xl border-2 border-white/20 shadow-md flex items-center justify-center"
            animate={{ 
              rotate: [0, 12, -12, 12, 0],
              scale: [1, 1.12, 0.95, 1.12, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4.5, 
              ease: "easeInOut" 
            }}
          >
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display uppercase italic">
              Bloons TD <span className="text-[var(--app-accent)]">6 Arcade</span>
            </h1>
            <p className="text-[11px] text-white/80 font-semibold uppercase tracking-wide">Place elite monkey towers, unleash heroes, defend the track!</p>
          </div>
        </div>

        {/* Active Account Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-2xl border border-white/10 shadow-inner transition-colors">
          <motion.span 
            className={`w-9 h-9 rounded-lg ${avatarBg} text-xl flex items-center justify-center border border-white/10 shadow-sm`}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5.5, 
              ease: "easeInOut" 
            }}
          >
            {avatarEmoji}
          </motion.span>
          <div className="text-left leading-none">
            <p className="text-[8px] uppercase font-bold text-white/50 tracking-wider">Account</p>
            <h3 className="text-xs font-black uppercase text-white tracking-tight mt-0.5">{activeAccountName}</h3>
          </div>
          {onLogoutAccount && (
            <button
              onClick={onLogoutAccount}
              className="ml-2.5 px-2 py-1 bg-black/20 hover:bg-rose-950 hover:text-rose-400 border border-white/5 rounded-lg text-white/40 hover:border-rose-900 transition-colors cursor-pointer text-[9px] font-bold uppercase flex items-center gap-1 shadow-sm"
              title="Log out / Switch Account"
            >
              <LogOut className="w-2.5 h-2.5" />
              <span>Swap</span>
            </button>
          )}
        </div>

        {/* Buttons and MM */}
        <div className="flex items-center gap-3.5 flex-wrap justify-center">
          <button
            id="btn-goto-achievements"
            onClick={onNavigateToAchievements}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--app-button)] hover:brightness-110 text-white font-black text-xs rounded-xl border-b-4 border-black/30 shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4 text-white" />
            Milestones
          </button>

          <button
            id="btn-goto-shop"
            onClick={onNavigateToShop}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--app-button)] hover:brightness-110 text-white font-black text-xs rounded-xl border-b-4 border-black/30 shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            Academy Shop
          </button>

          <button
            id="btn-goto-settings"
            onClick={onNavigateToSettings}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-black text-xs rounded-xl border-b-4 border-neutral-900 shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            <Settings className="w-4 h-4 text-white" />
            Settings
          </button>

          <div className="flex items-center gap-1.5 px-4 py-2 bg-black/30 border-2 border-white/25 text-[var(--app-accent)] font-sans font-black text-xs rounded-full shadow-inner uppercase tracking-wider">
            <Coins className="w-4 h-4 text-[var(--app-accent)]" />
            <span>{monkeyMoney} MM</span>
          </div>
        </div>
      </div>

      {/* Main Panel - Split columns with theme-powered panels */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Map selection */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/20 shadow-xl flex flex-col gap-4 text-white transition-colors duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white font-display flex items-center gap-2 uppercase tracking-tight">
                <MapPin className="w-5 h-5 text-[var(--app-accent)]" />
                Select Battle Map (At Least 5 Arenas)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MAPS.map((m) => {
                const isSelected = m.id === selectedMapId;
                return (
                  <motion.button
                    key={m.id}
                    id={`map-select-${m.id}`}
                    onClick={() => setSelectedMapId(m.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`flex flex-col text-left p-4 rounded-2xl border-4 transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-[var(--app-accent)] bg-[var(--app-subpanel)] shadow-lg ring-2 ring-[var(--app-accent)]/30'
                        : 'border-black/20 bg-black/10 hover:bg-black/25'
                    }`}
                  >
                    {/* Dynamic Map Vector Image Preview on Top */}
                    <MiniMapPreview map={m} isActive={isSelected} className="mb-3.5 shadow-md border-b-2 border-black/30" />

                    <div className="flex justify-between items-center mb-1.5 w-full">
                      <span className="font-sans font-black text-white text-sm uppercase tracking-tight">{m.name}</span>
                      <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-black/30 border border-white/20 text-[var(--app-accent)]">
                        {m.theme}
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px] leading-relaxed mb-3 line-clamp-2">
                      {m.description}
                    </p>
                    <div className="mt-auto flex justify-between items-center text-[10px] text-white/50 font-black w-full uppercase">
                      <span>{getThemeLabel(m.theme)}</span>
                      <span className={isSelected ? 'text-[var(--app-accent)]' : 'text-white/40'}>
                        {isSelected ? '★ Selected' : 'Click to Select'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/20 shadow-xl flex flex-col gap-4 text-white transition-colors duration-200">
            <h2 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-white/60" />
              Campaign Difficulty & Challenge Scale
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['Easy', 'Medium', 'Hard', 'CHIMPS'] as Difficulty[]).map((dif) => {
                const getColors = () => {
                  if (dif === 'Easy') return { bg: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 hover:border-emerald-750', border: 'border-emerald-800' };
                  if (dif === 'Medium') return { bg: 'bg-blue-600 hover:bg-blue-500 border-blue-800 hover:border-blue-750', border: 'border-blue-800' };
                  if (dif === 'Hard') return { bg: 'bg-rose-600 hover:bg-rose-500 border-rose-800 hover:border-rose-750', border: 'border-rose-800' };
                  return { bg: 'bg-neutral-850 hover:bg-neutral-800 border-neutral-950 hover:border-neutral-900', border: 'border-neutral-950' };
                };
                const config = getColors();
                const isSelected = selectedDifficulty === dif;

                return (
                  <button
                    key={dif}
                    id={`diff-select-${dif}`}
                    onClick={() => setSelectedDifficulty(dif)}
                    className={`py-3 px-1.5 rounded-xl text-xs font-black font-sans transition-all border-b-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[58px] ${
                      isSelected
                        ? `${config.bg} text-white shadow-lg ${config.border} -translate-y-0.5`
                        : 'bg-black/20 border-2 border-black/20 text-white/65 hover:bg-black/35 hover:text-white border-b-4'
                    }`}
                  >
                    <span>{dif.toUpperCase()}</span>
                    <div className={`text-[8.5px] mt-0.5 font-bold leading-normal ${isSelected ? 'text-white' : 'text-white/40'}`}>
                      {dif === 'Easy' && '200 HP • 40 Rounds'}
                      {dif === 'Medium' && '150 HP • 60 Rounds'}
                      {dif === 'Hard' && '100 HP • 80 Rounds'}
                      {dif === 'CHIMPS' && '1 HP • 100 Rounds'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Hero & Summary Launcher */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Hero Selection */}
          <div className="bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/20 shadow-xl flex flex-col gap-4 text-white transition-colors duration-200">
            <h2 className="text-lg font-black text-white font-display flex items-center gap-2 uppercase tracking-tight">
              <Award className="w-5 h-5 text-[var(--app-accent)]" />
              Commanding Hero
            </h2>

            <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-2 border border-white/10">
              {HEROES.map((h) => {
                const isSelected = h.id === selectedHero;
                return (
                  <button
                    key={h.id}
                    id={`hero-tab-${h.id}`}
                    onClick={() => setSelectedHero(h.id)}
                    className={`flex-1 py-1 px-1 text-xs font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                      isSelected
                        ? 'bg-[var(--app-accent)] text-white shadow border-b-2 border-black/30 font-black'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {h.name}
                  </button>
                );
              })}
            </div>

            {/* Selected Hero Showcase */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-md border-2 border-white"
                  style={{ backgroundColor: currentHero.primaryColor }}
                >
                  {currentHero.name[0]}
                </div>
                <div>
                  <h3 className="font-sans font-black text-[var(--app-accent)] uppercase tracking-tight text-sm">{currentHero.name}</h3>
                  <p className="text-[10px] text-white/70 font-bold italic">"{currentHero.quote}"</p>
                </div>
              </div>

              <p className="text-white/80 text-xs leading-relaxed">
                {currentHero.description}
              </p>

              {/* Levels / Perk list */}
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-white/10">
                <span className="text-[10px] font-black text-[var(--app-accent)] uppercase tracking-widest">Level Progression Traits:</span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {currentHero.perks.map((p) => (
                    <div key={p.level} className="flex gap-2 items-start text-xs text-white/80 animate-fade-in">
                      <span className="font-black text-[var(--app-accent)]">Lv.{p.level}:</span>
                      <span>{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Launcher Panel */}
          <div className="bg-[var(--app-subpanel)] p-6 rounded-3xl text-white shadow-xl flex flex-col gap-5 border-4 border-black/20 transition-colors duration-200">
            <h3 className="text-base font-black tracking-wide text-[var(--app-accent)] uppercase font-display">Arena Checklist</h3>
            <div className="flex flex-col gap-3 text-xs text-white/75">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="font-bold text-white/50">MAP TARGET</span>
                <span className="font-black text-white uppercase">{selectedMap.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="font-bold text-white/50">STARTING CAPTAIN</span>
                <span className="font-black text-white uppercase">{currentHero.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5 border-none!">
                <span className="font-bold text-white/50">SURVIVAL TARGET</span>
                <span className={`font-black uppercase ${selectedGameMode === 'endless' ? 'text-purple-300' : selectedGameMode === 'sandbox' ? 'text-amber-300 animate-pulse' : selectedGameMode === 'battles2' ? 'text-cyan-405' : 'text-rose-450'}`}>
                  {selectedGameMode === 'endless' ? 'Infinite (Endless Freeplay)' : selectedGameMode === 'sandbox' ? 'Testing (Sandbox Sandbox)' : selectedGameMode === 'battles2' ? 'Defeat Opponent (Battles 2!)' : 'Round 40 (MOAB BOSS)'}
                </span>
              </div>
              <div className="flex justify-between pb-1.5">
                <span className="font-bold text-white/50">SCALE TIER</span>
                <span className="font-black text-emerald-400 uppercase">{selectedDifficulty}</span>
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <span className="text-[10px] font-black text-white/65 uppercase tracking-widest text-center">Select Game Mode</span>
              <div className="grid grid-cols-4 gap-1 p-1 bg-black/25 rounded-xl border border-white/5">
                <button
                  id="mode-select-campaign"
                  type="button"
                  onClick={() => setSelectedGameMode('campaign')}
                  className={`py-2 px-0.5 text-[8px] font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                    selectedGameMode === 'campaign'
                      ? 'bg-[var(--app-accent)] text-white font-black shadow border-b-2 border-black/35'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🏆 Campaign
                </button>
                <button
                  id="mode-select-endless"
                  type="button"
                  onClick={() => setSelectedGameMode('endless')}
                  className={`py-2 px-0.5 text-[8px] font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                    selectedGameMode === 'endless'
                      ? 'bg-[var(--app-accent)] text-white font-black shadow border-b-2 border-black/35'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🌌 Endless
                </button>
                <button
                  id="mode-select-sandbox"
                  type="button"
                  onClick={() => setSelectedGameMode('sandbox')}
                  className={`py-2 px-0.5 text-[8px] font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                    selectedGameMode === 'sandbox'
                      ? 'bg-[var(--app-accent)] text-white font-black shadow border-b-2 border-black/35'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🧪 Sandbox
                </button>
                <button
                  id="mode-select-battles2"
                  type="button"
                  onClick={() => setSelectedGameMode('battles2')}
                  className={`py-2 px-0.5 text-[8px] font-black rounded-lg transition-all text-center cursor-pointer uppercase ${
                    selectedGameMode === 'battles2'
                      ? 'bg-cyan-600 text-white font-black shadow border-b-2 border-black/35'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎈 Battles 2
                </button>
              </div>
            </div>

            <button
              id="btn-launch-game"
              onClick={handleStart}
              className="mt-2 w-full py-4 bg-[var(--app-button)] hover:brightness-110 text-white font-display font-black tracking-wide rounded-2xl flex items-center justify-center gap-2 border-b-4 border-black/35 shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer text-sm uppercase italic"
            >
              <Play className="w-5 h-5 fill-current text-white" />
              Start Deployment
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

