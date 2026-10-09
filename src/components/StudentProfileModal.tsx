import React, { useState, useMemo } from 'react';
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
  Building2,
  BarChart3
} from 'lucide-react';
import { StudentProfile, WorksheetSessionResult, PretestResult, KumonLevelId, LevelProgress } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { StudentLevelProgressChart } from './StudentLevelProgressChart';
import { StudentProgressReportModal } from './StudentProgressReportModal';
import { getStoredLevelProgress } from '../utils/storage';

interface StudentProfileModalProps {
  profile: StudentProfile;
  sessions: WorksheetSessionResult[];
  pretestResult: PretestResult | null;
  levelProgress?: Record<KumonLevelId, LevelProgress>;
  onLogout?: () => void;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  sessions,
  pretestResult,
  levelProgress,
  onLogout,
  onClose
}) => {
  const [showReportPDF, setShowReportPDF] = useState(false);
  const [chartTab, setChartTab] = useState<'level_progress' | 'session_trends'>('level_progress');

  const effectiveLevelProgress = useMemo(() => {
    return levelProgress || getStoredLevelProgress();
  }, [levelProgress]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const startingInfo = profile.startingLevel ? KUMON_LEVELS[profile.startingLevel] : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
        <div className="flex flex-col w-full max-w-4xl clay-card rounded-[32px] overflow-hidden my-auto max-h-[90vh] transition-colors duration-200">
          {/* Header */}
          <div className="bg-slate-900/90 dark:bg-slate-950/90 p-6 text-white border-b border-slate-800/80 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                id="export-progress-pdf-button"
                type="button"
                onClick={() => setShowReportPDF(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl clay-btn text-white text-xs font-black transition-all cursor-pointer"
                title="Ekspor Laporan Perkembangan Belajar & Grafik ke PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Ekspor Rapor (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl clay-btn-secondary text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl clay-btn flex items-center justify-center text-2xl shrink-0">
                {profile.avatar}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h3>
                  {profile.isTrial ? (
                    <span className="text-[10px] clay-btn-amber text-slate-950 font-bold px-2 py-0.5 rounded-full">
                      Akun Trial
                    </span>
                  ) : profile.isAdmin ? (
                    <span className="text-[10px] clay-btn-emerald text-white font-bold px-2 py-0.5 rounded-full">
                      Admin Guru
                    </span>
                  ) : (
                    <span className="text-[10px] clay-badge text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                      Siswa Reguler
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{profile.grade}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full clay-badge text-amber-300 text-xs font-black">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Streak {profile.streakDays} Hari</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full clay-badge text-emerald-300 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{profile.totalPoints} Poin</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* PDF Report Card Callout Banner */}
            <div className="p-4 clay-card-sm rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 clay-btn text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100">Rapor Perkembangan Belajar Mandiri</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                    Ekspor seluruh grafik performa, hasil tes diagnostik, dan daftar level yang diselesaikan ke format PDF.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReportPDF(true)}
                className="px-4 py-2 clay-btn text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka & Cetak PDF</span>
              </button>
            </div>

            {/* Diagnostic Placement Badge */}
            {startingInfo && (
              <div className="p-4 clay-inset rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl clay-btn text-white flex items-center justify-center font-black text-sm">
                    {profile.startingLevel}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Hasil Penempatan Pretest</span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                      Level {profile.startingLevel}: {startingInfo.name}
                    </h4>
                  </div>
                </div>

                {pretestResult && (
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {pretestResult.score}/{pretestResult.total}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Akurasi Pretest</p>
                  </div>
                )}
              </div>
            )}

            {/* Status Akun Siswa Card */}
            <div className="p-4 clay-card-sm rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Status Akun & Informasi Siswa</span>
                </div>
                <div>
                  {profile.isAdmin ? (
                    <span className="px-3 py-1 clay-btn-emerald text-white text-[10px] font-black rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Admin Pengajar
                    </span>
                  ) : profile.isTrial ? (
                    <span className="px-3 py-1 clay-btn-amber text-slate-950 text-[10px] font-black rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Mode Trial
                    </span>
                  ) : (
                    <span className="px-3 py-1 clay-btn-emerald text-white text-[10px] font-black rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Disetujui & Aktif (Cloud)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {profile.username && (
                  <div className="p-2.5 clay-inset rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Username</span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 truncate block">
                      @{profile.username}
                    </span>
                  </div>
                )}

                <div className="p-2.5 clay-inset rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Jenjang / Kelas</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {profile.grade}
                  </span>
                </div>

                {profile.school && (
                  <div className="p-2.5 clay-inset rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Asal Sekolah</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {profile.school}
                    </span>
                  </div>
                )}

                <div className="p-2.5 clay-inset rounded-xl">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tipe Akun</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {profile.isAdmin ? 'Master Admin' : profile.isTrial ? 'Trial Sementara' : 'Siswa Reguler'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 clay-card-sm rounded-2xl text-center">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{profile.totalWorksheetsCompleted}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Lembar Diselesaikan</p>
              </div>

              <div className="p-4 clay-card-sm rounded-2xl text-center">
                <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{profile.totalPoints}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Total Skor Belajar</p>
              </div>

              <div className="p-4 clay-card-sm rounded-2xl text-center col-span-2 sm:col-span-1">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {profile.lastStudyDate || 'Hari Ini'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Latihan Terakhir</p>
              </div>
            </div>

            {/* Visualisasi Data Pembelajaran (Recharts) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Visualisasi Progres & Evaluasi Belajar (Recharts)
                  </h4>
                </div>

                {/* Sub-tab switcher */}
                <div className="flex items-center gap-1 clay-inset p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartTab('level_progress')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartTab === 'level_progress'
                        ? 'clay-btn text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Kemajuan per Level</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartTab('session_trends')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartTab === 'session_trends'
                        ? 'clay-btn text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Tren Skor Sesi</span>
                  </button>
                </div>
              </div>

              {chartTab === 'level_progress' ? (
                <StudentLevelProgressChart
                  profile={profile}
                  levelProgress={effectiveLevelProgress}
                  sessions={sessions}
                />
              ) : (
                <PerformanceTrendChart sessions={sessions} />
              )}
            </div>

            {/* Session History List */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Riwayat Latihan Lembar Kerja (Tersimpan Lokal)
              </h4>

              {sessions.length === 0 ? (
                <div className="p-8 text-center clay-inset rounded-2xl text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Belum ada sesi latihan. Pilih level dan mulai mengerjakan lembar kerja pertama!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 clay-card-sm rounded-xl flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          sess.score >= 90 ? 'clay-btn-emerald text-white' : 'clay-btn text-white'
                        }`}>
                          {sess.levelId}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Lembar #{sess.worksheetNum}</span>
                            {sess.isMastered && (
                              <span className="text-[10px] clay-btn-amber text-slate-950 px-2 py-0.5 rounded-md font-bold">
                                ★ Master
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
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
          <div className="p-4 bg-slate-50/70 dark:bg-slate-850/70 border-t border-slate-100/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Semua level, nilai, dan riwayat belajar tersimpan & tersinkronkan di database.</span>
            </div>

            {onLogout && (
              <button
                id="student-logout-button"
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-4 py-2 clay-btn-rose text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
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


