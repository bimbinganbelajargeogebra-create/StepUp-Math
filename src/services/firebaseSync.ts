import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where,
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
  AccountStatus,
  UnlockedBadge,
  ReflectionJournalEntry
} from '../types';
import { 
  getStoredAccounts, 
  saveStoredAccounts, 
  getStoredAccountByUsername, 
  upsertStoredAccount,
  generateCleanLevelProgress,
  getStoredProfile,
  getStoredLevelProgress,
  getStoredPretestResult
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
            name: 'Pak GuruAI',
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
      const normalizedUsername = cleanUsername.replace(/[^a-z0-9_]/g, '');

      // 2. Try fetching from Firestore with fallback
      try {
        await ensureFirebaseAuth();
        let accountDoc = await getDoc(doc(db, 'accounts', cleanUsername));
        if (!accountDoc.exists() && normalizedUsername && normalizedUsername !== cleanUsername) {
          accountDoc = await getDoc(doc(db, 'accounts', normalizedUsername));
        }

        // If not found by direct doc ID, try querying by username or student name
        let docData = accountDoc.exists() ? accountDoc.data() : null;
        let matchedDocId = accountDoc.exists() ? accountDoc.id : cleanUsername;

        if (!docData) {
          try {
            const accCollection = collection(db, 'accounts');
            const qUser = query(accCollection, where('username', '==', cleanUsername), limit(1));
            const snapUser = await getDocs(qUser);
            if (!snapUser.empty) {
              docData = snapUser.docs[0].data();
              matchedDocId = snapUser.docs[0].id;
            } else if (normalizedUsername) {
              const qNorm = query(accCollection, where('username', '==', normalizedUsername), limit(1));
              const snapNorm = await getDocs(qNorm);
              if (!snapNorm.empty) {
                docData = snapNorm.docs[0].data();
                matchedDocId = snapNorm.docs[0].id;
              }
            }
            if (!docData) {
              const qName = query(accCollection, where('name', '==', usernameInput.trim()), limit(1));
              const snapName = await getDocs(qName);
              if (!snapName.empty) {
                docData = snapName.docs[0].data();
                matchedDocId = snapName.docs[0].id;
              }
            }
          } catch (queryErr) {
            console.warn('Firestore accounts query notice:', queryErr);
          }
        }

        if (docData) {
          const hasPretest = Boolean(
            docData.pretestCompleted === true ||
            docData.pretestResult ||
            (docData.startingLevel && docData.startingLevel !== null)
          );
          const assignedLvl = docData.startingLevel || (hasPretest ? (docData.currentLevel || '6A') : null);
          account = {
            username: docData.username || matchedDocId || cleanUsername,
            ...docData,
            pretestCompleted: hasPretest,
            startingLevel: assignedLvl,
            currentLevel: docData.currentLevel || assignedLvl || '6A',
            lastStudiedLevel: docData.lastStudiedLevel || assignedLvl || '6A',
            lastStudiedWorksheet: docData.lastStudiedWorksheet || 1,
            levelProgress: docData.levelProgress || undefined,
            pretestResult: docData.pretestResult || undefined
          } as UserAccount;
          upsertStoredAccount(account);
        }

        // Secondary check: verify if studentPretests exists in Firestore
        const targetSearchKey = account?.username || cleanUsername;
        if (account && !account.pretestCompleted) {
          const pretestDocRef = doc(db, 'studentPretests', targetSearchKey);
          let pretestDocSnap = await getDoc(pretestDocRef);
          if (!pretestDocSnap.exists() && normalizedUsername && normalizedUsername !== targetSearchKey) {
            pretestDocSnap = await getDoc(doc(db, 'studentPretests', normalizedUsername));
          }
          if (pretestDocSnap.exists()) {
            const preData = pretestDocSnap.data() as PretestResult;
            account.pretestCompleted = true;
            if (preData?.assignedLevel) {
              account.startingLevel = preData.assignedLevel;
              account.currentLevel = preData.assignedLevel;
              account.lastStudiedLevel = preData.assignedLevel;
              account.lastStudiedWorksheet = 1;
            }
            if (preData) {
              account.pretestResult = preData;
            }
            upsertStoredAccount(account);

            // Backfill accounts doc in Firestore so future queries are instant
            try {
              await setDoc(doc(db, 'accounts', targetSearchKey), {
                pretestCompleted: true,
                startingLevel: account.startingLevel,
                currentLevel: account.currentLevel,
                lastStudiedLevel: account.lastStudiedLevel,
                lastStudiedWorksheet: 1,
                pretestResult: preData,
                updatedAt: Date.now()
              }, { merge: true });
            } catch (backfillErr) {
              console.warn('Accounts pretest backfill notice:', backfillErr);
            }
          }
        }

        // Check if startingLevel is already assigned
        if (account && account.startingLevel && account.startingLevel !== null) {
          account.pretestCompleted = true;
          upsertStoredAccount(account);
        }
      } catch (cloudErr) {
        console.warn('Firestore login fetch notice (using local cache if present):', cloudErr);
      }

      // Check local pretest results fallback
      if (account && !account.pretestCompleted) {
        const localPretest = getStoredPretestResult();
        const localProfile = getStoredProfile();
        if (localPretest && (localProfile?.username?.toLowerCase() === cleanUsername || !localProfile?.username)) {
          account.pretestCompleted = true;
          account.startingLevel = localPretest.assignedLevel || account.startingLevel || '6A';
          account.currentLevel = localPretest.assignedLevel || account.currentLevel || '6A';
          account.pretestResult = localPretest;
          upsertStoredAccount(account);
        }
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

      // Check approval status: students must be approved by Teacher/Admin
      if (account.status === 'pending') {
        return {
          success: false,
          status: 'pending',
          account,
          message: 'Akun Anda sedang dalam proses verifikasi (Menunggu Approval Guru / Admin). Silakan hubungi guru Anda untuk menyetujui akun Anda di Panel Admin.'
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

      if (account.role !== 'admin' && account.status !== 'approved') {
        return {
          success: false,
          status: account.status || 'pending',
          account,
          message: 'Akun Anda belum disetujui (Approve) oleh Guru / Admin. Akses login hanya untuk akun yang sudah didaftarkan dan telah disetujui.'
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
        const normalizedUsername = cleanUsername.replace(/[^a-z0-9_]/g, '');
        let accountDoc = await getDoc(doc(db, 'accounts', cleanUsername));
        if (!accountDoc.exists() && normalizedUsername && normalizedUsername !== cleanUsername) {
          accountDoc = await getDoc(doc(db, 'accounts', normalizedUsername));
        }

        if (accountDoc.exists()) {
          const docData = accountDoc.data();
          if (docData) {
            const hasPretest = Boolean(
              docData.pretestCompleted === true ||
              docData.pretestResult ||
              (docData.startingLevel && docData.startingLevel !== null)
            );
            const assignedLvl = docData.startingLevel || (hasPretest ? (docData.currentLevel || '6A') : null);
            account = {
              username: docData.username || accountDoc.id || cleanUsername,
              ...docData,
              pretestCompleted: hasPretest,
              startingLevel: assignedLvl,
              currentLevel: docData.currentLevel || assignedLvl || '6A',
              lastStudiedLevel: docData.lastStudiedLevel || assignedLvl || '6A',
              lastStudiedWorksheet: docData.lastStudiedWorksheet || 1,
              levelProgress: docData.levelProgress || undefined,
              pretestResult: docData.pretestResult || undefined
            } as UserAccount;
            upsertStoredAccount(account);
          }
        }

        // Secondary check for pretest
        if (account && !account.pretestCompleted) {
          const targetKey = account.username || cleanUsername;
          const preRef = doc(db, 'studentPretests', targetKey);
          const preSnap = await getDoc(preRef);
          if (preSnap.exists()) {
            const pData = preSnap.data() as PretestResult;
            account.pretestCompleted = true;
            if (pData?.assignedLevel) {
              account.startingLevel = pData.assignedLevel;
              account.currentLevel = pData.assignedLevel;
              account.lastStudiedLevel = pData.assignedLevel;
            }
            account.pretestResult = pData;
            upsertStoredAccount(account);
          }
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
          const remoteAccounts: UserAccount[] = snapshot.docs
            .map(docSnap => {
              const data = docSnap.data();
              if (!data) return null;
              const rawUsername = data.username || docSnap.id || '';
              const username = String(rawUsername).trim().toLowerCase();
              if (!username) return null;
              return {
                ...data,
                username,
              } as UserAccount;
            })
            .filter((item): item is UserAccount => item !== null);
          
          // Merge remote with local
          const localMap = new Map<string, UserAccount>();
          getStoredAccounts().forEach(acc => {
            if (acc && typeof acc.username === 'string' && acc.username.trim()) {
              localMap.set(acc.username.trim().toLowerCase(), acc);
            }
          });
          remoteAccounts.forEach(acc => {
            if (acc && typeof acc.username === 'string' && acc.username.trim()) {
              localMap.set(acc.username.trim().toLowerCase(), acc);
            }
          });
          
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
   * Approve student account with pretest persistence protection
   */
  static async approveAccount(
    username: string, 
    adminName: string = 'Pak GuruAI', 
    startingLevel?: KumonLevelId
  ): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      const existing = getStoredAccountByUsername(cleanUsername);
      let hasDonePretest = Boolean(existing?.pretestCompleted || existing?.startingLevel);
      let assignedLevel = startingLevel || existing?.startingLevel || existing?.currentLevel || '6A';

      await ensureFirebaseAuth();
      const accountRef = doc(db, 'accounts', cleanUsername);
      const snap = await getDoc(accountRef);
      if (snap.exists()) {
        const snapData = snap.data();
        if (snapData.pretestCompleted || snapData.startingLevel || snapData.pretestResult) {
          hasDonePretest = true;
          assignedLevel = snapData.startingLevel || startingLevel || snapData.currentLevel || assignedLevel;
        }
      }

      const cleanProgress = existing?.levelProgress || generateCleanLevelProgress(assignedLevel, true);

      // 1. Update local storage cache immediately
      const updatedAccount: UserAccount = {
        ...(existing || {}),
        username: cleanUsername,
        name: existing?.name || cleanUsername,
        password: existing?.password || '',
        grade: existing?.grade || 'SD Kelas 3',
        avatar: existing?.avatar || '🦊',
        status: 'approved',
        role: existing?.role || 'student',
        createdAt: existing?.createdAt || Date.now(),
        approvedAt: Date.now(),
        reviewedBy: adminName,
        updatedAt: Date.now(),
        pretestCompleted: hasDonePretest,
        startingLevel: hasDonePretest ? assignedLevel : (startingLevel || null),
        currentLevel: assignedLevel,
        levelProgress: cleanProgress
      };
      upsertStoredAccount(updatedAccount);

      // 2. Sync to Firestore
      await setDoc(accountRef, {
        status: 'approved',
        approvedAt: Date.now(),
        reviewedBy: adminName,
        updatedAt: Date.now(),
        pretestCompleted: hasDonePretest,
        startingLevel: hasDonePretest ? assignedLevel : (startingLevel || null),
        currentLevel: assignedLevel,
        levelProgress: cleanProgress
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Firebase approveAccount error:', error);
      return false;
    }
  }

  /**
   * Update student assigned level (Guru / Admin) and calibrate level progress
   */
  static async updateStudentLevel(
    username: string,
    newLevel: KumonLevelId,
    adminName: string = 'Pak GuruAI'
  ): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    try {
      const cleanProgress = generateCleanLevelProgress(newLevel, true);

      // 1. Update local storage cache
      const existing = getStoredAccountByUsername(cleanUsername);
      if (existing) {
        upsertStoredAccount({
          ...existing,
          pretestCompleted: true,
          startingLevel: newLevel,
          currentLevel: newLevel,
          lastStudiedLevel: newLevel,
          lastStudiedWorksheet: 1,
          levelProgress: cleanProgress,
          updatedAt: Date.now(),
          reviewedBy: adminName
        });
      }

      // 2. Sync to Firestore
      await ensureFirebaseAuth();
      const accountRef = doc(db, 'accounts', cleanUsername);
      await setDoc(accountRef, {
        pretestCompleted: true,
        startingLevel: newLevel,
        currentLevel: newLevel,
        lastStudiedLevel: newLevel,
        lastStudiedWorksheet: 1,
        levelProgress: cleanProgress,
        updatedAt: Date.now(),
        reviewedBy: adminName
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Firebase updateStudentLevel error:', error);
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

      const isDone = Boolean(profile.pretestCompleted || profile.startingLevel);
      const startingLvl = profile.startingLevel || (isDone ? (profile.currentLevel || '6A') : null);

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        ...profile,
        pretestCompleted: isDone,
        startingLevel: startingLvl,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // If profile is linked to a username account, mirror updates to accounts collection
      if (profile.username) {
        const cleanUsername = profile.username.toLowerCase();
        const accountRef = doc(db, 'accounts', cleanUsername);
        const currentProgress = getStoredLevelProgress();
        const pretestRes = getStoredPretestResult();

        await setDoc(accountRef, {
          name: profile.name,
          grade: profile.grade,
          school: profile.school || '',
          avatar: profile.avatar,
          startingLevel: startingLvl,
          currentLevel: profile.currentLevel || startingLvl || '6A',
          lastStudiedLevel: profile.lastStudiedLevel || profile.currentLevel || startingLvl || '6A',
          lastStudiedWorksheet: profile.lastStudiedWorksheet || 1,
          lastStudiedScore: profile.lastStudiedScore || null,
          lastStudiedAt: profile.lastStudiedAt || Date.now(),
          pretestCompleted: isDone,
          levelProgress: currentProgress || null,
          pretestResult: pretestRes || null,
          totalWorksheetsCompleted: profile.totalWorksheetsCompleted || 0,
          totalPoints: profile.totalPoints || 0,
          streakDays: profile.streakDays || 1,
          lastStudyDate: profile.lastStudyDate || '',
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

      // If user is a student with username, also mirror to accounts/{username}
      const profile = getStoredProfile();
      if (profile?.username) {
        const accountRef = doc(db, 'accounts', profile.username.toLowerCase());
        await setDoc(accountRef, {
          levelProgress: progress,
          updatedAt: Date.now()
        }, { merge: true });
      }

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
        studentName: studentName || 'Siswa AlgoriMath',
        createdAt: serverTimestamp()
      });

      // 2. Global session history collection for teacher analytics & leaderboard
      const rootSessionRef = doc(db, 'sessionHistory', `${user.uid}_${result.id}`);
      await setDoc(rootSessionRef, {
        ...result,
        userId: user.uid,
        studentName: studentName || 'Siswa AlgoriMath',
        createdAt: serverTimestamp()
      });

      // 3. Update user document with latest learning position and stats
      const currentProfile = getStoredProfile();
      const currentProgress = getStoredLevelProgress();
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        lastStudiedLevel: result.levelId,
        lastStudiedWorksheet: result.worksheetNum,
        lastStudiedScore: result.score,
        lastStudiedAt: result.timestamp,
        currentLevel: result.levelId,
        levelProgress: currentProgress,
        totalWorksheetsCompleted: currentProfile?.totalWorksheetsCompleted || 0,
        totalPoints: currentProfile?.totalPoints || 0,
        streakDays: currentProfile?.streakDays || 1,
        lastStudyDate: currentProfile?.lastStudyDate || '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 4. Update student account record in accounts collection
      const targetUsername = currentProfile?.username?.toLowerCase();
      if (targetUsername) {
        const accountRef = doc(db, 'accounts', targetUsername);
        await setDoc(accountRef, {
          lastStudiedLevel: result.levelId,
          lastStudiedWorksheet: result.worksheetNum,
          lastStudiedScore: result.score,
          lastStudiedAt: result.timestamp,
          currentLevel: result.levelId,
          levelProgress: currentProgress,
          totalWorksheetsCompleted: currentProfile?.totalWorksheetsCompleted || 0,
          totalPoints: currentProfile?.totalPoints || 0,
          streakDays: currentProfile?.streakDays || 1,
          lastStudyDate: currentProfile?.lastStudyDate || '',
          updatedAt: Date.now()
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Firebase saveSessionResult error:', error);
      return false;
    }
  }

  /**
   * Save pretest placement result in Firebase Firestore
   */
  static async savePretestResult(result: PretestResult, studentUsername?: string): Promise<boolean> {
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

      // 3. User root doc
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        pretestCompleted: true,
        startingLevel: result.assignedLevel,
        currentLevel: result.assignedLevel,
        lastStudiedLevel: result.assignedLevel,
        lastStudiedWorksheet: 1,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 4. Update student account record in Firestore accounts collection
      const profile = getStoredProfile();
      const rawUser = studentUsername || profile?.username || (profile?.name ? profile.name.toLowerCase().replace(/[^a-z0-9_]/g, '') : null);
      const targetUsername = rawUser?.trim().toLowerCase();
      if (targetUsername) {
        const cleanUser = targetUsername.replace(/[^a-z0-9_]/g, '');
        const progress = getStoredLevelProgress();
        const accountPayload = {
          pretestCompleted: true,
          startingLevel: result.assignedLevel,
          currentLevel: result.assignedLevel,
          lastStudiedLevel: result.assignedLevel,
          lastStudiedWorksheet: 1,
          levelProgress: progress,
          pretestResult: result,
          updatedAt: Date.now()
        };

        const accountRef = doc(db, 'accounts', targetUsername);
        await setDoc(accountRef, accountPayload, { merge: true });
        if (cleanUser && cleanUser !== targetUsername) {
          await setDoc(doc(db, 'accounts', cleanUser), accountPayload, { merge: true });
        }

        // Update studentPretests lookup under targetUsername and cleanUser
        const studentPretestRef = doc(db, 'studentPretests', targetUsername);
        await setDoc(studentPretestRef, {
          username: targetUsername,
          userId: user.uid,
          ...result,
          updatedAt: serverTimestamp()
        }, { merge: true });

        if (cleanUser && cleanUser !== targetUsername) {
          await setDoc(doc(db, 'studentPretests', cleanUser), {
            username: cleanUser,
            userId: user.uid,
            ...result,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      }

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
    onUpdate: (data: FirebaseUserData) => void,
    usernameOverride?: string
  ): Unsubscribe | null {
    let unsubscribeUserDoc: Unsubscribe | null = null;
    let unsubscribePretestDoc: Unsubscribe | null = null;
    let unsubscribeAccountDoc: Unsubscribe | null = null;
    let unsubscribeStudentPretestDoc: Unsubscribe | null = null;

    ensureFirebaseAuth().then((user) => {
      if (!user) return;

      const localProf = getStoredProfile();
      const rawUser = (usernameOverride || localProf?.username || localProf?.name)?.trim().toLowerCase();
      const currentUsername = rawUser ? rawUser.replace(/[^a-z0-9_]/g, '') : null;

      // When student has a username, accounts/{currentUsername} is the SINGLE SOURCE OF TRUTH across all devices.
      // We deliberately DO NOT listen to users/{user.uid} here to prevent another device's anonymous auth
      // from overwriting the real student profile and pretest status.
      if (currentUsername) {
        try {
          const accountRef = doc(db, 'accounts', currentUsername);
          unsubscribeAccountDoc = onSnapshot(accountRef, (snapshot) => {
            if (snapshot.exists()) {
              const accData = snapshot.data();
              const hasPretest = Boolean(
                accData.pretestCompleted === true ||
                accData.pretestResult ||
                (accData.startingLevel && accData.startingLevel !== null)
              );
              const assignedLvl = accData.startingLevel || (hasPretest ? (accData.currentLevel || '6A') : null);

              const updatedProfile: StudentProfile = {
                username: currentUsername,
                name: accData.name || localProf?.name || currentUsername,
                grade: accData.grade || localProf?.grade || 'SD Kelas 3',
                school: accData.school || localProf?.school || '',
                avatar: accData.avatar || localProf?.avatar || '🦊',
                joinedDate: accData.createdAt || localProf?.joinedDate || Date.now(),
                accessGranted: true,
                isAdmin: accData.role === 'admin' || localProf?.isAdmin || false,
                isTrial: false,
                pretestCompleted: hasPretest,
                startingLevel: assignedLvl,
                currentLevel: accData.currentLevel || assignedLvl || '6A',
                lastStudiedLevel: accData.lastStudiedLevel || assignedLvl || '6A',
                lastStudiedWorksheet: accData.lastStudiedWorksheet || 1,
                lastStudiedScore: accData.lastStudiedScore || undefined,
                lastStudiedAt: accData.lastStudiedAt || undefined,
                totalWorksheetsCompleted: accData.totalWorksheetsCompleted || 0,
                totalPoints: accData.totalPoints || 0,
                streakDays: accData.streakDays || 1,
                lastStudyDate: accData.lastStudyDate || ''
              };

              const pretestObj: PretestResult | null = (accData.pretestResult as PretestResult) || (hasPretest && assignedLvl ? {
                completedAt: accData.updatedAt || Date.now(),
                assignedLevel: assignedLvl,
                score: 10,
                total: 10,
                breakdown: {},
                studentName: accData.name || currentUsername
              } : null);

              onUpdate({
                profile: updatedProfile,
                levelProgress: (accData.levelProgress as Record<KumonLevelId, LevelProgress>) || null,
                pretestResult: pretestObj
              });
            }
          }, (err) => {
            console.warn('Firestore account snapshot notice:', err);
          });

          // Also subscribe to real-time studentPretests collection
          const studentPretestRef = doc(db, 'studentPretests', currentUsername);
          unsubscribeStudentPretestDoc = onSnapshot(studentPretestRef, (snapshot) => {
            if (snapshot.exists()) {
              const preData = snapshot.data() as PretestResult;
              if (preData && preData.assignedLevel) {
                onUpdate({
                  profile: null,
                  levelProgress: null,
                  pretestResult: preData
                });
              }
            }
          }, (err) => {
            console.warn('Firestore studentPretest snapshot notice:', err);
          });
        } catch (err) {
          console.warn('Firestore account subscription error:', err);
        }
      } else {
        // Fallback for guest trial sessions (no username linked)
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUserDoc = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const hasPretest = Boolean(data.pretestCompleted || data.startingLevel);
            const assignedLvl = data.startingLevel || (hasPretest ? (data.currentLevel || '6A') : null);

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
              pretestCompleted: hasPretest,
              startingLevel: assignedLvl,
              currentLevel: data.currentLevel || assignedLvl || '6A',
              lastStudiedLevel: data.lastStudiedLevel || assignedLvl || '6A',
              lastStudiedWorksheet: data.lastStudiedWorksheet || 1,
              lastStudiedScore: data.lastStudiedScore || undefined,
              lastStudiedAt: data.lastStudiedAt || undefined,
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

        // Also listen to pretest for guest trial
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
      }
    });

    return () => {
      if (unsubscribeAccountDoc) unsubscribeAccountDoc();
      if (unsubscribeStudentPretestDoc) unsubscribeStudentPretestDoc();
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
   * Real-time Firestore subscription for all registered students' session history (for Teacher Admin Daily Progress Chart)
   */
  static subscribeToAllSessions(
    onUpdate: (sessions: (WorksheetSessionResult & { studentName?: string; username?: string })[]) => void
  ): Unsubscribe | null {
    let unsubscribeAllSessions: Unsubscribe | null = null;

    ensureFirebaseAuth().then(() => {
      try {
        const historyRef = collection(db, 'sessionHistory');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(500));

        unsubscribeAllSessions = onSnapshot(q, (snapshot) => {
          const sessions = snapshot.docs.map(docSnap => docSnap.data() as WorksheetSessionResult & { studentName?: string; username?: string });
          onUpdate(sessions);
        }, (err) => {
          console.warn('Firestore all sessions history listener notice:', err);
        });
      } catch (err) {
        console.warn('subscribeToAllSessions setup notice:', err);
      }
    }).catch(err => {
      console.warn('Auth error in subscribeToAllSessions:', err);
    });

    return () => {
      if (unsubscribeAllSessions) unsubscribeAllSessions();
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

      const localProf = getStoredProfile();
      let profile: StudentProfile | undefined;
      let levelProgress: Record<KumonLevelId, LevelProgress> | undefined;
      let pretestResult: PretestResult | undefined;
      let sessionHistory: WorksheetSessionResult[] = [];

      // 1. Authoritative check on accounts collection if username exists
      const rawUser = (localProf?.username || localProf?.name)?.trim().toLowerCase();
      const cleanUsername = rawUser ? rawUser.replace(/[^a-z0-9_]/g, '') : null;

      if (cleanUsername) {
        try {
          let accountSnap = await getDoc(doc(db, 'accounts', cleanUsername));
          if (!accountSnap.exists() && rawUser && rawUser !== cleanUsername) {
            accountSnap = await getDoc(doc(db, 'accounts', rawUser));
          }

          if (accountSnap.exists()) {
            const accData = accountSnap.data();
            const hasPretest = Boolean(
              accData.pretestCompleted === true ||
              accData.pretestResult ||
              (accData.startingLevel && accData.startingLevel !== null)
            );
            const assignedLvl = accData.startingLevel || (hasPretest ? (accData.currentLevel || '6A') : null);

            profile = {
              username: cleanUsername,
              name: accData.name || localProf?.name || cleanUsername,
              grade: accData.grade || localProf?.grade || '',
              school: accData.school || localProf?.school || '',
              avatar: accData.avatar || localProf?.avatar || '🦊',
              joinedDate: accData.createdAt || localProf?.joinedDate || Date.now(),
              accessGranted: true,
              isAdmin: accData.role === 'admin' || localProf?.isAdmin || false,
              isTrial: false,
              pretestCompleted: hasPretest,
              startingLevel: assignedLvl,
              currentLevel: accData.currentLevel || assignedLvl || '6A',
              lastStudiedLevel: accData.lastStudiedLevel || assignedLvl || '6A',
              lastStudiedWorksheet: accData.lastStudiedWorksheet || 1,
              lastStudiedScore: accData.lastStudiedScore || undefined,
              lastStudiedAt: accData.lastStudiedAt || undefined,
              totalWorksheetsCompleted: accData.totalWorksheetsCompleted || 0,
              totalPoints: accData.totalPoints || 0,
              streakDays: accData.streakDays || 1,
              lastStudyDate: accData.lastStudyDate || ''
            };

            if (accData.levelProgress) {
              levelProgress = accData.levelProgress as Record<KumonLevelId, LevelProgress>;
            }
            if (accData.pretestResult) {
              pretestResult = accData.pretestResult as PretestResult;
            }
          }

          // Also check studentPretests collection in Firestore
          if (!pretestResult || !profile?.pretestCompleted) {
            const pretestSnap = await getDoc(doc(db, 'studentPretests', cleanUsername));
            if (pretestSnap.exists()) {
              const pData = pretestSnap.data() as PretestResult;
              pretestResult = pData;
              if (profile) {
                profile.pretestCompleted = true;
                profile.startingLevel = profile.startingLevel || pData.assignedLevel;
                profile.currentLevel = profile.currentLevel || pData.assignedLevel;
              }
            }
          }
        } catch (accErr) {
          console.warn('Could not fetch accounts doc in loadAllUserData:', accErr);
        }
      }

      // 2. Fetch from users/{user.uid}
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const hasPretest = Boolean(userData.pretestCompleted || userData.startingLevel);
        const assignedLvl = userData.startingLevel || (hasPretest ? (userData.currentLevel || '6A') : null);

        if (!profile) {
          profile = {
            username: userData.username || localProf?.username || undefined,
            name: userData.name || '',
            grade: userData.grade || '',
            school: userData.school || '',
            avatar: userData.avatar || '🦊',
            joinedDate: userData.joinedDate || Date.now(),
            accessGranted: userData.accessGranted ?? true,
            isAdmin: userData.isAdmin || false,
            isTrial: userData.isTrial || false,
            pretestCompleted: hasPretest,
            startingLevel: assignedLvl,
            currentLevel: userData.currentLevel || assignedLvl || '6A',
            lastStudiedLevel: userData.lastStudiedLevel || undefined,
            lastStudiedWorksheet: userData.lastStudiedWorksheet || undefined,
            lastStudiedScore: userData.lastStudiedScore || undefined,
            lastStudiedAt: userData.lastStudiedAt || undefined,
            totalWorksheetsCompleted: userData.totalWorksheetsCompleted || 0,
            totalPoints: userData.totalPoints || 0,
            streakDays: userData.streakDays || 1,
            lastStudyDate: userData.lastStudyDate || ''
          };
        }
        if (!levelProgress && userData?.levelProgress) {
          levelProgress = userData.levelProgress as Record<KumonLevelId, LevelProgress>;
        }
      }

      // Load session history from subcollection
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
        const querySnap = await getDocs(q);
        sessionHistory = querySnap.docs.map(d => d.data() as WorksheetSessionResult);
      } catch (err) {
        console.warn('Could not fetch sessions from Firebase:', err);
      }

      // Load pretest
      if (!pretestResult) {
        try {
          const pretestDocRef = doc(db, 'users', user.uid, 'pretest', 'latest');
          const pretestSnap = await getDoc(pretestDocRef);
          if (pretestSnap.exists()) {
            pretestResult = pretestSnap.data() as PretestResult;
          } else if (localProf?.username) {
            const studentPretestRef = doc(db, 'studentPretests', localProf.username.toLowerCase());
            const studentPretestSnap = await getDoc(studentPretestRef);
            if (studentPretestSnap.exists()) {
              pretestResult = studentPretestSnap.data() as PretestResult;
            }
          }
        } catch (err) {
          console.warn('Could not fetch pretest from Firebase:', err);
        }
      }

      if (profile && (pretestResult || profile.startingLevel)) {
        profile.pretestCompleted = true;
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
   * Save or sync student badges in Database
   */
  static async syncBadgesToCloud(badges: UnlockedBadge[], studentUsername?: string): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      // 1. User doc update
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        badges,
        badgesCount: badges.length,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Global badge collection if username exists
      if (studentUsername) {
        const badgeDocRef = doc(db, 'studentBadges', `${studentUsername.toLowerCase()}`);
        await setDoc(badgeDocRef, {
          userId: user.uid,
          username: studentUsername.toLowerCase(),
          badges,
          badgesCount: badges.length,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      return true;
    } catch (error) {
      console.error('Database syncBadgesToCloud error:', error);
      return false;
    }
  }

  /**
   * Save or sync reflection journal entry to Database
   */
  static async syncReflectionJournalToCloud(entry: ReflectionJournalEntry): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      const journalPayload = {
        ...entry,
        userId: user.uid,
        createdAt: serverTimestamp()
      };

      // 1. Save in user private subcollection
      const userJournalRef = doc(db, 'users', user.uid, 'journals', entry.id);
      await setDoc(userJournalRef, journalPayload);

      // 2. Save in global reflection journals collection for teacher review
      const rootJournalRef = doc(db, 'reflectionJournals', `${user.uid}_${entry.id}`);
      await setDoc(rootJournalRef, journalPayload);

      return true;
    } catch (error) {
      console.error('Database syncReflectionJournalToCloud error:', error);
      return false;
    }
  }

  /**
   * Delete reflection journal entry from Database
   */
  static async deleteReflectionJournalInCloud(journalId: string): Promise<boolean> {
    try {
      const user = await ensureFirebaseAuth();
      if (!user) return false;

      const userJournalRef = doc(db, 'users', user.uid, 'journals', journalId);
      await deleteDoc(userJournalRef);

      const rootJournalRef = doc(db, 'reflectionJournals', `${user.uid}_${journalId}`);
      await deleteDoc(rootJournalRef);

      return true;
    } catch (error) {
      console.error('Database deleteReflectionJournalInCloud error:', error);
      return false;
    }
  }

  /**
   * Real-time subscription for Reflection Journals
   */
  static subscribeToJournals(
    onUpdate: (journals: ReflectionJournalEntry[]) => void
  ): Unsubscribe | null {
    let unsubscribeJournals: Unsubscribe | null = null;

    ensureFirebaseAuth().then((user) => {
      if (!user) return;

      const journalsRef = collection(db, 'users', user.uid, 'journals');
      const q = query(journalsRef, orderBy('timestamp', 'desc'), limit(100));

      unsubscribeJournals = onSnapshot(q, (snapshot) => {
        const journals: ReflectionJournalEntry[] = snapshot.docs.map(docSnap => docSnap.data() as ReflectionJournalEntry);
        onUpdate(journals);
      }, (err) => {
        console.warn('Database journals snapshot notice:', err);
      });
    });

    return () => {
      if (unsubscribeJournals) unsubscribeJournals();
    };
  }

  /**
   * Reset all data in Database for the active user
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
      console.error('Database resetAllUserData error:', error);
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

