import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  FileText, 
  X, 
  Database,
  Users,
  Award,
  Printer,
  Sparkles
} from 'lucide-react';
import { KumonLevelId, StudentProfile, LevelProgress } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { 
  ACCESS_CODE, 
  ADMIN_PASSWORD,
  exportDeviceBackupJSON, 
  importDeviceBackupJSON, 
  saveStoredLevelProgress, 
  saveStoredProfile,
  savePretestResult,
  resetAllDeviceData 
} from '../utils/storage';
import { FirebaseSyncService } from '../services/firebaseSync';
import { Cloud, CloudUpload, CloudDownload } from 'lucide-react';

interface TeacherAdminModalProps {
  profile: StudentProfile | null;
  levelProgress: Record<KumonLevelId, LevelProgress>;
  onProgressUpdated: (newProgress: Record<KumonLevelId, LevelProgress>) => void;
  onProfileUpdated: (newProfile: StudentProfile) => void;
  onResetAll: () => void;
  onOpenPrintWorksheets?: (levelId?: KumonLevelId) => void;
  onClose: () => void;
}

export const TeacherAdminModal: React.FC<TeacherAdminModalProps> = ({
  profile,
  levelProgress,
  onProgressUpdated,
  onProfileUpdated,
  onResetAll,
  onOpenPrintWorksheets,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'backup' | 'info'>('levels');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const handleCloudUploadAll = async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatus('Mengunggah data profil dan progres ke Firebase Firestore...');
    try {
      if (profile) {
        await FirebaseSyncService.syncProfileToCloud(profile);
      }
      await FirebaseSyncService.syncLevelProgressToCloud(levelProgress);
      setCloudSyncStatus('✓ Data profil dan level berhasil disinkronkan ke Firebase Cloud!');
    } catch (err) {
      console.error(err);
      setCloudSyncStatus('Gagal menyinkronkan data ke cloud. Periksa koneksi internet.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleCloudDownloadAll = async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatus('Memeriksa dan memuat data dari Firebase Firestore...');
    try {
      const cloudData = await FirebaseSyncService.loadAllUserDataFromCloud();
      if (cloudData) {
        if (cloudData.profile) {
          saveStoredProfile(cloudData.profile);
          onProfileUpdated(cloudData.profile);
        }
        if (cloudData.levelProgress) {
          saveStoredLevelProgress(cloudData.levelProgress);
          onProgressUpdated(cloudData.levelProgress);
        }
        if (cloudData.pretestResult) {
          savePretestResult(cloudData.pretestResult);
        }
        setCloudSyncStatus('✓ Berhasil memulihkan data siswa dari Firebase Firestore!');
      } else {
        setCloudSyncStatus('Belum ada data cadangan di Firebase Firestore untuk akun ini.');
      }
    } catch (err) {
      console.error(err);
      setCloudSyncStatus('Gagal memuat data dari Firebase. Pastikan koneksi aktif.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleUnlockAll = () => {
    const updated = { ...levelProgress };
    KUMON_LEVEL_ORDER.forEach((lvl) => {
      if (updated[lvl]) {
        updated[lvl].unlocked = true;
      }
    });
    saveStoredLevelProgress(updated);
    onProgressUpdated(updated);
  };

  const handleToggleLevel = (lvlId: KumonLevelId) => {
    const current = levelProgress[lvlId];
    const updated = {
      ...levelProgress,
      [lvlId]: {
        ...current,
        unlocked: !current?.unlocked
      }
    };
    saveStoredLevelProgress(updated);
    onProgressUpdated(updated);
  };

  const handleToggleMastered = (lvlId: KumonLevelId) => {
    const current = levelProgress[lvlId];
    const updated = {
      ...levelProgress,
      [lvlId]: {
        ...current,
        mastered: !current?.mastered,
        masteryDate: !current?.mastered ? Date.now() : undefined
      }
    };
    saveStoredLevelProgress(updated);
    onProgressUpdated(updated);
  };

  const handleResetPretestOnly = () => {
    if (!profile) return;
    const updatedProfile: StudentProfile = {
      ...profile,
      pretestCompleted: false,
      startingLevel: null
    };
    saveStoredProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportDeviceBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stepup_math_backup_${profile?.name || 'siswa'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDeviceBackupJSON(importText);
    if (ok) {
      setImportStatus('Data berhasil diimpor! Halaman akan diperbarui.');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setImportStatus('Format JSON tidak valid. Pastikan menyalin file cadangan yang sesuai.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="flex flex-col w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Panel Pengajar / Admin Guru</h3>
              <p className="text-xs text-indigo-300">Kontrol Level & Manajemen Data Perangkat</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          {[
            { id: 'levels', label: 'Buka / Kunci Level', icon: Unlock },
            { id: 'backup', label: 'Cadangkan / Ekspor Data', icon: Database },
            { id: 'info', label: 'Kode Akses & Info', icon: KeyRound }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'levels' && (
            <div className="space-y-4">
              {/* PDF Print Banner */}
              <div className="p-4 bg-linear-to-r from-indigo-900 to-slate-900 rounded-2xl text-white flex items-center justify-between gap-3 shadow-md border border-indigo-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Cetak Lembar Kerja Siswa (PDF)</h5>
                    <p className="text-xs text-indigo-200">
                      Cetak lembar kerja seluruh level (6A–M) dengan Soal #1 Contoh &amp; Penyelesaian Bertingkat.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPrintWorksheets) {
                      onOpenPrintWorksheets();
                    }
                  }}
                  className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Buka Lembar PDF</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Manajemen Status 18 Level Kurikulum</h4>
                  <p className="text-xs text-slate-500">Guru dapat membuka/mengunci level secara instan untuk kebutuhan pengajaran.</p>
                </div>

                <button
                  type="button"
                  onClick={handleUnlockAll}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Buka Semua (6A – M)
                </button>
              </div>

              {/* Grid of all 18 levels */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {KUMON_LEVEL_ORDER.map((lvl) => {
                  const info = KUMON_LEVELS[lvl];
                  const prog = levelProgress[lvl];
                  const isUnlocked = prog?.unlocked;
                  const isMastered = prog?.mastered;

                  return (
                    <div
                      key={lvl}
                      className={`p-3 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-slate-100/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-900 text-sm">Level {lvl}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLevel(lvl)}
                            className={`p-1 rounded-md text-xs font-bold ${
                              isUnlocked
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                            title={isUnlocked ? 'Kunci Level' : 'Buka Level'}
                          >
                            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleMastered(lvl)}
                            className={`p-1 rounded-md text-xs font-bold ${
                              isMastered
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                            title={isMastered ? 'Tandai Belum Lulus' : 'Tandai Lulus (Bintang)'}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate font-medium">{info.name}</p>
                      <p className="text-[10px] text-indigo-600 font-semibold">{info.category}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reset pretest option */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Uji Ulang Pretest Diagnostik</h5>
                  <p className="text-[11px] text-slate-500">Mereset hasil tes diagnostik agar siswa dapat mengikuti pretest lagi.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPretestOnly}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Ulangi Pretest
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Firebase Cloud Firestore Card */}
              <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950">Firebase Cloud Backend (Firestore)</h4>
                      <p className="text-[11px] text-indigo-700">Sinkronisasi & pencadangan awan otomatis aktif</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    Online & Terhubung
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Data latihan, progres level, dan hasil pretest otomatis disinkronkan ke Firebase Firestore di latar belakang saat online. Anda juga dapat memicu sinkronisasi atau pemulihan secara manual.
                </p>

                {cloudSyncStatus && (
                  <div className="p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 shadow-2xs">
                    {cloudSyncStatus}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCloudUploadAll}
                    disabled={isCloudSyncing}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Unggah / Sinkronkan ke Cloud'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloudDownloadAll}
                    disabled={isCloudSyncing}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CloudDownload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pulihkan dari Cloud</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">Ekspor & Impor File Lokal</h4>
                <p className="text-xs text-slate-500">
                  Anda juga dapat mengunduh berkas JSON cadangan mandiri untuk disimpan secara manual atau dipindahkan ke perangkat lain.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan (JSON)</span>
                </button>
              </div>

              {/* Import box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">Impor Cadangan JSON</label>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Tempel teks JSON cadangan di sini..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {importStatus && (
                  <p className="text-xs font-semibold text-indigo-700">{importStatus}</p>
                )}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Terapkan Impor</span>
                </button>
              </div>

              {/* Dangerous Reset */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Reset Total Data Perangkat
                </h5>
                <p className="text-[11px] text-rose-800">
                  Tindakan ini akan menghapus seluruh data siswa, pretest, riwayat skor, dan progres belajar di perangkat ini secara permanen.
                </p>

                {confirmReset ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllDeviceData();
                        onResetAll();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                    >
                      Ya, Hapus Semua Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition-colors"
                  >
                    Reset Seluruh Data
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                    Password Master Admin (Buka Seluruh Level & Cetak PDF)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-700 font-mono text-base font-bold text-white rounded-xl shadow-xs">
                      {ADMIN_PASSWORD}
                    </span>
                    <span className="text-xs text-slate-600">
                      Membuka seluruh 18 level tanpa tes diagnostik & mengaktifkan mode cetak PDF.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-200/70">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Kode Akses Standar Siswa / Guru
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white border border-indigo-300 font-mono text-sm font-bold text-indigo-950 rounded-xl">
                      {ACCESS_CODE}
                    </span>
                    <span className="text-xs text-slate-600">
                      Otorisasi login awal siswa sebelum tes penempatan level.
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Struktur 18 Level Kurikulum (6A – M)</h4>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>• <strong>Pra-Sekolah (6A – 4A)</strong>: Mengenal angka 1–100 & konsep +1</p>
                  <p>• <strong>SD Dasar (3A – C)</strong>: Penjumlahan, pengurangan susun, perkalian & pembagian</p>
                  <p>• <strong>SD Lanjut (D – F)</strong>: Operasi pecahan, desimal, urutan hitung campuran</p>
                  <p>• <strong>SMP Aljabar (G – I)</strong>: Bilangan negatif, SPLDV, faktorisasi kuadrat</p>
                  <p>• <strong>SMA Aljabar & Fungsi (J – K)</strong>: Polinomial, eksponensial, logaritma</p>
                  <p>• <strong>SMA Kalkulus (L – M)</strong>: Trigonometri, limit, turunan & kalkulus integral</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
