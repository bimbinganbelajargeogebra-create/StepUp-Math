import { 
  KumonLevelId, 
  StudentProfile, 
  LevelProgress, 
  WorksheetSessionResult, 
  PretestResult,
  UserAccount,
  UnlockedBadge,
  BadgeDefinition,
  ReflectionJournalEntry,
  UploadedFileItem
} from '../types';
import { KUMON_LEVEL_ORDER } from '../data/curriculumData';
import { BADGE_DEFINITIONS, evaluateAllBadges } from '../data/badgesData';
import { FirebaseSyncService, FirebaseDatabaseService } from '../services/firebaseSync';

export const STORAGE_KEYS = {
  PROFILE: 'algorimath_student_profile',
  LEVEL_PROGRESS: 'algorimath_level_progress',
  SESSION_HISTORY: 'algorimath_session_history',
  PRETEST_RESULT: 'algorimath_pretest_result',
  ADMIN_SETTINGS: 'algorimath_admin_settings',
  ACCOUNTS_CACHE: 'algorimath_registered_accounts',
  THEME: 'algorimath_theme',
  BADGES: 'algorimath_student_badges',
  JOURNALS: 'algorimath_reflection_journals',
  UPLOADED_FILES: 'algorimath_uploaded_files'
};


export const LEGACY_STORAGE_KEYS = {
  PROFILE: 'stepup_math_student_profile',
  LEVEL_PROGRESS: 'stepup_math_level_progress',
  SESSION_HISTORY: 'stepup_math_session_history',
  PRETEST_RESULT: 'stepup_math_pretest_result',
  ADMIN_SETTINGS: 'stepup_math_admin_settings',
  ACCOUNTS_CACHE: 'stepup_math_registered_accounts',
  THEME: 'stepup_math_theme',
  BADGES: 'stepup_math_student_badges',
  JOURNALS: 'stepup_math_reflection_journals'
};

// Automatic one-time migration from legacy stepup keys to algorimath keys
function migrateLegacyStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    (Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>).forEach((k) => {
      const newKey = STORAGE_KEYS[k];
      const oldKey = LEGACY_STORAGE_KEYS[k];
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
      }
    });
  } catch (err) {
    console.warn('Storage migration notice:', err);
  }
}

migrateLegacyStorage();

export function getStorageItemWithFallback(key: keyof typeof STORAGE_KEYS): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem(STORAGE_KEYS[key]) ?? localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
  } catch {
    return null;
  }
}

export type AppTheme = 'light' | 'dark';

export function getStoredTheme(): AppTheme {
  try {
    const saved = getStorageItemWithFallback('THEME');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (e) {
    console.error('Failed to get theme', e);
  }
  return 'light';
}

export function saveStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export const ACCESS_CODE = 'algorimath';
export const TRIAL_CODE = 'trial';
export const ADMIN_PASSWORD = 'bajuri39';

export function verifyTrialAccess(input: string): boolean {
  if (!input) return false;
  const clean = input.trim().toLowerCase();
  return clean === TRIAL_CODE.toLowerCase() || clean === 'trial';
}

export function verifyAdminPassword(input: string): boolean {
  if (!input) return false;
  const clean = input.trim().toLowerCase();
  return clean === ADMIN_PASSWORD.toLowerCase() || clean === 'bajuri39';
}

export function unlockAllLevelsAdmin(): Record<KumonLevelId, LevelProgress> {
  const current = getStoredLevelProgress();
  const updated: Record<KumonLevelId, LevelProgress> = { ...current };
  
  KUMON_LEVEL_ORDER.forEach((lvl) => {
    if (!updated[lvl]) {
      updated[lvl] = {
        levelId: lvl,
        unlocked: true,
        mastered: false,
        completedWorksheets: [],
        highestScores: {},
        bestTimes: {},
        attemptsCount: {}
      };
    } else {
      updated[lvl] = {
        ...updated[lvl],
        unlocked: true
      };
    }
  });

  saveStoredLevelProgress(updated);
  return updated;
}

export function getStoredProfile(): StudentProfile | null {
  try {
    const raw = getStorageItemWithFallback('PROFILE');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
    return null;
  }
}

export function saveStoredProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
  // Cloud sync in background
  FirebaseSyncService.syncProfileToCloud(profile).catch((err) => {
    console.warn('Background profile cloud sync deferred:', err);
  });
}

export function generateCleanLevelProgress(
  targetLevel: KumonLevelId = '6A',
  unlockPrevious: boolean = true
): Record<KumonLevelId, LevelProgress> {
  const progress: Partial<Record<KumonLevelId, LevelProgress>> = {};
  const targetIdx = KUMON_LEVEL_ORDER.indexOf(targetLevel);
  const safeTargetIdx = targetIdx !== -1 ? targetIdx : 0;

  KUMON_LEVEL_ORDER.forEach((lvl, idx) => {
    const isUnlocked = unlockPrevious ? idx <= safeTargetIdx : idx === safeTargetIdx;
    progress[lvl] = {
      levelId: lvl,
      unlocked: isUnlocked,
      mastered: false,
      completedWorksheets: [],
      highestScores: {},
      bestTimes: {},
      attemptsCount: {}
    };
  });

  return progress as Record<KumonLevelId, LevelProgress>;
}

