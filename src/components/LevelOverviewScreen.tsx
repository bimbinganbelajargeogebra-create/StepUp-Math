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
  Moon
} from 'lucide-react';
import { KumonLevelId, StudentProfile, LevelProgress, WorksheetSessionResult } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { DailyProgressChart } from './DailyProgressChart';
import { AppTheme } from '../utils/storage';
import { MathLogo } from './MathLogo';
import { StudyStreakTracker } from './StudyStreakTracker';

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

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <MathLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">StepUp Math</h1>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 uppercase tracking-wide hidden sm:inline">
                  Kurikulum Mandiri (6A – M)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Belajar Mandiri Berbasis Kecepatan & Ketelitian</p>
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
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
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
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
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

            {/* Quick Print & Download PDF / HTML Button */}
            {onOpenPrint && (
              <button
                id="quick-print-worksheets-button"
                type="button"
                onClick={() => onOpenPrint()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Cetak & Unduh Lembar Kerja (Pilihan: Soal Saja, Kunci Jawaban, atau Pembahasan Lengkap)"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Unduh / Cetak Soal &amp; Pembahasan</span>
                <span className="sm:hidden">Cetak</span>
              </button>
            )}

            {/* Student Badge (clickable) */}
            <button
              id="student-profile-button"
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-left cursor-pointer shadow-xs hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-lg">
                {profile.avatar}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">{profile.name}</span>
                  {profile.isAdmin ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded">
                      ADMIN
                    </span>
                  ) : profile.isTrial ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded">
                      TRIAL
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{profile.totalPoints} Poin</span>
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors cursor-pointer shadow-xs"
              title="Panel Guru & Manajemen Data"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Logout / Keluar Button */}
            {onLogout && (
              <button
                id="header-logout-button"
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
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
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-amber-950 dark:text-amber-100 block">Akses Akun Uji Coba (Trial Mode)</strong>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  Anda dapat mencoba Tes Diagnostik & Level Penempatan (<strong>Level {profile.startingLevel || '6A'}</strong>, Lembar Kerja #1). Untuk membuka seluruh 10 lembar kerja dan 18 level lengkap tanpa batas, gunakan kode siswa <code>stepup</code> saat login.
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Ganti Akun
              </button>
            )}
          </div>
        )}

        {/* Banner summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
                Level Awal: {profile.startingLevel || '6A'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Penyimpanan Lokal Aktif
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Kurikulum Mandiri Berjenjang 18 Level
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Selesaikan setiap set lembar kerja secara rutin untuk mencapai akurasi 100% dan target waktu standar (SCT). Level akan terbuka berurutan sesuai pencapaian Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Level Terbuka</span>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalUnlocked} / 18</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Lulus Master</span>
              <div className="text-xl font-black text-amber-500 flex items-center justify-center gap-1">
                <span>{totalMastered}</span>
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak Tracker with animated fire icon & 7-day activity calendar */}
        <StudyStreakTracker 
          profile={profile} 
          sessions={sessions} 
        />

        {/* Recharts Analytics Section: Daily Progress (Worksheets vs Time) & Performance Trend */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Visualisasi & Analitik Belajar Siswa
              </h3>
            </div>

            <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-1 text-xs font-bold self-start sm:self-auto shadow-2xs">
              <button
                type="button"
                id="tab-analytics-daily"
                onClick={() => setAnalyticsTab('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  analyticsTab === 'daily'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
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
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  analyticsTab === 'trend'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tren Skor & Standar SCT</span>
              </button>
            </div>
          </div>

          {analyticsTab === 'daily' ? (
            <DailyProgressChart sessions={sessions} />
          ) : (
            <PerformanceTrendChart sessions={sessions} />
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 ml-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Level Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between relative bg-white dark:bg-slate-900 ${
                  isUnlocked
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800/80 opacity-65 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                {/* Master Badge */}
                {isMastered && (
                  <div className="absolute top-3 right-3 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Mastered</span>
                  </div>
                )}

                <div>
                  {/* Top Row: Level ID & Category */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${info.color} text-white font-extrabold text-base flex items-center justify-center shadow-xs`}>
                        {lvlId}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          {info.category}
                        </span>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight">
                          {info.name}
                        </h3>
                      </div>
                    </div>

                    {!isUnlocked && (
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Description & Target Skill */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {info.description}
                  </p>

                  {/* Sample Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {info.sampleTopics.slice(0, 2).map((top, idx) => (
                      <span key={idx} className="text-[10px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Action */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isUnlocked ? (
                    <>
                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          <span>Progres Lembar Kerja</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{completedCount} / {info.totalWorksheets} Selesai</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveLevelModal(lvlId)}
                          className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Pilih Lembar Kerja</span>
                        </button>

                        {isMastered && (
                          <button
                            type="button"
                            onClick={() => onOpenCertificate(lvlId)}
                            className="p-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl transition-colors cursor-pointer"
                            title="Lihat Sertifikat Kelulusan"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-2.5 text-center text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{profile.isTrial ? 'Khusus Akun Penuh (Trial Terbatas)' : 'Kuasai level sebelumnya untuk membuka'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Professional Status Footer */}
      <footer className="h-12 bg-slate-800 dark:bg-slate-900 border-t dark:border-slate-800 text-white flex items-center px-4 sm:px-8 justify-between text-[11px] font-medium tracking-wide mt-auto transition-colors duration-200">
        <div className="flex items-center gap-3 sm:gap-4 uppercase">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Penyimpanan Lokal: Aktif</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-300">
            {totalMastered > 0 ? `${totalMastered} Level Lulus Master` : 'Sistem Pembelajaran Mandiri Berjenjang'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 uppercase tracking-wider text-[10px]">SISTEM SIAP</span>
        </div>
      </footer>

      {/* Worksheet Selector Modal when a level is clicked */}
      {activeLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div className="flex flex-col w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] transition-colors duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${KUMON_LEVELS[activeLevelModal].color} text-white font-bold text-lg flex items-center justify-center shadow-xs`}>
                  {activeLevelModal}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    {KUMON_LEVELS[activeLevelModal].category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Level {activeLevelModal}: {KUMON_LEVELS[activeLevelModal].name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Waktu Standar (SCT): {KUMON_LEVELS[activeLevelModal].standardTimeMinutes} menit per lembar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Unduh atau Cetak Lembar Kerja & Pembahasan Lengkap Level Ini"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Unduh / Cetak Level Ini</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveLevelModal(null)}
                  className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Trial notification banner inside sheet selector */}
            {profile.isTrial && (
              <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Akun Trial: Anda dapat mengerjakan <strong>Lembar #1</strong>. Lembar #2–10 tersedia pada versi penuh.</span>
              </div>
            )}

            {/* List of 10 Worksheets */}
            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Pilih lembar kerja (Set 1 – 10). Latihan dapat diulang untuk mengoptimalkan kecepatan berhitung:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isLockedByTrial
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-300 dark:hover:border-emerald-700'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Lembar #{wNum}</span>
                          {isLockedByTrial ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                              🔒 Trial Limit
                            </span>
                          ) : isDone ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
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
                          onClick={() => setTrialNotice(`Lembar #${wNum} hanya tersedia pada Akun Siswa Penuh. Silakan masuk menggunakan kode akses "stepup" untuk membuka seluruh lembar kerja.`)}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
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
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fitur Terbatas pada Mode Trial</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {trialNotice}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTrialNotice(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Masuk Akun Penuh (stepup)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


