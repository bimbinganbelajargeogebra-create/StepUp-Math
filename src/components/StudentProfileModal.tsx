import React, { useState } from 'react';
import { 
  User, 
  Flame, 
  Award, 
  Clock, 
  CheckCircle2, 
  History, 
  Calendar, 
  X, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  LogOut, 
  ShieldCheck,
  Printer,
  FileSpreadsheet,
  Zap,
  Building2
} from 'lucide-react';
import { StudentProfile, WorksheetSessionResult, PretestResult } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { StudentProgressReportModal } from './StudentProgressReportModal';

interface StudentProfileModalProps {
  profile: StudentProfile;
  sessions: WorksheetSessionResult[];
  pretestResult: PretestResult | null;
  onLogout?: () => void;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  sessions,
  pretestResult,
  onLogout,
  onClose
}) => {
  const [showReportPDF, setShowReportPDF] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const startingInfo = profile.startingLevel ? KUMON_LEVELS[profile.startingLevel] : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
        <div className="flex flex-col w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] transition-colors duration-200">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white border-b border-slate-800 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                id="export-progress-pdf-button"
                type="button"
                onClick={() => setShowReportPDF(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
                title="Ekspor Laporan Perkembangan Belajar & Grafik ke PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Ekspor Rapor (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-md shadow-indigo-600/30 shrink-0">
                {profile.avatar}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">{profile.name}</h3>
                  {profile.isTrial ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                      Akun Trial
                    </span>
                  ) : profile.isAdmin ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                      Admin Guru
                    </span>
                  ) : (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/40">
                      Siswa Reguler
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{profile.grade}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Streak {profile.streakDays} Hari</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{profile.totalPoints} Poin</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* PDF Report Card Callout Banner */}
            <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Rapor Perkembangan Belajar Mandiri</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Ekspor seluruh grafik performa, hasil tes diagnostik, dan daftar level yang diselesaikan ke format PDF.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReportPDF(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka & Cetak PDF</span>
              </button>
            </div>

            {/* Diagnostic Placement Badge */}
            {startingInfo && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                    {profile.startingLevel}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hasil Penempatan Pretest</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Level {profile.startingLevel}: {startingInfo.name}
                    </h4>
                  </div>
                </div>

                {pretestResult && (
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {pretestResult.score}/{pretestResult.total}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Akurasi Pretest</p>
                  </div>
                )}
              </div>
            )}

            {/* Status Akun Siswa Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Status Akun & Informasi Siswa</span>
                </div>
                <div>
                  {profile.isAdmin ? (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Admin Pengajar
                    </span>
                  ) : profile.isTrial ? (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                      <Clock className="w-3 h-3" />
                      Mode Trial
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Disetujui & Aktif (Cloud)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {profile.username && (
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Username</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate block">
                      @{profile.username}
                    </span>
                  </div>
                )}

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Jenjang / Kelas</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {profile.grade}
                  </span>
                </div>

                {profile.school && (
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Asal Sekolah</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {profile.school}
                    </span>
                  </div>
                )}

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tipe Akun</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile.isAdmin ? 'Master Admin' : profile.isTrial ? 'Trial Sementara' : 'Siswa Reguler'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{profile.totalWorksheetsCompleted}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lembar Diselesaikan</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                <Award className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">{profile.totalPoints}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Skor Belajar</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-center col-span-2 sm:col-span-1">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {profile.lastStudyDate || 'Hari Ini'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Latihan Terakhir</p>
              </div>
            </div>

            {/* Recharts Performance Visualizer */}
            <PerformanceTrendChart sessions={sessions} />

            {/* Session History List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Riwayat Latihan Lembar Kerja (Tersimpan Lokal)
              </h4>

              {sessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                  Belum ada sesi latihan. Pilih level dan mulai mengerjakan lembar kerja pertama!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          sess.score >= 90 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300'
                        }`}>
                          {sess.levelId}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Lembar #{sess.worksheetNum}</span>
                            {sess.isMastered && (
                              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-bold">
                                ★ Master
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {new Date(sess.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-black ${
                          sess.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : sess.score >= 70 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {sess.score} / 100
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {formatTime(sess.timeSpentSeconds)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer with Data Protection Note and Logout Button */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Semua level, nilai, dan riwayat belajar tersimpan & tersinkronkan di Firebase Firestore.</span>
            </div>

            {onLogout && (
              <button
                id="student-logout-button"
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 hover:text-rose-800 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar / Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Printable Report PDF Modal */}
      {showReportPDF && (
        <StudentProgressReportModal
          profile={profile}
          sessions={sessions}
          pretestResult={pretestResult}
          onClose={() => setShowReportPDF(false)}
        />
      )}
    </>
  );
};


