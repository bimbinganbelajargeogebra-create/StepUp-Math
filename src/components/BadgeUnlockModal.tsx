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
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="badge-unlock-popup-card"
        className="w-full max-w-md clay-card rounded-[32px] p-6 sm:p-7 text-center space-y-5 relative overflow-hidden"
      >
        {/* Glow ambient clay accent */}
        <div className="clay-orb w-48 h-48 -top-16 -left-16 bg-amber-400/25 pointer-events-none" />
        <div className="clay-orb w-48 h-48 -bottom-16 -right-16 bg-indigo-500/25 pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl clay-btn-secondary text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Milestone Badge Icon & Header */}
        <div className="space-y-2">
          <div className="w-20 h-20 clay-btn-amber rounded-3xl flex items-center justify-center text-4xl shadow-xl mx-auto animate-bounce">
            {unlockedBadges[0].icon}
          </div>

          <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-xs tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Lencana Baru Terbuka!</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                className={`p-4 rounded-2xl text-left flex items-start gap-3.5 clay-card-sm ${tierTheme.border}`}
              >
                <div className="text-3xl shrink-0 p-1">
                  {badge.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {badge.title}
                    </h3>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tierTheme.bg} ${tierTheme.text}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-medium">
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
          className="w-full py-4 clay-btn text-white font-black rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
        >
          <span>Klaim &amp; Terus Belajar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