export function sanitizeStudentLevelProgress(
  rawProgress: Record<KumonLevelId, LevelProgress> | null | undefined,
  profile: StudentProfile | null
): Record<KumonLevelId, LevelProgress> {
  if (profile?.isAdmin) {
    return rawProgress || unlockAllLevelsAdmin();
  }

  const baseLevel: KumonLevelId = profile?.startingLevel || profile?.currentLevel || '6A';
  const baseIdx = Math.max(0, KUMON_LEVEL_ORDER.indexOf(baseLevel));

  if (profile?.isTrial) {
    const trialProgress: Partial<Record<KumonLevelId, LevelProgress>> = {};
    KUMON_LEVEL_ORDER.forEach((lvl) => {
      const existing = rawProgress?.[lvl];
      trialProgress[lvl] = {
        levelId: lvl,
        unlocked: lvl === baseLevel,
        mastered: existing?.mastered || false,
        masteryDate: existing?.masteryDate,
        completedWorksheets: existing?.completedWorksheets || [],
        highestScores: existing?.highestScores || {},
        bestTimes: existing?.bestTimes || {},
        attemptsCount: existing?.attemptsCount || {}
      };
    });
    return trialProgress as Record<KumonLevelId, LevelProgress>;
  }

  const sanitized: Partial<Record<KumonLevelId, LevelProgress>> = {};
  
  // Track continuous mastery chain from baseLevel
  let previousLevelMastered = false;

  KUMON_LEVEL_ORDER.forEach((lvl, idx) => {
    const existing = rawProgress?.[lvl];
    const isMastered = Boolean(existing?.mastered);
    
    let isUnlocked = false;
    if (idx <= baseIdx) {
      // All levels up to starting/current assigned level are accessible
      isUnlocked = true;
    } else {
      // Future levels are ONLY unlocked if the immediate previous level is mastered
      isUnlocked = previousLevelMastered || isMastered;
    }

    sanitized[lvl] = {
      levelId: lvl,
      unlocked: isUnlocked,
      mastered: isMastered,
      masteryDate: existing?.masteryDate,
      completedWorksheets: existing?.completedWorksheets || [],
      highestScores: existing?.highestScores || {},
      bestTimes: existing?.bestTimes || {},
      attemptsCount: existing?.attemptsCount || {}
    };

    // Update mastery status for next level in loop
    previousLevelMastered = isMastered;
  });

  return sanitized as Record<KumonLevelId, LevelProgress>;
}

export function getStoredLevelProgress(): Record<KumonLevelId, LevelProgress> {
  try {
    const raw = getStorageItemWithFallback('LEVEL_PROGRESS');
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile = getStoredProfile();
      if (profile && !profile.isAdmin) {
        return sanitizeStudentLevelProgress(parsed, profile);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load level progress', e);
  }

  const profile = getStoredProfile();
  const baseLevel: KumonLevelId = profile?.startingLevel || profile?.currentLevel || '6A';
  return generateCleanLevelProgress(baseLevel, true);
}

export function saveStoredLevelProgress(progress: Record<KumonLevelId, LevelProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save level progress', e);
  }
  // Cloud sync in background
  FirebaseSyncService.syncLevelProgressToCloud(progress).catch((err) => {
    console.warn('Background level progress cloud sync deferred:', err);
  });
}

export function getStoredSessionHistory(): WorksheetSessionResult[] {
  try {
    const raw = getStorageItemWithFallback('SESSION_HISTORY');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history', e);
    return [];
  }
}

