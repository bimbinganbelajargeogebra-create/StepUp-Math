import React, { useState } from 'react';
import { 
  KeyRound, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Zap, 
  Sun, 
  Moon, 
  ArrowLeft, 
  UserPlus, 
  LogIn, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Building2, 
  Lock,
  Search,
  UserCheck,
  Award,
  Calendar,
  Flame
} from 'lucide-react';
import { StudentProfile, UserAccount, PretestResult } from '../types';
import { 
  ACCESS_CODE, 
  TRIAL_CODE,
  ADMIN_PASSWORD,
  verifyAdminPassword, 
  verifyTrialAccess,
  unlockAllLevelsAdmin, 
  saveStoredProfile, 
  getStoredProfile,
  getStoredLevelProgress,
  getStoredPretestResult,
  savePretestResult,
  getStoredAccountByUsername,
  upsertStoredAccount,
  saveStoredLevelProgress,
  sanitizeStudentLevelProgress,
  generateCleanLevelProgress,
  AppTheme
} from '../utils/storage';
import { FirebaseDatabaseService } from '../services/firebaseSync';
import { MathLogo } from './MathLogo';

interface LoginAccessModalProps {
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onBackToHome?: () => void;
  onSuccess: (profile: StudentProfile) => void;
}

const AVATARS = ['🦊', '🐼', '🦁', '🦉', '🚀', '⭐', '🐬', '🐯'];

