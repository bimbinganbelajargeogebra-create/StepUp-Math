import React, { useState, useEffect } from 'react';
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
  Sparkles,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  GraduationCap,
  Building2
} from 'lucide-react';
import { KumonLevelId, StudentProfile, LevelProgress, UserAccount, AccountStatus } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { 
  ACCESS_CODE, 
  ADMIN_PASSWORD,
  exportDeviceBackupJSON, 
  importDeviceBackupJSON, 
  saveStoredLevelProgress, 
  saveStoredProfile,
  savePretestResult,
  resetAllDeviceData,
  generateCleanLevelProgress 
} from '../utils/storage';
import { FirebaseDatabaseService, FirebaseSyncService } from '../services/firebaseSync';
import { testFirebaseConnection } from '../lib/firebase';
import { Cloud, CloudUpload, CloudDownload, Activity } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'approvals' | 'levels' | 'backup' | 'info'>('approvals');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{
    connected: boolean;
    message: string;
    projectId: string;
    database: string;
    latencyMs: number;
  } | null>(null);

  // User Accounts & Approval State
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [accountsFilter, setAccountsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [accountsSearch, setAccountsSearch] = useState('');
  const [approvalLevelChoices, setApprovalLevelChoices] = useState<Record<string, KumonLevelId>>({});
  const [rejectModalAccount, setRejectModalAccount] = useState<UserAccount | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('Data pendaftaran belum terverifikasi di bimbingan belajar.');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [processingUsername, setProcessingUsername] = useState<string | null>(null);

  // Real-time listener for registered accounts in Firebase Firestore
  useEffect(() => {
    const unsub = FirebaseDatabaseService.subscribeToAccounts((fetchedAccounts) => {
      setAccounts(fetchedAccounts);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const pendingCount = accounts.filter(a => a.status === 'pending').length;

  // Handle Approve Account
  const handleApprove = async (username: string, startingLevel?: KumonLevelId) => {
    setProcessingUsername(username);
    setActionSuccessNotice(null);
    try {
      const chosenLevel = startingLevel || approvalLevelChoices[username] || '6A';
      const ok = await FirebaseDatabaseService.approveAccount(username, profile?.name || 'Admin Guru', chosenLevel);
      if (ok) {
        setActionSuccessNotice(`Akun @${username} berhasil DISETUJUI dengan Level Awal: ${chosenLevel}!`);
        setTimeout(() => setActionSuccessNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingUsername(null);
    }
  };

  // Handle Changing Student Level
  const handleUpdateStudentLevel = async (username: string, newLevel: KumonLevelId) => {
    setProcessingUsername(username);
    setActionSuccessNotice(null);
    try {
      const ok = await FirebaseDatabaseService.updateStudentLevel(username, newLevel, profile?.name || 'Admin Guru');
      if (ok) {
        setActionSuccessNotice(`Level siswa @${username} berhasil diubah ke Level ${newLevel}. Level terbuka telah dikalibrasi.`);
        setTimeout(() => setActionSuccessNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingUsername(null);
    }
  };

  // Handle Reject Account
  const handleConfirmReject = async () => {
    if (!rejectModalAccount) return;
    const username = rejectModalAccount.username;
    setProcessingUsername(username);
    setActionSuccessNotice(null);
    try {
      const ok = await FirebaseDatabaseService.rejectAccount(
        username, 
        profile?.name || 'Admin Guru', 
        rejectReasonInput.trim()
      );
      if (ok) {
        setActionSuccessNotice(`Pendaftaran akun @${username} telah DITOLAK.`);
        setRejectModalAccount(null);
        setTimeout(() => setActionSuccessNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingUsername(null);
    }
  };

  // Handle Reset Status to Pending
  const handleResetToPending = async (username: string) => {
    setProcessingUsername(username);
    try {
      await FirebaseDatabaseService.resetAccountToPending(username);
      setActionSuccessNotice(`Status akun @${username} dikembalikan ke Menunggu Approval.`);
      setTimeout(() => setActionSuccessNotice(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingUsername(null);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (username: string) => {
    if (!window.confirm(`Yakin ingin menghapus akun @${username} secara permanen dari database?`)) {
      return;
    }
    setProcessingUsername(username);
    try {
      await FirebaseDatabaseService.deleteAccount(username);
      setActionSuccessNotice(`Akun @${username} telah dihapus.`);
      setTimeout(() => setActionSuccessNotice(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingUsername(null);
    }
  };

  const handleCloudUploadAll = async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatus('Mengunggah data profil dan progres ke database...');
    try {
      if (profile) {
        await FirebaseSyncService.syncProfileToCloud(profile);
      }
      await FirebaseSyncService.syncLevelProgressToCloud(levelProgress);
      setCloudSyncStatus('✓ Data profil dan level berhasil disinkronkan ke database cloud!');
    } catch (err) {
      console.error(err);
      setCloudSyncStatus('Gagal menyinkronkan data ke cloud. Periksa koneksi internet.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleCloudDownloadAll = async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatus('Memeriksa dan memuat data dari database...');
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
        setCloudSyncStatus('✓ Berhasil memulihkan data siswa dari database cloud!');
      } else {
        setCloudSyncStatus('Belum ada data cadangan di database untuk akun ini.');
      }
    } catch (err) {
      console.error(err);
      setCloudSyncStatus('Gagal memuat data dari database. Pastikan koneksi aktif.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const result = await testFirebaseConnection();
      setFirebaseTestResult(result);
    } catch (err: unknown) {
      console.error(err);
      setFirebaseTestResult({
        connected: false,
        message: err instanceof Error ? err.message : 'Uji koneksi gagal',
        projectId: 'database-service',
        database: '(default)',
        latencyMs: 0
      });
    } finally {
      setIsTestingFirebase(false);
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

  const handleLockToStudentLevel = () => {
    const baseLevel = profile?.startingLevel || profile?.currentLevel || '6A';
    const cleanProg = generateCleanLevelProgress(baseLevel, true);
    saveStoredLevelProgress(cleanProg);
    onProgressUpdated(cleanProg);
    setActionSuccessNotice(`Level telah dikunci ulang sesuai level siswa saat ini (${baseLevel})`);
    setTimeout(() => setActionSuccessNotice(null), 3500);
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

  // Filter and search accounts
  const filteredAccounts = accounts.filter(acc => {
    if (accountsFilter !== 'all' && acc.status !== accountsFilter) return false;
    if (accountsSearch.trim()) {
      const q = accountsSearch.toLowerCase();
      const matchName = acc.name?.toLowerCase().includes(q);
      const matchUser = acc.username?.toLowerCase().includes(q);
      const matchSchool = acc.school?.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchSchool) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="flex flex-col w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-300 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Panel Pengajar / Guru Admin</h3>
                <span className="px-2 py-0.5 bg-indigo-800/80 text-indigo-200 text-[10px] font-bold rounded-md border border-indigo-700">
                  Database Cloud Live
                </span>
              </div>
              <p className="text-xs text-indigo-300">Persetujuan Siswa, Kontrol 18 Level & Manajemen Database</p>
            </div>
          </div>

          <button
            id="admin-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 sm:px-6 pt-2 overflow-x-auto">
          {[
            { 
              id: 'approvals', 
              label: 'Akun Siswa & Status Akun', 
              icon: Users,
              badge: pendingCount > 0 ? pendingCount : null
            },
            { id: 'levels', label: 'Buka / Kunci 18 Level', icon: Unlock },
            { id: 'backup', label: 'Sinkronisasi & Cadangan', icon: Database },
            { id: 'info', label: 'Kode Akses & Info', icon: KeyRound }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* Success Notice */}
          {actionSuccessNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: PERSETUJUAN PENDAFTARAN SISWA (APPROVE / REJECT) */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              
              {/* Header metrics card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Terdaftar</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{accounts.length}</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase">Menunggu (Pending)</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase">Disetujui (Approved)</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {accounts.filter(a => a.status === 'approved').length}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block uppercase">Ditolak (Rejected)</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                    {accounts.filter(a => a.status === 'rejected').length}
                  </span>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pending', label: `Pending (${pendingCount})` },
                    { id: 'approved', label: 'Disetujui' },
                    { id: 'rejected', label: 'Ditolak' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAccountsFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        accountsFilter === f.id
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={accountsSearch}
                    onChange={(e) => setAccountsSearch(e.target.value)}
                    placeholder="Cari nama, username, sekolah..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Account list */}
              {filteredAccounts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Belum Ada Data Pendaftaran</h5>
                  <p className="text-xs text-slate-500">
                    Siswa yang mendaftar melalui menu login akan otomatis tampil di sini secara real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredAccounts.map((acc) => {
                    const isPending = acc.status === 'pending';
                    const isApproved = acc.status === 'approved';
                    const isRejected = acc.status === 'rejected';
                    const isProcessing = processingUsername === acc.username;

                    return (
                      <div
                        key={acc.username}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isPending 
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs' 
                            : isApproved
                            ? 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 opacity-80'
                        }`}
                      >
                        {/* Student Details */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {acc.avatar || '🦊'}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{acc.name}</h4>
                              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                @{acc.username}
                              </span>
                              
                              {/* Status Badge */}
                              {isPending && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Disetujui
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Ditolak
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" />
                                {acc.grade || 'SD'}
                              </span>
                              {acc.school && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {acc.school}
                                </span>
                              )}
                              <span>
                                Terdaftar: {new Date(acc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              {acc.currentLevel && (
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  Level: {acc.currentLevel}
                                </span>
                              )}
                            </div>

                            {/* Rejection Note if exists */}
                            {isRejected && acc.rejectionReason && (
                              <p className="text-[11px] text-rose-700 dark:text-rose-300 italic pt-0.5">
                                Alasan Ditolak: "{acc.rejectionReason}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: APPROVE & REJECT */}
                        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0">
                          {isPending && (
                            <>
                              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-1">Level:</span>
                                <select
                                  value={approvalLevelChoices[acc.username] || '6A'}
                                  onChange={(e) => {
                                    setApprovalLevelChoices(prev => ({
                                      ...prev,
                                      [acc.username]: e.target.value as KumonLevelId
                                    }));
                                  }}
                                  className="text-xs font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                                >
                                  {KUMON_LEVEL_ORDER.map(lvl => (
                                    <option key={lvl} value={lvl}>Level {lvl}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                id={`approve-btn-${acc.username}`}
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleApprove(acc.username)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>

                              <button
                                id={`reject-btn-${acc.username}`}
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setRejectModalAccount(acc)}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <>
                              <div className="flex items-center gap-1 bg-indigo-50/70 dark:bg-indigo-950/40 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800" title="Ubah level siswa dan kalibrasi level terbuka">
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 pl-1">Level:</span>
                                <select
                                  disabled={isProcessing}
                                  value={acc.currentLevel || acc.startingLevel || '6A'}
                                  onChange={(e) => handleUpdateStudentLevel(acc.username, e.target.value as KumonLevelId)}
                                  className="text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-lg px-2 py-1 border border-indigo-200 dark:border-indigo-800 outline-none cursor-pointer"
                                >
                                  {KUMON_LEVEL_ORDER.map(lvl => (
                                    <option key={lvl} value={lvl}>Level {lvl}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleResetToPending(acc.username)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                title="Kembalikan status ke Pending"
                              >
                                Ubah ke Pending
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => setRejectModalAccount(acc)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                                title="Batalkan Persetujuan (Tolak)"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(acc.username)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Setujui Ulang</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDeleteAccount(acc.username)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEVEL UNLOCK & MASTER */}
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

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Manajemen Status 18 Level Kurikulum</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Guru dapat membuka/mengunci level secara instan untuk kebutuhan pengajaran.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLockToStudentLevel}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    title="Kunci semua level di atas level siswa saat ini"
                  >
                    Kunci Sesuai Level Siswa
                  </button>
                  <button
                    type="button"
                    onClick={handleUnlockAll}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Buka Semua (6A – M)
                  </button>
                </div>
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
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'
                          : 'bg-slate-100/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">Level {lvl}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLevel(lvl)}
                            className={`p-1 rounded-md text-xs font-bold cursor-pointer ${
                              isUnlocked
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title={isUnlocked ? 'Kunci Level' : 'Buka Level'}
                          >
                            {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleMastered(lvl)}
                            className={`p-1 rounded-md text-xs font-bold cursor-pointer ${
                              isMastered
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                            }`}
                            title={isMastered ? 'Tandai Belum Lulus' : 'Tandai Lulus (Bintang)'}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">{info.name}</p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{info.category}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reset pretest option */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Uji Ulang Pretest Diagnostik</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Mereset hasil tes diagnostik agar siswa dapat mengikuti pretest lagi.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPretestOnly}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Ulangi Pretest
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & CLOUD */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* Database Cloud Card */}
              <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Database Cloud Terpusat</h4>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Sinkronisasi & basis data akun siswa terpusat</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    Online & Terhubung
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Data latihan, profil, registrasi akun siswa, dan hasil pretest otomatis tersimpan di database cloud.
                </p>

                {cloudSyncStatus && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-xs font-semibold text-indigo-900 dark:text-indigo-200 shadow-2xs">
                    {cloudSyncStatus}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestFirebase}
                    disabled={isTestingFirebase}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isTestingFirebase ? 'animate-spin' : ''}`} />
                    <span>{isTestingFirebase ? 'Menguji Ping...' : 'Uji Koneksi Database'}</span>
                  </button>

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
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CloudDownload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Pulihkan dari Cloud</span>
                  </button>
                </div>

                {firebaseTestResult && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                    firebaseTestResult.connected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}>
                    {firebaseTestResult.connected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">{firebaseTestResult.message}</div>
                      <div className="text-[11px] opacity-85">
                        Project ID: <span className="font-mono font-semibold">{firebaseTestResult.projectId}</span> | Database: <span className="font-mono font-semibold">{firebaseTestResult.database}</span> | Latensi: <span className="font-mono font-semibold">{firebaseTestResult.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Ekspor & Impor File JSON</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cadangan berkas JSON mandiri untuk arsip offline.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan (JSON)</span>
                </button>
              </div>

              {/* Import box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Impor Cadangan JSON</label>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Tempel teks JSON cadangan di sini..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {importStatus && (
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">{importStatus}</p>
                )}
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Terapkan Impor</span>
                </button>
              </div>

              {/* Dangerous Reset */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Reset Total Data Perangkat
                </h5>
                <p className="text-[11px] text-rose-800 dark:text-rose-300">
                  Tindakan ini akan mereset cache profil dan sesi latihan lokal di perangkat ini.
                </p>

                {confirmReset ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllDeviceData();
                        onResetAll();
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Ya, Hapus Semua Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-300 dark:border-rose-700 transition-colors cursor-pointer"
                  >
                    Reset Seluruh Data
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
                    Password Master Admin &amp; Guru
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-700 font-mono text-base font-bold text-white rounded-xl shadow-xs">
                      {ADMIN_PASSWORD}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Login sebagai <code className="font-bold">admin</code> dengan password ini untuk akses penuh dan persetujuan siswa.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-200/70 dark:border-indigo-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                    Alur Pendaftaran &amp; Persetujuan Siswa
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    1. Siswa mendaftar di tab "Daftar Akun Baru" pada menu login dengan username &amp; password.<br />
                    2. Akun masuk ke daftar antrean persetujuan (Status: Pending).<br />
                    3. Guru / Admin membuka tab <strong>"Persetujuan Pendaftaran"</strong> pada panel ini dan menekan tombol <strong>"Setujui (Approve)"</strong> atau <strong>"Tolak (Reject)"</strong>.<br />
                    4. Siswa yang disetujui dapat langsung login dan mulai belajar.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Struktur 18 Level Kurikulum (6A – M)</h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
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

      {/* REJECT CONFIRMATION MODAL POPUP */}
      {rejectModalAccount && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Tolak Pendaftaran Siswa</h4>
                <p className="text-xs text-slate-500">
                  Akun @{rejectModalAccount.username} ({rejectModalAccount.name})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Alasan Penolakan (akan ditampilkan kepada siswa saat login):
              </label>
              <textarea
                rows={3}
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Contoh: Belum terdaftar secara resmi di les / Nama tidak sesuai..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Konfirmasi Tolak Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
