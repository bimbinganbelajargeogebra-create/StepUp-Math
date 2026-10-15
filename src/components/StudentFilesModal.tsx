import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderDown, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Sparkles, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Search, 
  Paperclip, 
  Clock, 
  Tag, 
  Filter, 
  Layers, 
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  GraduationCap
} from 'lucide-react';
import { KumonLevelId, StudentProfile, UploadedFileItem, UploadedFileType } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';
import { FirebaseDatabaseService } from '../services/firebaseSync';
import { getStudentRelevantFiles } from '../utils/storage';

interface StudentFilesModalProps {
  profile: StudentProfile;
  onClose: () => void;
  onOpenPrint?: (levelId?: KumonLevelId, worksheetNum?: number) => void;
  onSelectWorksheet?: (levelId: KumonLevelId, worksheetNum: number) => void;
}

export const StudentFilesModal: React.FC<StudentFilesModalProps> = ({
  profile,
  onClose,
  onOpenPrint,
  onSelectWorksheet
}) => {
  const [allFiles, setAllFiles] = useState<UploadedFileItem[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'diagnostic' | 'last_studied' | 'all' | 'my_uploads'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<UploadedFileItem | null>(null);

  // Student upload form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [studentTitle, setStudentTitle] = useState('');
  const [studentDesc, setStudentDesc] = useState('');
  const [studentPickedFile, setStudentPickedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
    type: UploadedFileType;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Subscribe to uploaded files from Firebase and localStorage
  useEffect(() => {
    const unsub = FirebaseDatabaseService.subscribeToUploadedFiles((files) => {
      setAllFiles(files);
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const diagnosticLevel: KumonLevelId | null = profile.startingLevel || null;
  const lastStudiedLevel: KumonLevelId = profile.lastStudiedLevel || profile.currentLevel || '6A';
  const lastStudiedWorksheetNum = profile.lastStudiedWorksheet || 1;

  const relevantData = useMemo(() => {
    return getStudentRelevantFiles(profile, allFiles);
  }, [profile, allFiles]);

  // Tab filtering logic
  const filteredFiles = useMemo(() => {
    let list: UploadedFileItem[] = [];

    switch (activeTab) {
      case 'recommended':
        list = relevantData.recommendedFiles;
        break;
      case 'diagnostic':
        list = relevantData.diagnosticLevelFiles;
        break;
      case 'last_studied':
        list = relevantData.lastStudiedLevelFiles;
        break;
      case 'my_uploads':
        list = allFiles.filter(
          f => f.uploaderRole === 'student' && 
               (f.uploadedBy.toLowerCase() === (profile.username || '').toLowerCase() || 
                f.uploadedBy.toLowerCase() === profile.name.toLowerCase())
        );
        break;
      case 'all':
      default:
        list = allFiles;
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => 
        f.title.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.fileName.toLowerCase().includes(q) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(q))) ||
        (f.targetLevel && f.targetLevel.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, relevantData, allFiles, searchQuery, profile]);

  // Handle local file selection by student
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fType: UploadedFileType = 'doc';
    if (file.type.includes('pdf')) fType = 'pdf';
    else if (file.type.startsWith('image/')) fType = 'image';

    const sizeFormatted = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.round(file.size / 1024) + ' KB';

    const reader = new FileReader();
    reader.onload = () => {
      setStudentPickedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: reader.result as string,
        type: fType
      });
      if (!studentTitle) {
        setStudentTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit student upload (e.g. proof of homework or practice)
  const handleSubmitStudentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentTitle.trim() && !studentPickedFile) return;

    setIsSubmitting(true);
    setUploadNotice(null);

    try {
      const newFileItem: UploadedFileItem = {
        id: `student-file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: studentTitle.trim() || studentPickedFile?.name || `Tugas Level ${lastStudiedLevel}`,
        description: studentDesc.trim() || `Lembar jawaban/latihan yang diunggah oleh ${profile.name} (Hasil Diagnostik: Level ${diagnosticLevel || '6A'}, Belajar Terakhir: Level ${lastStudiedLevel} #${lastStudiedWorksheetNum})`,
        fileName: studentPickedFile?.name || `Tugas-${profile.name}-Level-${lastStudiedLevel}.pdf`,
        fileType: studentPickedFile?.type || 'worksheet',
        fileDataUrl: studentPickedFile?.dataUrl,
        fileSize: studentPickedFile?.size || '340 KB',
        targetLevel: lastStudiedLevel,
        targetWorksheetNum: lastStudiedWorksheetNum,
        uploadedBy: profile.name,
        uploaderRole: 'student',
        uploadedAt: Date.now(),
        tags: ['Unggahan Siswa', `Level ${lastStudiedLevel}`, `Diagnostik ${diagnosticLevel || '6A'}`]
      };

      await FirebaseDatabaseService.uploadFileItem(newFileItem);

      setUploadNotice('File pengerjaan berhasil diunggah! Guru / Admin dapat memeriksa di Panel Pengajar.');
      setStudentTitle('');
      setStudentDesc('');
      setStudentPickedFile(null);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadNotice(null);
        setActiveTab('my_uploads');
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadNotice('Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = (file: UploadedFileItem) => {
    if (file.fileDataUrl) {
      const a = document.createElement('a');
      a.href = file.fileDataUrl;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // If it's a simulated or generated curriculum file, trigger open or print
      if (onOpenPrint && file.targetLevel !== 'ALL') {
        onOpenPrint(file.targetLevel, file.targetWorksheetNum || 1);
      } else {
        // Fallback: create simulated text file with topic summary
        const content = `=== ALGORIMATH LEARNING MATERIAL ===\nJudul: ${file.title}\nLevel: ${file.targetLevel}\nPengunggah: ${file.uploadedBy}\nDeskripsi: ${file.description || '-'}\n\nMateri ini disesuaikan untuk siswa pada Level ${file.targetLevel}.`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const renderFileIcon = (type: UploadedFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'worksheet':
        return <FileSpreadsheet className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileCode className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
      <div className="flex flex-col w-full max-w-4xl clay-card rounded-[32px] overflow-hidden my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 dark:bg-slate-950/90 text-white border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl clay-btn flex items-center justify-center text-amber-300">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">File &amp; Materi Pembelajaran Siswa</h3>
                <span className="px-2.5 py-0.5 clay-badge text-emerald-300 text-[10px] font-black rounded-full">
                  Level-Adaptive
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-medium">
                Muncul otomatis sesuai Hasil Tes Diagnostik &amp; Level Belajar Terakhir Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="student-upload-toggle-btn"
              type="button"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
              className="clay-btn clay-btn-primary px-3 py-1.5 text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
              title="Unggah tugas atau lembar pengerjaan Anda"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unggah Tugas Saya</span>
            </button>
            <button
              id="student-files-modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl clay-btn-secondary text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Level Context Cards (Diagnostic & Last Studied) */}
        <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Diagnostic Placement Level */}
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Hasil Tes Diagnostik Penempatan
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 text-[10px] font-black">
                    Wajib 1x
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Level {diagnosticLevel || 'Belum Tes'}
                  </h4>
                  {diagnosticLevel && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      ({KUMON_LEVELS[diagnosticLevel]?.name})
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {diagnosticLevel 
                    ? `File modul & panduan dasar Level ${diagnosticLevel} disiapkan khusus untuk pondasi awal Anda.`
                    : 'Silakan selesaikan tes awal diagnostik untuk kalibrasi file materi otomatis.'}
                </p>
              </div>
            </div>

            {/* Card 2: Last Studied Level */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Level Belajar Terakhir
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black">
                    Aktif
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Level {lastStudiedLevel} #{lastStudiedWorksheetNum}
                  </h4>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    ({KUMON_LEVELS[lastStudiedLevel]?.name})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Menampilkan file materi pengayaan &amp; lembar latihan lanjutan untuk level yang sedang Anda kerjakan.
                </p>
              </div>
            </div>
          </div>

          {/* Student Upload Form (collapsible) */}
          {isUploadOpen && (
            <form onSubmit={handleSubmitStudentUpload} className="p-4 bg-white dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-700 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Unggah Lembar Pengerjaan / Tugas Siswa
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Tersimpan untuk Level {lastStudiedLevel}
                </span>
              </div>

              {uploadNotice && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Tugas / Catatan
                  </label>
                  <input
                    type="text"
                    required
                    value={studentTitle}
                    onChange={(e) => setStudentTitle(e.target.value)}
                    placeholder={`Contoh: Latihan Soal Level ${lastStudiedLevel} Lembar #${lastStudiedWorksheetNum}`}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih File (PDF, Gambar Foto, atau Dokumen)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileSelect}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan / Keterangan untuk Guru (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={studentDesc}
                  onChange={(e) => setStudentDesc(e.target.value)}
                  placeholder="Tuliskan catatan pengerjaan, nomor soal yang sulit, atau pesan untuk Guru..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!studentTitle.trim() && !studentPickedFile)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengunggah...' : 'Kirim File ke Guru'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            {[
              { 
                id: 'recommended', 
                label: 'Rekomendasi Level Saya', 
                icon: Sparkles,
                badge: relevantData.recommendedFiles.length
              },
              { 
                id: 'diagnostic', 
                label: `Level Diagnostik (${diagnosticLevel || '6A'})`, 
                icon: Target,
                badge: relevantData.diagnosticLevelFiles.length
              },
              { 
                id: 'last_studied', 
                label: `Belajar Terakhir (${lastStudiedLevel})`, 
                icon: BookOpen,
                badge: relevantData.lastStudiedLevelFiles.length
              },
              { 
                id: 'my_uploads', 
                label: 'Tugas Saya', 
                icon: Upload,
                badge: allFiles.filter(f => f.uploaderRole === 'student' && (f.uploadedBy.toLowerCase() === (profile.username || '').toLowerCase() || f.uploadedBy.toLowerCase() === profile.name.toLowerCase())).length || null
              },
              { 
                id: 'all', 
                label: 'Semua File (18 Level)', 
                icon: Layers,
                badge: allFiles.length
              }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`student-file-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'clay-btn text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul, file, topik..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Files Grid / List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <FolderDown className="w-10 h-10 text-slate-400 mx-auto" />
              <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Tidak Ada File yang Sesuai
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'diagnostic'
                  ? `Belum ada file khusus untuk Level Diagnostik ${diagnosticLevel || '6A'}. Silakan pilih tab Rekomendasi atau Semua File.`
                  : activeTab === 'last_studied'
                  ? `Belum ada file untuk Level Belajar Terakhir ${lastStudiedLevel}.`
                  : 'Coba ubah kata kunci pencarian Anda atau buka tab Semua File.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredFiles.map((file) => {
                const isDiagnosticMatch = diagnosticLevel && file.targetLevel === diagnosticLevel;
                const isLastStudiedMatch = file.targetLevel === lastStudiedLevel;
                const isUniversal = file.targetLevel === 'ALL';
                const isStudentUpload = file.uploaderRole === 'student';

                return (
                  <div
                    key={file.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isDiagnosticMatch && isLastStudiedMatch
                        ? 'bg-linear-to-br from-indigo-50/90 to-amber-50/90 dark:from-indigo-950/40 dark:to-amber-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                        : isDiagnosticMatch
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                        : isLastStudiedMatch
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {/* Target Level Badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          file.targetLevel === 'ALL'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        }`}>
                          {file.targetLevel === 'ALL' ? 'Semua Level' : `Level ${file.targetLevel}`}
                        </span>

                        {/* Match Indicators */}
                        {isDiagnosticMatch && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Hasil Tes Diagnostik
                          </span>
                        )}

                        {isLastStudiedMatch && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Belajar Terakhir
                          </span>
                        )}

                        {isUniversal && !isDiagnosticMatch && !isLastStudiedMatch && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Kurikulum Umum
                          </span>
                        )}

                        {isStudentUpload && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            Tugas Anda
                          </span>
                        )}

                        <span className="ml-auto text-[10px] text-slate-400 font-medium">
                          {file.fileSize || 'PDF'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                          {renderFileIcon(file.fileType)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                            {file.title}
                          </h4>
                          {file.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {file.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{file.fileName}</span>
                            </span>
                            <span>&bull;</span>
                            <span>Oleh: <strong className="text-slate-700 dark:text-slate-300">{file.uploadedBy}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/80">
                      <div className="flex items-center gap-1">
                        {file.tags && file.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSelectWorksheet && file.targetLevel !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectWorksheet(file.targetLevel as KumonLevelId, file.targetWorksheetNum || 1);
                            }}
                            className="px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors cursor-pointer"
                            title="Latihan langsung di level ini"
                          >
                            Latihan Level Ini
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh / Buka</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info notice */}
        <div className="px-6 py-3 bg-slate-100/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Sinkronisasi Cloud Live: Setiap file baru yang diunggah Guru akan langsung tampil sesuai level pencapaian Anda.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
