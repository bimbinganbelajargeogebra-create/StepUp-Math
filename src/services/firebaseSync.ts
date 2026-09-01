import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  Unsubscribe 
} from 'firebase/firestore';
import { db, ensureFirebaseAuth, auth } from '../lib/firebase';
import { 
  KumonLevelId, 
  StudentProfile, 
  LevelProgress, 
  WorksheetSessionResult, 
  PretestResult 
} from '../types';

export interface FirebaseUserData {
  profile: StudentProfile | null;
  levelProgress: Record<KumonLevelId, LevelProgress> | null;
  pretestResult: PretestResult | null;
}

export class FirebaseDatabaseService {
  /**
   * Save or update student profile in Firebase Firestore (Primary DB)
   */
  static async saveProfile(profile: StudentProfile): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Firebase saveProfile error:', error);
      return false;
    }
  }

  /**
   * Save level progress in Firebase Firestore (Primary DB)
   */
  static async saveLevelProgress(progress: Record<KumonLevelId, LevelProgress>): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        levelProgress: progress,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Also mirror to levelProgress collection
      const rootProgressRef = doc(db, 'levelProgress', user.uid);
      await setDoc(rootProgressRef, {
        userId: user.uid,
        levelProgress: progress,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Firebase saveLevelProgress error:', error);
      return false;
    }
  }

  /**
   * Save completed worksheet session result in Firebase Firestore
   */
  static async saveSessionResult(result: WorksheetSessionResult, studentName?: string): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      // 1. User private subcollection
      const userSessionRef = doc(db, 'users', user.uid, 'sessions', result.id);
      await setDoc(userSessionRef, {
        ...result,
        userId: user.uid,
        studentName: studentName || 'Siswa StepUp',
        createdAt: serverTimestamp()
      });

      // 2. Global session history collection for teacher analytics & leaderboard
      const rootSessionRef = doc(db, 'sessionHistory', `${user.uid}_${result.id}`);
      await setDoc(rootSessionRef, {
        ...result,
        userId: user.uid,
        studentName: studentName || 'Siswa StepUp',
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Firebase saveSessionResult error:', error);
      return false;
    }
  }

  /**
   * Save pretest placement result in Firebase Firestore
   */
  static async savePretestResult(result: PretestResult): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      // 1. User private pretest
      const userPretestRef = doc(db, 'users', user.uid, 'pretest', 'latest');
      await setDoc(userPretestRef, {
        ...result,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });

      // 2. Global pretest results collection
      const rootPretestRef = doc(db, 'pretestResults', user.uid);
      await setDoc(rootPretestRef, {
        ...result,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Firebase savePretestResult error:', error);
      return false;
    }
  }

  /**
   * Real-time Firestore subscription for User Profile, Level Progress & Pretest
   */
  static subscribeToUserData(
    onUpdate: (data: FirebaseUserData) => void
  ): Unsubscribe | null {
    let unsubscribeUserDoc: Unsubscribe | null = null;
    let unsubscribePretestDoc: Unsubscribe | null = null;

    ensureFirebaseAuth().then((user) => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      unsubscribeUserDoc = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const profile: StudentProfile = {
            name: data.name || '',
            grade: data.grade || '',
            school: data.school || '',
            avatar: data.avatar || '🦊',
            joinedDate: data.joinedDate || Date.now(),
            accessGranted: data.accessGranted ?? true,
            isAdmin: data.isAdmin || false,
            isTrial: data.isTrial || false,
            pretestCompleted: data.pretestCompleted || false,
            startingLevel: data.startingLevel || null,
            currentLevel: data.currentLevel || '6A',
            totalWorksheetsCompleted: data.totalWorksheetsCompleted || 0,
            totalPoints: data.totalPoints || 0,
            streakDays: data.streakDays || 1,
            lastStudyDate: data.lastStudyDate || ''
          };

          const levelProgress = (data.levelProgress as Record<KumonLevelId, LevelProgress>) || null;

          onUpdate({
            profile,
            levelProgress,
            pretestResult: null
          });
        }
      }, (err) => {
        console.warn('Firestore userDoc snapshot listener notice:', err);
      });

      // Also listen to pretest
      const pretestRef = doc(db, 'users', user.uid, 'pretest', 'latest');
      unsubscribePretestDoc = onSnapshot(pretestRef, (snapshot) => {
        if (snapshot.exists()) {
          const pretestData = snapshot.data() as PretestResult;
          onUpdate({
            profile: null,
            levelProgress: null,
            pretestResult: pretestData
          });
        }
      }, (err) => {
        console.warn('Firestore pretest snapshot listener notice:', err);
      });
    });

    return () => {
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribePretestDoc) unsubscribePretestDoc();
    };
  }

  /**
   * Real-time Firestore subscription for Session History Drills
   */
  static subscribeToSessions(
    onUpdate: (sessions: WorksheetSessionResult[]) => void
  ): Unsubscribe | null {
    let unsubscribeSessions: Unsubscribe | null = null;

    ensureFirebaseAuth().then((user) => {
      if (!user) return;

      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));

      unsubscribeSessions = onSnapshot(q, (snapshot) => {
        const sessions: WorksheetSessionResult[] = snapshot.docs.map(docSnap => docSnap.data() as WorksheetSessionResult);
        onUpdate(sessions);
      }, (err) => {
        console.warn('Firestore sessions snapshot listener notice:', err);
      });
    });

    return () => {
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }

  /**
   * Fetch all user data directly from Firestore on initial boot
   */
  static async loadAllUserData(): Promise<{
    profile?: StudentProfile;
    levelProgress?: Record<KumonLevelId, LevelProgress>;
    sessionHistory?: WorksheetSessionResult[];
    pretestResult?: PretestResult;
  } | null> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return null;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return null;
      }

      const userData = userDocSnap.data();
      const profile: StudentProfile = {
        name: userData.name || '',
        grade: userData.grade || '',
        school: userData.school || '',
        avatar: userData.avatar || '🦊',
        joinedDate: userData.joinedDate || Date.now(),
        accessGranted: userData.accessGranted ?? true,
        isAdmin: userData.isAdmin || false,
        isTrial: userData.isTrial || false,
        pretestCompleted: userData.pretestCompleted || false,
        startingLevel: userData.startingLevel || null,
        currentLevel: userData.currentLevel || '6A',
        totalWorksheetsCompleted: userData.totalWorksheetsCompleted || 0,
        totalPoints: userData.totalPoints || 0,
        streakDays: userData.streakDays || 1,
        lastStudyDate: userData.lastStudyDate || ''
      };

      const levelProgress = userData?.levelProgress as Record<KumonLevelId, LevelProgress> | undefined;

      // Load session history from subcollection
      let sessionHistory: WorksheetSessionResult[] = [];
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
        const querySnap = await getDocs(q);
        sessionHistory = querySnap.docs.map(d => d.data() as WorksheetSessionResult);
      } catch (err) {
        console.warn('Could not fetch sessions from Firebase:', err);
      }

      // Load pretest
      let pretestResult: PretestResult | undefined;
      try {
        const pretestDocRef = doc(db, 'users', user.uid, 'pretest', 'latest');
        const pretestSnap = await getDoc(pretestDocRef);
        if (pretestSnap.exists()) {
          pretestResult = pretestSnap.data() as PretestResult;
        }
      } catch (err) {
        console.warn('Could not fetch pretest from Firebase:', err);
      }

      return {
        profile,
        levelProgress,
        sessionHistory,
        pretestResult
      };
    } catch (error) {
      console.error('Failed to load user data from Firebase Firestore:', error);
      return null;
    }
  }

  /**
   * Reset all data in Firebase Firestore for the active user
   */
  static async resetAllUserData(): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      const pretestDocRef = doc(db, 'users', user.uid, 'pretest', 'latest');
      await deleteDoc(pretestDocRef);

      return true;
    } catch (error) {
      console.error('Firebase resetAllUserData error:', error);
      return false;
    }
  }

  // Backward compatibility alias methods
  static syncProfileToCloud = FirebaseDatabaseService.saveProfile;
  static syncLevelProgressToCloud = FirebaseDatabaseService.saveLevelProgress;
  static syncSessionResultToCloud = FirebaseDatabaseService.saveSessionResult;
  static syncPretestResultToCloud = FirebaseDatabaseService.savePretestResult;
  static loadAllUserDataFromCloud = FirebaseDatabaseService.loadAllUserData;
}

// Export backward compatibility alias
export const FirebaseSyncService = FirebaseDatabaseService;
