import React, { useState, useEffect } from 'react';
import { HeroType, Difficulty, Achievement, PersistentUpgrade, ThemeColors, UserAccount } from './types';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { ShopScreen } from './components/ShopScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AccountScreen } from './components/AccountScreen';
import { INITIAL_ACHIEVEMENTS, PERSISTENT_UPGRADES } from './gameData';
import { playLevelUp } from './audio';
import { Trophy, Coins, Skull } from 'lucide-react';

const DEFAULT_THEME: ThemeColors = {
  bg: '#000000',
  header: '#09090b',
  panel: '#18181b',
  subpanel: '#27272a',
  accent: '#a1a1aa',
  button: '#3f3f46',
};

export default function App() {
  // Navigation: 'accounts' | 'lobby' | 'playing' | 'shop' | 'achievements' | 'settings'
  const [screen, setScreen] = useState<'accounts' | 'lobby' | 'playing' | 'shop' | 'achievements' | 'settings'>('accounts');

  // Accounts state
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);

  // Theme customizable colors state
  const [themeColors, setThemeColors] = useState<ThemeColors>(DEFAULT_THEME);

  // Persistence Variables (localStorage backed)
  const [monkeyMoney, setMonkeyMoney] = useState<number>(350); // Starting balance
  const [purchasedUpgradeIds, setPurchasedUpgradeIds] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // Game session parameters
  const [selectedMapId, setSelectedMapId] = useState<string>('monkey_meadow');
  const [selectedHero, setSelectedHero] = useState<HeroType>('quincy');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [selectedGameMode, setSelectedGameMode] = useState<'campaign' | 'endless' | 'sandbox' | 'battles2'>('campaign');

  // GameOver Status popup modal state
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    roundsCompleted: number;
    moneyEarned: number;
    totalPopped: number;
  } | null>(null);

  // Cross-Computer save import handler (imports into active account, or as guest)
  const handleImportSave = (code: string): boolean => {
    try {
      const raw = decodeURIComponent(escape(atob(code)));
      const saveObj = JSON.parse(raw);
      if (saveObj && typeof saveObj === 'object') {
        const mm = parseInt(saveObj.monkey_money || '350', 10);
        const perks = JSON.parse(saveObj.purchased_perks || '[]');
        const achs = JSON.parse(saveObj.achievements || '[]');

        updateAccountStats(mm, perks, achs);
        return true;
      }
    } catch (e) {
      console.error('Failed to parse save string:', e);
    }
    return false;
  };

  // Initialize Accounts on mount
  useEffect(() => {
    try {
      // Load accounts registry
      const storedSecs = localStorage.getItem('btd_accounts');
      let loadedAccounts: UserAccount[] = [];
      if (storedSecs) {
        try {
          loadedAccounts = JSON.parse(storedSecs);
          setAccounts(loadedAccounts);
        } catch (e) {}
      }

      // Check for active login session
      const activeId = localStorage.getItem('btd_current_account_id');
      if (activeId === 'guest') {
        // Log in as Guest automatically
        setCurrentAccountId(null);
        
        const storedMoney = localStorage.getItem('btd_monkey_money');
        if (storedMoney !== null) {
          setMonkeyMoney(parseInt(storedMoney, 10));
        }
        const storedUpgrades = localStorage.getItem('btd_purchased_perks');
        if (storedUpgrades !== null) {
          setPurchasedUpgradeIds(JSON.parse(storedUpgrades));
        }
        const storedAchievements = localStorage.getItem('btd_achievements');
        if (storedAchievements !== null) {
          setAchievements(JSON.parse(storedAchievements));
        } else {
          setAchievements(INITIAL_ACHIEVEMENTS);
        }
        const storedTheme = localStorage.getItem('btd_theme_colors');
        if (storedTheme !== null) {
          setThemeColors(JSON.parse(storedTheme));
        }
        setScreen('lobby');
      } else if (activeId) {
        // Log in as saved Account profile
        const found = loadedAccounts.find(a => a.id === activeId);
        if (found) {
          setCurrentAccountId(activeId);
          setMonkeyMoney(found.monkeyMoney);
          setPurchasedUpgradeIds(found.purchasedUpgradeIds);
          setAchievements(found.achievements);
          if (found.themeColors) {
            setThemeColors(found.themeColors);
          } else {
            setThemeColors(DEFAULT_THEME);
          }
          setScreen('lobby');
        } else {
          setScreen('accounts');
        }
      } else {
        setScreen('accounts');
      }
    } catch (e) {
      console.warn('Initial load failed, defaulting to Accounts portal:', e);
      setScreen('accounts');
    }
  }, []);

  // Account switching / login handler
  const handleSelectAccount = (accountId: string | null) => {
    if (accountId === null) {
      // Guest mode
      setCurrentAccountId(null);
      localStorage.setItem('btd_current_account_id', 'guest');

      const storedMoney = localStorage.getItem('btd_monkey_money') || '350';
      setMonkeyMoney(parseInt(storedMoney, 10));
      const storedUpgrades = localStorage.getItem('btd_purchased_perks') || '[]';
      setPurchasedUpgradeIds(JSON.parse(storedUpgrades));
      const storedAchievements = localStorage.getItem('btd_achievements') || JSON.stringify(INITIAL_ACHIEVEMENTS);
      setAchievements(JSON.parse(storedAchievements));
      const storedTheme = localStorage.getItem('btd_theme_colors') || JSON.stringify(DEFAULT_THEME);
      setThemeColors(JSON.parse(storedTheme));
      setScreen('lobby');
    } else {
      // Find account
      const found = accounts.find(a => a.id === accountId);
      if (found) {
        setCurrentAccountId(accountId);
        localStorage.setItem('btd_current_account_id', accountId);

        setMonkeyMoney(found.monkeyMoney);
        setPurchasedUpgradeIds(found.purchasedUpgradeIds);
        setAchievements(found.achievements);
        if (found.themeColors) {
          setThemeColors(found.themeColors);
        } else {
          setThemeColors(DEFAULT_THEME);
        }
        setScreen('lobby');
      }
    }
  };

  // Profile creation handler
  const handleCreateAccount = (username: string, avatarId: string) => {
    const newId = 'cadet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newAccount: UserAccount = {
      id: newId,
      username,
      avatarId,
      createdAt: new Date().toISOString(),
      monkeyMoney: 350,
      purchasedUpgradeIds: [],
      achievements: INITIAL_ACHIEVEMENTS,
      themeColors: DEFAULT_THEME,
    };

    const nextAccounts = [...accounts, newAccount];
    setAccounts(nextAccounts);
    localStorage.setItem('btd_accounts', JSON.stringify(nextAccounts));

    // Sign in immediately on the new profile
    setCurrentAccountId(newId);
    localStorage.setItem('btd_current_account_id', newId);
    setMonkeyMoney(newAccount.monkeyMoney);
    setPurchasedUpgradeIds(newAccount.purchasedUpgradeIds);
    setAchievements(newAccount.achievements);
    setThemeColors(newAccount.themeColors);
    setScreen('lobby');
  };

  // Profile deletion handler
  const handleDeleteAccount = (accountId: string) => {
    const nextAccounts = accounts.filter(a => a.id !== accountId);
    setAccounts(nextAccounts);
    localStorage.setItem('btd_accounts', JSON.stringify(nextAccounts));

    if (currentAccountId === accountId) {
      setCurrentAccountId(null);
      localStorage.removeItem('btd_current_account_id');
      setScreen('accounts');
    }
  };

  // Unified progression persistence updater supporting accounts and guests
  const updateAccountStats = (
    nextMoney?: number,
    nextUpgrades?: string[],
    nextAchs?: Achievement[],
    nextColors?: ThemeColors
  ) => {
    // 1. Update React local states
    if (nextMoney !== undefined) {
      setMonkeyMoney(nextMoney);
      if (currentAccountId === null) {
        localStorage.setItem('btd_monkey_money', nextMoney.toString());
      }
    }
    if (nextUpgrades !== undefined) {
      setPurchasedUpgradeIds(nextUpgrades);
      if (currentAccountId === null) {
        localStorage.setItem('btd_purchased_perks', JSON.stringify(nextUpgrades));
      }
    }
    if (nextAchs !== undefined) {
      setAchievements(nextAchs);
      if (currentAccountId === null) {
        localStorage.setItem('btd_achievements', JSON.stringify(nextAchs));
      }
    }
    if (nextColors !== undefined) {
      setThemeColors(nextColors);
      if (currentAccountId === null) {
        localStorage.setItem('btd_theme_colors', JSON.stringify(nextColors));
      }
    }

    // 2. Persist into accounts database if piloting a Cadet profile
    if (currentAccountId) {
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === currentAccountId) {
          return {
            ...acc,
            monkeyMoney: nextMoney !== undefined ? nextMoney : acc.monkeyMoney,
            purchasedUpgradeIds: nextUpgrades !== undefined ? nextUpgrades : acc.purchasedUpgradeIds,
            achievements: nextAchs !== undefined ? nextAchs : acc.achievements,
            themeColors: nextColors !== undefined ? nextColors : acc.themeColors,
          };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      localStorage.setItem('btd_accounts', JSON.stringify(updatedAccounts));
    }
  };

  // Buy Persistent Upgrade
  const handlePurchaseUpgrade = (id: string) => {
    const item = PERSISTENT_UPGRADES.find((u) => u.id === id);
    if (!item) return;

    if (monkeyMoney >= item.cost && !purchasedUpgradeIds.includes(id)) {
      const nextMoney = monkeyMoney - item.cost;
      const nextUpgrades = [...purchasedUpgradeIds, id];

      updateAccountStats(nextMoney, nextUpgrades);
      playLevelUp();
    }
  };

  // Refund Shop upgrades (100% full refund)
  const handleResetUpgrades = () => {
    let refundTotal = 0;
    purchasedUpgradeIds.forEach((id) => {
      const spec = PERSISTENT_UPGRADES.find((u) => u.id === id);
      if (spec) refundTotal += spec.cost;
    });

    const nextMoney = monkeyMoney + refundTotal;
    updateAccountStats(nextMoney, []);
    playLevelUp();
  };

  // Claim Completed Achievements
  const handleClaimAchievement = (id: string, reward: number) => {
    const updated = achievements.map((ach) => {
      if (ach.id === id) {
        return { ...ach, isUnlocked: true };
      }
      return ach;
    });

    updateAccountStats(monkeyMoney + reward, undefined, updated);
  };

  // Start campaign match callback
  const handleStartGame = (mapId: string, hero: HeroType, diff: Difficulty, mode: 'campaign' | 'endless' | 'sandbox') => {
    setSelectedMapId(mapId);
    setSelectedHero(hero);
    setSelectedDifficulty(diff);
    setSelectedGameMode(mode);
    setScreen('playing');
  };

  // Game Overs (Defeats or survive victories!)
  const handleGameOver = (roundsCompleted: number, moneyEarned: number, totalPopped: number) => {
    setGameResult({
      roundsCompleted,
      moneyEarned,
      totalPopped,
    });
    setScreen('lobby');
    setShowGameOverModal(true);

    // Save earned Monkey Money
    updateAccountStats(monkeyMoney + moneyEarned);

    // Sync progress counters for achievements
    syncAchievementsPostGame(roundsCompleted, totalPopped);
  };

  // Sync Achievements post match
  const syncAchievementsPostGame = (rounds: number, poppedCount: number) => {
    const updated = achievements.map((ach) => {
      const nAch = { ...ach };
      if (nAch.id === 'pop_1000') {
        nAch.progress = Math.min(nAch.maxProgress, nAch.progress + poppedCount);
      }
      if (nAch.id === 'pop_10000') {
        nAch.progress = Math.min(nAch.maxProgress, nAch.progress + poppedCount);
      }
      if (nAch.id === 'round_40' && rounds >= 40) {
        nAch.progress = nAch.maxProgress;
      }
      return nAch;
    });

    updateAccountStats(undefined, undefined, updated);
  };

  // Profile Logout handler
  const handleLogout = () => {
    setCurrentAccountId(null);
    localStorage.removeItem('btd_current_account_id');
    setScreen('accounts');
  };

  // Read current active persistent enhancements properties
  const getStartingCashBonusValue = (): number => {
    return purchasedUpgradeIds.includes('extra_starting_cash') ? 150 : 0;
  };

  const getDiscountPercentValue = (): number => {
    return purchasedUpgradeIds.includes('btd_discount') ? 8 : 0;
  };

  const getExtraLivesBonusValue = (): number => {
    return purchasedUpgradeIds.includes('extra_lives') ? 30 : 0;
  };

  const getHeroXpRateBonusValue = (): number => {
    return purchasedUpgradeIds.includes('hero_mentorship') ? 1.3 : 1.0;
  };

  const activeProfile = currentAccountId ? accounts.find(a => a.id === currentAccountId) : null;

  const styleVars = {
    '--app-bg': themeColors.bg,
    '--app-header': themeColors.header,
    '--app-panel': themeColors.panel,
    '--app-subpanel': themeColors.subpanel,
    '--app-accent': themeColors.accent,
    '--app-button': themeColors.button,
  } as React.CSSProperties;

  return (
    <div style={styleVars} className="min-h-screen bg-[var(--app-bg)] text-slate-800 font-sans antialiased transition-colors duration-200">
      
      {screen === 'accounts' && (
        <AccountScreen
          accounts={accounts}
          currentAccountId={currentAccountId}
          onSelectAccount={handleSelectAccount}
          onCreateAccount={handleCreateAccount}
          onDeleteAccount={handleDeleteAccount}
          onPlayAsGuest={() => handleSelectAccount(null)}
        />
      )}

      {screen === 'lobby' && (
        <LobbyScreen
          monkeyMoney={monkeyMoney}
          unlockedMapIds={['monkey_meadow', 'in_the_loop', 'cubism', 'logs', 'scorched_crater']} // all standard maps immediately testable!
          onStartGame={handleStartGame}
          onNavigateToShop={() => setScreen('shop')}
          onNavigateToAchievements={() => setScreen('achievements')}
          onNavigateToSettings={() => setScreen('settings')}
          activeAccountName={activeProfile?.username || 'Guest Pilot'}
          activeAvatarId={activeProfile?.avatarId || 'guest'}
          onLogoutAccount={handleLogout}
        />
      )}

      {screen === 'playing' && (
        <GameScreen
          mapId={selectedMapId}
          heroType={selectedHero}
          difficulty={selectedDifficulty}
          gameMode={selectedGameMode}
          startingCashBonus={getStartingCashBonusValue()}
          discountPercent={getDiscountPercentValue()}
          extraLivesBonus={getExtraLivesBonusValue()}
          heroXpRateBonus={getHeroXpRateBonusValue()}
          onGameOver={handleGameOver}
          onNavigateHome={() => setScreen('lobby')}
          themeColors={themeColors}
          onChangeTheme={(colors) => updateAccountStats(undefined, undefined, undefined, colors)}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          monkeyMoney={monkeyMoney}
          purchasedUpgradeIds={purchasedUpgradeIds}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onResetUpgrades={handleResetUpgrades}
          onBackToLobby={() => setScreen('lobby')}
        />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen
          achievements={achievements}
          monkeyMoney={monkeyMoney}
          onClaimReward={handleClaimAchievement}
          onBackToLobby={() => setScreen('lobby')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          monkeyMoney={monkeyMoney}
          themeColors={themeColors}
          onChangeTheme={(colors) => updateAccountStats(undefined, undefined, undefined, colors)}
          onBackToLobby={() => setScreen('lobby')}
          onImportSave={handleImportSave}
          onResetAllProgress={() => updateAccountStats(350, [], INITIAL_ACHIEVEMENTS)}
        />
      )}

      {/* Campaign Complete / Match GameOver Summary Dialog Modal */}
      {showGameOverModal && gameResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--app-panel)] text-white rounded-3xl border-4 border-black/25 max-w-sm w-full p-6 text-center shadow-2xl flex flex-col gap-5">
            {gameResult.roundsCompleted >= 40 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[var(--app-accent)] text-yellow-950 rounded-full border-2 border-white shadow-lg shadow-black/20 animate-bounce">
                  <Trophy className="w-12 h-12" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight font-display uppercase italic">Arena Defended! Victory!</h1>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed">Outstanding! You successfully conquered Wave 40 and shut down the boss bloon!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-rose-600 text-white rounded-full border-2 border-white shadow-lg shadow-rose-900/10">
                  <Skull className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight font-display uppercase italic">Campaign Defeated</h1>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed">Balloons overwhelmed your defense line. Adjust your strategy and try again!</p>
              </div>
            )}

            {/* Metrics Breakdown list */}
            <div className="grid grid-cols-3 gap-2 bg-[var(--app-subpanel)] p-4 rounded-xl border border-white/5 shadow-inner">
              <div className="flex flex-col items-center border-r border-white/5">
                <span className="text-[8px] text-white/50 font-black uppercase tracking-wider leading-none">Rounds</span>
                <span className="text-base font-black text-white font-mono mt-1">{gameResult.roundsCompleted}</span>
              </div>
              <div className="flex flex-col items-center border-r border-white/5">
                <span className="text-[8px] text-white/50 font-black uppercase tracking-wider leading-none">Popped</span>
                <span className="text-base font-black text-white font-mono mt-1">{gameResult.totalPopped}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-white/50 font-black uppercase tracking-wider leading-none">Rewards</span>
                <span className="text-base font-black text-[var(--app-accent)] font-mono mt-1">+{gameResult.moneyEarned} MM</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                id="btn-close-gameover"
                onClick={() => setShowGameOverModal(false)}
                className="w-full py-3 bg-[var(--app-button)] hover:brightness-110 text-white font-sans font-black text-xs tracking-wider rounded-xl border-b-4 border-black/35 shadow-md uppercase transition-all active:scale-98 cursor-pointer"
              >
                Return to Lobby
              </button>
              
              <button
                id="btn-goto-shop-from-gameover"
                onClick={() => {
                  setShowGameOverModal(false);
                  setScreen('shop');
                }}
                className="w-full py-2.5 bg-black/30 hover:bg-black/50 text-white border border-white/10 hover:border-white/20 font-sans font-black text-[10px] uppercase tracking-wide rounded-xl shadow-inner transition-colors cursor-pointer"
              >
                Spend Earnings in Academy Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