export const LoginAccessModal: React.FC<LoginAccessModalProps> = ({ 
  theme = 'light',
  onToggleTheme,
  onBackToHome,
  onSuccess 
}) => {
  const existingProfile = getStoredProfile();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'status'>('login');
  
  // Login State
  const [loginUsername, setLoginUsername] = useState(existingProfile?.username || existingProfile?.name || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGrade, setRegGrade] = useState('SD Kelas 3');
  const [regSchool, setRegSchool] = useState('');
  const [regAvatar, setRegAvatar] = useState('🦊');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Status Lookup State
  const [statusLookupUsername, setStatusLookupUsername] = useState(existingProfile?.username || existingProfile?.name || '');
  const [statusLookupResult, setStatusLookupResult] = useState<UserAccount | null>(null);
  const [statusLookupChecked, setStatusLookupChecked] = useState(false);
  const [isSearchingStatus, setIsSearchingStatus] = useState(false);
  const [statusLookupError, setStatusLookupError] = useState<string | null>(null);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [pendingAccount, setPendingAccount] = useState<UserAccount | null>(null);
  const [rejectedAccount, setRejectedAccount] = useState<UserAccount | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Handler for lookup student account status
  const handleLookupStatus = async (usernameToSearch?: string) => {
    const clean = (usernameToSearch || statusLookupUsername).trim().toLowerCase();
    if (!clean) {
      setStatusLookupError('Silakan masukkan username yang ingin dicek.');
      return;
    }
    setIsSearchingStatus(true);
    setStatusLookupError(null);
    setStatusLookupChecked(true);
    try {
      const res = await FirebaseDatabaseService.checkAccountStatus(clean);
      if (res.exists && res.account) {
        setStatusLookupResult(res.account);
      } else {
        setStatusLookupResult(null);
        setStatusLookupError(`Akun dengan username "${clean}" tidak ditemukan di database.`);
      }
    } catch (err) {
      console.error(err);
      setStatusLookupError('Gagal memeriksa status akun. Periksa koneksi internet Anda.');
    } finally {
      setIsSearchingStatus(false);
    }
  };

  // Quick Trial Mode
  const handleQuickTrial = () => {
    setError('');
    setPendingAccount(null);
    setRejectedAccount(null);
    
    const existing = getStoredProfile();
    const trialProfile: StudentProfile = {
      name: 'Siswa Trial',
      grade: 'SD Kelas 3',
      avatar: '🦊',
      joinedDate: existing?.joinedDate || Date.now(),
      accessGranted: true,
      isAdmin: false,
      isTrial: true,
      pretestCompleted: existing?.pretestCompleted && existing?.isTrial ? existing.pretestCompleted : false,
      startingLevel: existing?.isTrial ? existing.startingLevel : null,
      currentLevel: existing?.isTrial ? existing.currentLevel : '6A',
      totalWorksheetsCompleted: existing?.isTrial ? existing.totalWorksheetsCompleted : 0,
      totalPoints: existing?.isTrial ? existing.totalPoints : 0,
      streakDays: existing?.isTrial ? existing.streakDays : 1,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };

    saveStoredProfile(trialProfile);
    onSuccess(trialProfile);
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAccount(null);
    setRejectedAccount(null);
    setSuccessNotice(null);

    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanUsername) {
      setError('Silakan masukkan username atau nama Anda.');
      return;
    }
    if (!cleanPassword) {
      setError('Silakan masukkan password akun Anda.');
      return;
    }

    setIsSubmittingLogin(true);

    try {
      // 1. Check if user is typing legacy/direct codes: "stepup", "trial", or admin password directly
      const isDirectAdmin = verifyAdminPassword(cleanPassword) || (cleanUsername.toLowerCase() === 'admin' && verifyAdminPassword(cleanPassword));
      const isDirectTrial = verifyTrialAccess(cleanPassword) || verifyTrialAccess(cleanUsername);
      const isDirectStepup = cleanPassword.toLowerCase() === ACCESS_CODE.toLowerCase();

      if (isDirectAdmin) {
        unlockAllLevelsAdmin();
        const existing = getStoredProfile();
        const adminProfile: StudentProfile = {
          name: cleanUsername === 'admin' ? 'Pak GuruAI' : cleanUsername,
          grade: 'Admin & Guru Pengajar',
          avatar: '⭐',
          joinedDate: existing?.joinedDate || Date.now(),
          accessGranted: true,
          isAdmin: true,
          isTrial: false,
          pretestCompleted: true,
          startingLevel: '6A',
          currentLevel: '6A',
          totalWorksheetsCompleted: existing?.totalWorksheetsCompleted || 0,
          totalPoints: existing?.totalPoints || 500,
          streakDays: existing?.streakDays || 1,
          lastStudyDate: new Date().toISOString().split('T')[0]
        };

        saveStoredProfile(adminProfile);
        onSuccess(adminProfile);
        return;
      }

      if (isDirectTrial) {
        handleQuickTrial();
        return;
      }

      // 2. Query Firebase Firestore Accounts Collection
      const result = await FirebaseDatabaseService.loginWithCredentials(cleanUsername, cleanPassword);

      if (result.status === 'admin') {
        unlockAllLevelsAdmin();
        const existing = getStoredProfile();
        const adminProfile: StudentProfile = {
          name: 'Pak GuruAI',
          grade: 'Admin & Guru Pengajar',
          avatar: '⭐',
          joinedDate: existing?.joinedDate || Date.now(),
          accessGranted: true,
          isAdmin: true,
          isTrial: false,
          pretestCompleted: true,
          startingLevel: '6A',
          currentLevel: '6A',
          totalWorksheetsCompleted: existing?.totalWorksheetsCompleted || 0,
          totalPoints: existing?.totalPoints || 500,
          streakDays: existing?.streakDays || 1,
          lastStudyDate: new Date().toISOString().split('T')[0]
        };

        saveStoredProfile(adminProfile);
        onSuccess(adminProfile);
        return;
      }

      if (result.status === 'pending') {
        setPendingAccount(result.account || null);
        setError(result.message);
        return;
      }

      if (result.status === 'rejected') {
        setRejectedAccount(result.account || null);
        setError(result.message);
        return;
      }

      if (result.success && result.account) {
        const acc = result.account;
        const existing = getStoredProfile();
        const existingPretest = getStoredPretestResult();
        const isSameStudent = existing?.username?.toLowerCase() === acc.username.toLowerCase();
        
        const isPretestDone = Boolean(
          acc.pretestCompleted ||
          acc.pretestResult ||
          (acc.startingLevel && acc.startingLevel !== null) ||
          (isSameStudent && existing?.pretestCompleted) ||
          (existingPretest && isSameStudent)
        );

        const assignedStartingLevel = isPretestDone
          ? (acc.startingLevel || (isSameStudent ? existing?.startingLevel : null) || existingPretest?.assignedLevel || '6A')
          : null;

        const currentLvl = isPretestDone
          ? (acc.currentLevel || (isSameStudent ? existing?.currentLevel : null) || assignedStartingLevel || '6A')
          : '6A';

        const lastStudiedLvl = acc.lastStudiedLevel || (isSameStudent ? existing?.lastStudiedLevel : undefined) || (isPretestDone ? assignedStartingLevel : undefined);
        const lastStudiedWs = acc.lastStudiedWorksheet || (isSameStudent ? existing?.lastStudiedWorksheet : undefined) || 1;
        const lastStudiedScr = acc.lastStudiedScore || (isSameStudent ? existing?.lastStudiedScore : undefined);
        const lastStudiedTimestamp = acc.lastStudiedAt || (isSameStudent ? existing?.lastStudiedAt : undefined);

        const approvedProfile: StudentProfile = {
          username: acc.username,
          name: acc.name,
          grade: acc.grade || 'SD Kelas 3',
          school: acc.school || '',
          avatar: acc.avatar || '🦊',
          joinedDate: acc.createdAt || Date.now(),
          accessGranted: true,
          isAdmin: acc.role === 'admin',
          isTrial: false,
          pretestCompleted: isPretestDone,
          startingLevel: assignedStartingLevel,
          currentLevel: currentLvl,
          lastStudiedLevel: lastStudiedLvl,
          lastStudiedWorksheet: lastStudiedWs,
          lastStudiedScore: lastStudiedScr,
          lastStudiedAt: lastStudiedTimestamp,
          totalWorksheetsCompleted: acc.totalWorksheetsCompleted || (isSameStudent ? existing?.totalWorksheetsCompleted : 0) || 0,
          totalPoints: acc.totalPoints || (isSameStudent ? existing?.totalPoints : 0) || 0,
          streakDays: acc.streakDays || (isSameStudent ? existing?.streakDays : 1) || 1,
          lastStudyDate: acc.lastStudyDate || (isSameStudent ? existing?.lastStudyDate : undefined) || new Date().toISOString().split('T')[0]
        };

        if (isPretestDone) {
          if (acc.pretestResult) {
            try {
              localStorage.setItem('stepup_math_pretest_result', JSON.stringify(acc.pretestResult));
            } catch (err) {
              console.warn('Could not store pretest result in cache', err);
            }
          } else if (assignedStartingLevel) {
            const syntheticPretest: PretestResult = {
              completedAt: acc.createdAt || Date.now(),
              assignedLevel: assignedStartingLevel,
              score: 10,
              total: 10,
              breakdown: {},
              studentName: acc.name
            };
            try {
              localStorage.setItem('stepup_math_pretest_result', JSON.stringify(syntheticPretest));
            } catch (err) {
              console.warn('Could not store synthetic pretest in cache', err);
            }
          }

          if (acc.levelProgress) {
            const sanitized = sanitizeStudentLevelProgress(acc.levelProgress, approvedProfile);
            saveStoredLevelProgress(sanitized);
          } else if (isSameStudent && getStoredLevelProgress()) {
            const existingProgress = getStoredLevelProgress();
            const sanitized = sanitizeStudentLevelProgress(existingProgress, approvedProfile);
            saveStoredLevelProgress(sanitized);
          } else {
            const targetLevel = approvedProfile.startingLevel || '6A';
            const freshProgress = generateCleanLevelProgress(targetLevel, true);
            saveStoredLevelProgress(freshProgress);
          }
        } else {
          const freshProgress = generateCleanLevelProgress('6A', true);
          saveStoredLevelProgress(freshProgress);
        }

        saveStoredProfile(approvedProfile);

        // Update account cache so pretest state is permanently preserved
        if (isPretestDone) {
          upsertStoredAccount({
            ...acc,
            pretestCompleted: true,
            startingLevel: assignedStartingLevel || '6A',
            currentLevel: currentLvl,
            lastStudiedLevel: lastStudiedLvl,
            lastStudiedWorksheet: lastStudiedWs,
            lastStudiedScore: lastStudiedScr,
            lastStudiedAt: lastStudiedTimestamp,
            levelProgress: getStoredLevelProgress(),
            updatedAt: Date.now()
          });
        }

        onSuccess(approvedProfile);
        return;
      }

      // 3. Fallback check for standard code 'stepup'
      if (isDirectStepup) {
        const usernameKey = cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        // Check if accounts/{usernameKey} exists in Firestore first
        const cloudStatus = await FirebaseDatabaseService.checkAccountStatus(usernameKey);
        const existingAcc = cloudStatus.account || getStoredAccountByUsername(usernameKey);
        const existingProf = getStoredProfile();

        const isPretestDone = Boolean(
          existingAcc?.pretestCompleted ||
          existingAcc?.pretestResult ||
          (existingAcc?.startingLevel && existingAcc?.startingLevel !== null) ||
          (existingProf?.pretestCompleted && (existingProf?.username === usernameKey || !existingProf?.username))
        );

        const assignedStartingLevel = isPretestDone
          ? (existingAcc?.startingLevel || existingProf?.startingLevel || existingAcc?.currentLevel || '6A')
          : null;

        const currentLvl = isPretestDone
          ? (existingAcc?.currentLevel || existingProf?.currentLevel || assignedStartingLevel || '6A')
          : '6A';

        const studentProfile: StudentProfile = {
          username: usernameKey,
          name: existingAcc?.name || cleanUsername,
          grade: existingAcc?.grade || existingProf?.grade || 'SD Kelas 3',
          school: existingAcc?.school || existingProf?.school || '',
          avatar: existingAcc?.avatar || existingProf?.avatar || '🦊',
          joinedDate: existingAcc?.createdAt || existingProf?.joinedDate || Date.now(),
          accessGranted: true,
          isAdmin: false,
          isTrial: false,
          pretestCompleted: isPretestDone,
          startingLevel: assignedStartingLevel,
          currentLevel: currentLvl,
          lastStudiedLevel: existingAcc?.lastStudiedLevel || currentLvl,
          lastStudiedWorksheet: existingAcc?.lastStudiedWorksheet || 1,
          totalWorksheetsCompleted: existingAcc?.totalWorksheetsCompleted || 0,
          totalPoints: existingAcc?.totalPoints || 0,
          streakDays: existingAcc?.streakDays || 1,
          lastStudyDate: existingAcc?.lastStudyDate || new Date().toISOString().split('T')[0]
        };

        if (isPretestDone) {
          if (existingAcc?.pretestResult) {
            savePretestResult(existingAcc.pretestResult, usernameKey);
          }
          if (existingAcc?.levelProgress) {
            const sanitized = sanitizeStudentLevelProgress(existingAcc.levelProgress, studentProfile);
            saveStoredLevelProgress(sanitized);
          } else {
            const targetLevel = studentProfile.startingLevel || '6A';
            const freshProgress = generateCleanLevelProgress(targetLevel, true);
            saveStoredLevelProgress(freshProgress);
          }
        } else {
          const freshProgress = generateCleanLevelProgress('6A', true);
          saveStoredLevelProgress(freshProgress);
        }

        saveStoredProfile(studentProfile);

        // Auto register/upsert in Firestore if not already present
        if (!cloudStatus.exists) {
          FirebaseDatabaseService.registerAccount({
            username: usernameKey,
            name: cleanUsername,
            password: ACCESS_CODE,
            grade: studentProfile.grade,
            school: studentProfile.school,
            avatar: studentProfile.avatar
          }).then(() => {
            FirebaseDatabaseService.approveAccount(usernameKey, 'Auto Direct Code', studentProfile.startingLevel || '6A');
          }).catch(err => console.warn('Direct register sync:', err));
        }

        onSuccess(studentProfile);
        return;
      }

      setError(result.message || 'Username atau password tidak sesuai.');
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kendala saat login. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Check pending status live
  const handleCheckPendingStatus = async () => {
    const targetUsername = pendingAccount?.username || loginUsername.trim().toLowerCase();
    if (!targetUsername) return;

    setIsCheckingStatus(true);
    setError('');

    try {
      const res = await FirebaseDatabaseService.checkAccountStatus(targetUsername);
      if (!res.exists || !res.account) {
        setError('Akun tidak ditemukan di database.');
        setPendingAccount(null);
        return;
      }

      if (res.status === 'approved') {
        const acc = res.account;
        setSuccessNotice(`Selamat! Akun ${acc.name} (${acc.username}) telah DISETUJUI oleh Guru / Admin.`);
        setPendingAccount(null);
        
        // Auto sign-in if password was entered
        if (loginPassword && loginPassword === acc.password) {
          const isPretestDone = Boolean(
            acc.pretestCompleted ||
            acc.pretestResult ||
            (acc.startingLevel && acc.startingLevel !== null)
          );
          const assignedStartingLevel = isPretestDone ? (acc.startingLevel || '6A') : null;
          const currentLvl = isPretestDone ? (acc.currentLevel || assignedStartingLevel || '6A') : '6A';

          const approvedProfile: StudentProfile = {
            username: acc.username,
            name: acc.name,
            grade: acc.grade,
            school: acc.school || '',
            avatar: acc.avatar,
            joinedDate: acc.createdAt,
            accessGranted: true,
            isAdmin: false,
            isTrial: false,
            pretestCompleted: isPretestDone,
            startingLevel: assignedStartingLevel,
            currentLevel: currentLvl,
            lastStudiedLevel: acc.lastStudiedLevel || currentLvl,
            lastStudiedWorksheet: acc.lastStudiedWorksheet || 1,
            totalWorksheetsCompleted: acc.totalWorksheetsCompleted || 0,
            totalPoints: acc.totalPoints || 0,
            streakDays: acc.streakDays || 1,
            lastStudyDate: acc.lastStudyDate || new Date().toISOString().split('T')[0]
          };

          if (isPretestDone) {
            if (acc.pretestResult) {
              savePretestResult(acc.pretestResult, acc.username);
            }
            if (acc.levelProgress) {
              const sanitized = sanitizeStudentLevelProgress(acc.levelProgress, approvedProfile);
              saveStoredLevelProgress(sanitized);
            } else {
              const freshProgress = generateCleanLevelProgress(assignedStartingLevel || '6A', true);
              saveStoredLevelProgress(freshProgress);
            }
          } else {
            const freshProgress = generateCleanLevelProgress('6A', true);
            saveStoredLevelProgress(freshProgress);
          }

          saveStoredProfile(approvedProfile);
          setTimeout(() => {
            onSuccess(approvedProfile);
          }, 800);
        }
      } else if (res.status === 'rejected') {
        setPendingAccount(null);
        setRejectedAccount(res.account);
        setError(`Pendaftaran ditolak oleh Guru / Admin.${res.account.rejectionReason ? ` Alasan: "${res.account.rejectionReason}"` : ''}`);
      } else {
        setPendingAccount(res.account);
        setError('Status masih MENUNGGU APPROVAL Guru / Admin. Silakan beritahu guru Anda untuk menyetujui akun ini di Panel Admin.');
      }
    } catch (e) {
      console.error(e);
      setError('Gagal memeriksa status. Pastikan koneksi internet stabil.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice(null);
    setPendingAccount(null);
    setRejectedAccount(null);

    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanPassword = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (!cleanName) {
      setError('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username minimal 3 karakter (hanya huruf kecil, angka, dan underscore).');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setError('Password minimal 4 karakter.');
      return;
    }
    if (cleanPassword !== cleanConfirm) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsSubmittingReg(true);

    try {
      const res = await FirebaseDatabaseService.registerAccount({
        username: cleanUsername,
        name: cleanName,
        password: cleanPassword,
        grade: regGrade,
        school: regSchool.trim(),
        avatar: regAvatar
      });

      if (res.success && res.account) {
        setPendingAccount(res.account);
        setSuccessNotice(res.message);
        setLoginUsername(cleanUsername);
        setLoginPassword(cleanPassword);
      } else {
        setError(res.message || 'Gagal mendaftarkan akun.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat pendaftaran.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 p-4 sm:p-6 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        
        {/* Top brand header */}
        <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800 relative">
          {onBackToHome && (
            <button
              id="login-back-to-home"
              type="button"
              onClick={onBackToHome}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              title="Kembali ke Halaman Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
          )}

          {onToggleTheme && (
            <button
              id="login-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>
          )}

          <div className="flex justify-center mb-2.5">
            <MathLogo size="xl" glow />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">StepUp Math</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Belajar Mandiri Matematika Berjenjang (Level 6A – M)
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-full text-[11px] text-indigo-200 border border-indigo-900/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database: Sinkronisasi Database Aktif</span>
          </div>
        </div>

        {/* Tab Selection: Masuk vs Daftar Akun vs Status Akun */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1 overflow-x-auto">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </button>

          <button
            id="tab-register-btn"
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun</span>
          </button>

          <button
            id="tab-status-btn"
            type="button"
            onClick={() => {
              setActiveTab('status');
              setError('');
              if (loginUsername && !statusLookupResult) {
                handleLookupStatus(loginUsername);
              }
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Status Akun</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-4">

          {/* Success Notice Banner */}
          {successNotice && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">{successNotice}</span>
                {pendingAccount && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Status saat ini: <strong className="uppercase">Menunggu Approval Guru</strong>. Akun akan aktif setelah disetujui di Panel Admin.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error / Alert Message */}
          {error && !pendingAccount && !rejectedAccount && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* PENDING APPROVAL SCREEN / BANNER */}
          {pendingAccount && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Menunggu Persetujuan Guru (Pending)</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Username: <strong className="font-mono">{pendingAccount.username}</strong> ({pendingAccount.name})
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Pendaftaran akun Anda telah tersimpan di database. Silakan hubungi Guru / Admin untuk menyetujui (Approve) akun Anda di Panel Guru.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="check-status-btn"
                  type="button"
                  onClick={handleCheckPendingStatus}
                  disabled={isCheckingStatus}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isCheckingStatus ? 'Memeriksa...' : 'Cek Status Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingAccount(null);
                    setError('');
                  }}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* REJECTED SCREEN / BANNER */}
          {rejectedAccount && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Pendaftaran Tidak Disetujui (Ditolak)</h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    Username: <strong className="font-mono">{rejectedAccount.username}</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
                <span className="font-semibold">Catatan dari Guru: </span>
                <span>{rejectedAccount.rejectionReason || 'Data pendaftaran belum sesuai.'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegName(rejectedAccount.name);
                    setRegUsername(rejectedAccount.username);
                    setRegGrade(rejectedAccount.grade);
                    setRejectedAccount(null);
                    setError('');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Daftar Ulang dengan Data Benar
                </button>
              </div>
            </div>
          )}

          {/* Quick Trial Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">Coba Tanpa Akun Dulu?</span>
                <span className="text-amber-700 dark:text-amber-300 text-[11px]">Tes Diagnostik & Lembar Latihan 1</span>
              </div>
            </div>
            <button
              id="quick-trial-btn"
              type="button"
              onClick={handleQuickTrial}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Coba Trial
            </button>
          </div>

          {/* TAB 1: MASUK (LOGIN) */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Username / Nama Akun
                </label>
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Contoh: rian123 atau admin"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    {showHint ? 'Tutup Info' : 'Bantuan Akses'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password akun Anda..."
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono tracking-wider transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {showHint && (
                  <div className="mt-2.5 p-3 bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">Akun Guru / Admin: </span>
                        <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">admin</code> / <code className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">{ADMIN_PASSWORD}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsername('admin');
                          setLoginPassword(ADMIN_PASSWORD);
                        }}
                        className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
                      >
                        Isi Admin
                      </button>
                    </div>
                    <div className="pt-1.5 border-t border-indigo-200 dark:border-indigo-800 text-[11px] text-slate-600 dark:text-slate-400">
                      Siswa yang baru mendaftar perlu disetujui (Approve) oleh Guru di Panel Admin sebelum dapat masuk.
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmittingLogin}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Masuk ke StepUp Math</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: DAFTAR AKUN BARU (REGISTER) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Nama Lengkap Siswa
                </label>
                <input
                  id="reg-name-input"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              {/* Username & Avatar in Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Username Akun
                  </label>
                  <input
                    id="reg-username-input"
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="Contoh: rian_math"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Huruf kecil, angka, garis bawah</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Pilih Avatar
                  </label>
                  <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVATARS.slice(0, 5).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setRegAvatar(av)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer ${
                          regAvatar === av ? 'bg-indigo-600 text-white shadow-xs scale-110' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grade & School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Jenjang / Kelas
                  </label>
                  <select
                    id="reg-grade-select"
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  >
                    <option value="TK / Pra-Sekolah">TK / Pra-Sekolah</option>
                    <option value="SD Kelas 1">SD Kelas 1</option>
                    <option value="SD Kelas 2">SD Kelas 2</option>
                    <option value="SD Kelas 3">SD Kelas 3</option>
                    <option value="SD Kelas 4">SD Kelas 4</option>
                    <option value="SD Kelas 5">SD Kelas 5</option>
                    <option value="SD Kelas 6">SD Kelas 6</option>
                    <option value="SMP Kelas 7-9">SMP (Kelas 7–9)</option>
                    <option value="SMA Kelas 10-12">SMA (Kelas 10–12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Asal Sekolah
                  </label>
                  <input
                    id="reg-school-input"
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="Contoh: SDN 01 Harapan"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Password
                  </label>
                  <input
                    id="reg-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 4 karakter"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Ulangi Password
                  </label>
                  <input
                    id="reg-confirm-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRegPassword}
                    onChange={(e) => setShowRegPassword(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Tampilkan Password</span>
                </label>
              </div>

              {/* Submit Register */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isSubmittingReg}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
              >
                {isSubmittingReg ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun ke Database...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Kirim Pendaftaran Akun Siswa</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: STATUS AKUN SISWA */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Cek Status Pendaftaran Akun Siswa
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Ketik username yang Anda daftarkan untuk melihat status persetujuan guru dan detail akun.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      id="status-lookup-input"
                      type="text"
                      value={statusLookupUsername}
                      onChange={(e) => {
                        setStatusLookupUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                        setStatusLookupError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLookupStatus();
                        }
                      }}
                      placeholder="Masukkan username akun..."
                      className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <button
                    id="btn-do-lookup-status"
                    type="button"
                    disabled={isSearchingStatus}
                    onClick={() => handleLookupStatus()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSearchingStatus ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{isSearchingStatus ? 'Mencari...' : 'Cek Status'}</span>
                  </button>
                </div>

                {statusLookupError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{statusLookupError}</span>
                  </div>
                )}
              </div>

              {/* Status Lookup Result Card */}
              {statusLookupResult && (
                <div className={`p-4 rounded-2xl border transition-all space-y-4 ${
                  statusLookupResult.status === 'approved'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : statusLookupResult.status === 'pending'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                }`}>
                  {/* Result Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0">
                        {statusLookupResult.avatar || '🦊'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {statusLookupResult.name}
                        </h4>
                        <p className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          @{statusLookupResult.username}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {statusLookupResult.status === 'approved' && (
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disetujui & Aktif</span>
                        </span>
                      )}
                      {statusLookupResult.status === 'pending' && (
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Approval</span>
                        </span>
                      )}
                      {statusLookupResult.status === 'rejected' && (
                        <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Pendaftaran Ditolak</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Explanation Box */}
                  <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                    {statusLookupResult.status === 'approved' && (
                      <div className="text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Akun telah disetujui dan aktif!</strong>
                          <span>
                            {statusLookupResult.reviewedBy 
                              ? `Disetujui oleh ${statusLookupResult.reviewedBy}. Anda dapat langsung login.` 
                              : 'Akun Anda sudah siap digunakan untuk belajar mandiri matematika.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {statusLookupResult.status === 'pending' && (
                      <div className="text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Menunggu Persetujuan Guru / Pengajar</strong>
                          <span>
                            Pendaftaran Anda sudah tersimpan di database. Hubungi guru atau pengajar bimbingan belajar untuk melakukan approval di Panel Admin.
                          </span>
                        </div>
                      </div>
                    )}

                    {statusLookupResult.status === 'rejected' && (
                      <div className="text-rose-800 dark:text-rose-300 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Pendaftaran Akun Ditolak</strong>
                          <span>
                            Catatan Guru: "{statusLookupResult.rejectionReason || 'Data pendaftaran belum terverifikasi.'}"
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Jenjang / Kelas</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{statusLookupResult.grade || '-'}</span>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Asal Sekolah</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{statusLookupResult.school || '-'}</span>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Level Awal</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {statusLookupResult.startingLevel || statusLookupResult.currentLevel || 'Level 6A'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Waktu Pendaftaran</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(statusLookupResult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions based on status */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {statusLookupResult.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginUsername(statusLookupResult.username);
                          setActiveTab('login');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Lanjut ke Form Login</span>
                      </button>
                    )}

                    {statusLookupResult.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleLookupStatus(statusLookupResult.username)}
                        disabled={isSearchingStatus}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSearchingStatus ? 'animate-spin' : ''}`} />
                        <span>Periksa Ulang Status</span>
                      </button>
                    )}

                    {statusLookupResult.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegName(statusLookupResult.name);
                          setRegUsername(statusLookupResult.username);
                          setRegGrade(statusLookupResult.grade || 'SD Kelas 3');
                          setRegSchool(statusLookupResult.school || '');
                          setActiveTab('register');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Daftar Ulang dengan Data Baru</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
