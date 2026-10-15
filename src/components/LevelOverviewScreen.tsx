import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Award, 
  Sparkles, 
  Flame, 
  User, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Star, 
  BookOpen, 
  Filter, 
  Check, 
  CheckCircle, 
  Database, 
  HardDrive, 
  BarChart3, 
  TrendingUp,
  Printer, 
  LogOut,
  Zap,
  Info,
  Sun,
  Moon,
  FolderDown,
  FileText,
  RefreshCw
} from 'lucide-react';
import { FirebaseDatabaseService } from '../services/firebaseSync';
import { KumonLevelId, StudentProfile, LevelProgress, WorksheetSessionResult, UnlockedBadge, ReflectionJournalEntry } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { DailyProgressChart } from './DailyProgressChart';
import { AppTheme, getStoredBadges, getStoredReflectionJournals } from '../utils/storage';
import { MathLogo } from './MathLogo';
import { StudyStreakTracker } from './StudyStreakTracker';
import { BadgeShowcaseModal } from './BadgeShowcaseModal';
import { ReflectionJournalModal } from './ReflectionJournalModal';
import { StudentFilesModal } from './StudentFilesModal';
import { BADGE_DEFINITIONS } from '../data/badgesData';

interface LevelOverviewScreenProps {
  profile: StudentProfile;
  levelProgress: Record<KumonLevelId, LevelProgress>;
  sessions: WorksheetSessionResult[];
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onSelectWorksheet: (levelId: KumonLevelId, worksheetNum: number) => void;
  onOpenCertificate: (levelId: KumonLevelId) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenPrint?: (levelId?: KumonLevelId, worksheetNum?: number) => void;
  onOpenHome?: () => void;
  onLogout?: () => void;
}

