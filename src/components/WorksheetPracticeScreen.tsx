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
  Moon,
  Maximize2,
  Minimize2,
  Focus,
  Eye,
  EyeOff,
  BookOpen,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KumonLevelId, Question, WorksheetSessionResult, BadgeDefinition, ReflectionFeeling, ReflectionJournalEntry } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';
import { generateWorksheetQuestions } from '../utils/mathGenerators';
import { KaTeXMath, MathText } from './KaTeXMath';
import { Scratchpad } from './Scratchpad';
import { VirtualMathPad } from './VirtualMathPad';
import { saveSessionResult, saveStoredReflectionJournal, getStoredProfile, AppTheme } from '../utils/storage';
import { KumonWorksheetPrintModal, WorksheetPrintMode } from './KumonWorksheetPrintModal';
import { BadgeUnlockModal } from './BadgeUnlockModal';

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
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const qList = generateWorksheetQuestions(levelId || '6A', worksheetNum || 1);
      return qList && qList.length > 0 ? qList : [];
    } catch (err) {
      console.error('Initial question generation error:', err);
      return [];
    }
  });
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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSolutionDuringPractice, setShowSolutionDuringPractice] = useState(false);
  const [expandedReviewQuestionId, setExpandedReviewQuestionId] = useState<string | null>(null);
  
  // Print & Download modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalMode, setPrintModalMode] = useState<WorksheetPrintMode>('full_solutions');

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState<WorksheetSessionResult | null>(null);
  const [unlockInfo, setUnlockInfo] = useState<{ isNewLevelUnlocked: boolean; unlockedLevelId?: KumonLevelId }>({
    isNewLevelUnlocked: false
  });
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<BadgeDefinition[]>([]);
  
  // Post-worksheet reflection state
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionFeeling, setReflectionFeeling] = useState<ReflectionFeeling>('pas_menyenangkan');
  const [isReflectionSaved, setIsReflectionSaved] = useState(false);
  const [reflectionSaveStatus, setReflectionSaveStatus] = useState<string | null>(null);

  const levelInfo = (levelId && KUMON_LEVELS[levelId]) ? KUMON_LEVELS[levelId] : KUMON_LEVELS['6A'];
  const standardTimeSec = (levelInfo?.standardTimeMinutes || 5) * 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync questions when levelId or worksheetNum changes
  useEffect(() => {
    try {
      const qList = generateWorksheetQuestions(levelId || '6A', worksheetNum || 1);
      if (qList && qList.length > 0) {
        setQuestions(qList);
      }
    } catch (err) {
      console.error('Error generating questions on level/worksheet change:', err);
    }
    setCurrentIndex(0);
    setInputVal('');
    setAnswersState({});
    setSecondsElapsed(0);
    setIsCompleted(false);
    setShowSolutionDuringPractice(false);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelId, worksheetNum]);

  const currentQ = questions[currentIndex] || questions[0];
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

    // Numerical loose matching
    const numUser = parseFloat(cleanUser.replace(',', '.'));
    const numCorrect = parseFloat(cleanCorrect.replace(',', '.'));
    if (!isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) < 0.0001) {
      isMatch = true;
    }

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: {
        userAnswer: userAns,
        isCorrect: isMatch,
        submitted: true
      }
    }));
  };

  const handleNextQuestion = () => {
    setShowSolutionDuringPractice(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputVal(answersState[questions[currentIndex + 1]?.id]?.userAnswer || '');
    } else {
      handleCompleteWorksheet();
    }
  };

  const handleCompleteWorksheet = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q) => {
      if (answersState[q.id]?.isCorrect) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const isMastered = score >= 90 && secondsElapsed <= standardTimeSec * 1.5;

    const answersList = questions.map((q) => ({
      questionId: q.id,
      userAnswer: answersState[q.id]?.userAnswer || '',
      isCorrect: answersState[q.id]?.isCorrect || false,
      correctAnswer: q.correctAnswer
    }));

    const result: WorksheetSessionResult = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      levelId,
      worksheetNum,
      timestamp: Date.now(),
      score,
      timeSpentSeconds: secondsElapsed,
      standardTimeSeconds: standardTimeSec,
      isMastered,
      totalQuestions: questions.length,
      correctCount,
      answers: answersList
    };

    const unlock = saveSessionResult(result);
    setFinalResult(result);
    setUnlockInfo(unlock);
    if (unlock.newlyUnlockedBadges && unlock.newlyUnlockedBadges.length > 0) {
      setNewlyUnlockedBadges(unlock.newlyUnlockedBadges);
    }
    setIsCompleted(true);

    if (score >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) {
      setReflectionSaveStatus('Tuliskan 1 kalimat hal yang kamu pahami hari ini.');
      return;
    }

    const profile = getStoredProfile();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const journalEntry: ReflectionJournalEntry = {
      id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentName: profile?.name || 'Siswa StepUp',
      studentUsername: profile?.username,
      timestamp: Date.now(),
      dateStr,
      levelId,
      worksheetNum,
      score: finalResult?.score || 100,
      timeSpentSeconds: finalResult?.timeSpentSeconds || secondsElapsed,
      reflectionText: reflectionText.trim(),
      feeling: reflectionFeeling
    };

    const res = saveStoredReflectionJournal(journalEntry);
    setIsReflectionSaved(true);
    setReflectionSaveStatus('Catatan refleksi berhasil disimpan ke database!');
    
    if (res.newlyUnlockedBadges && res.newlyUnlockedBadges.length > 0) {
      setNewlyUnlockedBadges((prev) => [...prev, ...(res.newlyUnlockedBadges || [])]);
    }
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 p-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Menyiapkan lembar kerja Level {levelId || '6A'} #{worksheetNum || 1}...</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const qList = generateWorksheetQuestions(levelId || '6A', worksheetNum || 1);
                setQuestions(qList);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Mulai Soal
            </button>
            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion summary screen with Comprehensive Solutions Review & Download
  if (isCompleted && finalResult) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans transition-colors duration-200 py-10">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Top banner */}
          <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-2xl">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Lembar Kerja Selesai!</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Level {levelId} • Lembar Kerja #{worksheetNum} • {levelInfo.name}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
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
            {unlockInfo.isNewLevelUnlocked && unlockInfo.unlockedLevelId && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  ★
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Selamat! Level Baru Terbuka!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Anda telah menguasai Level {levelId} dan membuka <strong>Level {unlockInfo.unlockedLevelId}</strong>.
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

            {/* POST-WORKSHEET REFLECTION JOURNAL CARD */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-indigo-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      Catatan Refleksi Belajar Hari Ini
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tuliskan hal yang baru dipahami untuk disimpan di database &amp; raih lencana refleksi.
                    </p>
                  </div>
                </div>

                {isReflectionSaved && (
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tersimpan
                  </span>
                )}
              </div>

              {/* Status Message */}
              {reflectionSaveStatus && (
                <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  isReflectionSaved 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{reflectionSaveStatus}</span>
                </div>
              )}

              {/* Feeling Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Bagaimana pemahamanmu di lembar kerja ini?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sangat_mudah', emoji: '⚡', label: 'Sangat Mudah' },
                    { id: 'pas_menyenangkan', emoji: '😊', label: 'Pas & Menyenangkan' },
                    { id: 'butuh_latihan_lagi', emoji: '🤔', label: 'Perlu Latihan' },
                    { id: 'cukup_sulit', emoji: '🔥', label: 'Menantang' },
                  ].map((f) => {
                    const isSelected = reflectionFeeling === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setReflectionFeeling(f.id as ReflectionFeeling)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                        }`}
                      >
                        <span>{f.emoji}</span>
                        <span className="text-[11px] truncate">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflection Text Input */}
              <div className="space-y-1">
                <textarea
                  rows={2}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Contoh: Saya sudah bisa menghitung perkalian bertingkat tanpa ragu dan lebih cepat..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Save Reflection Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  id="save-post-reflection-btn"
                  onClick={handleSaveReflection}
                  disabled={isReflectionSaved}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isReflectionSaved
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isReflectionSaved ? 'Refleksi Tersimpan ke Database' : 'Simpan Refleksi ke Database'}</span>
                </button>
              </div>
            </div>

            {/* DOWNLOAD OPTIONS & ACTION BUTTONS */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  Pilihan Unduh &amp; Cetak Lembar Ini
                </span>
                <span className="text-[10px] text-slate-400">Format A4 Bersih</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="download-with-explanation-btn"
                  onClick={() => {
                    setPrintModalMode('full_solutions');
                    setIsPrintModalOpen(true);
                  }}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>Unduh dengan Pembahasan Rinci</span>
                </button>

                <button
                  type="button"
                  id="download-questions-only-btn"
                  onClick={() => {
                    setPrintModalMode('questions_only');
                    setIsPrintModalOpen(true);
                  }}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Unduh Soal Latihan Saja</span>
                </button>
              </div>
            </div>

            {/* DETAILED SOLUTIONS & EXPLANATIONS REVIEW SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tinjau Pembahasan Semua Soal (1 – {questions.length})</span>
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Klik nomor soal untuk melihat detail
                </span>
              </div>

              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const state = answersState[q.id];
                  const isExpanded = expandedReviewQuestionId === q.id || (!expandedReviewQuestionId && idx === 0);

                  return (
                    <div 
                      key={q.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/40 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedReviewQuestionId(isExpanded ? null : q.id)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            state?.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                            {q.prompt}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            Kunci: {q.correctAnswer}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
                          {q.mathFormula && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                              <KaTeXMath math={q.mathFormula} block className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white" />
                            </div>
                          )}

                          {/* Step-by-Step Breakdown */}
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Langkah Penyelesaian Rinci:
                            </h5>
                            <div className="space-y-1">
                              {(q.stepByStepSolution || []).map((step, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-700 dark:text-slate-200 border-l-2 border-indigo-600"
                                >
                                  <MathText text={step} />
                                </div>
                              ))}
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="text-xs text-slate-600 dark:text-slate-300 p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                              <strong className="text-indigo-900 dark:text-indigo-200">Konsep:</strong> <MathText text={q.explanation} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Restart actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                id="finish-return-level-menu-btn"
                onClick={() => onFinish(finalResult, unlockInfo.isNewLevelUnlocked, unlockInfo.unlockedLevelId)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
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
                  setShowSolutionDuringPractice(false);
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

              <div className="text-center pt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                @copyright by. Pak GuruAi
              </div>
            </div>
          </div>
        </div>

        {/* Modal for PDF/HTML Print and Download */}
        {isPrintModalOpen && (
          <KumonWorksheetPrintModal
            initialLevelId={levelId}
            initialWorksheetNum={worksheetNum}
            initialMode={printModalMode}
            onClose={() => setIsPrintModalOpen(false)}
          />
        )}

        {/* Milestone Badge Unlock Celebratory Modal */}
        {newlyUnlockedBadges.length > 0 && (
          <BadgeUnlockModal
            unlockedBadges={newlyUnlockedBadges}
            onClose={() => setNewlyUnlockedBadges([])}
          />
        )}
      </div>
    );
  }

  // Toggle focus mode with keyboard shortcut 'f' or 'F' (when not typing in text input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'f' || e.key === 'F') && 
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        setIsFocusMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen ${isFocusMode ? 'bg-slate-900 dark:bg-slate-950' : 'bg-[#F1F5F9] dark:bg-slate-950'} text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300`}>
      {/* Header Bar */}
      <header className={`${isFocusMode ? 'h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6' : 'h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8'} flex items-center justify-between shadow-xs transition-all duration-300 z-10`}>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              id="practice-exit-btn"
              onClick={onExit}
              className={`px-3 py-1.5 ${isFocusMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'} text-xs font-bold rounded-lg transition-colors cursor-pointer`}
            >
              Keluar
            </button>
            
            <div className="flex flex-col">
              {!isFocusMode && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Set Latihan</span>
              )}
              <span className={`text-xs sm:text-sm font-bold ${isFocusMode ? 'text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>
                Level {levelId} • Lembar #{worksheetNum} {!isFocusMode && `(${levelInfo.name})`}
              </span>
            </div>
          </div>

          {!isFocusMode && (
            <>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

              <div className="hidden md:flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Status Akses</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">STEPUP-VERIFIED</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Print & Download Trigger */}
          <button
            id="practice-quick-print-btn"
            type="button"
            onClick={() => {
              setPrintModalMode('questions_only');
              setIsPrintModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
            title="Cetak atau Unduh Lembar Kerja Ini (PDF / Dokumen)"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Cetak/Unduh</span>
          </button>

          {/* Focus Mode Toggle Button */}
          <button
            id="focus-mode-toggle-btn"
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isFocusMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 shadow-amber-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
            title="Mode Fokus: Sembunyikan elemen pengganggu untuk konsentrasi penuh (Tekan 'F')"
          >
            <Focus className={`w-3.5 h-3.5 ${isFocusMode ? 'text-slate-950 animate-pulse' : 'text-indigo-500'}`} />
            <span className="hidden xs:inline">{isFocusMode ? 'Fokus Aktif' : 'Mode Fokus'}</span>
          </button>

          {/* Dark / Light Mode Toggle Button (Hidden in focus mode if user wants zen) */}
          {onToggleTheme && !isFocusMode && (
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

          {/* Timer Display */}
          <div className={`text-right ${isFocusMode ? 'px-2 py-1 bg-slate-900 rounded-lg border border-slate-800' : ''}`}>
            {!isFocusMode && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Waktu Berjalan</p>
            )}
            <p className={`font-mono font-bold ${isFocusMode ? 'text-xs sm:text-sm text-emerald-400 flex items-center gap-1' : 'text-base sm:text-lg text-slate-800 dark:text-slate-100'}`}>
              {isFocusMode && <Clock className="w-3 h-3 text-emerald-400" />}
              {formatTime(secondsElapsed)}
            </p>
          </div>

          {/* Scratchpad Button */}
          <button
            type="button"
            id="practice-scratchpad-btn"
            onClick={() => setIsScratchpadOpen(true)}
            className={`flex items-center gap-1 px-3 py-2 ${
              isFocusMode
                ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            } font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs`}
            title="Buka Papan Coretan / Scratchpad"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coretan</span>
          </button>
        </div>
      </header>

      {/* Main Worksheet Card */}
      <main className={`flex-1 p-3 sm:p-6 lg:p-8 flex items-center justify-center transition-all duration-300 ${isFocusMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
        <div className={`w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl ${isFocusMode ? 'shadow-2xl shadow-indigo-950/50 border-2 border-indigo-500/30 ring-4 ring-indigo-500/10' : 'shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800'} rounded-2xl flex flex-col overflow-hidden transition-all duration-200`}>
          {/* Focus Mode Zen Banner */}
          {isFocusMode && (
            <div className="bg-indigo-950/60 border-b border-indigo-800/40 px-5 py-2 flex items-center justify-between text-xs text-indigo-300">
              <div className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Fokus Aktif — Bebas Gangguan</span>
              </div>
              <span className="text-[11px] text-indigo-400/80 font-mono">
                Soal #{currentIndex + 1} / {questions.length}
              </span>
            </div>
          )}

          {/* Card Top Header */}
          <div className={`${isFocusMode ? 'bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5' : 'bg-slate-50 dark:bg-slate-800/80 p-5 sm:p-6'} border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all`}>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Lembar Kerja {levelId} - Soal #{currentIndex + 1}
              </h3>
              {!isFocusMode && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Kerjakan perhitungan matematika dengan cepat dan teliti.</p>
              )}
            </div>
            <span className="text-xs font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
              Soal {currentIndex + 1} dari {questions.length}
            </span>
          </div>

          {/* Card Body / Exercise Area */}
          <div className={`${isFocusMode ? 'p-5 sm:p-8 space-y-5' : 'p-6 sm:p-8 space-y-6'}`}>
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
              <h2 className={`font-medium text-slate-800 dark:text-slate-100 tracking-normal ${isFocusMode ? 'text-xl sm:text-2xl font-semibold' : 'text-lg sm:text-xl'}`}>
                {currentQ.prompt}
              </h2>

              {currentQ.mathFormula ? (
                <div className={`p-4 sm:p-6 ${isFocusMode ? 'bg-slate-50 dark:bg-slate-800/90 border-2 border-indigo-200/50 dark:border-indigo-900/50 shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 shadow-2xs'} rounded-2xl overflow-x-auto overflow-y-visible flex items-center justify-center max-w-xl mx-auto`}>
                  <KaTeXMath math={currentQ.mathFormula} block className={`${isFocusMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'} text-slate-900 dark:text-white font-semibold`} />
                </div>
              ) : currentQ.isLatex ? (
                <div className={`p-3 sm:p-5 ${isFocusMode ? 'bg-slate-50 dark:bg-slate-800/90 border-2 border-indigo-200/50 dark:border-indigo-900/50 shadow-md' : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 shadow-2xs'} rounded-2xl overflow-x-auto overflow-y-visible flex items-center justify-center max-w-xl mx-auto`}>
                  <KaTeXMath math={currentQ.prompt} block className={`${isFocusMode ? 'text-2xl sm:text-4xl' : 'text-2xl sm:text-3xl'} text-slate-900 dark:text-white font-medium`} />
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
              <div className={`p-4 rounded-xl border text-sm max-w-md mx-auto space-y-3 ${
                currentState.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-bold text-sm">
                  <div className="flex items-center gap-2">
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

                  <button
                    type="button"
                    onClick={() => setShowSolutionDuringPractice(!showSolutionDuringPractice)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{showSolutionDuringPractice ? 'Tutup Pembahasan' : 'Lihat Pembahasan Lengkap'}</span>
                  </button>
                </div>

                {!currentState.isCorrect && !showSolutionDuringPractice && (
                  <div className="text-xs">
                    Kunci Jawaban:{' '}
                    <strong className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                      {currentQ.correctAnswer}
                    </strong>
                  </div>
                )}

                {/* Expandable Step-by-Step Solution Breakdown during practice */}
                {showSolutionDuringPractice && (
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Langkah Pengerjaan Rinci:
                      </span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        Jawaban = {currentQ.correctAnswer}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {(currentQ.stepByStepSolution || []).map((step, sIdx) => (
                        <div key={sIdx} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-md border-l-2 border-indigo-500 text-[11px]">
                          <MathText text={step} />
                        </div>
                      ))}
                    </div>

                    {currentQ.explanation && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                        <strong>Penjelasan Konsep:</strong> <MathText text={currentQ.explanation} />
                      </div>
                    )}
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
                      setShowSolutionDuringPractice(false);
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

      {/* Professional Status Footer (Hidden in Focus Mode for Zero Distraction) */}
      {!isFocusMode && (
        <footer className="py-2 sm:h-10 bg-slate-800 dark:bg-slate-900 border-t dark:border-slate-800 text-white flex flex-col sm:flex-row items-center px-4 sm:px-8 justify-between text-[11px] font-medium tracking-wide transition-colors duration-200 gap-1 sm:gap-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
            <span className="uppercase">Level {levelId} • Target {levelInfo.standardTimeMinutes} Menit</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-amber-300 font-bold">@copyright by. Pak GuruAi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 uppercase tracking-wider text-[10px]">SISTEM AKTIF</span>
          </div>
        </footer>
      )}

      {/* Scratchpad Whiteboard */}
      <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />

      {/* Print & Download Modal */}
      {isPrintModalOpen && (
        <KumonWorksheetPrintModal
          initialLevelId={levelId}
          initialWorksheetNum={worksheetNum}
          initialMode={printModalMode}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
