import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserAccount, ThemeColors } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../gameData';
import { User, Plus, Trash2, Key, Check, Users, Sparkles, Coins, Trophy, Clock, ArrowRight, CornerDownRight } from 'lucide-react';

export interface AvatarSpec {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
}

export const AVATARS: AvatarSpec[] = [
  { id: 'dart', name: 'Dart Monkey', emoji: '🐒', bgColor: 'bg-amber-600' },
  { id: 'super', name: 'Super Monkey', emoji: '🦸', bgColor: 'bg-indigo-600' },
  { id: 'wizard', name: 'Wizard Monkey', emoji: '🧙', bgColor: 'bg-purple-600' },
  { id: 'ninja', name: 'Ninja Monkey', emoji: '🥷', bgColor: 'bg-zinc-800' },
  { id: 'tack', name: 'Tack Shooter', emoji: '⚙️', bgColor: 'bg-slate-500' },
  { id: 'bomb', name: 'Bomb Specialist', emoji: '💣', bgColor: 'bg-neutral-800' },
  { id: 'ice', name: 'Ice Emperor', emoji: '🥶', bgColor: 'bg-sky-500' },
  { id: 'quincy', name: 'Quincy Arrow', emoji: '🏹', bgColor: 'bg-orange-500' },
  { id: 'gwendolin', name: 'Gwendolin Pyrex', emoji: '🔥', bgColor: 'bg-red-500' },
  { id: 'obyn', name: 'Obyn Greenfoot', emoji: '🌳', bgColor: 'bg-emerald-600' },
];

