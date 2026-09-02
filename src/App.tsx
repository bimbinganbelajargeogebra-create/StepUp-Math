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
  logoutStudentSession,
  getStoredTheme,
  saveStoredTheme,
  sanitizeStudentLevelProgress,
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

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [levelProgress, setLevelProgress] = useState<Record<KumonLevelId, LevelProgress>>({} as any);
  const [sessionHistory, setSessionHistory] = useState<WorksheetSessionResult[]>([]);
  const [pretestResult, setPretestResult] = useState<PretestResult | null>(null);
  const [theme, setTheme] = useState<AppTheme>('light');
  const [isCloudReady, setIsCloudReady] = useState(false);

  // Navigation / View State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
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

    // 2. Subscribe to real-time User Doc updates in Firestore
    const unsubscribeUser = FirebaseDatabaseService.subscribeToUserData((update) => {
      let currentProf = profile;
      if (update.profile) {
        currentProf = { ...(profile || {}), ...update.profile } as StudentProfile;
        setProfile(currentProf);
        saveStoredProfile(update.profile);
      }
      if (update.levelProgress) {
        const cleanProg = sanitizeStudentLevelProgress(update.levelProgress, currentProf);
        setLevelProgress(cleanProg);
        saveStoredLevelProgress(cleanProg);
      }
      if (update.pretestResult) {
        setPretestResult(update.pretestResult);
      }
    });

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
  }, [syncStorageData]);

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
      name: existing?.name || 'Siswa Trial',
      grade: existing?.grade || 'SD Kelas 4',
      avatar: existing?.avatar || '🦊',
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
    setProfile(trialProfile);
    setShowLoginModal(false);
    setShowHomeViewLoggedIn(false);
    showToast('Akses Uji Coba (Trial) aktif! Selamat belajar di StepUp Math.');
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
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onBackToHome={() => setShowLoginModal(false)}
            onSuccess={(newProfile) => {
              setProfile(newProfile);
              setLevelProgress(getStoredLevelProgress());
              setShowLoginModal(false);
              showToast(`Selamat datang di StepUp Math, ${newProfile.name}!`);
            }}
          />
        );
      }

      return (
        <HomeLandingScreen
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenLogin={() => setShowLoginModal(true)}
          onQuickTrial={handleQuickTrialStart}
          onStartPretest={() => {
            handleQuickTrialStart();
          }}
        />
      );
    }

    // Step 0.5: If logged-in user explicitly wants to view the Home Landing screen
    if (showHomeViewLoggedIn) {
      return (
        <HomeLandingScreen
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenLogin={() => setShowHomeViewLoggedIn(false)}
          onQuickTrial={() => setShowHomeViewLoggedIn(false)}
          onStartPretest={() => setShowHomeViewLoggedIn(false)}
        />
      );
    }

    // Step 1: Diagnostic Pretest (Placement Test)
    if (!profile.pretestCompleted) {
      return (
        <PretestScreen
          profile={profile}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onComplete={(assignedLevel) => {
            const currentProf = getStoredProfile() || profile;
            const updated: StudentProfile = {
              ...currentProf,
              pretestCompleted: true,
              startingLevel: assignedLevel,
              currentLevel: assignedLevel,
              lastStudiedLevel: assignedLevel,
              lastStudiedWorksheet: 1
            };
            saveStoredProfile(updated);
            if (updated.username) {
              FirebaseDatabaseService.saveProfile(updated).catch(err => console.warn('Cloud sync on complete notice:', err));
            }
            setProfile(updated);
            setLevelProgress(getStoredLevelProgress());
            setPretestResult(getStoredPretestResult());
            showToast(`Level awal belajar Anda ditetapkan pada Level ${assignedLevel}`);
          }}
        />
      );
    }

    // Step 2: Active Worksheet Drill Practice
    if (activeSession) {
      return (
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
      );
    }

    // Step 3: Main Level Roadmap & Dashboard
    return (
      <LevelOverviewScreen
        profile={profile}
        levelProgress={levelProgress}
        sessions={sessionHistory}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectWorksheet={(levelId, worksheetNum) => {
          if (profile.isTrial && worksheetNum > 1) {
            showToast('Akun Trial dibatasi hanya untuk Lembar Kerja #1. Gunakan kode "stepup" untuk akses penuh.');
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
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Network Connectivity Status Banner (Offline / Back Online) */}
      <NetworkStatusBanner onSyncWithStorage={syncStorageData} />

      {/* Main Screen Content */}
      <div className="flex-1 flex flex-col">
        {renderCurrentScreen()}
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl border border-indigo-400 flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile & History Modal */}
      {isProfileModalOpen && profile && (
        <StudentProfileModal
          profile={profile}
          sessions={sessionHistory}
          pretestResult={pretestResult}
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
