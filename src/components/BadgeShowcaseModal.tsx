import React, { useState } from 'react';
import { 
  Award, 
  X, 
  Sparkles, 
  Flame, 
  Target, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Star,
  ChevronRight,
  TrendingUp,
  Crown
} from 'lucide-react';
import { BadgeDefinition, UnlockedBadge, StudentProfile, WorksheetSessionResult, LevelProgress, ReflectionJournalEntry } from '../types';
import { BADGE_DEFINITIONS, BADGE_TIER_COLORS, getBadgeProgress } from '../data/badgesData';

interface BadgeShowcaseModalProps {
  profile: StudentProfile | null;
  sessions: WorksheetSessionResult[];
  levelProgress: Record<string, LevelProgress>;
  journals: ReflectionJournalEntry[];
  unlockedBadges: UnlockedBadge[];
  onClose: () => void;
}

export const BadgeShowcaseModal: React.FC<BadgeShowcaseModalProps> = ({
  profile,
  sessions,
  levelProgress,
  journals,
  unlockedBadges,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectBadge, setInspectBadge] = useState<BadgeDefinition | null>(null);

  const unlockedMap = new Map<string, UnlockedBadge>();
  unlockedBadges.forEach(b => unlockedMap.set(b.badgeId, b));

  const totalBadges = BADGE_DEFINITIONS.length;
  const earnedCount = unlockedBadges.length;
  const progressPercent = Math.round((earnedCount / totalBadges) * 100);

  const categories = [
    { id: 'all', label: 'Semua Lencana' },
    { id: 'worksheets', label: 'Kuantitas Lembar' },
    { id: 'streak', label: 'Konsistensi (Streak)' },
    { id: 'accuracy', label: 'Akurasi & Kecepatan' },
    { id: 'mastery', label: 'Penguasaan Level' },
    { id: 'journal', label: 'Jurnal Refleksi' },
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? BADGE_DEFINITIONS 
    : BADGE_DEFINITIONS.filter(b => b.category === selectedCategory || (selectedCategory === 'accuracy' && (b.category === 'accuracy' || b.category === 'speed')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="badge-showcase-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Lencana &amp; Milestone Pencapaian
                </h2>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/40">
                  {earnedCount}/{totalBadges} Terbuka
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dapatkan lencana penghargaan saat menyelesaikan target latihan dan konsistensi belajar.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-badge-showcase-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Bar Card */}
        <div className="p-4 sm:p-5 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="w-full sm:w-auto space-y-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Kemajuan Koleksi Lencana Belajar
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Setiap pencapaian membuktikan kedisiplinan dan kemandirian belajar matematikamu.
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">{earnedCount} dari {totalBadges} Diraih</span>
              <span className="text-slate-700 dark:text-slate-300">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              id={`badge-cat-${cat.id}-btn`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredBadges.map(badge => {
              const unlockedRecord = unlockedMap.get(badge.id);
              const isUnlocked = Boolean(unlockedRecord);
              const progress = getBadgeProgress(badge, profile, sessions, levelProgress, journals);
              const tierTheme = BADGE_TIER_COLORS[badge.tier] || BADGE_TIER_COLORS.bronze;

              return (
                <div
                  key={badge.id}
                  id={`badge-item-${badge.id}`}
                  onClick={() => setInspectBadge(badge)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-md'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  {/* Top row: Icon & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                      isUnlocked 
                        ? `${tierTheme.bg} ${tierTheme.border}` 
                        : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 grayscale'
                    }`}>
                      {badge.icon}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Diraih
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Terkunci
                        </span>
                      )}
                      
                      <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${tierTheme.bg} ${tierTheme.text}`}>
                        {badge.tier}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="mt-3 space-y-1 flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress bar towards badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">
                        Progres: {progress.current} / {progress.target} {badge.unit}
                      </span>
                      <span className={isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                        {progress.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnlocked ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Capai <strong>100 Lembar Kerja</strong> dan <strong>7 Hari Streak</strong> untuk meraih gelar kehormatan!</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Inspect Detail Badge Modal */}
      {inspectBadge && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-4xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800 shadow-sm">
              {inspectBadge.icon}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                Kategori: {inspectBadge.categoryLabel}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                {inspectBadge.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {inspectBadge.description}
              </p>
            </div>

            {/* Target Criteria */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500 dark:text-slate-400">Target Pencapaian:</span>
                <span className="text-slate-900 dark:text-white">{inspectBadge.targetValue} {inspectBadge.unit}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500 dark:text-slate-400">Tingkatan (Tier):</span>
                <span className="text-amber-600 dark:text-amber-400 uppercase">{inspectBadge.tier}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectBadge(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