export function saveSessionResult(result: WorksheetSessionResult): {
  updatedProgress: Record<KumonLevelId, LevelProgress>;
  isNewLevelUnlocked: boolean;
  unlockedLevelId?: KumonLevelId;
  isWaitingApproval?: boolean;
  pendingPromotionLevel?: KumonLevelId;
  newlyUnlockedBadges?: BadgeDefinition[];
} {
  const history = getStoredSessionHistory();
  history.unshift(result); // latest first
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history.slice(0, 100))); // keep 100 recent
  } catch (e) {
    console.error('Failed to save history', e);
  }

  const profile = getStoredProfile();
  // Default to full access if not explicitly tiered
  const isTieredAccess = profile?.accessType === 'tiered';

  const progress = getStoredLevelProgress();
  const lvlProg = progress[result.levelId] || {
    levelId: result.levelId,
    unlocked: true,
    mastered: false,
    completedWorksheets: [],
    highestScores: {},
    bestTimes: {},
    attemptsCount: {}
  };

  const wNum = result.worksheetNum;
  const currentBestScore = lvlProg.highestScores[wNum] || 0;
  const currentBestTime = lvlProg.bestTimes[wNum] || 999999;
  const attempts = (lvlProg.attemptsCount[wNum] || 0) + 1;

  lvlProg.highestScores[wNum] = Math.max(currentBestScore, result.score);
  lvlProg.bestTimes[wNum] = Math.min(currentBestTime, result.timeSpentSeconds);
  lvlProg.attemptsCount[wNum] = attempts;

  if (result.score >= 80 && !lvlProg.completedWorksheets.includes(wNum)) {
    lvlProg.completedWorksheets.push(wNum);
    lvlProg.completedWorksheets.sort((a, b) => a - b);
  }

  // Check if entire level is mastered (e.g. at least 8 of 10 worksheets completed with >= 90 score or 10 worksheets completed)
  const completedCount = lvlProg.completedWorksheets.length;
  const avgTopScore = Object.values(lvlProg.highestScores).reduce((a, b) => a + b, 0) / (Object.keys(lvlProg.highestScores).length || 1);
  
  let isNewLevelUnlocked = false;
  let unlockedLevelId: KumonLevelId | undefined = undefined;
  let isWaitingApproval = false;
  let pendingPromotionLevel: KumonLevelId | undefined = undefined;

  const isLevelCompletedOrMastered = (completedCount >= 8 && avgTopScore >= 75) || completedCount >= 10 || (wNum === 10 && result.score >= 70);
  if (isLevelCompletedOrMastered) {
    if (!lvlProg.mastered) {
      lvlProg.mastered = true;
      lvlProg.masteryDate = Date.now();
    }
      
    // Check next level in sequence
    const currIdx = KUMON_LEVEL_ORDER.indexOf(result.levelId);
    if (currIdx !== -1 && currIdx < KUMON_LEVEL_ORDER.length - 1) {
      const nextLevelId = KUMON_LEVEL_ORDER[currIdx + 1];
      if (!progress[nextLevelId]?.unlocked) {
        if (!isTieredAccess) {
          // Full Akses: Akses level berikutnya otomatis terbuka langsung ketika levelnya selesai dikerjakan!
          progress[nextLevelId] = {
            ...(progress[nextLevelId] || {
              levelId: nextLevelId,
              mastered: false,
              completedWorksheets: [],
              highestScores: {},
              bestTimes: {},
              attemptsCount: {}
            }),
            unlocked: true
          };
          isNewLevelUnlocked = true;
          unlockedLevelId = nextLevelId;
        } else {
          // Akses Berjenjang: Menunggu approve dari guru/admin untuk melanjutkan ke level berikutnya!
          isWaitingApproval = true;
          pendingPromotionLevel = nextLevelId;
          if (profile) {
            profile.pendingPromotionLevel = nextLevelId;
          }
        }
      }
    }
  }

  progress[result.levelId] = lvlProg;
  saveStoredLevelProgress(progress);

  // Update profile points, streak, and last studied position
  if (profile) {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streakDays;
    if (profile.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (!profile.lastStudyDate) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    profile.totalWorksheetsCompleted += 1;
    profile.totalPoints += Math.round(result.score + (result.isMastered ? 50 : 20));
    profile.streakDays = newStreak;
    profile.lastStudyDate = today;
    profile.lastStudiedLevel = result.levelId;
    profile.lastStudiedWorksheet = result.worksheetNum;
    profile.lastStudiedScore = result.score;
    profile.lastStudiedAt = result.timestamp;
    if (isNewLevelUnlocked && unlockedLevelId) {
      profile.currentLevel = unlockedLevelId;
    }
    if (pendingPromotionLevel) {
      profile.pendingPromotionLevel = pendingPromotionLevel;
    }
    saveStoredProfile(profile);

    // Update account in accounts cache & database
    if (profile.username) {
      const existingAcc = getStoredAccountByUsername(profile.username);
      if (existingAcc) {
        upsertStoredAccount({
          ...existingAcc,
          lastStudiedLevel: result.levelId,
          lastStudiedWorksheet: result.worksheetNum,
          lastStudiedScore: result.score,
          lastStudiedAt: result.timestamp,
          currentLevel: isNewLevelUnlocked && unlockedLevelId ? unlockedLevelId : (existingAcc.currentLevel || result.levelId),
          pendingPromotionLevel: pendingPromotionLevel || existingAcc.pendingPromotionLevel || null,
          totalWorksheetsCompleted: profile.totalWorksheetsCompleted,
          totalPoints: profile.totalPoints,
          streakDays: profile.streakDays,
          lastStudyDate: profile.lastStudyDate,
          levelProgress: progress,
          updatedAt: Date.now()
        });
      }

      if (pendingPromotionLevel) {
        FirebaseDatabaseService.requestLevelPromotion(profile.username, pendingPromotionLevel).catch((err) => {
          console.warn('Background requestLevelPromotion cloud sync notice:', err);
        });
      }
    }
  }

  // Cloud sync session result in background
  FirebaseSyncService.syncSessionResultToCloud(result, profile?.name).catch((err) => {
    console.warn('Background session cloud sync deferred:', err);
  });

  // Evaluate and award badges automatically
  const sessions = getStoredSessionHistory();
  const currentBadges = getStoredBadges();
  const journals = getStoredReflectionJournals();
  const badgeEval = evaluateAllBadges(profile, sessions, progress, journals, currentBadges);

  let newlyUnlockedBadges: BadgeDefinition[] = [];
  if (badgeEval.newlyUnlocked.length > 0) {
    saveStoredBadges(badgeEval.allUnlocked);
    newlyUnlockedBadges = badgeEval.newlyUnlocked;
    
    // Update badges count in profile
    if (profile) {
      profile.badgesCount = badgeEval.allUnlocked.length;
      saveStoredProfile(profile);
    }
  }

  return {
    updatedProgress: progress,
    isNewLevelUnlocked,
    unlockedLevelId,
    isWaitingApproval,
    pendingPromotionLevel,
    newlyUnlockedBadges
  };
}

