import { 
  KumonLevelId, 
  StudentProfile, 
  LevelProgress, 
  WorksheetSessionResult, 
  PretestResult,
  UserAccount 
} from '../types';
import { KUMON_LEVEL_ORDER } from '../data/curriculumData';
import { FirebaseSyncService } from '../services/firebaseSync';

const STORAGE_KEYS = {
  PROFILE: 'stepup_math_student_profile',
  LEVEL_PROGRESS: 'stepup_math_level_progress',
  SESSION_HISTORY: 'stepup_math_session_history',
  PRETEST_RESULT: 'stepup_math_pretest_result',
  ADMIN_SETTINGS: 'stepup_math_admin_settings',
  ACCOUNTS_CACHE: 'stepup_math_registered_accounts',
  THEME: 'stepup_math_theme'
};

export type AppTheme = 'light' | 'dark';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
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

export const ACCESS_CODE = 'stepup';
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
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
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
    const raw = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
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
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
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
} {
  const history = getStoredSessionHistory();
  history.unshift(result); // latest first
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(history.slice(0, 100))); // keep 100 recent
  } catch (e) {
    console.error('Failed to save history', e);
  }

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

  // Check if entire level is mastered (e.g. at least 8 of 10 worksheets completed with >= 90 score)
  const completedCount = lvlProg.completedWorksheets.length;
  const avgTopScore = Object.values(lvlProg.highestScores).reduce((a, b) => a + b, 0) / (Object.keys(lvlProg.highestScores).length || 1);
  
  let isNewLevelUnlocked = false;
  let unlockedLevelId: KumonLevelId | undefined = undefined;

  if (completedCount >= 8 && avgTopScore >= 85) {
    if (!lvlProg.mastered) {
      lvlProg.mastered = true;
      lvlProg.masteryDate = Date.now();
      
      // Unlock next level in sequence
      const currIdx = KUMON_LEVEL_ORDER.indexOf(result.levelId);
      if (currIdx !== -1 && currIdx < KUMON_LEVEL_ORDER.length - 1) {
        const nextLevelId = KUMON_LEVEL_ORDER[currIdx + 1];
        if (!progress[nextLevelId]?.unlocked) {
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
        }
      }
    }
  }

  progress[result.levelId] = lvlProg;
  saveStoredLevelProgress(progress);

  // Update profile points and streak
  const profile = getStoredProfile();
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
    saveStoredProfile(profile);
  }

  // Cloud sync session result in background
  FirebaseSyncService.syncSessionResultToCloud(result, profile?.name).catch((err) => {
    console.warn('Background session cloud sync deferred:', err);
  });

  return {
    updatedProgress: progress,
    isNewLevelUnlocked,
    unlockedLevelId
  };
}

export function getStoredPretestResult(): PretestResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRETEST_RESULT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load pretest result', e);
    return null;
  }
}

export function savePretestResult(result: PretestResult): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRETEST_RESULT, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save pretest result', e);
  }

  // Cloud sync pretest result in background
  FirebaseSyncService.syncPretestResultToCloud(result).catch((err) => {
    console.warn('Background pretest cloud sync deferred:', err);
  });

  // Update profile with assigned level
  const profile = getStoredProfile();
  if (profile) {
    profile.pretestCompleted = true;
    profile.startingLevel = result.assignedLevel;
    profile.currentLevel = result.assignedLevel;
    saveStoredProfile(profile);
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
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.LEVEL_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.PRETEST_RESULT);
}

export function exportDeviceBackupJSON(): string {
  const data = {
    profile: getStoredProfile(),
    levelProgress: getStoredLevelProgress(),
    sessionHistory: getStoredSessionHistory(),
    pretestResult: getStoredPretestResult(),
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
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

// Local accounts cache helpers for offline-first resilience
export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_CACHE);
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