interface AccountScreenProps {
  accounts: UserAccount[];
  currentAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  onCreateAccount: (username: string, avatarId: string) => void;
  onDeleteAccount: (accountId: string) => void;
  onPlayAsGuest: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  accounts,
  currentAccountId,
  onSelectAccount,
  onCreateAccount,
  onDeleteAccount,
  onPlayAsGuest,
}) => {
  const [showSignup, setShowSignup] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('dart');
  const [errorMsg, setErrorMsg] = useState('');

  const activeAvatar = AVATARS.find(a => a.id === selectedAvatarId) || AVATARS[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setErrorMsg('Cadet name cannot be empty!');
      return;
    }
    if (trimmed.length > 15) {
      setErrorMsg('Cadet name must be 15 characters or less!');
      return;
    }
    if (accounts.some(acc => acc.username.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Name already taken! Try another tag.');
      return;
    }

    onCreateAccount(trimmed, selectedAvatarId);
    setNewUsername('');
    setSelectedAvatarId('dart');
    setErrorMsg('');
    setShowSignup(false);
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[var(--app-bg)] text-white font-sans overflow-y-auto items-center justify-center p-4 sm:p-8 duration-200 transition-colors"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2 mb-2 animate-fade-in">
          <div className="p-4 bg-emerald-600 text-white rounded-full border-4 border-white shadow-xl animate-bounce">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tight italic text-emerald-400 drop-shadow-md font-display">
            Monkey Academy
          </h1>
          <p className="text-sm font-black uppercase text-white/90 tracking-widest bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
            Cadet Credentials Portal
          </p>
          <p className="text-xs text-white/70 max-w-md mt-1">
            Create custom accounts, track individual achievements, unlock upgrades in the shop, and design unique custom themes!
          </p>
        </div>

        {/* Outer Panel Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-white">
          
          {/* Main Account Area - 7 cols on desktop */}
          <div className="md:col-span-7 bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/25 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h2 className="text-lg font-black uppercase tracking-tight font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Active Cadets ({accounts.length})
              </h2>
              
              {!showSignup && (
                <button
                  id="btn-trigger-signup"
                  onClick={() => {
                    setShowSignup(true);
                    setErrorMsg('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-550 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase border-b-2 border-emerald-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Cadet
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/25 border border-red-500/50 p-3 rounded-xl text-xs font-bold text-red-200">
                ⚠️ {errorMsg}
              </div>
            )}

            {showSignup ? (
              /* SIGNUP / PROFILE CREATION FORM */
              <form onSubmit={handleCreate} className="flex flex-col gap-4 animate-fade-in bg-black/15 p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-white/60">Cadet Nickname / Profile Tag</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter cadet name..."
                    className="px-4 py-2.5 bg-black/30 border-2 border-white/10 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-white/30"
                    maxLength={15}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black tracking-wider text-white/60">Select Cadet Class / Avatar</label>
                  
                  {/* Selected Character Preview */}
                  <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 mb-1.5">
                    <span className={`w-12 h-12 rounded-xl ${activeAvatar.bgColor} text-2xl flex items-center justify-center border-2 border-white/20 shadow-md`}>
                      {activeAvatar.emoji}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">{activeAvatar.name}</h4>
                      <p className="text-[10px] text-white/50 uppercase font-black">Selected Battle Class Representative</p>
                    </div>
                  </div>

                  {/* Avatar Grids */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {AVATARS.map((av) => {
                      const isChosen = av.id === selectedAvatarId;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatarId(av.id)}
                          className={`relative group aspect-square rounded-xl ${av.bgColor} text-xl flex items-center justify-center border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            isChosen 
                              ? 'border-emerald-400 ring-4 ring-emerald-500/25' 
                              : 'border-white/10 hover:border-white/40'
                          }`}
                          title={av.name}
                        >
                          <span>{av.emoji}</span>
                          {isChosen && (
                            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border border-white shadow">
                              <Check className="w-2.5 h-2.5 font-bold" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white font-black text-xs rounded-xl shadow border-b-4 border-emerald-800 cursor-pointer uppercase transition-all tracking-wide"
                  >
                    Deploy Cadet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignup(false);
                      setErrorMsg('');
                    }}
                    className="px-4 py-2.5 bg-black/25 hover:bg-black/35 text-white/80 font-black text-xs rounded-xl cursor-pointer border border-white/10 uppercase transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* ACCOUNT LISTINGS */
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {accounts.length === 0 ? (
                  <div className="text-center py-10 bg-black/10 border border-white/5 rounded-2xl flex flex-col items-center gap-2">
                    <User className="w-8 h-8 text-white/30" />
                    <p className="text-xs font-black text-white/50 uppercase tracking-wide">No Custom Cadets Found</p>
                    <p className="text-[10px] text-white/45 max-w-[250px] leading-relaxed">
                      Create your brand new user profile to save and accumulate permanent shop upgrades and combat trophies!
                    </p>
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isSelected = acc.id === currentAccountId;
                    const avatar = AVATARS.find(a => a.id === acc.avatarId) || AVATARS[0];
                    const unlockedAchs = acc.achievements.filter(a => a.isUnlocked).length;

                    return (
                      <div
                        key={acc.id}
                        onClick={() => onSelectAccount(acc.id)}
                        className={`group relative flex items-center justify-between p-4 rounded-2xl border-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--app-subpanel)] border-[var(--app-accent)] shadow-[0_0_15px_rgba(250,204,21,0.25)] ring-2 ring-[var(--app-accent)]/20'
                            : 'bg-black/15 border-black/10 hover:bg-black/25 hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Avatar Indicator */}
                          <div className={`w-11 h-11 rounded-xl ${avatar.bgColor} text-2xl flex items-center justify-center border-2 border-white/15 shadow-inner`}>
                            {avatar.emoji}
                          </div>

                          {/* Account Info */}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-sans font-black text-sm uppercase text-white tracking-tight">{acc.username}</h3>
                              {isSelected && (
                                <span className="bg-emerald-600 text-white font-black text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wider leading-none">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-white/60 text-[10px] font-black uppercase">
                              <span className="flex items-center gap-0.5 text-emerald-400">
                                <Coins className="w-3 h-3 text-emerald-400" />
                                {acc.monkeyMoney} MM
                              </span>
                              <span className="flex items-center gap-0.5 text-emerald-400">
                                <Trophy className="w-3 h-3 text-emerald-400" />
                                {unlockedAchs}/{acc.achievements.length}
                              </span>
                              <span className="text-white/40 font-normal">
                                joined {new Date(acc.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions on hover/right */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectAccount(acc.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 font-black text-[10px] rounded-lg uppercase tracking-wide transition-all border-b-2 hover:scale-103 shadow-sm ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-550 border-emerald-800 text-white cursor-pointer'
                                : 'bg-black/35 border-black/50 text-white/80 cursor-pointer'
                            }`}
                          >
                            <span>Deploy</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete Cadet ${acc.username} and wipe their persistent progression? Data cannot be recovered.`)) {
                                onDeleteAccount(acc.id);
                              }
                            }}
                            className="p-1 px-1.5 bg-black/15 hover:bg-rose-950 hover:text-rose-400 border border-white/5 rounded-lg text-white/30 hover:border-rose-900 transition-colors cursor-pointer"
                            title="Delete custom cadet profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick-facts and Guest access - 5 cols on desktop */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Quick Play as Guest */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl border-4 border-indigo-500/35 shadow-xl text-center flex flex-col items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold uppercase italic tracking-wide text-white text-base font-display">Quick-Launch Arena</h3>
                <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed font-sans">
                  Want to practice defense instantly? Tap below to play with temporary progression in active Guest-Session mode.
                </p>
              </div>

              <button
                id="btn-play-guest"
                onClick={onPlayAsGuest}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 border-b-4 border-indigo-700 text-white font-black font-display tracking-wider text-xs rounded-xl transition-all cursor-pointer hover:scale-[1.02] uppercase active:scale-98 animate-pulse"
              >
                Launch Offline Guest-Mode
              </button>
            </div>

            {/* Profile sync guide */}
            <div className="bg-black/25 border-4 border-black/20 p-5 rounded-3xl flex flex-col gap-3 text-xs leading-relaxed text-white/80">
              <h4 className="font-extrabold uppercase text-white/90 text-[10px] tracking-widest flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                Academy Cadet Rules
              </h4>
              <ul className="list-disc pl-4 space-y-2 text-white/70 text-[10.5px]">
                <li>Upgrades unlocked in the shop apply uniquely per Cadet.</li>
                <li>Conquer Round 40 standard campaigns to earn bonus Monkey Money.</li>
                <li>Customized color themes are remembered specifically for each Account.</li>
                <li>Swap Cadet Accounts anytime from the settings or main top navigation bar.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};
