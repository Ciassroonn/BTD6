import React from 'react';
import { motion } from 'motion/react';
import { Achievement } from '../types';
import { Trophy, Gift, CheckCircle2, Lock, Flame } from 'lucide-react';
import { playLevelUp } from '../audio';

interface AchievementsScreenProps {
  achievements: Achievement[];
  monkeyMoney: number;
  onClaimReward: (id: string, reward: number) => void;
  onBackToLobby: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  achievements,
  monkeyMoney,
  onClaimReward,
  onBackToLobby,
}) => {
  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[var(--app-bg)] text-white font-sans overflow-y-auto duration-200 transition-colors"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[var(--app-header)] border-b-4 border-black/20 z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg text-white duration-200 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-yellow-950 rounded-xl border-2 border-white shadow-sm">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display uppercase italic">Strategic Milestones</h1>
            <p className="text-[11px] text-white/80 font-semibold uppercase tracking-wide">Track and claim special rewards for achieving combat milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/30 border-2 border-white/20 text-[var(--app-accent)] font-sans px-4 py-2 rounded-full font-black shadow-inner uppercase text-[12px] tracking-wider">
          <Gift className="w-5 h-5 animate-bounce text-[var(--app-accent)]" />
          <span>Balance: {monkeyMoney} MM</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {achievements.map((ach) => {
            const isCompleted = ach.progress >= ach.maxProgress;
            const progressPercent = Math.min(100, (ach.progress / ach.maxProgress) * 100);

            return (
              <div
                key={ach.id}
                id={`ach-item-${ach.id}`}
                className={`flex flex-col p-5 bg-[var(--app-panel)] border-4 rounded-2xl transition-all duration-200 ${
                  ach.isUnlocked
                    ? 'border-emerald-500 bg-emerald-950/10'
                    : isCompleted
                    ? 'border-[var(--app-accent)] shadow-xl bg-orange-400/5'
                    : 'border-black/20 bg-black/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-sans font-black text-white text-base uppercase tracking-tight">{ach.title}</h3>
                    <p className="text-white/80 text-xs mt-1 leading-relaxed">{ach.description}</p>
                  </div>
                  <div className={`p-2 rounded-lg border-2 ${
                    ach.isUnlocked 
                      ? 'bg-emerald-955/40 border-emerald-500 text-emerald-300' 
                      : isCompleted 
                      ? 'bg-yellow-955/40 border-[var(--app-accent)] text-[var(--app-accent)] animate-bounce' 
                      : 'bg-black/20 border-white/15 text-white/35'
                  }`}>
                    {ach.isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCompleted ? (
                      <Flame className="w-5 h-5 animate-pulse text-[var(--app-accent)]" />
                    ) : (
                      <Lock className="w-5 h-5 text-white/35" />
                    )}
                  </div>
                </div>

                {/* Progress bar state */}
                <div className="mt-auto pt-3">
                  <div className="flex justify-between items-center text-xs font-black text-white/60 mb-1.5 uppercase tracking-wide">
                    <span>Progress</span>
                    <span>{Math.floor(ach.progress)} / {ach.maxProgress}</span>
                  </div>
                  <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all duration-550 ${
                        ach.isUnlocked 
                          ? 'bg-emerald-500' 
                          : isCompleted 
                          ? 'bg-emerald-400' 
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%`, backgroundColor: ach.isUnlocked ? '#10b981' : isCompleted ? '#34d399' : '#3b82f6' }}
                    />
                  </div>

                  {/* Claim Button */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs text-white/60 flex items-center gap-1 uppercase font-black">
                      <span>Reward:</span>
                      <span className="text-[var(--app-accent)]">+{ach.rewardValue} MM</span>
                    </div>

                    {ach.isUnlocked ? (
                      <span className="text-xs font-black text-emerald-450 bg-emerald-950/40 border border-emerald-500/25 px-2.5 py-1 rounded">CLAIMED</span>
                    ) : isCompleted ? (
                      <button
                        id={`btn-claim-${ach.id}`}
                        onClick={() => {
                          playLevelUp();
                          onClaimReward(ach.id, ach.rewardValue);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-550 border-b-2 border-emerald-800 text-xs text-white font-black rounded-lg transition-all shadow uppercase tracking-wider cursor-pointer"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-[10px] font-black text-white/30 bg-black/20 px-2.5 py-1 rounded">LOCKED</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back navigation */}
        <div className="flex justify-center mt-6">
          <button
            id="btn-achievements-back"
            onClick={onBackToLobby}
            className="px-8 py-3 bg-[var(--app-button)] hover:brightness-110 text-white tracking-wide font-sans font-black border-b-4 border-black/35 rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all uppercase cursor-pointer italic text-sm"
          >
            Return to Arena Lobby
          </button>
        </div>
      </div>
    </motion.div>
  );
};
