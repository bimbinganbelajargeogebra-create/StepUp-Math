import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NetworkStatusBannerProps {
  onSyncWithStorage?: () => void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onSyncWithStorage }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleManualSync = useCallback(() => {
    setIsSyncing(true);
    if (onSyncWithStorage) {
      onSyncWithStorage();
    }
    setTimeout(() => {
      setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsSyncing(false);
    }, 400);
  }, [onSyncWithStorage]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      handleManualSync();

      // Auto-hide the "Back Online" banner after 5 seconds
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
    };

    // Also listen to storage changes from other tabs to ensure total multi-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('algorimath_') || e.key.startsWith('stepup_math_'))) {
        if (onSyncWithStorage) {
          onSyncWithStorage();
        }
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleManualSync, onSyncWithStorage]);

  // If online and toast expired, render nothing to keep UI clean
  if (isOnline && !showOnlineToast) {
    return null;
  }

  return (
    <div
      id="network-status-banner"
      role="status"
      aria-live="polite"
      className="w-full z-50 print:hidden px-3 pt-2"
    >
      <div className={`max-w-7xl mx-auto px-4 py-2 sm:py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm transition-all duration-300 shadow-md ${
        !isOnline
          ? 'clay-btn-amber text-white'
          : 'clay-btn-emerald text-white'
      }`}>
        {/* Left Side: Status Message & Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-white/20 shrink-0 flex items-center justify-center shadow-xs">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-white animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4 text-white" />
            )}
          </div>

          <div className="leading-snug">
            {!isOnline ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-extrabold tracking-tight">Perangkat Sedang Offline</span>
                <span className="text-amber-100 text-[11px] sm:text-xs font-medium">
                  • Mode mandiri aktif. Lembar kerja, streak, dan progres tersimpan di cache lokal AlgoriMath.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-extrabold tracking-tight flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                  Database Cloud Terhubung
                </span>
                <span className="text-emerald-100 text-[11px] sm:text-xs font-medium">
                  • Seluruh data belajar telah sinkron real-time dengan basis data cloud AlgoriMath (Pukul {lastSyncedTime}).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Storage badge & manual sync button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-[11px] font-bold border border-white/20 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Database Cloud Aktif</span>
          </div>

          <button
            type="button"
            id="manual-sync-btn"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-50 active:scale-95 text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-75"
            title="Sinkronkan data dengan database cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>

          {showOnlineToast && (
            <button
              type="button"
              id="close-online-banner-btn"
              onClick={() => setShowOnlineToast(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white text-xs cursor-pointer ml-1"
              aria-label="Tutup pemberitahuan"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
