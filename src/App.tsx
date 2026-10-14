/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { KumonLevelId, StudentProfile, LevelProgress, WorksheetSessionResult, PretestResult } from './types';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredLevelProgress, 
  saveStoredLevelProgress, 
  getStoredSessionHistory, 
  getStoredPretestResult,
  savePretestResult,
  logoutStudentSession,
  getStoredTheme,
  saveStoredTheme,
  sanitizeStudentLevelProgress,
  generateCleanLevelProgress,
  getStoredAccountByUsername,
  upsertStoredAccount,
  AppTheme
} from './utils/storage';
import { FirebaseDatabaseService } from './services/firebaseSync';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { LoginAccessModal } from './components/LoginAccessModal';
import { HomeLandingScreen } from './components/HomeLandingScreen';
import { PretestScreen } from './components/PretestScreen';
import { LevelOverviewScreen } from './components/LevelOverviewScreen';
import { WorksheetPracticeScreen } from './components/WorksheetPracticeScreen';
import { StudentProfileModal } from './components/StudentProfileModal';
import { CertificateModal } from './components/CertificateModal';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { KumonWorksheetPrintModal } from './components/KumonWorksheetPrintModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [levelProgress, setLevelProgress] = useState<Record<KumonLevelId, LevelProgress>>({} as any);
  const [sessionHistory, setSessionHistory] = useState<WorksheetSessionResult[]>([]);
  const [pretestResult, setPretestResult] = useState<PretestResult | null>(null);
  const [theme, setTheme] = useState<AppTheme>('light');
  const [isCloudReady, setIsCloudReady] = useState(false);

  // Navigation / View State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'login' | 'register'>('login');
  const [showHomeViewLoggedIn, setShowHomeViewLoggedIn] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<{
    levelId: KumonLevelId;
    worksheetNum: number;
  } | null>(null);

  const [activeCertificateLevel, setActiveCertificateLevel] = useState<KumonLevelId | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    levelId?: KumonLevelId;
    worksheetNum?: number;
  }>({ isOpen: false });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize initial cache data
  const syncStorageData = useCallback(() => {
    const p = getStoredProfile();
    const prog = getStoredLevelProgress();
    const hist = getStoredSessionHistory();
    const pt = getStoredPretestResult();
    const t = getStoredTheme();

    if (p) setProfile(p);
    if (prog) setLevelProgress(prog);
    if (hist) setSessionHistory(hist);
    if (pt) setPretestResult(pt);
    setTheme(t);
  }, []);

  // Initialize and attach real-time Firebase Firestore database listeners
  useEffect(() => {
    syncStorageData();
    const initialTheme = getStoredTheme();
    saveStoredTheme(initialTheme);

    // 1. Initial async load from Firebase Firestore
    FirebaseDatabaseService.loadAllUserData().then((cloudData) => {
      if (cloudData) {
        const currentProfile = cloudData.profile || getStoredProfile();
        if (cloudData.profile) {
          setProfile(cloudData.profile);
          saveStoredProfile(cloudData.profile);
        }
        if (cloudData.levelProgress) {
          const cleanProg = sanitizeStudentLevelProgress(cloudData.levelProgress, currentProfile);
          setLevelProgress(cleanProg);
          saveStoredLevelProgress(cleanProg);
        }
        if (cloudData.sessionHistory && cloudData.sessionHistory.length > 0) {
          setSessionHistory(cloudData.sessionHistory);
        }
        if (cloudData.pretestResult) {
          setPretestResult(cloudData.pretestResult);
        }
      }
      setIsCloudReady(true);
    }).catch((err) => {
      console.warn('Firebase initial load fallback:', err);
      setIsCloudReady(true);
    });

    // 2. Subscribe to real-time User & Account Doc updates in Firestore
    const localProf = getStoredProfile();
    const targetUsername = (profile?.username || localProf?.username)?.trim().toLowerCase();

    const unsubscribeUser = FirebaseDatabaseService.subscribeToUserData((update) => {
      let currentProf = profile || getStoredProfile();
      if (update.profile) {
        const prevCompleted = currentProf?.pretestCompleted;
        const prevStartingLevel = currentProf?.startingLevel;
        currentProf = { ...(currentProf || {}), ...update.profile } as StudentProfile;
        if (prevCompleted && !currentProf.pretestCompleted) {
          currentProf.pretestCompleted = true;
          currentProf.startingLevel = currentProf.startingLevel || prevStartingLevel;
        }
        setProfile(currentProf);
        saveStoredProfile(currentProf);
      }
      if (update.levelProgress) {
        const cleanProg = sanitizeStudentLevelProgress(update.levelProgress, currentProf);
        setLevelProgress(cleanProg);
        saveStoredLevelProgress(cleanProg);
      }
      if (update.pretestResult) {
        setPretestResult(update.pretestResult);
        const resolvedUsername = targetUsername || update.profile?.username || currentProf?.username;
        savePretestResult(update.pretestResult, resolvedUsername);
      }
    }, targetUsername);

    // 3. Subscribe to real-time Session History in Firestore
    const unsubscribeSessions = FirebaseDatabaseService.subscribeToSessions((sessions) => {
      if (sessions && sessions.length > 0) {
        setSessionHistory(sessions);
      }
    });

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, [syncStorageData, profile?.username]);

  const handleToggleTheme = () => {
    const nextTheme: AppTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleQuickTrialStart = () => {
    const existing = getStoredProfile();
    const trialProfile: StudentProfile = {
      name: existing?.name || 'Siswa Simulasi Trial',
      grade: existing?.grade || 'SD Kelas 4',
      avatar: existing?.avatar || '🦊',
      joinedDate: existing?.joinedDate || Date.now(),
      accessGranted: true,
      isAdmin: false,
      isTrial: true,
      pretestCompleted: true, // Trial langsung membuka simulasi latihan lembar kerja, bukan tes diagnostik resmi
      startingLevel: '6A',
      currentLevel: '6A',
      totalWorksheetsCompleted: existing?.isTrial ? existing.totalWorksheetsCompleted : 0,
      totalPoints: existing?.isTrial ? existing.totalPoints : 0,
      streakDays: existing?.isTrial ? existing.streakDays : 1,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };

    const cleanProg = generateCleanLevelProgress('6A', true);
    saveStoredLevelProgress(cleanProg);
    saveStoredProfile(trialProfile);
    setProfile(trialProfile);
    setLevelProgress(cleanProg);
    setShowLoginModal(false);
    setShowHomeViewLoggedIn(false);
    showToast('Mode Uji Coba (Trial) aktif. Untuk tes diagnostik awal & penyimpanan progres, silakan daftar akun siswa.');
  };

  const handleLogout = () => {
    logoutStudentSession();
    setProfile(null);
    setShowLoginModal(false);
    setShowHomeViewLoggedIn(false);
    setIsProfileModalOpen(false);
    setIsAdminModalOpen(false);
    setPrintModalState({ isOpen: false });
    setActiveSession(null);
    showToast('Berhasil keluar. Data progres belajar tetap tersimpan aman di perangkat.');
  };

  // Render content based on current route/screen state
  const renderCurrentScreen = () => {
    // Step 0: Pre-login Home Landing Dashboard or Login Modal
    if (!profile || !profile.accessGranted) {
      if (showLoginModal) {
        return (
          <LoginAccessModal
            initialTab={loginInitialTab}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onBackToHome={() => setShowLoginModal(false)}
            onSuccess={(newProfile) => {
              setProfile(newProfile);
              setLevelProgress(getStoredLevelProgress());
              setShowLoginModal(false);
              showToast(`Selamat datang di AlgoriMath, ${newProfile.name}!`);
            }}
          />
        );
      }

      return (
        <HomeLandingScreen
          theme={theme}
          profile={profile}
          onToggleTheme={handleToggleTheme}
          onOpenLogin={(tab) => {
            setLoginInitialTab(tab || 'login');
            setShowLoginModal(true);
          }}
          onQuickTrial={handleQuickTrialStart}
          onStartPretest={() => {
            setLoginInitialTab('register');
            setShowLoginModal(true);
          }}
          onReturnToDashboard={() => setShowHomeViewLoggedIn(false)}
        />
      );
    }

    // Step 1: Diagnostic Pretest (Placement Test) - Mandatory upon first login after approval
    if (!profile.pretestCompleted) {
      return (
        <PretestScreen
          profile={profile}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onComplete={async (assignedLevel) => {
            const currentProf = getStoredProfile() || profile;
            
            // 1. Generate clean level progress with assigned level (and prior foundational levels) unlocked
            const cleanProgress = generateCleanLevelProgress(assignedLevel, true);
            saveStoredLevelProgress(cleanProgress);

            // 2. Updated student profile
            const updated: StudentProfile = {
              ...currentProf,
              pretestCompleted: true,
              startingLevel: assignedLevel,
              currentLevel: assignedLevel,
              lastStudiedLevel: assignedLevel,
              lastStudiedWorksheet: 1
            };
            saveStoredProfile(updated);

            // 3. Immediately persist to Firebase backend (profile, levelProgress, and pretestResult)
            try {
              await FirebaseDatabaseService.saveProfile(updated);
              await FirebaseDatabaseService.saveLevelProgress(cleanProgress);
              const latestPretest = getStoredPretestResult();
              if (latestPretest) {
                await FirebaseDatabaseService.savePretestResult(latestPretest, updated.username);
              }
              if (updated.username) {
                const acc = getStoredAccountByUsername(updated.username);
                if (acc) {
                  upsertStoredAccount({
                    ...acc,
                    pretestCompleted: true,
                    startingLevel: assignedLevel,
                    currentLevel: assignedLevel,
                    lastStudiedLevel: assignedLevel,
                    lastStudiedWorksheet: 1,
                    levelProgress: cleanProgress,
                    pretestResult: latestPretest || undefined,
                    updatedAt: Date.now()
                  });
                }
              }
            } catch (err) {
              console.warn('Firebase direct save on pretest complete notice:', err);
            }

            // 4. Update React state
            setProfile(updated);
            setLevelProgress(cleanProgress);
            setPretestResult(getStoredPretestResult());
            showToast(`Tes diagnostik selesai! Level awal Anda ditetapkan pada Level ${assignedLevel} dan lembar kerja otomatis terbuka.`);
          }}
        />
      );
    }

    // Step 1.5: If logged-in user explicitly wants to view the Home Landing screen (only after pretest is completed)
    if (showHomeViewLoggedIn) {
      return (
        <HomeLandingScreen
          theme={theme}
          profile={profile}
          onToggleTheme={handleToggleTheme}
          onOpenLogin={() => setShowHomeViewLoggedIn(false)}
          onQuickTrial={() => setShowHomeViewLoggedIn(false)}
          onStartPretest={() => setShowHomeViewLoggedIn(false)}
          onReturnToDashboard={() => setShowHomeViewLoggedIn(false)}
        />
      );
    }

    // Step 2 & 3: Active Worksheet Drill Practice <-> Level Roadmap Dashboard with Framer Motion slide & fade
    return (
      <AnimatePresence mode="wait" initial={false}>
        {activeSession ? (
          <motion.div
            key={`worksheet-${activeSession.levelId}-${activeSession.worksheetNum}`}
            initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <ErrorBoundary fallbackTitle="Lembar Kerja Sedang Dimuat" onReset={() => setActiveSession(null)}>
              <WorksheetPracticeScreen
                levelId={activeSession.levelId}
                worksheetNum={activeSession.worksheetNum}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onExit={() => setActiveSession(null)}
                onFinish={(result, isNewLevelUnlocked, unlockedLevelId) => {
                  setLevelProgress(getStoredLevelProgress());
                  setSessionHistory(getStoredSessionHistory());
                  const updatedProfile = getStoredProfile();
                  if (updatedProfile) setProfile(updatedProfile);

                  if (isNewLevelUnlocked && unlockedLevelId) {
                    showToast(`Luar biasa! Level ${unlockedLevelId} telah terbuka!`);
                  }
                  setActiveSession(null);
                }}
              />
            </ErrorBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="level-overview-screen"
            initial={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <LevelOverviewScreen
              profile={profile}
              levelProgress={levelProgress}
              sessions={sessionHistory}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onSelectWorksheet={(levelId, worksheetNum) => {
                if (profile.isTrial && worksheetNum > 1) {
                  showToast('Akun Trial dibatasi hanya untuk Lembar Kerja #1. Silakan masuk menggunakan akun siswa yang telah disetujui Guru untuk akses penuh.');
                  return;
                }
                setActiveSession({ levelId, worksheetNum });
              }}
              onOpenCertificate={(lvlId) => {
                setActiveCertificateLevel(lvlId);
              }}
              onOpenProfile={() => {
                setIsProfileModalOpen(true);
              }}
              onOpenAdmin={() => {
                setIsAdminModalOpen(true);
              }}
              onOpenPrint={(levelId, worksheetNum) => {
                setPrintModalState({
                  isOpen: true,
                  levelId: levelId || 'E',
                  worksheetNum: worksheetNum || 1
                });
              }}
              onOpenHome={() => {
                setShowHomeViewLoggedIn(true);
              }}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col clay-bg-app text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Network Connectivity Status Banner (Offline / Back Online) */}
      <NetworkStatusBanner onSyncWithStorage={syncStorageData} />

      {/* Main Screen Content */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {renderCurrentScreen()}
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-5 py-3.5 clay-btn-primary text-white font-bold text-xs sm:text-sm rounded-[22px] flex items-center gap-2.5 animate-slide-up">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping shadow-sm" />
          <span className="tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Profile & History Modal */}
      {isProfileModalOpen && profile && (
        <StudentProfileModal
          profile={profile}
          sessions={sessionHistory}
          pretestResult={pretestResult}
          levelProgress={levelProgress}
          onLogout={handleLogout}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Certificate Modal */}
      {activeCertificateLevel && profile && (
        <CertificateModal
          levelId={activeCertificateLevel}
          profile={profile}
          progress={levelProgress[activeCertificateLevel]}
          onClose={() => setActiveCertificateLevel(null)}
        />
      )}

      {/* Teacher / Admin Modal */}
      {isAdminModalOpen && (
        <TeacherAdminModal
          profile={profile}
          levelProgress={levelProgress}
          onProgressUpdated={(newProg) => setLevelProgress(newProg)}
          onProfileUpdated={(newProf) => setProfile(newProf)}
          onOpenPrintWorksheets={(lvlId) => {
            setIsAdminModalOpen(false);
            setPrintModalState({
              isOpen: true,
              levelId: lvlId || 'E',
              worksheetNum: 1
            });
          }}
          onResetAll={() => {
            setProfile(null);
            setLevelProgress({} as any);
            setSessionHistory([]);
            setPretestResult(null);
            setIsAdminModalOpen(false);
          }}
          onClose={() => setIsAdminModalOpen(false)}
        />
      )}

      {/* Worksheet PDF Print Modal */}
      {printModalState.isOpen && (
        <KumonWorksheetPrintModal
          initialLevelId={printModalState.levelId || profile?.currentLevel || 'E'}
          initialWorksheetNum={printModalState.worksheetNum || 1}
          isAdmin={profile?.isAdmin || false}
          studentCurrentLevel={profile?.currentLevel || profile?.startingLevel || '6A'}
          unlockedLevels={
            profile?.isAdmin
              ? undefined
              : (Object.keys(levelProgress).filter(
                  (k) => levelProgress[k as KumonLevelId]?.unlocked
                ) as KumonLevelId[])
          }
          onClose={() => setPrintModalState({ isOpen: false })}
        />
      )}
    </div>
  );
}