export function getStoredPretestResult(): PretestResult | null {
  try {
    const raw = getStorageItemWithFallback('PRETEST_RESULT');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load pretest result', e);
    return null;
  }
}

export function savePretestResult(result: PretestResult, studentUsername?: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRETEST_RESULT, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save pretest result', e);
  }

  const profile = getStoredProfile();
  const targetUsername = studentUsername || profile?.username;

  // Cloud sync pretest result in background
  FirebaseSyncService.syncPretestResultToCloud(result, targetUsername).catch((err) => {
    console.warn('Background pretest cloud sync deferred:', err);
  });

  // Update profile with assigned level
  if (profile) {
    const updatedProfile: StudentProfile = {
      ...profile,
      pretestCompleted: true,
      startingLevel: result.assignedLevel,
      currentLevel: result.assignedLevel,
      lastStudiedLevel: result.assignedLevel,
      lastStudiedWorksheet: 1
    };
    saveStoredProfile(updatedProfile);
  }

  // Calibrate level progress to strictly unlock up to assigned starting level
  const currentProgress = getStoredLevelProgress();
  const assignedIdx = KUMON_LEVEL_ORDER.indexOf(result.assignedLevel);
  const safeAssignedIdx = assignedIdx !== -1 ? assignedIdx : 0;
  
  const updatedProgress: Record<KumonLevelId, LevelProgress> = { ...currentProgress };

  if (profile?.isTrial) {
    // Trial Mode: ONLY unlock the placed level, lock all others
    KUMON_LEVEL_ORDER.forEach((lvl) => {
      const isTarget = lvl === result.assignedLevel;
      if (updatedProgress[lvl]) {
        updatedProgress[lvl] = {
          ...updatedProgress[lvl],
          unlocked: isTarget
        };
      }
    });
  } else {
    // Standard student: Unlock levels up to assigned level, lock all future levels
    KUMON_LEVEL_ORDER.forEach((lvl, idx) => {
      const isUpToAssigned = idx <= safeAssignedIdx;
      if (updatedProgress[lvl]) {
        updatedProgress[lvl] = {
          ...updatedProgress[lvl],
          unlocked: isUpToAssigned
        };
      }
    });
  }

  saveStoredLevelProgress(updatedProgress);

  // Update account in accounts cache & database
  if (targetUsername) {
    const existingAcc = getStoredAccountByUsername(targetUsername);
    if (existingAcc) {
      upsertStoredAccount({
        ...existingAcc,
        pretestCompleted: true,
        startingLevel: result.assignedLevel,
        currentLevel: result.assignedLevel,
        lastStudiedLevel: result.assignedLevel,
        lastStudiedWorksheet: 1,
        levelProgress: updatedProgress,
        pretestResult: result,
        updatedAt: Date.now()
      });
    }
  }
}

export function logoutStudentSession(): void {
  const currentProfile = getStoredProfile();
  if (currentProfile) {
    // Keep all learning progress, points, streak, startingLevel, pretestCompleted, but mark active session accessGranted: false
    saveStoredProfile({
      ...currentProfile,
      accessGranted: false
    });
  }
}

export function resetAllDeviceData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  Object.values(LEGACY_STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

export function exportDeviceBackupJSON(): string {
  const data = {
    profile: getStoredProfile(),
    levelProgress: getStoredLevelProgress(),
    sessionHistory: getStoredSessionHistory(),
    pretestResult: getStoredPretestResult(),
    badges: getStoredBadges(),
    journals: getStoredReflectionJournals(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export function importDeviceBackupJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
    if (parsed.levelProgress) localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(parsed.levelProgress));
    if (parsed.sessionHistory) localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(parsed.sessionHistory));
    if (parsed.pretestResult) localStorage.setItem(STORAGE_KEYS.PRETEST_RESULT, JSON.stringify(parsed.pretestResult));
    if (parsed.badges) localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(parsed.badges));
    if (parsed.journals) localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(parsed.journals));
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

