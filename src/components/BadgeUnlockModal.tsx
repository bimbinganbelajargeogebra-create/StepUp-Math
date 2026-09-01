import React, { useEffect } from 'react';
import { Award, Sparkles, X, ChevronRight, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BadgeDefinition } from '../types';
import { BADGE_TIER_COLORS } from '../data/badgesData';

interface BadgeUnlockModalProps {
  unlockedBadges: BadgeDefinition[];
  onClose: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  unlockedBadges,
  onClose
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  if (!unlockedBadges || unlockedBadges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="badge-unlock-popup-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-300 dark:border-amber-700/80 text-center space-y-5 relative overflow-hidden"
      >
        {/* Glow background accent */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Milestone Badge Icon & Header */}
        <div className="space-y-2">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 dark:from-amber-500 dark:to-yellow-300 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mx-auto border-2 border-white dark:border-slate-800 animate-bounce">
            {unlockedBadges[0].icon}
          </div>

          <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lencana Baru Terbuka!</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Selamat! Milestone Tercapai!
          </h2>
        </div>

        {/* Badges List */}
        <div className="space-y-3">
          {unlockedBadges.map((badge) => {
            const tierTheme = BADGE_TIER_COLORS[badge.tier] || BADGE_TIER_COLORS.bronze;
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 ${tierTheme.bg} ${tierTheme.border}`}
              >
                <div className="text-3xl shrink-0 p-1">
                  {badge.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {badge.title}
                    </h3>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-white/80 dark:bg-slate-900/80 ${tierTheme.text}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="claim-badge-reward-btn"
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer active:scale-95"
        >
          <span>Klaim &amp; Terus Belajar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