export const LevelOverviewScreen: React.FC<LevelOverviewScreenProps> = ({
  profile,
  levelProgress,
  sessions,
  theme = 'light',
  onToggleTheme,
  onSelectWorksheet,
  onOpenCertificate,
  onOpenProfile,
  onOpenAdmin,
  onOpenPrint,
  onOpenHome,
  onLogout
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeLevelModal, setActiveLevelModal] = useState<KumonLevelId | null>(null);
  const [trialNotice, setTrialNotice] = useState<string | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<'daily' | 'trend'>('daily');
  
  // Gamification & Reflection Journal state
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isJournalsModalOpen, setIsJournalsModalOpen] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>(() => getStoredBadges());
  const [journals, setJournals] = useState<ReflectionJournalEntry[]>(() => getStoredReflectionJournals());
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);

  // Keep badges and journals synced
  const refreshGamificationData = () => {
    setUnlockedBadges(getStoredBadges());
    setJournals(getStoredReflectionJournals());
  };

  const [isCheckingPromotion, setIsCheckingPromotion] = useState(false);
  const [promotionCheckNotice, setPromotionCheckNotice] = useState<string | null>(null);

  const handleCheckPromotionStatus = async () => {
    if (!profile.username) return;
    setIsCheckingPromotion(true);
    setPromotionCheckNotice(null);
    try {
      const res = await FirebaseDatabaseService.checkAccountStatus(profile.username);
      if (res.account) {
        if (!res.account.pendingPromotionLevel && res.account.currentLevel !== profile.currentLevel) {
          setPromotionCheckNotice(`Level ${res.account.currentLevel} telah disetujui Guru! Memuat ulang...`);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        } else if (res.account.pendingPromotionLevel) {
          setPromotionCheckNotice(`Level ${res.account.pendingPromotionLevel} masih menunggu persetujuan Guru di Panel Admin.`);
          setTimeout(() => setPromotionCheckNotice(null), 4000);
        } else {
          setPromotionCheckNotice('Belum ada pembaruan status.');
          setTimeout(() => setPromotionCheckNotice(null), 3000);
        }
      }
    } catch (e) {
      console.error(e);
      setPromotionCheckNotice('Gagal memeriksa status. Periksa koneksi internet.');
      setTimeout(() => setPromotionCheckNotice(null), 3000);
    } finally {
      setIsCheckingPromotion(false);
    }
  };

  const categories = [
    'Semua',
    'Pra-Sekolah',
    'SD Dasar',
    'SD Lanjut',
    'SMP Aljabar',
    'SMA Aljabar & Fungsi',
    'SMA Kalkulus'
  ];

  const filteredLevels = KUMON_LEVEL_ORDER.filter((lvlId) => {
    if (selectedCategory === 'Semua') return true;
    return KUMON_LEVELS[lvlId].category === selectedCategory;
  });

  const totalMastered = Object.values(levelProgress).filter((p: LevelProgress) => p?.mastered).length;
  const totalUnlocked = Object.values(levelProgress).filter((p: LevelProgress) => p?.unlocked).length;

  // Calculate Last Studied & Next Target Worksheet Position
  const lastStudiedLvl: KumonLevelId = profile.lastStudiedLevel || profile.startingLevel || profile.currentLevel || '6A';
  const lastStudiedWs: number = profile.lastStudiedWorksheet || 1;
  const currentLvlProgress = levelProgress[lastStudiedLvl];
  const isLastWsDone = currentLvlProgress?.completedWorksheets?.includes(lastStudiedWs) || false;

  let nextTargetLevel: KumonLevelId = lastStudiedLvl;
  let nextTargetWorksheet: number = lastStudiedWs;

  if (isLastWsDone) {
    if (lastStudiedWs < 10) {
      nextTargetWorksheet = lastStudiedWs + 1;
    } else {
      const currIdx = KUMON_LEVEL_ORDER.indexOf(lastStudiedLvl);
      if (currIdx !== -1 && currIdx < KUMON_LEVEL_ORDER.length - 1) {
        const nextLvlId = KUMON_LEVEL_ORDER[currIdx + 1];
        if (levelProgress[nextLvlId]?.unlocked) {
          nextTargetLevel = nextLvlId;
          nextTargetWorksheet = 1;
        } else {
          nextTargetWorksheet = 10;
        }
      }
    }
  }

  const nextLevelInfo = KUMON_LEVELS[nextTargetLevel] || KUMON_LEVELS[lastStudiedLvl];

  return (
    <div className="min-h-screen clay-bg-app text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Decorative ambient clay spheres */}
      <div className="clay-orb w-64 h-64 -top-16 -left-16 bg-indigo-300/25 dark:bg-indigo-700/15" />
      <div className="clay-orb w-72 h-72 top-1/2 -right-24 bg-amber-200/30 dark:bg-amber-600/10" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 clay-nav px-4 sm:px-8 py-3.5 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <MathLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">AlgoriMath</h1>
                <span className="clay-badge text-[10px] bg-indigo-50/90 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 uppercase tracking-wide hidden sm:inline">
                  Kurikulum Mandiri (6A – M)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Belajar Mandiri Berbasis Kecepatan &amp; Ketelitian</p>
            </div>
          </div>

          {/* User Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Home / Beranda link button */}
            {onOpenHome && (
              <button
                id="header-home-button"
                type="button"
                onClick={onOpenHome}
                className="hidden lg:flex clay-btn clay-btn-secondary items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                title="Buka Halaman Beranda & Informasi Kurikulum"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Beranda</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle Button */}
            {onToggleTheme && (
              <button
                id="theme-toggle-button"
                type="button"
                onClick={onToggleTheme}
                className="clay-btn clay-btn-secondary p-2 sm:px-3 sm:py-2 text-xs font-bold gap-1.5"
                title={theme === 'dark' ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
                aria-label="Toggle tema gelap / terang"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">Gelap</span>
                  </>
                )}
              </button>
            )}

            {/* Student Learning Materials & Uploaded Files */}
            <button
              id="open-student-files-btn"
              type="button"
              onClick={() => setIsFilesModalOpen(true)}
              className="clay-btn clay-btn-primary items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
              title="File & Materi Pembelajaran (Sesuai Hasil Diagnostik & Level Belajar Terakhir Anda)"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">File &amp; Materi Pembelajaran</span>
              <span className="md:hidden">File</span>
            </button>

            {/* Quick Print & Download PDF / HTML Button */}
            {onOpenPrint && (
              <button
                id="quick-print-worksheets-button"
                type="button"
                onClick={() => onOpenPrint(lastStudiedLvl, lastStudiedWs)}
                className="clay-btn clay-btn-secondary items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                title={`Cetak & Unduh Lembar Kerja (Level ${lastStudiedLvl} #${lastStudiedWs})`}
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Cetak Soal &amp; Pembahasan</span>
                <span className="sm:hidden">Cetak</span>
              </button>
            )}

            {/* Student Badge (clickable) */}
            <button
              id="student-profile-button"
              type="button"
              onClick={onOpenProfile}
              className="clay-btn clay-btn-secondary items-center gap-2.5 px-3 py-1.5 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-lg shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
                {profile.avatar}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">{profile.name}</span>
                  {profile.isAdmin ? (
                    <span className="clay-badge text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      ADMIN
                    </span>
                  ) : profile.isTrial ? (
                    <span className="clay-badge text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      TRIAL
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{profile.totalPoints} Poin</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pl-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{profile.streakDays}</span>
              </div>
            </button>

            {/* Teacher / Admin Button */}
            <button
              id="teacher-admin-button"
              type="button"
              onClick={onOpenAdmin}
              className="clay-btn clay-btn-secondary p-2.5 text-slate-700 dark:text-slate-200"
              title="Panel Guru & Manajemen Data"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </button>

            {/* Logout / Keluar Button */}
            {onLogout && (
              <button
                id="header-logout-button"
                type="button"
                onClick={onLogout}
                className="clay-btn clay-btn-rose px-3 py-2 text-xs font-bold gap-1.5"
                title="Keluar / Logout (Semua progres belajar tetap tersimpan aman)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        {/* Trial Account Banner Notice */}
        {profile.isTrial && (
          <div className="p-4 sm:p-5 clay-card bg-amber-50/90 dark:bg-amber-950/40 border-amber-300/60 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <strong className="text-sm font-extrabold text-amber-950 dark:text-amber-100 block">Akses Akun Uji Coba (Trial Mode)</strong>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed mt-0.5">
                  Anda dapat mencoba Tes Diagnostik &amp; Level Penempatan (<strong>Level {profile.startingLevel || '6A'}</strong>, Lembar Kerja #1). Untuk membuka seluruh 10 lembar kerja dan 18 level lengkap tanpa batas, silakan masuk menggunakan akun siswa yang telah didaftarkan dan disetujui Guru.
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="clay-btn clay-btn-amber px-4 py-2 text-xs font-bold shrink-0"
              >
                Ganti Akun
              </button>
            )}
          </div>
        )}

        {/* Tiered Access: Pending Level Promotion Banner */}
        {profile.accessType === 'tiered' && profile.pendingPromotionLevel && (
          <div className="p-4 sm:p-5 clay-card bg-amber-50/95 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-black text-amber-950 dark:text-amber-100">
                    Level {profile.lastStudiedLevel || profile.currentLevel} Selesai • Menunggu Approval Naik Level {profile.pendingPromotionLevel}
                  </strong>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Akses Berjenjang
                  </span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                  Selamat! Anda telah menuntaskan materi level sebelumnya. Karena akun Anda bertipe <strong>Akses Berjenjang</strong>, akses <strong>Level {profile.pendingPromotionLevel}</strong> sedang menunggu persetujuan (Approve) dari Guru di Panel Admin.
                </p>
                {promotionCheckNotice && (
                  <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 pt-0.5 animate-fadeIn">
                    {promotionCheckNotice}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isCheckingPromotion}
              onClick={handleCheckPromotionStatus}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-center disabled:opacity-50"
              title="Periksa apakah Guru sudah menyetujui kenaikan level"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPromotion ? 'animate-spin' : ''}`} />
              <span>Cek Status Approval Guru</span>
            </button>
          </div>
        )}

        {/* Banner summary */}
        <div className="clay-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors duration-200">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="clay-badge px-3 py-1 bg-indigo-50/90 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                Level Awal: {profile.startingLevel || '6A'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                Penyimpanan Database Sinkron
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Kurikulum Mandiri Berjenjang 18 Level
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Selesaikan setiap set lembar kerja secara rutin untuk mencapai akurasi 100% dan target waktu standar (SCT). Level akan terbuka berurutan sesuai pencapaian Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="clay-card-sm px-5 py-3.5 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Level Terbuka</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{totalUnlocked} / 18</div>
            </div>

            <div className="clay-card-sm px-5 py-3.5 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Lulus Master</span>
              <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                <span>{totalMastered}</span>
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning / Resume Last Studied Worksheet Card */}
        <div className="clay-card bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden border-indigo-700/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="clay-badge px-3 py-1 bg-amber-400/20 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider border-amber-400/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Lanjutkan Pembelajaran Terakhir
                </span>
                <span className="clay-badge text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-0.5 border-emerald-700/50">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Tersimpan Otomatis di Database
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Level {nextTargetLevel} • Lembar Kerja #{nextTargetWorksheet}</span>
                  <span className="text-xs sm:text-sm font-normal text-indigo-200">({nextLevelInfo.name})</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                  {profile.lastStudiedAt || (profile.totalWorksheetsCompleted > 0) ? (
                    <>
                      Terakhir dipelajari: <strong className="text-white">Level {lastStudiedLvl} #{lastStudiedWs}</strong>
                      {profile.lastStudiedScore !== undefined ? (
                        <span> dengan skor <strong className="text-amber-300">{profile.lastStudiedScore}%</strong></span>
                      ) : null}. Lanjutkan drill sekarang untuk mempertahankan streak dan meningkatkan kecepatan!
                    </>
                  ) : (
                    <>
                      Hasil penempatan pretest Anda: <strong className="text-white">Level {profile.startingLevel || '6A'}</strong>. Mulai pembelajaran dari Lembar Kerja #1!
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsFilesModalOpen(true)}
                className="clay-btn clay-btn-secondary px-4 py-3.5 text-xs font-bold gap-1.5 rounded-[22px] justify-center"
                title="Buka File & Modul Materi Sesuai Level Ini"
              >
                <FolderDown className="w-4 h-4 text-emerald-400" />
                <span>File Materi</span>
              </button>

              <button
                id="resume-last-learning-button"
                type="button"
                onClick={() => {
                  if (profile.isTrial && nextTargetWorksheet > 1) {
                    setTrialNotice('Akun Trial dibatasi hanya untuk Lembar Kerja #1. Silakan masuk menggunakan akun siswa yang telah disetujui Guru untuk akses penuh.');
                    return;
                  }
                  onSelectWorksheet(nextTargetLevel, nextTargetWorksheet);
                }}
                className="w-full sm:w-auto clay-btn clay-btn-amber px-6 py-4 text-sm font-black gap-2 rounded-[22px] justify-center"
              >
                <Play className="w-4 h-4 fill-amber-950" />
                <span>Lanjutkan Belajar (Level {nextTargetLevel} #{nextTargetWorksheet})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Study Streak Tracker with animated fire icon & 7-day activity calendar */}
        <StudyStreakTracker 
          profile={profile} 
          sessions={sessions} 
        />

        {/* Milestone Badges & Reflection Journal Quick Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lencana Pencapaian Card */}
          <div 
            id="badge-showcase-card"
            onClick={() => {
              refreshGamificationData();
              setIsBadgesModalOpen(true);
            }}
            className="p-5 clay-card clay-card-interactive flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl clay-card-sm text-2xl flex items-center justify-center shrink-0">
                🏆
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    Lencana Pencapaian
                  </h3>
                  <span className="clay-badge px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                    {unlockedBadges.length} / {BADGE_DEFINITIONS.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target milestone 100 lembar kerja, streak 7 hari, dan penguasaan level.
                </p>
              </div>
            </div>

            <div className="clay-btn clay-btn-amber px-3.5 py-2 text-xs font-bold shrink-0 gap-1 rounded-xl">
              <span>Buka</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Jurnal Refleksi Siswa Card */}
          <div 
            id="reflection-journal-card"
            onClick={() => {
              refreshGamificationData();
              setIsJournalsModalOpen(true);
            }}
            className="p-5 clay-card clay-card-interactive flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl clay-card-sm text-2xl flex items-center justify-center shrink-0">
                📖
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    Jurnal &amp; Catatan Belajar
                  </h3>
                  <span className="clay-badge px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-[10px] font-black">
                    {journals.length} Catatan
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Catatan mandiri materi yang baru dipelajari setelah menyelesaikan lembar kerja.
                </p>
              </div>
            </div>

            <div className="clay-btn clay-btn-primary px-3.5 py-2 text-xs font-bold shrink-0 gap-1 rounded-xl">
              <span>Jurnal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Recharts Analytics Section: Daily Progress (Worksheets vs Time) & Performance Trend */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Visualisasi &amp; Analitik Belajar Siswa
              </h3>
            </div>

            <div className="flex items-center p-1.5 clay-inset rounded-[20px] gap-1 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                id="tab-analytics-daily"
                onClick={() => setAnalyticsTab('daily')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  analyticsTab === 'daily'
                    ? 'clay-btn-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Kemajuan Harian (Lembar vs Waktu)</span>
              </button>

              <button
                type="button"
                id="tab-analytics-trend"
                onClick={() => setAnalyticsTab('trend')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  analyticsTab === 'trend'
                    ? 'clay-btn-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tren Skor &amp; Standar SCT</span>
              </button>
            </div>
          </div>

          <div className="clay-card p-5 sm:p-6">
            {analyticsTab === 'daily' ? (
              <DailyProgressChart sessions={sessions} />
            ) : (
              <PerformanceTrendChart sessions={sessions} />
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none p-1.5 clay-inset rounded-[22px]">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'clay-btn-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Level Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLevels.map((lvlId) => {
            const info = KUMON_LEVELS[lvlId];
            const prog = levelProgress[lvlId] || {
              levelId: lvlId,
              unlocked: false,
              mastered: false,
              completedWorksheets: [],
              highestScores: {},
              bestTimes: {},
              attemptsCount: {}
            };

            // In trial mode, only allow the placed starting level
            const isUnlocked = profile.isTrial 
              ? (lvlId === (profile.startingLevel || profile.currentLevel || '6A'))
              : prog.unlocked;

            const isMastered = prog.mastered;
            const completedCount = prog.completedWorksheets.length;
            const progressPercent = Math.round((completedCount / info.totalWorksheets) * 100);

            return (
              <div
                key={lvlId}
                className={`p-6 transition-all flex flex-col justify-between relative ${
                  isUnlocked
                    ? 'clay-card clay-card-interactive'
                    : 'clay-card opacity-65 grayscale-[30%]'
                }`}
              >
                {/* Master Badge */}
                {isMastered && (
                  <div className="absolute top-4 right-4 clay-badge bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase px-3 py-1 flex items-center gap-1.5 border-emerald-300/40">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Mastered</span>
                  </div>
                )}

                <div>
                  {/* Top Row: Level ID & Category */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${info.color} text-white font-black text-base flex items-center justify-center shadow-[4px_6px_12px_rgba(0,0,0,0.18),inset_2px_2px_4px_rgba(255,255,255,0.4)]`}>
                        {lvlId}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          {info.category}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-tight">
                          {info.name}
                        </h3>
                      </div>
                    </div>

                    {!isUnlocked && (
                      <div className="flex items-center gap-1.5">
                        {profile.accessType === 'tiered' && profile.pendingPromotionLevel === lvlId ? (
                          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] rounded-xl flex items-center gap-1 border border-amber-300 dark:border-amber-700 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Menunggu Approve Guru</span>
                          </span>
                        ) : (
                          <div className="p-2.5 rounded-2xl clay-card-sm text-slate-400 dark:text-slate-500">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description & Target Skill */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3.5">
                    {info.description}
                  </p>

                  {/* Sample Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {info.sampleTopics.slice(0, 2).map((top, idx) => (
                      <span key={idx} className="clay-badge text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Action */}
                <div className="space-y-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  {isUnlocked ? (
                    <>
                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          <span>Progres Lembar Kerja</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{completedCount} / {info.totalWorksheets} Selesai</span>
                        </div>
                        <div className="w-full clay-inset h-3 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveLevelModal(lvlId)}
                          className="flex-1 py-3 px-4 clay-btn clay-btn-primary text-xs sm:text-sm font-bold gap-2 rounded-2xl"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Pilih Lembar Kerja</span>
                        </button>

                        {isMastered && (
                          <button
                            type="button"
                            onClick={() => onOpenCertificate(lvlId)}
                            className="p-3 clay-btn clay-btn-amber text-amber-900 rounded-2xl"
                            title="Lihat Sertifikat Kelulusan"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={`py-3 text-center text-xs font-bold clay-inset flex items-center justify-center gap-2 rounded-2xl ${
                      profile.accessType === 'tiered' && profile.pendingPromotionLevel === lvlId
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/60'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {profile.accessType === 'tiered' && profile.pendingPromotionLevel === lvlId ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Menunggu Approve Guru (Akses Berjenjang)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>{profile.isTrial ? 'Khusus Akun Penuh (Trial Terbatas)' : 'Kuasai level sebelumnya untuk membuka'}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Professional Status Footer */}
      <footer className="py-3 sm:h-13 clay-nav text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row items-center px-4 sm:px-8 justify-between text-[11px] font-bold tracking-wide mt-auto transition-colors duration-200 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          <span className="flex items-center gap-1.5 uppercase text-indigo-600 dark:text-indigo-400">
            <Database className="w-3.5 h-3.5" />
            <span>Database: Sinkronisasi Cloud Aktif</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">
            @copyright by. Pak GuruAi
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
          <span className="hidden md:inline text-slate-500 dark:text-slate-400 text-[10px]">
            {totalMastered > 0 ? `${totalMastered} Level Lulus Master` : 'Sistem Pembelajaran Mandiri Berjenjang'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px] font-black">DATABASE ONLINE</span>
        </div>
      </footer>

      {/* Worksheet Selector Modal when a level is clicked */}
      {activeLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="flex flex-col w-full max-w-2xl clay-card overflow-hidden my-auto max-h-[90vh]">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${KUMON_LEVELS[activeLevelModal].color} text-white font-black text-lg flex items-center justify-center shadow-[4px_6px_12px_rgba(0,0,0,0.18)]`}>
                  {activeLevelModal}
                </div>
                <div>
                  <span className="clay-badge text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2.5 py-0.5">
                    {KUMON_LEVELS[activeLevelModal].category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    Level {activeLevelModal}: {KUMON_LEVELS[activeLevelModal].name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Waktu Standar (SCT): {KUMON_LEVELS[activeLevelModal].standardTimeMinutes} menit per lembar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilesModalOpen(true)}
                  className="clay-btn clay-btn-secondary px-3.5 py-2 text-xs font-bold gap-1.5 rounded-2xl"
                  title="Lihat File & Modul Pembelajaran Siswa"
                >
                  <FolderDown className="w-3.5 h-3.5 text-emerald-500" />
                  <span>File Materi</span>
                </button>

                {onOpenPrint && (
                  <button
                    type="button"
                    onClick={() => {
                      const lvl = activeLevelModal;
                      if (lvl) {
                        setActiveLevelModal(null);
                        onOpenPrint(lvl);
                      }
                    }}
                    className="clay-btn clay-btn-secondary px-3.5 py-2 text-xs font-bold gap-1.5 rounded-2xl"
                    title="Unduh atau Cetak Lembar Kerja & Pembahasan Lengkap Level Ini"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cetak Level Ini</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveLevelModal(null)}
                  className="clay-btn clay-btn-secondary p-2 rounded-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Trial notification banner inside sheet selector */}
            {profile.isTrial && (
              <div className="px-6 py-2.5 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Akun Trial: Anda dapat mengerjakan <strong>Lembar #1</strong>. Lembar #2–10 tersedia pada versi penuh.</span>
              </div>
            )}

            {/* List of 10 Worksheets */}
            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Pilih lembar kerja (Set 1 – 10). Latihan dapat diulang untuk mengoptimalkan kecepatan berhitung:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const wNum = idx + 1;
                  const isLockedByTrial = profile.isTrial && wNum > 1;
                  const prog = levelProgress[activeLevelModal];
                  const isDone = prog?.completedWorksheets?.includes(wNum);
                  const topScore = prog?.highestScores?.[wNum];
                  const bestTime = prog?.bestTimes?.[wNum];

                  return (
                    <div
                      key={wNum}
                      className={`p-4 rounded-2xl transition-all flex items-center justify-between ${
                        isLockedByTrial
                          ? 'clay-inset opacity-60'
                          : isDone
                          ? 'clay-card-sm border-emerald-300/40'
                          : 'clay-card-sm'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Lembar #{wNum}</span>
                          {isLockedByTrial ? (
                            <span className="clay-badge text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              🔒 Trial
                            </span>
                          ) : isDone ? (
                            <span className="clay-badge text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                              ✓ Nilai {topScore}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isLockedByTrial 
                            ? 'Khusus akun penuh' 
                            : bestTime 
                            ? `Waktu terbaik: ${Math.floor(bestTime / 60)}m ${bestTime % 60}s` 
                            : '10 Soal Bertahap'}
                        </p>
                      </div>

                      {isLockedByTrial ? (
                        <button
                          type="button"
                          onClick={() => setTrialNotice(`Lembar #${wNum} hanya tersedia pada Akun Siswa Penuh. Silakan masuk menggunakan akun siswa yang telah disetujui Guru untuk membuka seluruh lembar kerja.`)}
                          className="clay-btn clay-btn-secondary px-3 py-1.5 text-xs font-bold gap-1 rounded-xl"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Terkunci</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const lvl = activeLevelModal;
                            if (lvl) {
                              setActiveLevelModal(null);
                              onSelectWorksheet(lvl, wNum);
                            }
                          }}
                          className={`clay-btn px-4 py-2 text-xs font-bold rounded-xl gap-1 ${
                            isDone ? 'clay-btn-emerald' : 'clay-btn-primary'
                          }`}
                        >
                          <span>{isDone ? 'Ulang' : 'Mulai'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Alert Notice Modal */}
      {trialNotice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md clay-card p-7 text-center space-y-4">
            <div className="w-14 h-14 clay-card-sm text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Fitur Terbatas pada Mode Trial</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {trialNotice}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTrialNotice(null)}
                className="clay-btn clay-btn-secondary px-6 py-2.5 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setTrialNotice(null);
                    setActiveLevelModal(null);
                    onLogout();
                  }}
                  className="clay-btn clay-btn-primary px-6 py-2.5 text-xs font-bold rounded-xl"
                >
                  Masuk Akun Siswa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Badge Showcase Modal */}
      {isBadgesModalOpen && (
        <BadgeShowcaseModal
          profile={profile}
          sessions={sessions}
          levelProgress={levelProgress}
          journals={journals}
          unlockedBadges={unlockedBadges}
          onClose={() => {
            setIsBadgesModalOpen(false);
            refreshGamificationData();
          }}
        />
      )}

      {/* Reflection Journal Modal */}
      {isJournalsModalOpen && (
        <ReflectionJournalModal
          profile={profile}
          journals={journals}
          onUpdateJournals={(updated) => {
            setJournals(updated);
            refreshGamificationData();
          }}
          onClose={() => {
            setIsJournalsModalOpen(false);
            refreshGamificationData();
          }}
        />
      )}

      {/* Student Files & Learning Materials Modal */}
      {isFilesModalOpen && (
        <StudentFilesModal
          profile={profile}
          onOpenPrint={onOpenPrint}
          onSelectWorksheet={onSelectWorksheet}
          onClose={() => setIsFilesModalOpen(false)}
        />
      )}
    </div>
  );
};