// ----------------- BADGES STORAGE & REWARDS -----------------

export function getStoredBadges(): UnlockedBadge[] {
  try {
    const raw = getStorageItemWithFallback('BADGES');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load stored badges', e);
    return [];
  }
}

export function saveStoredBadges(badges: UnlockedBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch (e) {
    console.error('Failed to save badges', e);
  }

  // Cloud sync badges in background
  const profile = getStoredProfile();
  FirebaseSyncService.syncBadgesToCloud(badges, profile?.username || profile?.name).catch(err => {
    console.warn('Background badges cloud sync deferred:', err);
  });
}

export function unlockBadge(badgeId: string, progressValue: number = 1): UnlockedBadge[] {
  const current = getStoredBadges();
  const exists = current.some(b => b.badgeId === badgeId);
  if (!exists) {
    const newBadge: UnlockedBadge = {
      badgeId: badgeId as any,
      unlockedAt: Date.now(),
      progressValue
    };
    const updated = [...current, newBadge];
    saveStoredBadges(updated);
    
    // Update profile badges count
    const profile = getStoredProfile();
    if (profile) {
      profile.badgesCount = updated.length;
      saveStoredProfile(profile);
    }
    return updated;
  }
  return current;
}

export function checkAndTriggerBadgesEvaluation(): {
  allUnlocked: UnlockedBadge[];
  newlyUnlocked: BadgeDefinition[];
} {
  const profile = getStoredProfile();
  const sessions = getStoredSessionHistory();
  const progress = getStoredLevelProgress();
  const journals = getStoredReflectionJournals();
  const currentBadges = getStoredBadges();

  const evalResult = evaluateAllBadges(profile, sessions, progress, journals, currentBadges);
  if (evalResult.newlyUnlocked.length > 0) {
    saveStoredBadges(evalResult.allUnlocked);
    if (profile) {
      profile.badgesCount = evalResult.allUnlocked.length;
      saveStoredProfile(profile);
    }
  }
  return evalResult;
}

// ----------------- REFLECTION JOURNALS STORAGE -----------------

export function getStoredReflectionJournals(): ReflectionJournalEntry[] {
  try {
    const raw = getStorageItemWithFallback('JOURNALS');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load stored reflection journals', e);
    return [];
  }
}

export function saveStoredReflectionJournal(entry: ReflectionJournalEntry): {
  journals: ReflectionJournalEntry[];
  newlyUnlockedBadges: BadgeDefinition[];
} {
  try {
    const current = getStoredReflectionJournals();
    const existingIndex = current.findIndex(j => j.id === entry.id);
    let updated: ReflectionJournalEntry[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(updated));

    // Update profile journal count
    const profile = getStoredProfile();
    if (profile) {
      profile.journalCount = updated.length;
      saveStoredProfile(profile);
    }

    // Sync to Database
    FirebaseSyncService.syncReflectionJournalToCloud(entry).catch(err => {
      console.warn('Background journal sync deferred:', err);
    });

    // Check for reflection badges (e.g., journal_starter, journal_pro)
    const badgeCheck = checkAndTriggerBadgesEvaluation();

    return {
      journals: updated,
      newlyUnlockedBadges: badgeCheck.newlyUnlocked
    };
  } catch (e) {
    console.error('Failed to save reflection journal', e);
    return {
      journals: getStoredReflectionJournals(),
      newlyUnlockedBadges: []
    };
  }
}

export function deleteStoredReflectionJournal(journalId: string): ReflectionJournalEntry[] {
  try {
    const current = getStoredReflectionJournals();
    const updated = current.filter(j => j.id !== journalId);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(updated));

    const profile = getStoredProfile();
    if (profile) {
      profile.journalCount = updated.length;
      saveStoredProfile(profile);
    }

    // Also delete in Database
    FirebaseSyncService.deleteReflectionJournalInCloud(journalId).catch(err => {
      console.warn('Background journal delete deferred:', err);
    });

    return updated;
  } catch (e) {
    console.error('Failed to delete reflection journal', e);
    return getStoredReflectionJournals();
  }
}

// Local accounts cache helpers for offline-first resilience
export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = getStorageItemWithFallback('ACCOUNTS_CACHE');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is UserAccount => Boolean(
        item && 
        typeof item === 'object' && 
        typeof ((item as any).username || (item as any).id) === 'string' && 
        ((item as any).username || (item as any).id).trim().length > 0
      ))
      .map(item => ({
        ...item,
        role: item.role || 'student',
        username: String((item as any).username || (item as any).id || '').trim().toLowerCase()
      }));
  } catch (e) {
    console.error('Failed to load stored accounts cache', e);
    return [];
  }
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    if (!Array.isArray(accounts)) return;
    const cleanAccounts: UserAccount[] = accounts
      .filter(a => Boolean(
        a && 
        typeof a === 'object' && 
        typeof (a.username || (a as any).id) === 'string' && 
        (a.username || (a as any).id).trim().length > 0
      ))
      .map(a => ({
        ...a,
        role: a.role || 'student',
        username: String(a.username || (a as any).id || '').trim().toLowerCase()
      }));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_CACHE, JSON.stringify(cleanAccounts));
  } catch (e) {
    console.error('Failed to save stored accounts cache', e);
  }
}

