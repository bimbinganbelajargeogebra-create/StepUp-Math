import { 
  KumonLevelId, 
  StudentProfile, 
  LevelProgress, 
  WorksheetSessionResult, 
  PretestResult 
} from '../types';
import { KUMON_LEVEL_ORDER } from '../data/curriculumData';

const STORAGE_KEYS = {
  PROFILE: 'stepup_math_student_profile',
  LEVEL_PROGRESS: 'stepup_math_level_progress',
  SESSION_HISTORY: 'stepup_math_session_history',
  PRETEST_RESULT: 'stepup_math_pretest_result',
  ADMIN_SETTINGS: 'stepup_math_admin_settings',
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
}

export function getStoredLevelProgress(): Record<KumonLevelId, LevelProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load level progress', e);
  }

  // Initialize fresh level progress
  const initialProgress: Partial<Record<KumonLevelId, LevelProgress>> = {};
  KUMON_LEVEL_ORDER.forEach((lvl, idx) => {
    initialProgress[lvl] = {
      levelId: lvl,
      unlocked: idx === 0, // 6A unlocked by default if not pretested
      mastered: false,
      completedWorksheets: [],
      highestScores: {},
      bestTimes: {},
      attemptsCount: {}
    };
  });

  return initialProgress as Record<KumonLevelId, LevelProgress>;
}

export function saveStoredLevelProgress(progress: Record<KumonLevelId, LevelProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save level progress', e);
  }
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

  // Update profile with assigned level
  const profile = getStoredProfile();
  if (profile) {
    profile.pretestCompleted = true;
    profile.startingLevel = result.assignedLevel;
    profile.currentLevel = result.assignedLevel;
    saveStoredProfile(profile);
  }

  // Unlock levels according to account mode
  const progress = getStoredLevelProgress();
  const assignedIdx = KUMON_LEVEL_ORDER.indexOf(result.assignedLevel);
  
  if (profile?.isTrial) {
    // Trial Mode: ONLY unlock the placed level, lock all others
    KUMON_LEVEL_ORDER.forEach((lvl) => {
      if (progress[lvl]) {
        progress[lvl].unlocked = (lvl === result.assignedLevel);
      }
    });
  } else {
    // Standard / Admin: Unlock all levels up to the assigned starting level
    KUMON_LEVEL_ORDER.forEach((lvl, idx) => {
      if (idx <= Math.max(0, assignedIdx)) {
        if (progress[lvl]) {
          progress[lvl].unlocked = true;
        }
      }
    });
  }

  saveStoredLevelProgress(progress);
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
