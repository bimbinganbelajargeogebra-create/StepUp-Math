import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Layers, 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { KumonLevelId, Question } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { generateWorksheetQuestions } from '../utils/mathGenerators';
import { verifyAdminPassword } from '../utils/storage';
import { KaTeXMath, MathText } from './KaTeXMath';
import { MathLogo } from './MathLogo';

interface KumonWorksheetPrintModalProps {
  initialLevelId?: KumonLevelId;
  initialWorksheetNum?: number;
  isAdmin?: boolean;
  onClose: () => void;
}

export const KumonWorksheetPrintModal: React.FC<KumonWorksheetPrintModalProps> = ({
  initialLevelId = 'E',
  initialWorksheetNum = 1,
  isAdmin = false,
  onClose
}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(isAdmin);
  const [adminPassInput, setAdminPassInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [selectedLevel, setSelectedLevel] = useState<KumonLevelId | 'ALL'>(initialLevelId);
  const [selectedWorksheet, setSelectedWorksheet] = useState<number | 'ALL'>(initialWorksheetNum);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(adminPassInput)) {
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Password admin salah. Fitur cetak PDF hanya dapat diakses oleh Admin.');
    }
  };

  // Determine list of levels to render
  const levelsToRender: KumonLevelId[] = useMemo(() => {
    if (selectedLevel === 'ALL') {
      return KUMON_LEVEL_ORDER;
    }
    return [selectedLevel];
  }, [selectedLevel]);

  // Determine list of worksheets to render per level
  const worksheetsToRender: number[] = useMemo(() => {
    if (selectedWorksheet === 'ALL') {
      return Array.from({ length: 10 }, (_, i) => i + 1);
    }
    return [selectedWorksheet];
  }, [selectedWorksheet]);

  // Pre-generate worksheets data
  const sheetList = useMemo(() => {
    const list: { levelId: KumonLevelId; worksheetNum: number; questions: Question[] }[] = [];
    levelsToRender.forEach((lvl) => {
      worksheetsToRender.forEach((wsNum) => {
        const questions = generateWorksheetQuestions(lvl, wsNum);
        list.push({
          levelId: lvl,
          worksheetNum: wsNum,
          questions
        });
      });
    });
    return list;
  }, [levelsToRender, worksheetsToRender]);

  const handlePrint = () => {
    window.print();
  };

  // If not yet authorized as admin, show the Admin Gate
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
          <div className="bg-slate-900 p-6 text-white text-center relative border-b border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 text-amber-300 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black">Akses Khusus Admin</h3>
            <p className="text-xs text-slate-400 mt-1">
              Pencetakan lembar kerja fisik PDF dibatasi khusus untuk Admin / Guru.
            </p>
          </div>

          <form onSubmit={handleVerifyPassword} className="p-6 space-y-4">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Password Master Admin
              </label>
              <input
                type="password"
                required
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                placeholder="Masukkan password admin (bajuri39)..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                Buka Generator Cetak
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-xs overflow-hidden">
      {/* Top Admin Control Bar (Hidden during Print) */}
      <header className="print:hidden bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-300 shadow-md shadow-indigo-600/30 font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
                Cetak Lembar Kerja Siswa (PDF Generator)
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Akses Master Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Format lembar kerja mandiri bertahap • Soal #1 Contoh &amp; Penyelesaian Bertingkat
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            title="Buka dialog cetak browser (Simpan sebagai PDF)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Filter and Configuration Sub-Bar (Hidden during Print) */}
      <div className="print:hidden bg-slate-800/90 border-b border-slate-700 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Level selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Pilih Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">★ Semua 18 Level (6A – M)</option>
              {KUMON_LEVEL_ORDER.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl} - {KUMON_LEVELS[lvl].name}
                </option>
              ))}
            </select>
          </div>

          {/* Worksheet selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Lembar Kerja:</span>
            <select
              value={selectedWorksheet}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedWorksheet(v === 'ALL' ? 'ALL' : Number(v));
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Lembar (1 – 10)</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Lembar {n} (Soal 1–10)
                </option>
              ))}
            </select>
          </div>

          {/* Answer Key Toggle */}
          <button
            type="button"
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
              showAnswerKey
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {showAnswerKey ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showAnswerKey ? 'Kunci Jawaban Aktif' : 'Lembar Kosong Siswa'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Total: <strong className="text-white font-mono">{sheetList.length} lembar kerja</strong></span>
          <span className="hidden sm:inline">• Format Standar A4 Portrait (Rapi & Bersih)</span>
        </div>
      </div>

      {/* Main Printable Sheets Container */}
      <div className="flex-1 overflow-y-auto bg-slate-900/60 p-4 sm:p-8 print:p-0 print:m-0 print:bg-white print:overflow-visible flex flex-col items-center">
        {sheetList.map((sheet, sIdx) => {
          const lvlInfo = KUMON_LEVELS[sheet.levelId];
          const exampleQ = sheet.questions[0];
          const practiceQuestions = sheet.questions.slice(1);

          return (
            <div
              key={`${sheet.levelId}-${sheet.worksheetNum}`}
              className="kumon-print-sheet bg-white text-slate-950 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 shadow-2xl rounded-xl sm:rounded-2xl my-4 print:my-0 print:p-0 print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 border border-slate-300 print:border-none relative flex flex-col justify-between"
              style={{
                pageBreakAfter: sIdx < sheetList.length - 1 ? 'always' : 'auto',
                breakAfter: sIdx < sheetList.length - 1 ? 'page' : 'auto'
              }}
            >
              <div>
                {/* 1. Kumon Header Standard */}
                <div className="border-b-2 border-black pb-2.5 mb-3 flex flex-wrap items-start justify-between gap-4">
                  {/* Left branding and Level identity */}
                  <div>
                    <div className="flex items-center gap-2">
                      <MathLogo size="sm" variant="monochrome" />
                      <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase">
                        StepUp Math • Sistem Pembelajaran Mandiri
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-black font-serif tracking-tight">
                        MATEMATIKA MANDIRI
                      </span>
                      <span className="px-2.5 py-0.5 bg-black text-white font-black rounded-xs text-sm tracking-wider">
                        LEVEL {sheet.levelId}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {lvlInfo.name} &bull; <span className="italic font-medium text-slate-700">{lvlInfo.targetSkill}</span>
                    </p>
                  </div>

                  {/* Right: Student Information & Time Tracking Table */}
                  <div className="border-2 border-black text-xs font-medium rounded-xs overflow-hidden w-full sm:w-auto">
                    <div className="grid grid-cols-2 border-b border-black bg-slate-100 font-bold">
                      <div className="px-3 py-1 border-r border-black text-center">
                        Lembar: <span className="text-sm font-black text-black">{sheet.levelId} #{sheet.worksheetNum}</span>
                      </div>
                      <div className="px-3 py-1 text-center">
                        SCT: <span className="font-black text-black">{lvlInfo.standardTimeMinutes} mnt</span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1.5 bg-white text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-800 font-bold">Nama:</span>
                        <span className="border-b border-black w-36 inline-block"></span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-800 font-bold">Tanggal:</span>
                        <span className="border-b border-black w-36 inline-block"></span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-800 font-bold">Waktu:</span>
                        <span className="font-mono text-black font-semibold">[ &nbsp; &nbsp; : &nbsp; &nbsp; ] s/d [ &nbsp; &nbsp; : &nbsp; &nbsp; ]</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-300">
                        <span className="font-black text-black">Nilai: [ &nbsp; &nbsp; / 100 ]</span>
                        <span className="text-slate-700 font-bold">Koreksi: [ &nbsp; &nbsp; ]</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Soal Nomor 1: CONTOH SOAL DAN PENYELESAIAN BERTINGKAT */}
                {exampleQ && (
                  <div className="mb-3.5 border-2 border-black rounded-xs bg-slate-50/90 p-3 print:bg-slate-50">
                    <div className="flex items-center justify-between border-b border-black pb-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-black text-white text-[11px] font-black tracking-wider uppercase rounded-xs">
                          CONTOH SOAL (1)
                        </span>
                        <span className="text-xs font-black text-black">
                          Pahami Langkah &amp; Pola Penyelesaian Bertingkat:
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 italic">
                        Model Latihan Bertahap (Small Steps)
                      </span>
                    </div>

                    {/* Example Question Prompt & Math Display */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 border border-slate-400 rounded-xs mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-black mb-1">
                          {exampleQ.prompt}
                        </p>
                        {exampleQ.mathFormula && (
                          <div className="text-base sm:text-lg font-bold text-black my-1">
                            <KaTeXMath math={exampleQ.mathFormula} block={false} />
                          </div>
                        )}
                        {exampleQ.visualItems && (
                          <div className="flex flex-wrap gap-1.5 my-1.5">
                            {Array.from({ length: exampleQ.visualItems.count }).map((_, vi) => (
                              <span key={vi} className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                                {vi + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-3 py-1.5 bg-slate-100 border border-slate-400 rounded-xs text-right shrink-0">
                        <span className="text-[9px] uppercase font-bold text-slate-700 block">Kunci Jawaban</span>
                        <span className="text-sm sm:text-base font-black text-black font-mono">
                          {exampleQ.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Hierarchical Solution (Penyelesaian Bertingkat) */}
                    <div className="bg-white border border-slate-400 rounded-xs p-2.5 space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Langkah Penyelesaian Bertingkat:
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-black">
                        {(exampleQ.stepByStepSolution || []).map((step, sidx) => (
                          <div
                            key={sidx}
                            className="p-2 bg-slate-50 border-l-3 border-black rounded-r-xs font-medium text-[11px] flex items-start gap-1.5"
                          >
                            <span className="font-black text-black shrink-0">{sidx + 1}.</span>
                            <span className="leading-snug">
                              <MathText text={step} />
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 italic font-medium">
                          Petunjuk: Selesaikan soal-soal latihan berikutnya dengan alur hitung serupa.
                        </span>
                        <div className="px-2.5 py-0.5 bg-black text-white font-black rounded-xs text-[11px]">
                          Hasil Akhir = {exampleQ.correctAnswer}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Soal Latihan Mandiri No. 2 s/d No. 10 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between border-b border-black pb-1 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      Soal Latihan Mandiri (Kerjakan Cepat &amp; Tepat)
                    </span>
                    <span className="text-[10px] text-slate-700 font-bold">
                      Gunakan ruang hitung bertingkat di bawah setiap nomor
                    </span>
                  </div>

                  {/* 2-Column Grid of Practice Questions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    {practiceQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="border-2 border-black rounded-xs p-3 bg-white relative flex flex-col justify-between min-h-[105px] shadow-2xs"
                      >
                        {/* Question Number & Math Formula */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[11px] flex items-center justify-center shrink-0">
                              {q.questionNumber}
                            </span>
                            <span className="text-xs font-bold text-black flex-1 leading-snug">
                              {q.prompt}
                            </span>
                          </div>

                          {/* Math Formula or Equation with crisp typography */}
                          {q.mathFormula && (
                            <div className="my-2 text-center font-black text-black text-base sm:text-lg py-1">
                              <KaTeXMath math={q.mathFormula} block={false} />
                            </div>
                          )}

                          {q.visualItems && (
                            <div className="flex flex-wrap gap-1.5 my-1.5 justify-center">
                              {Array.from({ length: q.visualItems.count }).map((_, vi) => (
                                <span key={vi} className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold">
                                  {vi + 1}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Clean Ruang Hitung / Blank Working Space Guideline & Answer Box */}
                        <div className="mt-2 pt-2 border-t border-dotted border-slate-400 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 font-mono tracking-widest select-none">
                            ............................
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-black">Jawab =</span>
                            <div className="min-w-[80px] h-6 border-2 border-black bg-slate-50 flex items-center justify-center px-2 text-xs font-mono font-black text-black">
                              {showAnswerKey ? q.correctAnswer : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Footer standard */}
              <div className="mt-4 pt-2 border-t-2 border-black flex items-center justify-between text-[10px] text-slate-700 font-bold">
                <div>
                  StepUp Math • Lembar Kerja Mandiri Level {sheet.levelId} (Lembar {sheet.worksheetNum} / 10)
                </div>
                <div>
                  Target Standar Waktu: {lvlInfo.standardTimeMinutes} Menit &bull; 100% Benar
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