export function getStoredAccountByUsername(username?: string | null): UserAccount | null {
  if (!username || typeof username !== 'string' || !username.trim()) return null;
  const accounts = getStoredAccounts();
  const clean = username.trim().toLowerCase();
  return accounts.find(a => a && typeof a.username === 'string' && a.username.trim().toLowerCase() === clean) || null;
}

export function upsertStoredAccount(account: Partial<UserAccount> & { id?: string; username?: string }): void {
  try {
    if (!account || typeof account !== 'object') return;
    const rawUsername = account.username || account.id;
    if (!rawUsername || typeof rawUsername !== 'string' || !rawUsername.trim()) {
      return;
    }
    const clean = rawUsername.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const validAccount: UserAccount = {
      name: account.name || clean,
      grade: account.grade || 'SD Kelas 3',
      school: account.school || '',
      avatar: account.avatar || '🦊',
      status: account.status || 'pending',
      role: account.role || 'student',
      createdAt: account.createdAt || Date.now(),
      ...account,
      username: clean,
    };

    const idx = accounts.findIndex(a => a && typeof a.username === 'string' && a.username.trim().toLowerCase() === clean);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...validAccount };
    } else {
      accounts.unshift(validAccount);
    }
    saveStoredAccounts(accounts);
  } catch (e) {
    console.error('Failed to upsert stored account', e);
  }
}

// ----------------------------------------------------
// UPLOADED FILES & LEARNING MATERIALS SYSTEM
// ----------------------------------------------------

