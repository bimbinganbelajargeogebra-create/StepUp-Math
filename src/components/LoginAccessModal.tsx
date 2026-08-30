import React, { useState } from 'react';
import { KeyRound, User, GraduationCap, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ShieldAlert, Zap, Sun, Moon, ArrowLeft } from 'lucide-react';
import { StudentProfile } from '../types';
import { 
  ACCESS_CODE, 
  TRIAL_CODE,
  verifyAdminPassword, 
  verifyTrialAccess,
  unlockAllLevelsAdmin, 
  saveStoredProfile, 
  getStoredProfile,
  AppTheme
} from '../utils/storage';
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
  const [name, setName] = useState(existingProfile?.name || '');
  const [grade, setGrade] = useState(existingProfile?.grade || 'SD Kelas 3');
  const [avatar, setAvatar] = useState(existingProfile?.avatar || '🦊');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleQuickTrial = () => {
    setName(name.trim() || 'Siswa Trial');
    setCode('trial');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Silakan masukkan nama lengkap atau nama panggilan Anda.');
      return;
    }

    const cleanedCode = code.trim().toLowerCase();
    const isAdmin = verifyAdminPassword(cleanedCode);
    const isTrial = verifyTrialAccess(cleanedCode);
    const isStandardAccess = cleanedCode === ACCESS_CODE.toLowerCase();

    if (!isAdmin && !isStandardAccess && !isTrial) {
      setError('Kode akses tidak valid. Gunakan kode siswa "stepup" atau kode uji coba "trial".');
      return;
    }

    // Existing profile or create new
    const existing = getStoredProfile();

    if (isAdmin) {
      // Super Admin bypass: Unlock all 18 levels immediately without taking the pretest!
      unlockAllLevelsAdmin();
      
      const adminProfile: StudentProfile = {
        name: trimmedName || 'Administrator',
        grade: grade || 'Admin & Guru Pengajar',
        avatar: avatar || '⭐',
        joinedDate: existing?.joinedDate || Date.now(),
        accessGranted: true,
        isAdmin: true,
        isTrial: false,
        pretestCompleted: true, // Bypass diagnostic pretest
        startingLevel: existing?.startingLevel || '6A',
        currentLevel: existing?.currentLevel || '6A',
        totalWorksheetsCompleted: existing?.totalWorksheetsCompleted || 0,
        totalPoints: existing?.totalPoints || 500,
        streakDays: existing?.streakDays || 1,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };

      saveStoredProfile(adminProfile);
      onSuccess(adminProfile);
      return;
    }

    if (isTrial) {
      // Trial User: Must take diagnostic pretest, placed on suitable level, sheet 1 only
      const trialProfile: StudentProfile = {
        name: trimmedName || 'Siswa Trial',
        grade,
        avatar,
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
      return;
    }

    // Standard student profile - keep all prior progress intact
    const newProfile: StudentProfile = {
      name: trimmedName,
      grade,
      avatar,
      joinedDate: existing?.joinedDate || Date.now(),
      accessGranted: true,
      isAdmin: false,
      isTrial: false,
      pretestCompleted: existing?.pretestCompleted || false,
      startingLevel: existing?.startingLevel || null,
      currentLevel: existing?.currentLevel || '6A',
      totalWorksheetsCompleted: existing?.totalWorksheetsCompleted || 0,
      totalPoints: existing?.totalPoints || 0,
      streakDays: existing?.streakDays || 1,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };

    saveStoredProfile(newProfile);
    onSuccess(newProfile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 p-4 sm:p-6 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {/* Top brand header */}
        <div className="bg-slate-900 p-6 sm:p-7 text-white text-center border-b border-slate-800 relative">
          {onBackToHome && (
            <button
              id="login-back-to-home"
              type="button"
              onClick={onBackToHome}
              className="absolute top-4 left-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer flex items-center gap-1"
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
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-300" />
              )}
            </button>
          )}

          <div className="flex justify-center mb-3">
            <MathLogo size="xl" glow />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">StepUp Math</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Belajar Mandiri Matematika Berjenjang (Level 6A – M)
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Penyimpanan Aman di Perangkat Ini</span>
          </div>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Trial Option Banner */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">Ingin Mencoba Dulu?</span>
                <span className="text-amber-700 dark:text-amber-300 text-[11px]">Tes Diagnostik & Level Penempatan (Lembar 1)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickTrial}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Coba Trial
            </button>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Nama Pengguna / Siswa
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rian Pratama atau Siswa Trial"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-medium"
            />
          </div>

          {/* Grade / Level & Avatar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Jenjang / Kelas
              </label>
              <select
                id="student-grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
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
                <option value="Admin / Guru Pengajar">Admin / Guru Pengajar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Pilih Avatar
              </label>
              <div className="flex items-center justify-between gap-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {AVATARS.slice(0, 4).map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-base transition-all cursor-pointer ${
                      avatar === av ? 'bg-indigo-600 text-white shadow-xs scale-110' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secret Access Code / Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Kode Akses / Password
              </label>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline font-medium cursor-pointer"
              >
                {showHint ? 'Tutup Petunjuk' : 'Petunjuk Akses'}
              </button>
            </div>

            <input
              id="admin-access-code-input"
              type="password"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan kode akses (stepup / trial)..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-mono tracking-wider"
            />

            {showHint && (
              <div className="mt-2.5 p-3 bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Akses Penuh Siswa: </span>
                    <strong className="font-mono font-bold text-indigo-950 dark:text-indigo-300">stepup</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Membuka seluruh 10 lembar latihan per level</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode('stepup')}
                    className="px-2 py-1 bg-indigo-600 text-white font-semibold text-[10px] rounded-md hover:bg-indigo-700 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    Gunakan "stepup"
                  </button>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-amber-800 dark:text-amber-300">Akses Uji Coba: </span>
                    <strong className="font-mono font-bold text-amber-950 dark:text-amber-200">trial</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Tes diagnostik & level penempatan (Lembar 1)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode('trial')}
                    className="px-2 py-1 bg-amber-600 text-white font-semibold text-[10px] rounded-md hover:bg-amber-700 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    Gunakan "trial"
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            id="login-submit-button"
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Masuk ke StepUp Math</span>
          </button>
        </form>
      </div>
    </div>
  );
};


