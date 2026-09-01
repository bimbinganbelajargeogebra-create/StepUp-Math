import { BadgeDefinition, BadgeId, StudentProfile, LevelProgress, WorksheetSessionResult, UnlockedBadge, ReflectionJournalEntry } from '../types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Worksheets Quantity Milestones
  {
    id: 'first_step',
    title: 'Langkah Pertama',
    category: 'worksheets',
    categoryLabel: 'Kuantitas Lembar',
    description: 'Menyelesaikan lembar kerja pertama dengan mandiri.',
    icon: '🌱',
    tier: 'bronze',
    targetValue: 1,
    unit: 'Lembar'
  },
  {
    id: 'first_ten',
    title: 'Langkah Awal Tangguh',
    category: 'worksheets',
    categoryLabel: 'Kuantitas Lembar',
    description: 'Menyelesaikan 10 lembar kerja matematika berjenjang.',
    icon: '🎯',
    tier: 'bronze',
    targetValue: 10,
    unit: 'Lembar'
  },
  {
    id: 'quarter_century',
    title: 'Penjelajah Angka',
    category: 'worksheets',
    categoryLabel: 'Kuantitas Lembar',
    description: 'Menuntaskan 25 lembar kerja latihan.',
    icon: '⚡',
    tier: 'silver',
    targetValue: 25,
    unit: 'Lembar'
  },
  {
    id: 'half_century',
    title: 'Pejuang Ketekunan',
    category: 'worksheets',
    categoryLabel: 'Kuantitas Lembar',
    description: 'Menuntaskan 50 lembar kerja latihan.',
    icon: '🔥',
    tier: 'gold',
    targetValue: 50,
    unit: 'Lembar'
  },
  {
    id: 'centurion_100',
    title: 'Centurion 100 Lembar',
    category: 'worksheets',
    categoryLabel: 'Kuantitas Lembar',
    description: 'Milestone Agung! Menyelesaikan total 100 lembar kerja.',
    icon: '👑',
    tier: 'diamond',
    targetValue: 100,
    unit: 'Lembar'
  },

  // Consistency & Streak Milestones
  {
    id: 'streak_3',
    title: 'Disiplin Awal',
    category: 'streak',
    categoryLabel: 'Konsistensi Belajar',
    description: 'Belajar secara rutin selama 3 hari berturut-turut.',
    icon: '🔥',
    tier: 'bronze',
    targetValue: 3,
    unit: 'Hari'
  },
  {
    id: 'streak_7',
    title: 'Disiplin Mingguan (7 Hari)',
    category: 'streak',
    categoryLabel: 'Konsistensi Belajar',
    description: 'Konsisten belajar setiap hari selama 1 minggu penuh (7 hari).',
    icon: '🌟',
    tier: 'gold',
    targetValue: 7,
    unit: 'Hari'
  },
  {
    id: 'streak_14',
    title: 'Ketekunan 2 Pekan',
    category: 'streak',
    categoryLabel: 'Konsistensi Belajar',
    description: 'Menjaga ritme belajar 14 hari tanpa jeda.',
    icon: '🚀',
    tier: 'platinum',
    targetValue: 14,
    unit: 'Hari'
  },
  {
    id: 'streak_30',
    title: 'Master Konsistensi (30 Hari)',
    category: 'streak',
    categoryLabel: 'Konsistensi Belajar',
    description: 'Disiplin belajar 30 hari berturut-turut tanpa putus.',
    icon: '🏆',
    tier: 'diamond',
    targetValue: 30,
    unit: 'Hari'
  },

  // Accuracy & Speed
  {
    id: 'perfect_score',
    title: 'Ketelitian Sempurna',
    category: 'accuracy',
    categoryLabel: 'Akurasi & Kecepatan',
    description: 'Meraih skor sempurna 100 pada lembar kerja.',
    icon: '💯',
    tier: 'bronze',
    targetValue: 1,
    unit: 'Sempurna'
  },
  {
    id: 'perfect_10',
    title: 'Akurasi Maestro 10x',
    category: 'accuracy',
    categoryLabel: 'Akurasi & Kecepatan',
    description: 'Meraih skor 100 sebanyak 10 kali pada lembar kerja.',
    icon: '💎',
    tier: 'platinum',
    targetValue: 10,
    unit: 'Sempurna'
  },
  {
    id: 'speed_demon',
    title: 'Kecepatan Kilat',
    category: 'speed',
    categoryLabel: 'Akurasi & Kecepatan',
    description: 'Meraih skor 100 dengan durasi di bawah 50% target SCT.',
    icon: '⚡',
    tier: 'gold',
    targetValue: 1,
    unit: 'Lembar'
  },

  // Mastery
  {
    id: 'level_master',
    title: 'Penguasa Level',
    category: 'mastery',
    categoryLabel: 'Penguasaan Kurikulum',
    description: 'Lulus menguasai (Mastered) minimal 1 Level Kumon.',
    icon: '🏅',
    tier: 'gold',
    targetValue: 1,
    unit: 'Level'
  },
  {
    id: 'multi_master',
    title: 'Trilogia Master',
    category: 'mastery',
    categoryLabel: 'Penguasaan Kurikulum',
    description: 'Lulus menguasai 3 Level Kurikulum secara berjenjang.',
    icon: '🎖️',
    tier: 'diamond',
    targetValue: 3,
    unit: 'Level'
  },

  // Journal & Reflection
  {
    id: 'journal_starter',
    title: 'Penulis Reflektif',
    category: 'journal',
    categoryLabel: 'Jurnal Belajar',
    description: 'Menuliskan catatan refleksi belajar pertamamu di sistem.',
    icon: '✍️',
    tier: 'bronze',
    targetValue: 1,
    unit: 'Catatan'
  },
  {
    id: 'journal_pro',
    title: 'Pikir & Evaluasi Mandiri',
    category: 'journal',
    categoryLabel: 'Jurnal Belajar',
    description: 'Konsisten menulis 5 catatan refleksi evaluasi belajar.',
    icon: '📖',
    tier: 'silver',
    targetValue: 5,
    unit: 'Catatan'
  }
];

