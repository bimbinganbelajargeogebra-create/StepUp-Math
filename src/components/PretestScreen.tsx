import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  PenTool, 
  Clock, 
  Award, 
  ChevronRight,
  GraduationCap,
  Target,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRETEST_QUESTIONS, calculateStartingLevel } from '../data/pretestQuestions';
import { KUMON_LEVELS } from '../data/curriculumData';
import { KumonLevelId, PretestResult, StudentProfile } from '../types';
import { KaTeXMath } from './KaTeXMath';
import { Scratchpad } from './Scratchpad';
import { savePretestResult, AppTheme } from '../utils/storage';

interface PretestScreenProps {
  profile: StudentProfile;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onComplete: (assignedLevel: KumonLevelId) => void;
}

export const PretestScreen: React.FC<PretestScreenProps> = ({ 
  profile, 
  theme = 'light',
  onToggleTheme,
  onComplete 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<PretestResult | null>(null);

  const currentQ = PRETEST_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / PRETEST_QUESTIONS.length) * 100);

  const handleSelectOption = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: option
    });
  };

  const handleNext = () => {
    if (currentIndex < PRETEST_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishPretest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishPretest = () => {
    const calc = calculateStartingLevel(selectedAnswers);

    const breakdown: Record<string, { total: number; correct: number }> = {};
    PRETEST_QUESTIONS.forEach((q) => {
      const lvl = KUMON_LEVELS[q.levelId].category;
      if (!breakdown[lvl]) {
        breakdown[lvl] = { total: 0, correct: 0 };
      }
      breakdown[lvl].total += 1;
      if (selectedAnswers[q.id] === q.correctAnswer) {
        breakdown[lvl].correct += 1;
      }
    });

    const pretestRes: PretestResult = {
      completedAt: Date.now(),
      assignedLevel: calc.assignedLevel,
      score: calc.score,
      total: calc.total,
      breakdown,
      studentName: profile.name
    };

    savePretestResult(pretestRes, profile.username);
    setResult(pretestRes);
    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  if (isSubmitted && result) {
    const assignedInfo = KUMON_LEVELS[result.assignedLevel];

    return (
      <div className="min-h-screen clay-bg-app text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-200 relative overflow-x-hidden">
        {/* Decorative ambient clay spheres */}
        <div className="clay-orb w-64 h-64 -top-20 -right-20 bg-indigo-300/30 dark:bg-indigo-900/10 pointer-events-none" />
        <div className="clay-orb w-60 h-60 -bottom-20 -left-20 bg-emerald-300/30 dark:bg-emerald-900/10 pointer-events-none" />

        <div className="w-full max-w-2xl clay-card text-slate-900 dark:text-slate-100 rounded-[32px] overflow-hidden animate-fade-in z-10">
          {/* Header */}
          <div className="bg-slate-900/90 dark:bg-slate-950/90 p-6 sm:p-8 text-white text-center border-b border-slate-800/80 relative">
            <div className="w-14 h-14 clay-btn rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Hasil Pretest Diagnostik Selesai!</h2>
            <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm mt-1 font-medium">
              Level belajar mandiri matematika untuk <strong>{profile.name}</strong> telah ditentukan
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Score and Level Badge */}
            <div className="p-5 clay-card-sm rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Rekomendasi Penempatan Level</span>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Level {result.assignedLevel}</span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">({assignedInfo.name})</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md font-medium">
                  {assignedInfo.description}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center clay-inset px-5 py-3 rounded-2xl min-w-[110px]">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">Skor Pretest</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{result.score} / {result.total}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black mt-0.5">
                  {Math.round((result.score / result.total) * 100)}% Benar
                </span>
              </div>
            </div>

            {/* Step-by-Step Philosophy Note */}
            <div className="p-4 bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 rounded-2xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
              <p className="font-black flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Filosofi Belajar Bertahap (Small Steps)
              </p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                Siswa sengaja ditempatkan pada titik awal di mana materi dapat dikerjakan dengan lancar dan memperoleh nilai 100. Hal ini melatih kecepatan berhitung, membangun konsentrasi, serta menghilangkan lubang fondasi matematika sebelum melangkah ke level yang lebih tinggi.
              </p>
            </div>

            {/* Breakdown per Category */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Analisis Kategori Materi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(result.breakdown).map(([category, stats]: [string, { total: number; correct: number }]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={category} className="p-3 clay-card-sm rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">{stats.correct}/{stats.total}</span>
                        <div className="w-16 h-2.5 clay-inset rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500 shadow-xs' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action button */}
            <button
              id="start-learning-button"
              type="button"
              onClick={() => onComplete(result.assignedLevel)}
              className="w-full py-4 clay-btn text-white font-black rounded-2xl flex items-center justify-center gap-2 text-base transition-all cursor-pointer"
            >
              <span>Mulai Belajar di Level {result.assignedLevel}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen clay-bg-app text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Decorative ambient clay spheres */}
      <div className="clay-orb w-64 h-64 -top-20 -right-20 bg-indigo-300/30 dark:bg-indigo-900/10 pointer-events-none" />
      <div className="clay-orb w-60 h-60 bottom-10 -left-20 bg-amber-300/30 dark:bg-amber-900/10 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="clay-nav px-4 sm:px-8 flex items-center justify-between transition-colors duration-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl clay-btn flex items-center justify-center font-bold text-white shadow-xs">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">Pretest Diagnostik Level</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Siswa: {profile.name} • {profile.grade}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {onToggleTheme && (
            <button
              id="pretest-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl clay-btn-secondary text-xs font-bold transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 clay-btn-secondary font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Papan Coretan</span>
          </button>

          <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 clay-badge px-3 py-1 rounded-xl">
            {currentIndex + 1} / {PRETEST_QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* Main Question Card Container */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col items-center justify-center max-w-3xl mx-auto w-full z-10">
        {/* Welcome Notice Banner */}
        <div className="w-full mb-4 p-3.5 clay-card-sm rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl clay-btn text-white flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                Pretest Diagnostik Penempatan Level (Wajib)
              </p>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 font-medium">
                Selamat! Akun Anda telah disetujui Pak GuruAI. Kerjakan pretest ini untuk menentukan titik awal belajar yang paling tepat.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 clay-badge text-[10px] font-black text-indigo-700 dark:text-indigo-300 rounded-full shrink-0">
            Mandiri & Jujur
          </span>
        </div>

        <div className="w-full max-w-2xl clay-card rounded-[32px] flex flex-col overflow-hidden transition-colors duration-200">
          {/* Progress Bar inside Card Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 clay-badge text-indigo-700 dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                Indikator: Level {currentQ.levelId} ({KUMON_LEVELS[currentQ.levelId].category})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Pilihlah salah satu jawaban</span>
            </div>

            <div className="w-full clay-inset h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center py-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed mb-2">
                {currentQ.prompt}
              </h3>
              {currentQ.mathFormula ? (
                <div className="my-4 p-5 clay-inset rounded-[24px] overflow-x-auto overflow-y-visible flex items-center justify-center">
                  <KaTeXMath math={currentQ.mathFormula} block className="text-2xl sm:text-4xl text-slate-900 dark:text-white font-semibold" />
                </div>
              ) : currentQ.isLatex && currentQ.prompt.includes('\\') ? (
                <div className="my-3 p-4 clay-inset rounded-[24px] overflow-x-auto overflow-y-visible flex items-center justify-center">
                  <KaTeXMath math={currentQ.prompt} block className="text-xl sm:text-3xl text-slate-900 dark:text-white font-medium" />
                </div>
              ) : null}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === option;
                const isMathOption = option.includes('\\') || option.includes('^') || option.includes('/') || option.includes('=');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`p-4 rounded-2xl text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer min-h-[60px] ${
                      isSelected
                        ? 'clay-btn text-white'
                        : 'clay-btn-secondary text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-white text-indigo-700' : 'clay-inset text-slate-700 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base sm:text-lg overflow-x-auto py-1 font-bold">
                        {isMathOption ? (
                          <KaTeXMath math={option} />
                        ) : (
                          <span>{option}</span>
                        )}
                      </span>
                    </span>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Footer Navigation */}
          <div className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-850/60 border-t border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentIndex === 0 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' : 'clay-btn-secondary cursor-pointer'
              }`}
            >
              Sebelumnya
            </button>

            <button
              id="pretest-next-button"
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                selectedAnswers[currentQ.id]
                  ? 'clay-btn text-white'
                  : 'clay-btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              <span>{currentIndex === PRETEST_QUESTIONS.length - 1 ? 'Selesai & Lihat Hasil' : 'Selanjutnya'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Professional Status Footer */}
      <footer className="py-2.5 sm:h-11 clay-nav text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-center px-4 sm:px-8 justify-between text-[11px] font-bold tracking-wide transition-colors duration-200 gap-1 sm:gap-0 mt-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          <span className="uppercase text-indigo-600 dark:text-indigo-400 font-black">AlgoriMath • Sinkronisasi Database Aktif</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-bold">@copyright by. Pak GuruAi</span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-500 dark:text-slate-400 hidden md:inline font-bold">Pretest Diagnostik 18 Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-xs shadow-emerald-500/50"></div>
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-black">DIAGNOSTIK AKTIF</span>
        </div>
      </footer>

      {/* Scratchpad whiteboard popup */}
      <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
    </div>
  );
};