export const DEFAULT_CURRICULUM_FILES: UploadedFileItem[] = [
  {
    id: 'file-modul-6a',
    title: 'Modul Visual Pengenalan Angka & Menghitung Objek',
    description: 'Panduan gambar objek (titik, apel, bintang) untuk melatih daya ingat angka 1–10 secara visual dan menyenangkan.',
    fileName: 'Modul-Visual-Angka-Level-6A.pdf',
    fileType: 'pdf',
    targetLevel: '6A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 7,
    tags: ['Pra-Sekolah', 'Visual Objek', 'Angka Dasar']
  },
  {
    id: 'file-modul-5a',
    title: 'Lembar Latihan Menghubungkan Titik & Garis Angka',
    description: 'Lembar kerja pembiasaan urutan bilangan 1 sampai 50 dengan panduan visual dan titik-titik bantu.',
    fileName: 'Lembar-Latihan-Urutan-Angka-Level-5A.pdf',
    fileType: 'pdf',
    targetLevel: '5A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 6,
    tags: ['Urutan Bilangan', 'Menulis Angka', '5A']
  },
  {
    id: 'file-modul-4a',
    title: 'Modul Baca Bilangan & Penulisan Angka Mandiri',
    description: 'Bahan bacaan dan latihan menulis lambang bilangan 1 sampai 100 dengan akurat dan rapi.',
    fileName: 'Modul-Baca-Tulis-Bilangan-Level-4A.pdf',
    fileType: 'pdf',
    targetLevel: '4A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 6,
    tags: ['Angka 1-100', 'Konsistensi', '4A']
  },
  {
    id: 'file-modul-3a',
    title: 'Panduan Cepat Konsep Tambah 1 hingga Tambah 3',
    description: 'Trik mental math dan lompatan angka untuk percepatan penjumlahan dasar tanpa jari.',
    fileName: 'Panduan-Cepat-Tambah-Dasar-Level-3A.pdf',
    fileType: 'pdf',
    targetLevel: '3A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 5,
    tags: ['Penjumlahan +1 sd +3', 'Mental Math', '3A']
  },
  {
    id: 'file-modul-2a',
    title: 'Tabel Kuasai Penjumlahan Tambah 4 sampai Tambah 10',
    description: 'Tabel drill harian penjumlahan 1 digit untuk mencapai standar kecepatan pengerjaan di bawah SCT.',
    fileName: 'Tabel-Drill-Penjumlahan-Level-2A.pdf',
    fileType: 'pdf',
    targetLevel: '2A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 5,
    tags: ['Penjumlahan Lanjut', 'SCT Drill', '2A']
  },
  {
    id: 'file-modul-a',
    title: 'Buku Saku Penjumlahan Bersusun & Pengurangan Dasar',
    description: 'Metode penjabaran puluhan, satuan, serta dasar konsep pengurangan sebagai kebalikan penjumlahan.',
    fileName: 'Buku-Saku-Penjumlahan-Pengurangan-Level-A.pdf',
    fileType: 'pdf',
    targetLevel: 'A',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 4,
    tags: ['SD Dasar', 'Pengurangan', 'Level A']
  },
  {
    id: 'file-modul-b',
    title: 'Panduan Pengurangan Bersusun dengan Teknik Meminjam',
    description: 'Panduan visual cara meminjam dari nilai tempat puluhan dan ratusan untuk menghindari kekeliruan umum.',
    fileName: 'Panduan-Teknik-Meminjam-Level-B.pdf',
    fileType: 'pdf',
    targetLevel: 'B',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 4,
    tags: ['Pengurangan Bersusun', 'Teknik Meminjam', 'Level B']
  },
  {
    id: 'file-modul-c',
    title: 'Trik Cepat Perkalian 1–9 & Pembagian Dasar Tanpa Sisa',
    description: 'Strategi pola perkalian (pola 9, pola ganda) dan pemahaman pembagian sebagai pembagian kelompok yang adil.',
    fileName: 'Trik-Cepat-Perkalian-Pembagian-Level-C.pdf',
    fileType: 'pdf',
    targetLevel: 'C',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 3,
    tags: ['Perkalian', 'Pembagian Dasar', 'Level C']
  },
  {
    id: 'file-modul-d',
    title: 'Panduan Pembagian Bersusun Porogapit & Pecahan Senilai',
    description: 'Langkah demi langkah porogapit pembagian bilangan 2-3 digit serta cara mereduksi pecahan ke bentuk paling sederhana.',
    fileName: 'Panduan-Porogapit-Pecahan-Senilai-Level-D.pdf',
    fileType: 'pdf',
    targetLevel: 'D',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 3,
    tags: ['Porogapit', 'Pecahan Senilai', 'Level D']
  },
  {
    id: 'file-modul-e',
    title: 'Mastery Pecahan: Penjumlahan, Pengurangan & KPK Penyebut',
    description: 'Rumus ringkas menyamakan penyebut menggunakan KPK serta operasi hitung pecahan campuran.',
    fileName: 'Modul-Mastery-Pecahan-Level-E.pdf',
    fileType: 'pdf',
    targetLevel: 'E',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 2,
    tags: ['Pecahan Campuran', 'KPK Penyebut', 'Level E']
  },
  {
    id: 'file-modul-f',
    title: 'Operasi Campuran Pecahan, Desimal & Persentase',
    description: 'Urutan pengerjaan operasi campuran (tanda kurung, perkalian/pembagian sebelum penjumlahan/pengurangan).',
    fileName: 'Operasi-Campuran-Pecahan-Desimal-Level-F.pdf',
    fileType: 'pdf',
    targetLevel: 'F',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 2,
    tags: ['Operasi Campuran', 'Desimal', 'Level F']
  },
  {
    id: 'file-modul-g',
    title: 'Fondasi Aljabar: Bilangan Bulat Negatif & Persamaan Linier Satu Variabel',
    description: 'Aturan perkalian tanda negatif positif dan sifat kesetaraan aljabar untuk menyelesaikan x + b = c.',
    fileName: 'Fondasi-Aljabar-Bilangan-Bulat-Level-G.pdf',
    fileType: 'pdf',
    targetLevel: 'G',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 2,
    tags: ['Aljabar Dasar', 'Bilangan Bulat', 'Level G']
  },
  {
    id: 'file-modul-h',
    title: 'Metode Substitusi & Eliminasi SPLDV serta Persamaan Garis',
    description: 'Panduan grafis dan aljabar menyelesaikan sistem persamaan linier 2 variabel dan gradien garis lurus.',
    fileName: 'Metode-SPLDV-Fungsi-Linier-Level-H.pdf',
    fileType: 'pdf',
    targetLevel: 'H',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['SPLDV', 'Eliminasi Substitusi', 'Level H']
  },
  {
    id: 'file-modul-i',
    title: 'Faktorisasi Polinomial, Akar Kuadrat & Teorema Pythagoras',
    description: 'Rumus cepat faktorisasi ax^2 + bx + c dan penerapan rumus abc serta panjang sisi segitiga siku-siku.',
    fileName: 'Faktorisasi-Pythagoras-Level-I.pdf',
    fileType: 'pdf',
    targetLevel: 'I',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['Faktorisasi', 'Pythagoras', 'Level I']
  },
  {
    id: 'file-modul-j',
    title: 'Aljabar Tingkat Lanjut: Polinomial Tingkat Tinggi & Teorema Sisa',
    description: 'Metode pembagian Horner, pembagian suku banyak, dan pemfaktoran derajat 3 ke atas.',
    fileName: 'Aljabar-Lanjut-Horner-Level-J.pdf',
    fileType: 'pdf',
    targetLevel: 'J',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['Polinomial', 'Horner', 'Level J']
  },
  {
    id: 'file-modul-k',
    title: 'Fungsi Kuadrat, Trigonometri & Irisan Kerucut',
    description: 'Grafik parabola puncak simetri, nilai perbandingan sinus kosinus tangen, dan lingkaran.',
    fileName: 'Fungsi-Kuadrat-Trigonometri-Level-K.pdf',
    fileType: 'pdf',
    targetLevel: 'K',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['Trigonometri', 'Fungsi Kuadrat', 'Level K']
  },
  {
    id: 'file-modul-l',
    title: 'Kalkulus Diferensial: Turunan Fungsi Aljabar & Nilai Ekstrim',
    description: 'Aturan rantai, turunan perkalian pembagian, uji turunan pertama dan kedua untuk titik stasioner.',
    fileName: 'Kalkulus-Turunan-Fungsi-Level-L.pdf',
    fileType: 'pdf',
    targetLevel: 'L',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['Diferensial', 'Turunan', 'Level L']
  },
  {
    id: 'file-modul-m',
    title: 'Kalkulus Integral: Integral Tak Tentu, Tertentu & Luas Daerah',
    description: 'Metode substitusi aljabar, integral parsial, serta perhitungan luas di bawah kurva fungsi.',
    fileName: 'Kalkulus-Integral-Luas-Daerah-Level-M.pdf',
    fileType: 'pdf',
    targetLevel: 'M',
    targetWorksheetNum: 1,
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 1,
    tags: ['Integral', 'Luas Daerah', 'Level M']
  },
  {
    id: 'file-modul-all-peta',
    title: 'Peta Kurikulum Komprehensif 18 Level AlgoriMath (6A s/d M)',
    description: 'Peta jalan lengkap pencapaian belajar mandiri, standar waktu pengerjaan (SCT), dan prasyarat kelulusan.',
    fileName: 'Peta-Kurikulum-AlgoriMath-18-Level.pdf',
    fileType: 'pdf',
    targetLevel: 'ALL',
    uploadedBy: 'Pak GuruAI',
    uploaderRole: 'admin',
    uploadedAt: Date.now() - 86400000 * 8,
    tags: ['Kurikulum', 'Semua Level', 'Peta Jalan']
  }
];

