import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  PenTool, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  Flame,
  Check,
  X,
  Sun,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KumonLevelId, Question, WorksheetSessionResult } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';
import { generateWorksheetQuestions } from '../utils/mathGenerators';
import { KaTeXMath, MathText } from './KaTeXMath';
import { Scratchpad } from './Scratchpad';
import { VirtualMathPad } from './VirtualMathPad';
import { saveSessionResult, AppTheme } from '../utils/storage';

interface WorksheetPracticeScreenProps {
  levelId: KumonLevelId;
  worksheetNum: number;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onFinish: (result: WorksheetSessionResult, isNewLevelUnlocked: boolean, unlockedLevelId?: KumonLevelId) => void;
  onExit: () => void;
}

export const WorksheetPracticeScreen: React.FC<WorksheetPracticeScreenProps> = ({
  levelId,
  worksheetNum,
  theme = 'light',
  onToggleTheme,
  onFinish,
  onExit
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [answersState, setAnswersState] = useState<{
    [qId: string]: {
      userAnswer: string;
      isCorrect: boolean;
      submitted: boolean;
    };
  }>({});

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState<WorksheetSessionResult | null>(null);
  const [unlockInfo, setUnlockInfo] = useState<{ isUnlocked: boolean; nextLevel?: KumonLevelId }>({
    isUnlocked: false
  });

  const levelInfo = KUMON_LEVELS[levelId];
  const standardTimeSec = levelInfo.standardTimeMinutes * 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize questions
  useEffect(() => {
    const qList = generateWorksheetQuestions(levelId, worksheetNum);
    setQuestions(qList);
    setCurrentIndex(0);
    setInputVal('');
    setAnswersState({});
    setSecondsElapsed(0);
    setIsCompleted(false);

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelId, worksheetNum]);

  const currentQ = questions[currentIndex];
  const currentState = currentQ ? answersState[currentQ.id] : null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const normalizeAnswer = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
      .replace(/\s*,\s*/g, ', ')
      .replace(/^x\s*=\s*/, '')
      .replace(/^\(/, '')
      .replace(/\)$/, '');
  };

  const checkAnswer = (userAns: string) => {
    if (!currentQ) return;
    const cleanUser = normalizeAnswer(userAns);
    const cleanCorrect = normalizeAnswer(currentQ.correctAnswer);

    let isMatch = cleanUser === cleanCorrect;
    if (!isMatch && currentQ.acceptableAnswers) {
      isMatch = currentQ.acceptableAnswers.some((ans) => normalizeAnswer(ans) === cleanUser);
    }

    const updated = {
      ...answersState,
      [currentQ.id]: {
        userAnswer: userAns,
        isCorrect: isMatch,
        submitted: true
      }
    };
    setAnswersState(updated);

    // Audio cue or small haptic effect can be handled visually
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextQ = questions[currentIndex + 1];
      setInputVal(answersState[nextQ.id]?.userAnswer || '');
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const recordedAnswers = questions.map((q) => {
      const state = answersState[q.id];
      const isCor = !!state?.isCorrect;
      if (isCor) correctCount++;
      return {
        questionId: q.id,
        userAnswer: state?.userAnswer || '',
        isCorrect: isCor,
        correctAnswer: q.correctAnswer
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const isMastered = score >= 90 && secondsElapsed <= standardTimeSec * 1.5;

    const result: WorksheetSessionResult = {
      id: `${levelId}-w${worksheetNum}-${Date.now()}`,
      levelId,
      worksheetNum,
      timestamp: Date.now(),
      totalQuestions: questions.length,
      correctCount,
      score,
      timeSpentSeconds: secondsElapsed,
      standardTimeSeconds: standardTimeSec,
      isMastered,
      answers: recordedAnswers
    };

    const res = saveSessionResult(result);
    setFinalResult(result);
    setUnlockInfo({
      isUnlocked: res.isNewLevelUnlocked,
      nextLevel: res.unlockedLevelId
    });
    setIsCompleted(true);

    if (score >= 80) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-950">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat lembar kerja...</span>
        </div>
      </div>
    );
  }

  // Completion summary screen
  if (isCompleted && finalResult) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans transition-colors duration-200">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Top banner */}
          <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-2xl">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Lembar Kerja Selesai!</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Level {levelId} • Lembar Kerja #{worksheetNum}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Score & Time cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Skor Akurasi</span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-indigo-700 dark:text-indigo-400 my-1">
                  {finalResult.score}
                </div>
                <span className={`text-xs font-bold ${finalResult.score === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {finalResult.correctCount} dari {finalResult.totalQuestions} Benar
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Waktu Pengerjaan</span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 my-1">
                  {formatTime(finalResult.timeSpentSeconds)}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Target Standar: {formatTime(finalResult.standardTimeSeconds)}
                </span>
              </div>
            </div>

            {/* Unlock Notification if new level unlocked */}
            {unlockInfo.isUnlocked && unlockInfo.nextLevel && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  ★
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Selamat! Level Baru Terbuka!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Anda telah menguasai Level {levelId} dan membuka <strong>Level {unlockInfo.nextLevel}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Mastery evaluation notice */}
            <div className={`p-4 rounded-xl text-xs sm:text-sm ${
              finalResult.isMastered
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {finalResult.isMastered ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                {finalResult.isMastered ? 'Lulus Standar Ketuntasan (SCT)!' : 'Pengulangan Latihan Disarankan'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {finalResult.isMastered
                  ? 'Kecepatan dan akurasi Anda memenuhi standar target. Anda siap melanjutkan lembar kerja berikutnya!'
                  : 'Dalam sistem belajar mandiri bertahap, pengulangan lembar kerja bertujuan meraih nilai 100 dengan waktu pengerjaan optimal.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onFinish(finalResult, unlockInfo.isUnlocked, unlockInfo.nextLevel)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Kembali ke Menu Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  // Restart worksheet
                  const qList = generateWorksheetQuestions(levelId, worksheetNum);
                  setQuestions(qList);
                  setCurrentIndex(0);
                  setInputVal('');
                  setAnswersState({});
                  setSecondsElapsed(0);
                  setIsCompleted(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                  timerRef.current = setInterval(() => {
                    setSecondsElapsed((prev) => prev + 1);
                  }, 1000);
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Lembar Kerja Ini (Latihan Kecepatan)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Header Bar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Keluar
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Set Latihan</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                Level {levelId} • Lembar #{worksheetNum} ({levelInfo.name})
              </span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Status Akses</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">STEPUP-VERIFIED</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          {onToggleTheme && (
            <button
              id="practice-theme-toggle"
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

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Waktu Berjalan</p>
            <p className="text-base sm:text-lg font-mono font-bold text-slate-800 dark:text-slate-100">{formatTime(secondsElapsed)}</p>
          </div>

          {/* Scratchpad Button */}
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs transition-colors cursor-pointer shadow-xs"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coretan</span>
          </button>
        </div>
      </header>

      {/* Main Worksheet Card */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors duration-200">
          {/* Card Top Header */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Lembar Kerja {levelId} - Soal #{currentIndex + 1}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kerjakan perhitungan matematika dengan cepat dan teliti.</p>
            </div>
            <span className="text-xs font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
              Soal {currentIndex + 1} dari {questions.length}
            </span>
          </div>

          {/* Card Body / Exercise Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Visual Dots if applicable */}
            {currentQ.visualItems?.type === 'dots' && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mx-auto p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                {Array.from({ length: currentQ.visualItems.count }).map((_, dIdx) => (
                  <span
                    key={dIdx}
                    className="w-8 h-8 rounded-full bg-rose-500 shadow-xs flex items-center justify-center font-bold text-white text-xs"
                  >
                    ●
                  </span>
                ))}
              </div>
            )}

            {/* Prompt & Math Formula Rendering */}
            <div className="text-center py-2 space-y-3">
              <h2 className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 tracking-normal">
                {currentQ.prompt}
              </h2>

              {currentQ.mathFormula ? (
                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl overflow-x-auto overflow-y-visible flex items-center justify-center max-w-xl mx-auto shadow-2xs">
                  <KaTeXMath math={currentQ.mathFormula} block className="text-2xl sm:text-4xl text-slate-900 dark:text-white font-semibold" />
                </div>
              ) : currentQ.isLatex ? (
                <div className="p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl overflow-x-auto overflow-y-visible flex items-center justify-center max-w-xl mx-auto shadow-2xs">
                  <KaTeXMath math={currentQ.prompt} block className="text-2xl sm:text-3xl text-slate-900 dark:text-white font-medium" />
                </div>
              ) : null}
            </div>

            {/* Multiple Choice Options or Input Keypad */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto my-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = inputVal === opt;
                  const isMathOpt = opt.includes('\\') || opt.includes('^') || opt.includes('/') || opt.includes('=');
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        setInputVal(opt);
                        if (!currentState?.submitted) {
                          checkAnswer(opt);
                        }
                      }}
                      className={`p-3.5 sm:p-4 rounded-xl font-bold text-base border transition-all cursor-pointer min-h-[56px] flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isMathOpt ? <KaTeXMath math={opt} /> : <span>{opt}</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputVal.trim() && !currentState?.submitted) {
                      checkAnswer(inputVal);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      id="worksheet-math-input"
                      type="text"
                      autoFocus
                      disabled={currentState?.submitted}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Masukkan jawaban..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-xl sm:text-2xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all"
                    />
                  </div>

                  {!currentState?.submitted && (
                    <button
                      id="worksheet-check-button"
                      type="submit"
                      disabled={!inputVal.trim()}
                      className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-1.5 transition-all cursor-pointer ${
                        inputVal.trim()
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none active:scale-95'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>Cek</span>
                    </button>
                  )}
                </form>

                {/* Virtual Math Keypad */}
                <VirtualMathPad
                  levelId={levelId}
                  onInsert={(txt) => setInputVal((prev) => prev + txt)}
                  onBackspace={() => setInputVal((prev) => prev.slice(0, -1))}
                  onClear={() => setInputVal('')}
                  onSubmit={() => {
                    if (inputVal.trim() && !currentState?.submitted) {
                      checkAnswer(inputVal);
                    }
                  }}
                />
              </div>
            )}

            {/* Answer feedback and explanation */}
            {currentState?.submitted && (
              <div className={`p-4 rounded-xl border text-sm max-w-md mx-auto ${
                currentState.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {currentState.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Jawaban Benar! (100)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Jawaban Belum Tepat</span>
                    </>
                  )}
                </div>

                {!currentState.isCorrect && (
                  <div className="mt-2 space-y-1.5 text-xs">
                    <p>
                      Kunci Jawaban:{' '}
                      <strong className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                        {currentQ.correctAnswer}
                      </strong>
                    </p>
                    <div className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed">
                      💡 <strong className="text-slate-800 dark:text-slate-100">Pembahasan:</strong>{' '}
                      <MathText text={currentQ.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Footer Toolbar */}
          <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {questions.map((q, idx) => {
                const st = answersState[q.id];
                const isCurrent = idx === currentIndex;
                let dotClass = 'bg-slate-200 dark:bg-slate-700';

                if (st?.submitted) {
                  dotClass = st.isCorrect ? 'bg-emerald-500' : 'bg-rose-500';
                } else if (isCurrent) {
                  dotClass = 'bg-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setInputVal(answersState[q.id]?.userAnswer || '');
                    }}
                    title={`Soal ${idx + 1}`}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${dotClass}`}
                  />
                );
              })}
            </div>

            {/* Next Button */}
            {currentState?.submitted ? (
              <button
                id="worksheet-next-question-button"
                type="button"
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all cursor-pointer active:scale-95 text-xs sm:text-sm"
              >
                <span>{currentIndex === questions.length - 1 ? 'Selesai Lembar' : 'Soal Berikutnya'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                Isi jawaban lalu klik Cek
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Professional Status Footer */}
      <footer className="h-10 bg-slate-800 dark:bg-slate-900 border-t dark:border-slate-800 text-white flex items-center px-4 sm:px-8 justify-between text-[11px] font-medium tracking-wide transition-colors duration-200">
        <div className="flex items-center gap-4 uppercase">
          <span>Penyimpanan Lokal: Aktif</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Level {levelId} • Target {levelInfo.standardTimeMinutes} Menit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300 uppercase tracking-wider text-[10px]">SISTEM AKTIF</span>
        </div>
      </footer>

      {/* Scratchpad Whiteboard */}
      <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
    </div>
  );
};
