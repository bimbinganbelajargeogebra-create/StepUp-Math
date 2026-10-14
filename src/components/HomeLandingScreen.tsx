import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Flame, 
  Award, 
  Printer, 
  PenTool, 
  Clock, 
  Compass, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Moon, 
  BookOpen, 
  BarChart3, 
  HelpCircle,
  KeyRound,
  Calculator,
  ChevronRight
} from 'lucide-react';
import { MathLogo } from './MathLogo';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { KumonLevelId } from '../types';
import { KaTeXMath } from './KaTeXMath';
import { AppTheme } from '../utils/storage';

interface HomeLandingScreenProps {
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenLogin: (initialTab?: 'login' | 'register') => void;
  onQuickTrial: () => void;
  onStartPretest: () => void;
}

export const HomeLandingScreen: React.FC<HomeLandingScreenProps> = ({
  theme = 'light',
  onToggleTheme,
  onOpenLogin,
  onQuickTrial,
  onStartPretest
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [previewLevelId, setPreviewLevelId] = useState<KumonLevelId>('E');
  const [showPretestChoiceModal, setShowPretestChoiceModal] = useState<boolean>(false);
  
  // Interactive Live Demo Mini Math State
  const [demoInput, setDemoInput] = useState<string>('');
  const [demoFeedback, setDemoFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const categories = [
    'Semua',
    'Pra-Sekolah',
    'SD Dasar',
    'SD Lanjut',
    'SMP Aljabar',
    'SMA Aljabar & Fungsi',
    'SMA Kalkulus'
  ];

  const filteredLevels = KUMON_LEVEL_ORDER.filter((lvl) => {
    if (activeCategory === 'Semua') return true;
    return KUMON_LEVELS[lvl].category === activeCategory;
  });

  const handleCheckDemo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = demoInput.trim();
    // Problem is: 3/4 + 2/3 = 17/12 or 1 5/12
    if (clean === '17/12' || clean === '1 5/12' || clean === '1.416' || clean === '1.42') {
      setDemoFeedback('correct');
    } else {
      setDemoFeedback('incorrect');
    }
  };

  const selectedLevelInfo = KUMON_LEVELS[previewLevelId];

  return (
    <div className="min-h-screen clay-bg-app text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 flex flex-col relative overflow-x-hidden">
      {/* Decorative ambient clay spheres */}
      <div className="clay-orb w-72 h-72 -top-20 -left-20 bg-indigo-300/30 dark:bg-indigo-700/20 shadow-[10px_10px_30px_rgba(99,102,241,0.2)]" />
      <div className="clay-orb w-64 h-64 top-1/3 -right-20 bg-amber-200/35 dark:bg-amber-600/15 shadow-[10px_10px_30px_rgba(245,158,11,0.2)]" />
      <div className="clay-orb w-80 h-80 bottom-32 -left-24 bg-emerald-200/30 dark:bg-emerald-600/15 shadow-[10px_10px_30px_rgba(16,185,129,0.2)]" />

      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 clay-nav px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <MathLogo size="md" showText subtitle="Pembelajaran Mandiri Berjenjang (6A – M)" />

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#kurikulum" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Kurikulum 18 Level
            </a>
            <a href="#fitur" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Metode &amp; Keunggulan
            </a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Simulasi Interaktif
            </a>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleTheme && (
              <button
                id="home-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className="clay-btn clay-btn-secondary p-2.5 rounded-2xl cursor-pointer"
                title={theme === 'dark' ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
                aria-label="Theme toggle"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            )}

            <button
              id="home-quick-trial-btn"
              type="button"
              onClick={onQuickTrial}
              className="hidden sm:flex clay-btn clay-btn-amber px-4 py-2 text-xs font-bold gap-1.5 rounded-2xl cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-900" />
              <span>Coba Trial</span>
            </button>

            <button
              id="home-login-btn"
              type="button"
              onClick={() => onOpenLogin('login')}
              className="clay-btn clay-btn-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold gap-2 rounded-2xl cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Belajar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full clay-badge bg-white/90 dark:bg-slate-800/90 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm animate-pulse" />
                <span>Metode Belajar Mandiri Bertahap 18 Level Lengkap</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18]">
                Bangun Daya Hitung &amp; Logika Mandiri dari <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300/40 decoration-wavy decoration-2">Dasar hingga Kalkulus</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Dirancang berbasis prinsip <strong>Small Steps</strong> dan kecepatan-ketelitian standar waktu optimal (SCT). Mulai dari tes diagnostik penempatan level, latihan mandiri harian beruntun (Study Streak), hingga cetak lembar kerja PDF fisik yang rapi dan bersih.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  id="hero-start-pretest-btn"
                  type="button"
                  onClick={() => setShowPretestChoiceModal(true)}
                  className="clay-btn clay-btn-primary px-6 py-4 text-sm sm:text-base rounded-[24px] cursor-pointer gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mulai Tes Diagnostik Penempatan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-trial-btn"
                  type="button"
                  onClick={onQuickTrial}
                  className="clay-btn clay-btn-secondary px-5 py-4 text-sm sm:text-base rounded-[24px] cursor-pointer gap-2 font-bold"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Coba Akses Trial</span>
                </button>
              </div>

              {/* Cross-device real-time sync notification */}
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 clay-card-sm p-3.5 max-w-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span>
                  Sudah pernah pretest di HP / laptop lain?{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLogin('login')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Masuk Akun di Sini
                  </button>{' '}
                  agar hasil belajar &amp; level Anda langsung tersinkron real-time.
                </span>
              </div>

              {/* Key Value Points Badges */}
              <div className="pt-3 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="clay-card-sm p-3.5 text-center">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">18 Level</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Pra-Sekolah – SMA</div>
                </div>
                <div className="clay-card-sm p-3.5 text-center">
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">180 Lembar</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">1.800+ Soal Bertingkat</div>
                </div>
                <div className="clay-card-sm p-3.5 text-center">
                  <div className="text-xl sm:text-2xl font-black text-amber-500">Database</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Cloud Sinkron &amp; Akun</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Live Interactive Mini Math Widget */}
            <div id="demo" className="lg:col-span-5">
              <div className="clay-card p-6 sm:p-7 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]" />
                    <span className="ml-1 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Simulasi Latihan Interaktif
                    </span>
                  </div>
                  <span className="clay-badge text-[10px] px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                    Level E: Pecahan
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Contoh Soal #1 (Penjumlahan Pecahan):
                    </span>
                    <div className="p-4 clay-inset text-center">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white py-1">
                        <KaTeXMath math="\frac{3}{4} + \frac{2}{3} = \dots" block={false} />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Input Form */}
                  <form onSubmit={handleCheckDemo} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Ketikkan jawaban Anda (contoh: <code>17/12</code> atau <code>1 5/12</code>):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={demoInput}
                          onChange={(e) => {
                            setDemoInput(e.target.value);
                            setDemoFeedback(null);
                          }}
                          placeholder="Masukkan hasil pecahan..."
                          className="flex-1 px-4 py-3 clay-inset text-slate-900 dark:text-white text-sm font-mono focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="clay-btn clay-btn-primary px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl"
                        >
                          Periksa
                        </button>
                      </div>
                    </div>

                    {/* Instant Feedback Notice */}
                    {demoFeedback === 'correct' && (
                      <div className="p-3.5 clay-card-sm bg-emerald-50/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in border-emerald-300/40">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Tepat Sekali!</strong> KPK dari 4 dan 3 adalah 12, sehingga 9/12 + 8/12 = 17/12.</span>
                      </div>
                    )}

                    {demoFeedback === 'incorrect' && (
                      <div className="p-3.5 clay-card-sm bg-rose-50/90 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-fade-in border-rose-300/40">
                        <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Belum tepat. Samakan penyebut menjadi 12 (9/12 + 8/12). Jawabannya adalah <strong>17/12</strong>.</span>
                      </div>
                    )}
                  </form>

                  {/* Hierarchical steps callout */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Tersedia papan coretan virtual &amp; timer SCT
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenLogin('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Buka Semua Level →
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Core Features Grid */}
      <section id="fitur" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="clay-badge px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-800/80">
            Metode Pembelajaran Mandiri
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            5 Pilar Keunggulan AlgoriMath
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Membangun rasa percaya diri dan kemandirian siswa melalui latihan bertahap (Small Steps) tanpa rasa cemas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Pretest Diagnostic */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Tes Diagnostik Penempatan Awal
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Mengevaluasi kecepatan dan ketelitian untuk menempatkan siswa pada “titik awal yang nyaman” (Just-Right Level) sebelum melangkah ke materi baru.
            </p>
          </div>

          {/* Feature 2: Small Steps & Example No.1 */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Soal Contoh &amp; Langkah Bertingkat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Setiap lembar kerja diawali soal nomor 1 dengan contoh solusi bertingkat. Siswa belajar mandiri dengan membaca pola sebelum menyelesaikan soal 2 s/d 10.
            </p>
          </div>

          {/* Feature 3: Virtual Scratchpad */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Papan Coretan Virtual (Scratchpad)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Coret-coret hitungan langsung di layar sentuh atau mouse dengan fitur kuas, penghapus, dan grid kalkulasi tanpa memerlukan kertas buram terpisah.
            </p>
          </div>

          {/* Feature 4: Study Streak Tracker */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. Study Streak Tracker &amp; Rapor
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Melacak konsistensi latihan harian beruntun dengan animasi api streak, kalender aktivitas mingguan, dan grafik evaluasi perkembangan kecepatan (SCT).
            </p>
          </div>

          {/* Feature 5: Clean PDF Printing */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              5. Cetak Lembar Kerja PDF Bersih &amp; Rapi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Format lembar kerja standar A4 portrait presisi tinggi dengan formula KaTeX jernih, ruang hitung lega, dan opsi cetak kunci jawaban untuk guru/orang tua.
            </p>
          </div>

          {/* Feature 6: Local Storage Safe */}
          <div className="clay-card clay-card-interactive p-6 space-y-3.5">
            <div className="w-12 h-12 rounded-2xl clay-card-sm text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6. Privasi &amp; Data Cloud Terjamin
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Semua progres belajar, nilai, dan rekor tersimpan secara offline di browser dan tersinkronisasi otomatis ke cloud Firestore saat terhubung internet.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Explorer (18 Levels 6A - M) */}
      <section id="kurikulum" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="clay-badge px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-800/80 mb-2">
                Struktur Kurikulum Lengkap
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Jelajahi 18 Level Kurikulum (6A s/d M)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Setiap level memuat 10 set lembar kerja mandiri dengan target waktu standar (SCT).
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none p-1.5 clay-inset rounded-[22px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'clay-btn-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLevels.map((lvlId) => {
              const info = KUMON_LEVELS[lvlId];
              return (
                <div
                  key={lvlId}
                  className="clay-card clay-card-interactive p-5 sm:p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${info.color} text-white font-extrabold text-sm flex items-center justify-center shadow-[4px_6px_12px_rgba(0,0,0,0.18),inset_2px_2px_4px_rgba(255,255,255,0.4)]`}>
                          {lvlId}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            {info.category}
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                            {info.name}
                          </h4>
                        </div>
                      </div>
                      <span className="clay-badge text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/80 px-2.5 py-1">
                        {info.standardTimeMinutes} mnt SCT
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5">
                      {info.description}
                    </p>

                    <div className="space-y-1 clay-inset p-3">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Fokus Penguasaan:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {info.targetSkill}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      10 Lembar (100 Soal)
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenLogin('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mulai Level Ini</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="clay-card bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white text-center sm:text-left relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 border-indigo-700/30">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-badge bg-indigo-800/80 text-amber-300 text-xs font-bold border-indigo-600/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akses Cepat Siswa &amp; Guru</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Siap Memulai Langkah Pertama Belajar Matematika Mandiri?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Ikuti tes diagnostik penempatan atau masuk dengan akun siswa terdaftar yang telah disetujui untuk membuka seluruh kurikulum 18 level.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <button
              id="footer-start-now-btn"
              type="button"
              onClick={() => onOpenLogin('login')}
              className="w-full sm:w-auto clay-btn clay-btn-primary px-6 py-4 text-sm font-bold gap-2 rounded-[22px]"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Masuk Akun Siswa</span>
            </button>

            <button
              id="footer-quick-trial-btn"
              type="button"
              onClick={onQuickTrial}
              className="w-full sm:w-auto clay-btn clay-btn-amber px-5 py-4 text-sm font-bold gap-2 rounded-[22px]"
            >
              <Zap className="w-4 h-4 text-amber-900" />
              <span>Mode Trial Gratis</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer Information */}
      <footer className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 py-6 px-4 sm:px-8 clay-nav text-xs text-slate-500 dark:text-slate-400 text-center transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <MathLogo size="sm" showText subtitle="Belajar Mandiri Berbasis Kecepatan &amp; Ketelitian" />
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-[11px]">
            <span>© {new Date().getFullYear()} AlgoriMath Indonesia</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">@copyright by. Pak GuruAi</span>
          </div>
        </div>
      </footer>

      {/* 7. Modal Pilihan Pretest vs Masuk Akun (Cross-Device Sync) */}
      {showPretestChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="clay-card p-6 sm:p-8 max-w-md w-full space-y-5 text-slate-800 dark:text-slate-100">
            <div className="w-14 h-14 rounded-2xl clay-card-sm text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Tes Diagnostik Penempatan Level
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tes Diagnostik Awal merupakan penentu titik level belajar Anda. Sesuai ketentuan, <strong>siswa harus mendaftar dan disetujui (Approved) oleh Guru / Admin terlebih dahulu</strong> sebelum dapat login dan melaksanakan tes awal.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPretestChoiceModal(false);
                  onOpenLogin('login');
                }}
                className="w-full clay-btn clay-btn-primary py-3 px-4 text-xs sm:text-sm font-bold gap-2 rounded-2xl flex items-center justify-center cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Masuk Akun (Bagi yang Sudah Disetujui)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPretestChoiceModal(false);
                  onOpenLogin('register');
                }}
                className="w-full clay-btn clay-btn-secondary py-3 px-4 text-xs sm:text-sm font-bold gap-2 rounded-2xl flex items-center justify-center cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Daftar Akun Baru (Menunggu Approval)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPretestChoiceModal(false);
                  onQuickTrial();
                }}
                className="w-full clay-btn clay-btn-amber py-2.5 px-4 text-xs font-bold gap-2 rounded-2xl flex items-center justify-center cursor-pointer text-amber-950"
              >
                <Zap className="w-3.5 h-3.5 text-amber-800" />
                <span>Coba Simulasi Singkat (Trial 1 Lembar)</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowPretestChoiceModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
