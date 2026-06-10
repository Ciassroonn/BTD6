import React from 'react';
import { motion } from 'motion/react';
import { PersistentUpgrade } from '../types';
import { PERSISTENT_UPGRADES } from '../gameData';
import { Coins, Shield, Award, Zap, Sparkles, Undo, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';

interface ShopScreenProps {
  monkeyMoney: number;
  purchasedUpgradeIds: string[];
  onPurchaseUpgrade: (id: string) => void;
  onResetUpgrades: () => void;
  onBackToLobby: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  monkeyMoney,
  purchasedUpgradeIds,
  onPurchaseUpgrade,
  onResetUpgrades,
  onBackToLobby,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Economy':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'Monkeys':
        return <Sparkles className="w-5 h-5 text-blue-500" />;
      case 'Hero':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[var(--app-bg)] text-white font-sans overflow-y-auto duration-200 transition-colors"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Shop Header */}
      <div className="sticky top-0 bg-[var(--app-header)] border-b-4 border-black/20 z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg text-white duration-200 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-yellow-950 rounded-xl border-2 border-white shadow-sm">
            <ShoppingBag className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display uppercase italic">Monkey Academy Shop</h1>
            <p className="text-[11px] text-white/80 font-semibold uppercase tracking-wide">Spend Monkey Money on persistent advantages for the battlefield</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Money display */}
          <div className="flex items-center gap-2 bg-black/30 text-[var(--app-accent)] border-2 border-white/20 font-sans px-4 py-2 rounded-full font-black shadow-inner uppercase text-[12px] tracking-wider">
            <Coins className="w-5 h-5 animate-pulse text-[var(--app-accent)]" />
            <span id="shop-monkey-money" className="text-sm">{monkeyMoney} MM</span>
          </div>

          {/* Refund Button */}
          {purchasedUpgradeIds.length > 0 && (
            <button
              id="btn-refund-upgrades"
              onClick={onResetUpgrades}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-rose-150 hover:text-white bg-rose-600 hover:bg-rose-500 rounded-lg border-b-2 border-rose-800 transition-all uppercase cursor-pointer"
              title="Refund all purchases with full refund"
            >
              <Undo className="w-3.5 h-3.5" />
              Reset Perks
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERSISTENT_UPGRADES.map((upgrade) => {
            const isOwned = purchasedUpgradeIds.includes(upgrade.id);
            const canAfford = monkeyMoney >= upgrade.cost;

            return (
              <div
                key={upgrade.id}
                id={`shop-item-${upgrade.id}`}
                className={`relative flex flex-col p-5 bg-[var(--app-panel)] rounded-2xl border-4 transition-all duration-200 ${
                  isOwned
                    ? 'border-emerald-500 shadow-xl bg-emerald-950/20'
                    : 'border-black/25 hover:border-black/45 hover:shadow-2xl'
                }`}
              >
                {/* Category tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-black/20 border border-white/10 rounded-full text-xs font-black text-white/80 uppercase tracking-tight">
                    {getCategoryIcon(upgrade.category)}
                    <span>{upgrade.category}</span>
                  </div>
                  {isOwned && (
                    <div className="flex items-center gap-1 text-emerald-300 text-xs font-black bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ACTIVE
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-sans font-black text-white uppercase tracking-tight text-lg mb-1.5">{upgrade.name}</h3>
                <p className="text-white/80 text-xs leading-relaxed flex-1 mb-5">{upgrade.description}</p>

                {/* Action panel at the bottom */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-wider">Acquisition Cost</span>
                    <div className="flex items-center gap-1 text-[var(--app-accent)] text-sm font-black uppercase">
                      <Coins className="w-4 h-4 text-[var(--app-accent)]" />
                      <span>{upgrade.cost} MM</span>
                    </div>
                  </div>

                  {isOwned ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-black text-xs rounded-xl flex items-center gap-1 uppercase"
                    >
                      <span>Acquired</span>
                    </button>
                  ) : (
                    <button
                      id={`btn-buy-${upgrade.id}`}
                      disabled={!canAfford}
                      onClick={() => onPurchaseUpgrade(upgrade.id)}
                      className={`px-4 py-2 font-black text-xs rounded-xl flex items-center gap-1 transition-all border-b-4 uppercase ${
                        canAfford
                          ? 'bg-yellow-400 hover:bg-yellow-350 hover:border-yellow-500 text-yellow-950 cursor-pointer border-yellow-750 font-black'
                          : 'bg-black/35 text-white/30 cursor-not-allowed border-black/30'
                      }`}
                    >
                      <span>Unlock</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back navigation */}
        <div className="flex justify-center mt-4">
          <button
            id="btn-shop-back"
            onClick={onBackToLobby}
            className="px-8 py-3 bg-[var(--app-button)] hover:brightness-110 text-white tracking-wide font-sans font-black rounded-2xl border-b-4 border-black/35 shadow-xl hover:scale-102 active:scale-98 transition-all uppercase cursor-pointer italic text-sm"
          >
            Return to Arena Lobby
          </button>
        </div>
      </div>
    </motion.div>
  );

};