export const BADGE_TIER_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    glow: 'shadow-amber-500/20'
  },
  silver: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-600',
    glow: 'shadow-slate-400/20'
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/60',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-400 dark:border-yellow-600',
    glow: 'shadow-yellow-500/20'
  },
  platinum: {
    bg: 'bg-cyan-100 dark:bg-cyan-950/60',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
    glow: 'shadow-cyan-500/20'
  },
  diamond: {
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700',
    glow: 'shadow-purple-500/20'
  }
};

/**
 * Calculates current status and newly unlocked badges given current student state
 */
export function evaluateAllBadges(
  profile: StudentProfile | null,
  sessions: WorksheetSessionResult[],
  levelProgress: Record<string, LevelProgress>,
  journalEntries: ReflectionJournalEntry[],
  existingUnlocked: UnlockedBadge[]
): {
  allUnlocked: UnlockedBadge[];
  newlyUnlocked: BadgeDefinition[];
} {
  const existingMap = new Map<BadgeId, UnlockedBadge>();
  existingUnlocked.forEach(b => existingMap.set(b.badgeId, b));

  const totalSheets = profile?.totalWorksheetsCompleted || sessions.length;
  const streak = profile?.streakDays || 1;
  const perfectSessionsCount = sessions.filter(s => s.score === 100).length;
  
  // Fast sessions: score 100 with time <= 50% SCT
  const lightningSessions = sessions.filter(s => s.score === 100 && s.timeSpentSeconds <= s.standardTimeSeconds * 0.5).length;
  
  // Mastered levels count
  const masteredLevelsCount = Object.values(levelProgress).filter(p => p.mastered).length;
  
  // Journal entries count
  const journalCount = journalEntries.length;

  const now = Date.now();
  const newlyUnlocked: BadgeDefinition[] = [];
  const allUnlocked: UnlockedBadge[] = [...existingUnlocked];

  BADGE_DEFINITIONS.forEach(badge => {
    let currentValue = 0;
    let isEarned = false;

    switch (badge.id) {
      case 'first_step':
        currentValue = totalSheets;
        isEarned = totalSheets >= 1;
        break;
      case 'first_ten':
        currentValue = totalSheets;
        isEarned = totalSheets >= 10;
        break;
      case 'quarter_century':
        currentValue = totalSheets;
        isEarned = totalSheets >= 25;
        break;
      case 'half_century':
        currentValue = totalSheets;
        isEarned = totalSheets >= 50;
        break;
      case 'centurion_100':
        currentValue = totalSheets;
        isEarned = totalSheets >= 100;
        break;

      case 'streak_3':
        currentValue = streak;
        isEarned = streak >= 3;
        break;
      case 'streak_7':
        currentValue = streak;
        isEarned = streak >= 7;
        break;
      case 'streak_14':
        currentValue = streak;
        isEarned = streak >= 14;
        break;
      case 'streak_30':
        currentValue = streak;
        isEarned = streak >= 30;
        break;

      case 'perfect_score':
        currentValue = perfectSessionsCount;
        isEarned = perfectSessionsCount >= 1;
        break;
      case 'perfect_10':
        currentValue = perfectSessionsCount;
        isEarned = perfectSessionsCount >= 10;
        break;
      case 'speed_demon':
        currentValue = lightningSessions;
        isEarned = lightningSessions >= 1;
        break;

      case 'level_master':
        currentValue = masteredLevelsCount;
        isEarned = masteredLevelsCount >= 1;
        break;
      case 'multi_master':
        currentValue = masteredLevelsCount;
        isEarned = masteredLevelsCount >= 3;
        break;

      case 'journal_starter':
        currentValue = journalCount;
        isEarned = journalCount >= 1;
        break;
      case 'journal_pro':
        currentValue = journalCount;
        isEarned = journalCount >= 5;
        break;
    }

    if (isEarned) {
      if (!existingMap.has(badge.id)) {
        const newRecord: UnlockedBadge = {
          badgeId: badge.id,
          unlockedAt: now,
          progressValue: currentValue,
        };
        existingMap.set(badge.id, newRecord);
        allUnlocked.push(newRecord);
        newlyUnlocked.push(badge);
      }
    }
  });

  return {
    allUnlocked,
    newlyUnlocked
  };
}

