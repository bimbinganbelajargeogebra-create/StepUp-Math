import React, { useRef } from 'react';
import { 
  Printer, 
  Download,
  X, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  User, 
  ShieldCheck,
  Zap,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { KumonLevelId, StudentProfile, WorksheetSessionResult, PretestResult, LevelProgress } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { getStoredLevelProgress } from '../utils/storage';
import { MathLogo } from './MathLogo';

interface StudentProgressReportModalProps {
  profile: StudentProfile;
  sessions: WorksheetSessionResult[];
  pretestResult: PretestResult | null;
  onClose: () => void;
}

export const StudentProgressReportModal: React.FC<StudentProgressReportModalProps> = ({
  profile,
  sessions,
  pretestResult,
  onClose
}) => {
  const levelProgress = getStoredLevelProgress();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!printRef.current) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapor Progres Belajar - ${profile.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .student-report-print-sheet { background: #ffffff; width: 100%; max-width: 210mm; margin: 0 auto; padding: 32px; border: 1px solid #cbd5e1; border-radius: 16px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 8mm; }
      body { background: #ffffff; padding: 0; }
      .student-report-print-sheet { border: none; margin: 0 auto; padding: 0; border-radius: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; gap: 12px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
      🖨️ Cetak / Simpan sebagai PDF (A4)
    </button>
  </div>
  <div class="student-report-print-sheet">
    ${printRef.current.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapor-Progres-Matematika-${profile.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const joinedDateStr = profile.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Agustus 2026';

  // Metrics calculations
  const totalMastered = Object.values(levelProgress).filter((p: LevelProgress) => p?.mastered).length;
  const totalUnlocked = Object.values(levelProgress).filter((p: LevelProgress) => p?.unlocked).length;

  const validScores = sessions.filter(s => s.score !== undefined);
  const averageScore = validScores.length > 0 
    ? Math.round(validScores.reduce((acc, s) => acc + s.score, 0) / validScores.length)
    : 0;

  const masteredSessionsCount = sessions.filter(s => s.isMastered).length;
  const masteryPercentage = sessions.length > 0 
    ? Math.round((masteredSessionsCount / sessions.length) * 100) 
    : 0;

  const startingInfo = profile.startingLevel ? KUMON_LEVELS[profile.startingLevel] : null;
  const currentInfo = KUMON_LEVELS[profile.currentLevel || profile.startingLevel || '6A'];

  // 6 Most recent sessions for the report chart
  const recentSessions = sessions.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="flex flex-col w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh]">
        {/* Top Floating Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">Laporan Perkembangan Belajar Siswa</h3>
              <p className="text-[11px] text-slate-400">Pratinjau Dokumen Rapor & Ekspor PDF Resmi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="download-report-html-button"
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Unduh file dokumen HTML resmi laporan belajar"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh Dokumen (.html)</span>
            </button>

            <button
              id="print-report-pdf-button"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/60 print:bg-white print:p-0">
          <div
            ref={printRef}
            className="student-report-print-sheet max-w-3xl mx-auto bg-white p-6 sm:p-8 border border-slate-200 rounded-2xl shadow-sm text-slate-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* 1. Official Header & Logo */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MathLogo size="sm" variant="monochrome" />
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    ALGORIMATH INDONESIA
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                  Laporan Evaluasi &amp; Progres Belajar Mandiri Siswa
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Kurikulum Matematika Mandiri Berjenjang (Level 6A s.d. Level M)
                </p>
              </div>

              <div className="text-right text-[11px] text-slate-600 shrink-0">
                <span className="font-bold text-slate-900 block">Tanggal Cetak:</span>
                <span>{currentDateStr}</span>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-800">
                  {profile.isAdmin ? 'Akses Admin Guru' : profile.isTrial ? 'Akun Uji Coba (Trial)' : 'Siswa Reguler Terdaftar'}
                </span>
              </div>
            </div>

            {/* 2. Student Identity Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Nama Siswa</span>
                  <strong className="text-slate-900 text-sm">{profile.name}</strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Jenjang / Kelas</span>
                  <span className="font-semibold text-slate-800">{profile.grade}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Level Penempatan (Awal)</span>
                  <span className="font-bold text-indigo-700">
                    {profile.startingLevel ? `Level ${profile.startingLevel}` : 'Belum Pretest'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Level Aktif Saat Ini</span>
                  <span className="font-bold text-emerald-700">
                    Level {profile.currentLevel || profile.startingLevel || '6A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Summary Performance Metrics KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
              <div className="p-3 bg-white border border-slate-300 rounded-xl">
                <BookOpen className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  {profile.totalWorksheetsCompleted}
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Lembar Selesai</span>
              </div>

              <div className="p-3 bg-white border border-slate-300 rounded-xl">
                <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  {profile.totalPoints}
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Total Poin Skor</span>
              </div>

              <div className="p-3 bg-white border border-slate-300 rounded-xl">
                <Target className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  {averageScore} / 100
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Rata-Rata Nilai</span>
              </div>

              <div className="p-3 bg-white border border-slate-300 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  {totalMastered} / 18
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Level Lulus Master</span>
              </div>
            </div>

            {/* 4. Diagnostic Pretest Placement Breakdown */}
            {pretestResult && (
              <div className="mb-5 p-4 border border-indigo-200 bg-indigo-50/40 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      Hasil Tes Diagnostik Penempatan (Placement Pretest)
                    </h3>
                  </div>
                  <span className="text-xs font-black text-indigo-900">
                    Skor: {pretestResult.score} / {pretestResult.total} (Penempatan: Level {pretestResult.assignedLevel})
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Siswa telah melalui evaluasi diagnostik berjenjang untuk mendeteksi batas ketelitian dan kecepatan berhitung. Penugasan awal ditetapkan pada <strong>Level {pretestResult.assignedLevel}: {KUMON_LEVELS[pretestResult.assignedLevel]?.name}</strong> agar fondasi matematika terbentuk dengan kokoh tanpa beban rasa cemas.
                </p>
              </div>
            )}

            {/* 5. Performance Trend Bar Chart (Crisp HTML / SVG Visualizer for PDF) */}
            <div className="mb-5 border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Grafik Performa & Kecepatan Latihan Terkini
                </h3>
                <span className="text-[10px] text-slate-500">Skor & Waktu terhadap Target Standar (SCT)</span>
              </div>

              {recentSessions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  Belum ada catatan sesi latihan terbaru.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map((sess, idx) => {
                    const pct = Math.min(100, Math.max(10, sess.score));
                    const isWithinTime = sess.timeSpentSeconds <= sess.standardTimeSeconds;
                    const mins = Math.floor(sess.timeSpentSeconds / 60);
                    const secs = sess.timeSpentSeconds % 60;
                    const sctMins = Math.floor(sess.standardTimeSeconds / 60);

                    return (
                      <div key={sess.id || idx} className="text-xs border-b border-slate-100 pb-1.5 last:border-b-0">
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold px-1.5 py-0.2 bg-slate-800 text-white rounded text-[10px]">
                              Level {sess.levelId}
                            </span>
                            <span className="font-semibold text-slate-800">Lembar #{sess.worksheetNum}</span>
                            {sess.isMastered && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1 py-0.2 rounded border border-amber-300">
                                ★ MASTER
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{sess.score}/100</span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {mins}m {secs}s (Target: {sctMins}m)
                            </span>
                          </div>
                        </div>

                        {/* Visual score bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              sess.score >= 90 ? 'bg-emerald-600' : sess.score >= 70 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Comprehensive 18-Level Kumon Mastery Matrix Table */}
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matriks Penguasaan Kurikulum 18 Level (6A – M)
              </h3>

              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      <th className="p-2 border-r border-slate-200">Level</th>
                      <th className="p-2 border-r border-slate-200">Topik Pembelajaran</th>
                      <th className="p-2 border-r border-slate-200">Kategori</th>
                      <th className="p-2 border-r border-slate-200 text-center">Lembar Selesai</th>
                      <th className="p-2 border-r border-slate-200 text-center">Nilai Tertinggi</th>
                      <th className="p-2 text-center">Status Penguasaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {KUMON_LEVEL_ORDER.map((lvlId) => {
                      const info = KUMON_LEVELS[lvlId];
                      const prog = levelProgress[lvlId];
                      const completedCount = prog?.completedWorksheets?.length || 0;
                      const isMastered = prog?.mastered;
                      const isUnlocked = prog?.unlocked;

                      const topScores = prog?.highestScores ? Object.values(prog.highestScores) : [];
                      const maxScore = topScores.length > 0 ? Math.max(...topScores) : '-';

                      return (
                        <tr
                          key={lvlId}
                          className={
                            isMastered
                              ? 'bg-emerald-50/40'
                              : isUnlocked
                              ? 'bg-white'
                              : 'bg-slate-50/60 text-slate-400'
                          }
                        >
                          <td className="p-2 font-black border-r border-slate-200 text-slate-900">
                            Level {lvlId}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-medium text-slate-800">
                            {info.name}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-600 text-[10px]">
                            {info.category}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-semibold text-slate-800">
                            {completedCount} / {info.totalWorksheets}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-900">
                            {maxScore !== '-' ? `${maxScore}` : '-'}
                          </td>
                          <td className="p-2 text-center">
                            {isMastered ? (
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] border border-emerald-300">
                                ★ MASTER
                              </span>
                            ) : isUnlocked ? (
                              <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                                {completedCount > 0 ? 'Sedang Dipelajari' : 'Terbuka'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Terkunci</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Teacher Comments & Official Signature Endorsement */}
            <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-6 text-xs text-slate-800">
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 block mb-1">
                  Catatan & Evaluasi Guru Pembimbing:
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  "Konsistensi harian 10–15 menit per hari sangat disarankan. Terus pertahankan ritme berhitung dan ketelitian dalam pengerjaan langkah-langkah aljabar serta kalkulus."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center text-[10px]">
                <div className="flex flex-col justify-between h-24 border-b border-slate-400 pb-1">
                  <span className="text-slate-500 font-bold uppercase">Orang Tua / Wali Siswa</span>
                  <span className="text-slate-700 font-medium">( ........................................ )</span>
                </div>

                <div className="flex flex-col justify-between h-24 border-b border-slate-400 pb-1">
                  <span className="text-slate-500 font-bold uppercase">Guru Pembimbing AlgoriMath</span>
                  <span className="text-slate-900 font-bold">( Pembimbing Matematika )</span>
                </div>
              </div>
            </div>

            {/* Bottom print watermark */}
            <div className="mt-5 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wider font-semibold border-t border-slate-200 pt-2">
              <span>ALGORIMATH • AUTOMATED STUDENT PROGRESS REPORT</span>
              <span className="font-bold text-slate-800">@copyright by. Pak GuruAI</span>
              <span>DOKUMEN RESMI HASIL LATIHAN MANDIRI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
