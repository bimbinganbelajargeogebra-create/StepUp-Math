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
  PretestResult,
  UserAccount,
  AccountStatus
} from '../types';
import { 
  getStoredAccounts, 
  saveStoredAccounts, 
  getStoredAccountByUsername, 
  upsertStoredAccount 
} from '../utils/storage';

export interface FirebaseUserData {
  profile: StudentProfile | null;
  levelProgress: Record<KumonLevelId, LevelProgress> | null;
  pretestResult: PretestResult | null;
}

export class FirebaseDatabaseService {
  /**
   * Register a new student account (Status: Pending approval by admin)
   * Resilient to offline mode, network drops, and seamless sync
   */
  static async registerAccount(accountData: {
    username: string;
    name: string;
    password: string;
    grade: string;
    school?: string;
    avatar: string;
  }): Promise<{ success: boolean; message: string; account?: UserAccount }> {
    try {
      const cleanUsername = accountData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!cleanUsername || cleanUsername.length < 3) {
        return { success: false, message: 'Username minimal 3 karakter (huruf, angka, atau garis bawah).' };
      }
      if (!accountData.password || accountData.password.length < 4) {
        return { success: false, message: 'Password minimal 4 karakter.' };
      }
      if (!accountData.name.trim()) {
        return { success: false, message: 'Nama lengkap wajib diisi.' };
      }

      // Check local cache first
      const localExisting = getStoredAccountByUsername(cleanUsername);
      if (localExisting) {
        return { success: false, message: `Username "${cleanUsername}" sudah terdaftar. Silakan pilih username lain.` };
      }

      const now = Date.now();
      const newAccount: UserAccount = {
        username: cleanUsername,
        name: accountData.name.trim(),
        password: accountData.password,
        grade: accountData.grade || 'SD Kelas 3',
        school: accountData.school?.trim() || '',
        avatar: accountData.avatar || '🦊',
        status: 'pending',
        role: 'student',
        createdAt: now,
        updatedAt: now,
        startingLevel: null,
        currentLevel: '6A',
        pretestCompleted: false,
        totalWorksheetsCompleted: 0,
        totalPoints: 0,
        streakDays: 1,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };

      // Always save to local storage immediately so registration is guaranteed
      upsertStoredAccount(newAccount);

      // Attempt Firestore check & sync
      try {
        await ensureFirebaseAuth();
        const accountRef = doc(db, 'accounts', cleanUsername);
        
        let existingDoc = null;
        try {
          existingDoc = await getDoc(accountRef);
        } catch (getErr) {
          console.warn('Firestore getDoc check notice (proceeding with local-first save):', getErr);
        }

        if (existingDoc && existingDoc.exists()) {
          const remoteAcc = existingDoc.data() as UserAccount;
          upsertStoredAccount(remoteAcc);
          return { success: false, message: `Username "${cleanUsername}" sudah digunakan di database. Silakan gunakan username lain.` };
        }

        // Write to Firestore in background
        setDoc(accountRef, newAccount).catch((writeErr) => {
          console.warn('Firestore setDoc deferred notice:', writeErr);
        });
      } catch (cloudErr) {
        console.warn('Firebase register sync deferred to local storage:', cloudErr);
      }

      return { 
        success: true, 
        message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (Approve) Guru / Admin.',
        account: newAccount 
      };
    } catch (error) {
      console.error('Firebase registerAccount error:', error);
      return { success: false, message: 'Gagal melakukan pendaftaran. Silakan periksa isian data Anda.' };
    }
  }

  /**
   * Authenticate student or admin using username and password
   */
  static async loginWithCredentials(
    usernameInput: string, 
    passwordInput: string
  ): Promise<{ 
    success: boolean; 
    message: string; 
    account?: UserAccount; 
    status?: AccountStatus | 'admin';
  }> {
    try {
      const cleanUsername = usernameInput.trim().toLowerCase();
      const cleanPassword = passwordInput.trim();

      if (!cleanUsername || !cleanPassword) {
        return { success: false, message: 'Silakan isi username dan password dengan lengkap.' };
      }

      // Check Master Admin direct credentials
      if (
        (cleanUsername === 'admin' || cleanUsername === 'guru') && 
        (cleanPassword === 'bajuri39' || cleanPassword === 'pakarmath2025')
      ) {
        return {
          success: true,
          status: 'admin',
          message: 'Login sebagai Administrator berhasil.',
          account: {
            username: 'admin',
            name: 'Guru Pengajar / Super Admin',
            grade: 'Admin & Guru Pengajar',
            avatar: '⭐',
            status: 'approved',
            role: 'admin',
            createdAt: Date.now()
          }
        };
      }

      // 1. Check local cache first
      let account: UserAccount | null = getStoredAccountByUsername(cleanUsername);

      // 2. Try fetching from Firestore with fallback
      try {
        await ensureFirebaseAuth();
        const accountRef = doc(db, 'accounts', cleanUsername);
        const accountDoc = await getDoc(accountRef);
        if (accountDoc.exists()) {
          account = accountDoc.data() as UserAccount;
          upsertStoredAccount(account);
        }
      } catch (cloudErr) {
        console.warn('Firestore login fetch notice (using local cache if present):', cloudErr);
      }

      if (!account) {
        return { 
          success: false, 
          message: `Akun dengan username "${cleanUsername}" tidak ditemukan. Silakan periksa kembali atau daftar akun baru.` 
        };
      }

      // Verify password
      if (account.password && account.password !== cleanPassword) {
        return { success: false, message: 'Password salah. Silakan periksa kembali.' };
      }

      // Check approval status
      if (account.status === 'pending') {
        return {
          success: false,
          status: 'pending',
          account,
          message: 'Akun Anda sedang dalam proses verifikasi (Menunggu Approval Guru / Admin). Silakan hubungi pengajar Anda.'
        };
      }

      if (account.status === 'rejected') {
        return {
          success: false,
          status: 'rejected',
          account,
          message: `Pendaftaran Anda tidak disetujui (Ditolak).${account.rejectionReason ? ` Alasan: "${account.rejectionReason}"` : ''} Silakan hubungi Guru Anda.`
        };
      }

      return {
        success: true,
        status: 'approved',
        account,
        message: 'Login berhasil! Selamat belajar.'
      };
    } catch (error) {
      console.error('Firebase loginWithCredentials error:', error);
      return { success: false, message: 'Gagal melakukan verifikasi akun. Periksa username dan password Anda.' };
    }
  }

  /**
   * Check status of a username in real-time
   */
  static async checkAccountStatus(usernameInput: string): Promise<{
    exists: boolean;
    account?: UserAccount;
    status?: AccountStatus;
  }> {
    try {
      const cleanUsername = usernameInput.trim().toLowerCase();
      if (!cleanUsername) return { exists: false };

      // Check local cache first
      let account: UserAccount | null = getStoredAccountByUsername(cleanUsername);

      try {
        await ensureFirebaseAuth();
        const accountRef = doc(db, 'accounts', cleanUsername);
        const accountDoc = await getDoc(accountRef);
        if (accountDoc.exists()) {
          account = accountDoc.data() as UserAccount;
          upsertStoredAccount(account);
        }
      } catch (err) {
        console.warn('Firestore checkAccountStatus notice (falling back to local):', err);
      }

      if (!account) {
        return { exists: false };
      }

      return {
        exists: true,
        account,
        status: account.status
      };
    } catch (error) {
      console.error('Firebase checkAccountStatus error:', error);
      return { exists: false };
    }
  }

  /**
   * Subscribe to all registered student accounts in real-time (for Admin Dashboard)
   */
  static subscribeToAccounts(
    onUpdate: (accounts: UserAccount[]) => void
  ): Unsubscribe | null {
    let unsubscribeAccounts: Unsubscribe | null = null;

    // Immediately deliver local accounts
    const initialLocal = getStoredAccounts();
    if (initialLocal.length > 0) {
      onUpdate(initialLocal);
    }

    ensureFirebaseAuth().then(() => {
      try {
        const accountsRef = collection(db, 'accounts');
        const q = query(accountsRef, orderBy('createdAt', 'desc'));

        unsubscribeAccounts = onSnapshot(q, (snapshot) => {
          const remoteAccounts: UserAccount[] = snapshot.docs.map(docSnap => docSnap.data() as UserAccount);
          
          // Merge remote with local
          const localMap = new Map<string, UserAccount>();
          getStoredAccounts().forEach(acc => localMap.set(acc.username.toLowerCase(), acc));
          remoteAccounts.forEach(acc => localMap.set(acc.username.toLowerCase(), acc));
          
          const merged = Array.from(localMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveStoredAccounts(merged);
          onUpdate(merged);
        }, (err) => {
          console.warn('Firestore accounts snapshot listener notice (continuing with local cache):', err);
        });
      } catch (err) {
        console.warn('Firestore accounts subscription setup notice:', err);
      }
    }).catch(err => {
      console.warn('FirebaseAuth error during subscribeToAccounts:', err);
    });

    return () => {
      if (unsubscribeAccounts) unsubscribeAccounts();
    };
  }

  /**
   * Approve student account
   */
  static async approveAccount(
    username: string, 
    adminName: string = 'Admin', 
    startingLevel?: KumonLevelId
  ): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      // 1. Update local storage cache immediately
      const existing = getStoredAccountByUsername(cleanUsername);
      if (existing) {
        upsertStoredAccount({
          ...existing,
          status: 'approved',
          approvedAt: Date.now(),
          reviewedBy: adminName,
          updatedAt: Date.now(),
          ...(startingLevel ? { startingLevel, currentLevel: startingLevel } : {})
        });
      }

      // 2. Sync to Firestore
      ensureFirebaseAuth().then(() => {
        const accountRef = doc(db, 'accounts', cleanUsername);
        setDoc(accountRef, {
          status: 'approved',
          approvedAt: Date.now(),
          reviewedBy: adminName,
          updatedAt: Date.now(),
          ...(startingLevel ? { startingLevel, currentLevel: startingLevel } : {})
        }, { merge: true }).catch(err => console.warn('Firestore approveAccount write notice:', err));
      }).catch(err => console.warn('Auth notice:', err));

      return true;
    } catch (error) {
      console.error('Firebase approveAccount error:', error);
      return false;
    }
  }

  /**
   * Reject student account with optional reason
   */
  static async rejectAccount(
    username: string, 
    adminName: string = 'Admin', 
    reason?: string
  ): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      // 1. Update local storage cache immediately
      const existing = getStoredAccountByUsername(cleanUsername);
      if (existing) {
        upsertStoredAccount({
          ...existing,
          status: 'rejected',
          rejectedAt: Date.now(),
          rejectionReason: reason || 'Data pendaftaran belum sesuai atau belum terdaftar resmi di bimbingan belajar.',
          reviewedBy: adminName,
          updatedAt: Date.now()
        });
      }

      // 2. Sync to Firestore
      ensureFirebaseAuth().then(() => {
        const accountRef = doc(db, 'accounts', cleanUsername);
        setDoc(accountRef, {
          status: 'rejected',
          rejectedAt: Date.now(),
          rejectionReason: reason || 'Data pendaftaran belum sesuai atau belum terdaftar resmi di bimbingan belajar.',
          reviewedBy: adminName,
          updatedAt: Date.now()
        }, { merge: true }).catch(err => console.warn('Firestore rejectAccount write notice:', err));
      }).catch(err => console.warn('Auth notice:', err));

      return true;
    } catch (error) {
      console.error('Firebase rejectAccount error:', error);
      return false;
    }
  }

  /**
   * Reset student account back to pending status
   */
  static async resetAccountToPending(username: string): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      const existing = getStoredAccountByUsername(cleanUsername);
      if (existing) {
        upsertStoredAccount({
          ...existing,
          status: 'pending',
          updatedAt: Date.now()
        });
      }

      ensureFirebaseAuth().then(() => {
        const accountRef = doc(db, 'accounts', cleanUsername);
        setDoc(accountRef, {
          status: 'pending',
          updatedAt: Date.now()
        }, { merge: true }).catch(err => console.warn('Firestore resetAccountToPending write notice:', err));
      }).catch(err => console.warn('Auth notice:', err));

      return true;
    } catch (error) {
      console.error('Firebase resetAccountToPending error:', error);
      return false;
    }
  }

  /**
   * Delete student account permanently
   */
  static async deleteAccount(username: string): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      const current = getStoredAccounts().filter(a => a.username.toLowerCase() !== cleanUsername);
      saveStoredAccounts(current);

      ensureFirebaseAuth().then(() => {
        const accountRef = doc(db, 'accounts', cleanUsername);
        deleteDoc(accountRef).catch(err => console.warn('Firestore deleteAccount notice:', err));
      }).catch(err => console.warn('Auth notice:', err));

      return true;
    } catch (error) {
      console.error('Firebase deleteAccount error:', error);
      return false;
    }
  }

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

      // If profile is linked to a username account, mirror updates to accounts collection
      if (profile.username) {
        const accountRef = doc(db, 'accounts', profile.username.toLowerCase());
        await setDoc(accountRef, {
          name: profile.name,
          grade: profile.grade,
          school: profile.school || '',
          avatar: profile.avatar,
          startingLevel: profile.startingLevel,
          currentLevel: profile.currentLevel,
          pretestCompleted: profile.pretestCompleted,
          totalWorksheetsCompleted: profile.totalWorksheetsCompleted,
          totalPoints: profile.totalPoints,
          streakDays: profile.streakDays,
          lastStudyDate: profile.lastStudyDate,
          updatedAt: Date.now()
        }, { merge: true });
      }

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
            username: data.username || undefined,
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
        username: userData.username || undefined,
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