export function getStoredUploadedFiles(): UploadedFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES);
    if (!raw) {
      // Initialize with default curriculum files
      localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(DEFAULT_CURRICULUM_FILES));
      return DEFAULT_CURRICULUM_FILES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CURRICULUM_FILES;
  } catch (e) {
    console.error('Failed to get stored uploaded files', e);
    return DEFAULT_CURRICULUM_FILES;
  }
}

export function saveStoredUploadedFiles(files: UploadedFileItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save stored uploaded files', e);
  }
}

export function addStoredUploadedFile(file: UploadedFileItem): void {
  try {
    const current = getStoredUploadedFiles();
    const filtered = current.filter(f => f.id !== file.id);
    filtered.unshift(file);
    saveStoredUploadedFiles(filtered);
  } catch (e) {
    console.error('Failed to add stored uploaded file', e);
  }
}

export function deleteStoredUploadedFile(id: string): void {
  try {
    const current = getStoredUploadedFiles();
    const updated = current.filter(f => f.id !== id);
    saveStoredUploadedFiles(updated);
  } catch (e) {
    console.error('Failed to delete stored uploaded file', e);
  }
}

/**
 * Filter and categorize files that appear for a student according to:
 * 1. Hasil Tes Diagnostik (startingLevel)
 * 2. Level Belajar Terakhir (lastStudiedLevel || currentLevel)
 */
export function getStudentRelevantFiles(
  profile: StudentProfile | null,
  filesList?: UploadedFileItem[]
): {
  diagnosticLevelFiles: UploadedFileItem[];
  lastStudiedLevelFiles: UploadedFileItem[];
  recommendedFiles: UploadedFileItem[];
  allFiles: UploadedFileItem[];
} {
  const allFiles = filesList && filesList.length > 0 ? filesList : getStoredUploadedFiles();
  
  const diagnosticLevel = profile?.startingLevel || null;
  const lastStudiedLevel = profile?.lastStudiedLevel || profile?.currentLevel || '6A';

  const diagnosticLevelFiles = diagnosticLevel
    ? allFiles.filter(f => f.targetLevel === diagnosticLevel)
    : [];

  const lastStudiedLevelFiles = allFiles.filter(f => f.targetLevel === lastStudiedLevel);

  // Recommended files: match diagnostic level OR match last studied level OR targetLevel is 'ALL'
  const recommendedFiles = allFiles.filter(f => {
    if (f.targetLevel === 'ALL') return true;
    if (diagnosticLevel && f.targetLevel === diagnosticLevel) return true;
    if (f.targetLevel === lastStudiedLevel) return true;
    return false;
  });

  return {
    diagnosticLevelFiles,
    lastStudiedLevelFiles,
    recommendedFiles,
    allFiles
  };
}


