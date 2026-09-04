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
  onOpenLogin: () => void;
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200 flex flex-col">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <MathLogo size="md" showText subtitle="Pembelajaran Mandiri Berjenjang (6A – M)" />

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#kurikulum" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Kurikulum 18 Level
            </a>
            <a href="#fitur" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Metode & Keunggulan
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
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
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
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Coba Trial</span>
            </button>

            <button
              id="home-login-btn"
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Belajar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-indigo-50/20 to-[#F8FAFC] dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950">
        {/* Ambient background blur elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                <span>Metode Belajar Bertahap 18 Level Lengkap</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Bangun Daya Hitung &amp; Logika Mandiri dari <span className="text-indigo-600 dark:text-indigo-400">Dasar hingga Kalkulus</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Dirancang berbasis prinsip <strong>Small Steps</strong> dan kecepatan-ketelitian standar waktu optimal (SCT). Mulai dari tes diagnostik penempatan level, latihan mandiri harian beruntun (Study Streak), hingga cetak lembar kerja PDF fisik yang rapi dan bersih.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-start-pretest-btn"
                  type="button"
                  onClick={() => setShowPretestChoiceModal(true)}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-2xl transition-all cursor-pointer active:scale-95 flex items-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mulai Tes Diagnostik Penempatan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-trial-btn"
                  type="button"
                  onClick={onQuickTrial}
                  className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Coba Akses Trial</span>
                </button>
              </div>

              {/* Cross-device real-time sync notification */}
              <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 max-w-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Sudah pernah pretest di HP / laptop lain?{' '}
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Masuk Akun di Sini
                  </button>{' '}
                  agar hasil belajar &amp; level Anda langsung tersinkron real-time tanpa perlu pretest ulang.
                </span>
              </div>

              {/* Key Value Points Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">18 Level</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pra-Sekolah s.d. SMA</div>
                </div>
                <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-800 px-3">
                  <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">180 Lembar</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">1.800+ Soal Bertingkat</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black text-amber-500">Database</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Cloud Sinkron & Akun</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Live Interactive Mini Math Widget */}
            <div id="demo" className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                      Simulasi Latihan Live
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded">
                    Level E: Pecahan
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Contoh Soal #1 (Penjumlahan Pecahan):
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        <KaTeXMath math="\frac{3}{4} + \frac{2}{3} = \dots" block={false} />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Input Form */}
                  <form onSubmit={handleCheckDemo} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                          className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
                        >
                          Periksa
                        </button>
                      </div>
                    </div>

                    {/* Instant Feedback Notice */}
                    {demoFeedback === 'correct' && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Tepat Sekali!</strong> KPK dari 4 dan 3 adalah 12, sehingga 9/12 + 8/12 = 17/12.</span>
                      </div>
                    )}

                    {demoFeedback === 'incorrect' && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
                        <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Belum tepat. Samakan penyebut menjadi 12 (9/12 + 8/12). Jawabannya adalah <strong>17/12</strong>.</span>
                      </div>
                    )}
                  </form>

                  {/* Hierarchical steps callout */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Tersedia papan coretan virtual &amp; timer SCT
                    </span>
                    <button
                      type="button"
                      onClick={onOpenLogin}
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
      <section id="fitur" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 flex items-center justify-center font-bold">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center font-bold">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 flex items-center justify-center font-bold">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold">
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
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6. Privasi &amp; Data Lokal Terjamin
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Semua progres belajar, nilai, dan rekor tersimpan secara offline di browser perangkat tanpa ketergantungan server eksternal yang rumit.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Explorer (18 Levels 6A - M) */}
      <section id="kurikulum" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLevels.map((lvlId) => {
              const info = KUMON_LEVELS[lvlId];
              return (
                <div
                  key={lvlId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} text-white font-extrabold text-sm flex items-center justify-center shadow-xs`}>
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
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                        {info.standardTimeMinutes} mnt SCT
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {info.description}
                    </p>

                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Fokus Penguasaan:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {info.targetSkill}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      10 Lembar (100 Soal)
                    </span>
                    <button
                      type="button"
                      onClick={onOpenLogin}
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
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left relative overflow-hidden shadow-2xl border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700 text-amber-300 text-xs font-bold">
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

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              id="footer-start-now-btn"
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Masuk Akun Siswa</span>
            </button>

            <button
              id="footer-quick-trial-btn"
              type="button"
              onClick={onQuickTrial}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Mode Trial Gratis</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer Information */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 text-center transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <MathLogo size="sm" showText subtitle="Belajar Mandiri Berbasis Kecepatan & Ketelitian" />
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-800 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Mulai Pretest atau Masuk Akun?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Jika Anda sudah pernah mengerjakan tes diagnostik atau memiliki akun di HP/laptop lain, silakan <strong>Masuk Akun</strong> agar level belajar Anda langsung tersinkron real-time tanpa perlu pretest ulang.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPretestChoiceModal(false);
                  onOpenLogin();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Masuk Akun Saya (Sudah Pernah Pretest)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPretestChoiceModal(false);
                  onStartPretest();
                }}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Mulai Tes Diagnostik Baru</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowPretestChoiceModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
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
