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

    savePretestResult(pretestRes);
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
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-200">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in">
          {/* Header */}
          <div className="bg-slate-900 p-6 sm:p-8 text-white text-center border-b border-slate-800 relative">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-2xl">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Hasil Pretest Diagnostik Selesai!</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Level belajar mandiri matematika untuk <strong>{profile.name}</strong> telah ditentukan
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Score and Level Badge */}
            <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Rekomendasi Penempatan Level</span>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Level {result.assignedLevel}</span>
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">({assignedInfo.name})</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                  {assignedInfo.description}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-xs border border-indigo-100 dark:border-slate-700 min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Skor Pretest</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{result.score} / {result.total}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  {Math.round((result.score / result.total) * 100)}% Benar
                </span>
              </div>
            </div>

            {/* Step-by-Step Philosophy Note */}
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Filosofi Belajar Bertahap (Small Steps)
              </p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Siswa sengaja ditempatkan pada titik awal di mana materi dapat dikerjakan dengan lancar dan memperoleh nilai 100. Hal ini melatih kecepatan berhitung, membangun konsentrasi, serta menghilangkan lubang fondasi matematika sebelum melangkah ke level yang lebih tinggi.
              </p>
            </div>

            {/* Breakdown per Category */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Analisis Kategori Materi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(result.breakdown).map(([category, stats]: [string, { total: number; correct: number }]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={category} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{stats.correct}/{stats.total}</span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-400'}`}
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
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 text-base transition-all active:scale-[0.99] cursor-pointer"
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
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">Pretest Diagnostik Level</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Siswa: {profile.name} • {profile.grade}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {onToggleTheme && (
            <button
              id="pretest-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Papan Coretan</span>
          </button>

          <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
            {currentIndex + 1} / {PRETEST_QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* Main Question Card Container */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-200">
          {/* Progress Bar inside Card Header */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                Indikator: Level {currentQ.levelId} ({KUMON_LEVELS[currentQ.levelId].category})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Pilihlah salah satu jawaban</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center py-2">
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed mb-2">
                {currentQ.prompt}
              </h3>
              {currentQ.mathFormula ? (
                <div className="my-4 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl overflow-x-auto overflow-y-visible flex items-center justify-center">
                  <KaTeXMath math={currentQ.mathFormula} block className="text-2xl sm:text-3xl text-slate-900 dark:text-white" />
                </div>
              ) : currentQ.isLatex && currentQ.prompt.includes('\\') ? (
                <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl overflow-x-auto overflow-y-visible flex items-center justify-center">
                  <KaTeXMath math={currentQ.prompt} block className="text-xl sm:text-2xl text-slate-900 dark:text-white" />
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
                    className={`p-4 rounded-xl border text-left font-medium text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] min-h-[60px] ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-base sm:text-lg overflow-x-auto py-1">
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
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                currentIndex === 0 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
              }`}
            >
              Sebelumnya
            </button>

            <button
              id="pretest-next-button"
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswers[currentQ.id]}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedAnswers[currentQ.id]
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{currentIndex === PRETEST_QUESTIONS.length - 1 ? 'Selesai & Lihat Hasil' : 'Selanjutnya'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Professional Status Footer */}
      <footer className="py-2 sm:h-10 bg-slate-800 dark:bg-slate-900 border-t dark:border-slate-800 text-white flex flex-col sm:flex-row items-center px-4 sm:px-8 justify-between text-[11px] font-medium tracking-wide transition-colors duration-200 gap-1 sm:gap-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          <span className="uppercase text-indigo-200">Database: Sinkronisasi Database Aktif</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-amber-300 font-bold">@copyright by. Pak GuruAi</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-300 hidden md:inline">Pretest Diagnostik 18 Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 uppercase tracking-wider text-[10px]">DIAGNOSTIK AKTIF</span>
        </div>
      </footer>

      {/* Scratchpad whiteboard popup */}
      <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
    </div>
  );
};
