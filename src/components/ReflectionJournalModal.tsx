import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Clock, 
  Smile, 
  CheckCircle2, 
  Search, 
  Filter,
  Award,
  Save,
  MessageSquareQuote,
  Flame,
  Zap,
  Tag
} from 'lucide-react';
import { ReflectionJournalEntry, ReflectionFeeling, StudentProfile, KumonLevelId } from '../types';
import { saveStoredReflectionJournal, deleteStoredReflectionJournal } from '../utils/storage';
import { KUMON_LEVEL_ORDER } from '../data/curriculumData';

interface ReflectionJournalModalProps {
  profile: StudentProfile | null;
  journals: ReflectionJournalEntry[];
  onUpdateJournals: (journals: ReflectionJournalEntry[]) => void;
  onClose: () => void;
}

export const ReflectionJournalModal: React.FC<ReflectionJournalModalProps> = ({
  profile,
  journals,
  onUpdateJournals,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isWritingNew, setIsWritingNew] = useState(false);

  // New reflection form state
  const [formLevel, setFormLevel] = useState<KumonLevelId>(profile?.currentLevel || '6A');
  const [formSheetNum, setFormSheetNum] = useState<number>(1);
  const [formReflectionText, setFormReflectionText] = useState('');
  const [formFeeling, setFormFeeling] = useState<ReflectionFeeling>('pas_menyenangkan');
  const [formKeyTakeaway, setFormKeyTakeaway] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const feelingsMap: Record<ReflectionFeeling, { label: string; emoji: string; bg: string; text: string }> = {
    sangat_mudah: {
      label: 'Sangat Mudah & Lancar',
      emoji: '⚡',
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-800 dark:text-emerald-300'
    },
    pas_menyenangkan: {
      label: 'Pas & Menyenangkan',
      emoji: '😊',
      bg: 'bg-indigo-100 dark:bg-indigo-950/60',
      text: 'text-indigo-800 dark:text-indigo-300'
    },
    butuh_latihan_lagi: {
      label: 'Perlu Latihan Pengulangan',
      emoji: '🤔',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300'
    },
    cukup_sulit: {
      label: 'Menantang & Butuh Waktu',
      emoji: '🔥',
      bg: 'bg-rose-100 dark:bg-rose-950/60',
      text: 'text-rose-800 dark:text-rose-300'
    }
  };

  const handleSaveManualJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReflectionText.trim()) {
      setStatusMessage('Silakan tulis catatan apa yang Anda pelajari hari ini.');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const newEntry: ReflectionJournalEntry = {
      id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentName: profile?.name || 'Siswa StepUp',
      studentUsername: profile?.username,
      timestamp: Date.now(),
      dateStr,
      levelId: formLevel,
      worksheetNum: Number(formSheetNum) || 1,
      score: 100,
      timeSpentSeconds: 300,
      reflectionText: formReflectionText.trim(),
      feeling: formFeeling,
      keyTakeaway: formKeyTakeaway.trim() || undefined
    };

    const res = saveStoredReflectionJournal(newEntry);
    onUpdateJournals(res.journals);
    setIsSubmitting(false);
    setIsWritingNew(false);
    setFormReflectionText('');
    setFormKeyTakeaway('');
    setStatusMessage('Catatan refleksi berhasil disimpan ke database!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan refleksi ini?')) {
      const updated = deleteStoredReflectionJournal(id);
      onUpdateJournals(updated);
    }
  };

  // Filter journals
  const filteredJournals = journals.filter(j => {
    const matchQuery = 
      j.reflectionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.keyTakeaway && j.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase())) ||
      j.levelId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLevel = filterLevel === 'all' || j.levelId === filterLevel;

    return matchQuery && matchLevel;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div 
        id="reflection-journal-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Jurnal &amp; Catatan Refleksi Belajar
                </h2>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-400/40">
                  {journals.length} Catatan Tersimpan
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Catat konsep baru, pemahaman, dan evaluasi mandiri setelah menyelesaikan lembar kerja.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-reflection-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback / Notification Banner */}
        {statusMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari catatan refleksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Semua Level</option>
              {KUMON_LEVEL_ORDER.map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            id="write-new-reflection-btn"
            onClick={() => setIsWritingNew(!isWritingNew)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            {isWritingNew ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Batal Tulis</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Catatan Refleksi Baru</span>
              </>
            )}
          </button>
        </div>

        {/* New Reflection Form Accordion */}
        {isWritingNew && (
          <form onSubmit={handleSaveManualJournal} className="p-4 sm:p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tulis Refleksi Mandiri Hari Ini
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Level
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as KumonLevelId)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {KUMON_LEVEL_ORDER.map((lvl) => (
                    <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Lembar Kerja (#1 – #10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formSheetNum}
                  onChange={(e) => setFormSheetNum(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Perasaan / Tingkat Pemahaman:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(feelingsMap) as ReflectionFeeling[]).map((fKey) => {
                  const fData = feelingsMap[fKey];
                  const isSelected = formFeeling === fKey;
                  return (
                    <button
                      key={fKey}
                      type="button"
                      onClick={() => setFormFeeling(fKey)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <span>{fData.emoji}</span>
                      <span className="text-[11px] truncate">{fData.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Catatan Refleksi (Apa yang dipelajari &amp; dipahami hari ini?) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Hari ini saya belajar cara mengoperasikan bilangan pecahan desimal dengan cepat dan teliti..."
                value={formReflectionText}
                onChange={(e) => setFormReflectionText(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Rumus / Kunci Pemahaman Penting (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: a/b + c/d = (ad + bc) / bd"
                value={formKeyTakeaway}
                onChange={(e) => setFormKeyTakeaway(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWritingNew(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </button>
            </div>
          </form>
        )}

        {/* Journals List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {filteredJournals.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-500">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Belum Ada Catatan Refleksi
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Setiap kali kamu menyelesaikan lembar kerja, tuliskan 1–2 kalimat tentang apa yang baru dipelajari agar pemahamanmu semakin kuat!
              </p>
              <button
                type="button"
                onClick={() => setIsWritingNew(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mulai Tulis Sekarang</span>
              </button>
            </div>
          ) : (
            filteredJournals.map((journal) => {
              const feelingInfo = journal.feeling ? feelingsMap[journal.feeling] : null;
              const formattedDate = new Date(journal.timestamp).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={journal.id}
                  id={`journal-item-${journal.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg">
                        Level {journal.levelId} • Lembar #{journal.worksheetNum}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {feelingInfo && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${feelingInfo.bg} ${feelingInfo.text}`}>
                          <span>{feelingInfo.emoji}</span>
                          <span>{feelingInfo.label}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(journal.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Reflection Text */}
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    <MessageSquareQuote className="w-4 h-4 text-indigo-400 inline mr-1.5 -mt-1" />
                    {journal.reflectionText}
                  </div>

                  {/* Key Takeaway Formula if present */}
                  {journal.keyTakeaway && (
                    <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <strong>Kunci / Rumus:</strong> <code>{journal.keyTakeaway}</code>
                      </div>
                    </div>
                  )}

                  {/* Footer Metrics */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>Oleh: <strong>{journal.studentName}</strong></span>
                    <span>Skor Terkait: <strong className="text-indigo-600 dark:text-indigo-400">{journal.score} Poin</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Semua catatan refleksi otomatis tersinkronisasi di <strong>Database Pusat</strong>.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