export function getBadgeProgress(
  badge: BadgeDefinition,
  profile: StudentProfile | null,
  sessions: WorksheetSessionResult[],
  levelProgress: Record<string, LevelProgress>,
  journalEntries: ReflectionJournalEntry[]
): { current: number; target: number; percentage: number; isUnlocked: boolean } {
  const totalSheets = profile?.totalWorksheetsCompleted || sessions.length;
  const streak = profile?.streakDays || 1;
  const perfectSessionsCount = sessions.filter(s => s.score === 100).length;
  const lightningSessions = sessions.filter(s => s.score === 100 && s.timeSpentSeconds <= s.standardTimeSeconds * 0.5).length;
  const masteredLevelsCount = Object.values(levelProgress).filter(p => p.mastered).length;
  const journalCount = journalEntries.length;

  let current = 0;
  switch (badge.id) {
    case 'first_step':
    case 'first_ten':
    case 'quarter_century':
    case 'half_century':
    case 'centurion_100':
      current = totalSheets;
      break;

    case 'streak_3':
    case 'streak_7':
    case 'streak_14':
    case 'streak_30':
      current = streak;
      break;

    case 'perfect_score':
    case 'perfect_10':
      current = perfectSessionsCount;
      break;

    case 'speed_demon':
      current = lightningSessions;
      break;

    case 'level_master':
    case 'multi_master':
      current = masteredLevelsCount;
      break;

    case 'journal_starter':
    case 'journal_pro':
      current = journalCount;
      break;
  }

  const target = badge.targetValue;
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isUnlocked = current >= target;

  return {
    current,
    target,
    percentage,
    isUnlocked
  };
}
