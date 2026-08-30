/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  AppTheme
} from './utils/storage';
import { LoginAccessModal } from './components/LoginAccessModal';
import { HomeLandingScreen } from './components/HomeLandingScreen';
import { PretestScreen } from './components/PretestScreen';
import { LevelOverviewScreen } from './components/LevelOverviewScreen';
import { WorksheetPracticeScreen } from './components/WorksheetPracticeScreen';
import { StudentProfileModal } from './components/StudentProfileModal';
import { CertificateModal } from './components/CertificateModal';
import { TeacherAdminModal } from './components/TeacherAdminModal';
import { KumonWorksheetPrintModal } from './components/KumonWorksheetPrintModal';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [levelProgress, setLevelProgress] = useState<Record<KumonLevelId, LevelProgress>>({} as any);
  const [sessionHistory, setSessionHistory] = useState<WorksheetSessionResult[]>([]);
  const [pretestResult, setPretestResult] = useState<PretestResult | null>(null);
  const [theme, setTheme] = useState<AppTheme>('light');

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

  // Initialize from Local Storage on device
  useEffect(() => {
    const p = getStoredProfile();
    const prog = getStoredLevelProgress();
    const hist = getStoredSessionHistory();
    const pt = getStoredPretestResult();
    const initialTheme = getStoredTheme();

    setProfile(p);
    setLevelProgress(prog);
    setSessionHistory(hist);
    setPretestResult(pt);
    setTheme(initialTheme);
    saveStoredTheme(initialTheme);
  }, []);

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
          const updated = getStoredProfile();
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
    );
  }

  // Step 3: Main Level Roadmap & Dashboard
  return (
    <div className="relative min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl border border-indigo-400 flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Roadmap Overview */}
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

      {/* Profile & History Modal */}
      {isProfileModalOpen && (
        <StudentProfileModal
          profile={profile}
          sessions={sessionHistory}
          pretestResult={pretestResult}
          onLogout={handleLogout}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Certificate Modal */}
      {activeCertificateLevel && (
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

      {/* Kumon Worksheet PDF Print Modal */}
      {printModalState.isOpen && (
        <KumonWorksheetPrintModal
          initialLevelId={printModalState.levelId || 'E'}
          initialWorksheetNum={printModalState.worksheetNum || 1}
          isAdmin={profile.isAdmin || false}
          onClose={() => setPrintModalState({ isOpen: false })}
        />
      )}
    </div>
  );
}
