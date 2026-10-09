import React, { useMemo } from 'react';
import { 
  Flame, 
  Calendar, 
  Check, 
  Sparkles, 
  Trophy, 
  Target, 
  Clock, 
  ChevronRight,
  Zap,
  Award
} from 'lucide-react';
import { StudentProfile, WorksheetSessionResult } from '../types';

interface StudyStreakTrackerProps {
  profile: StudentProfile;
  sessions: WorksheetSessionResult[];
  onStartPractice?: () => void;
  compact?: boolean;
}

export const StudyStreakTracker: React.FC<StudyStreakTrackerProps> = ({
  profile,
  sessions,
  onStartPractice,
  compact = false
}) => {
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Compute active dates from sessions
  const activeDatesSet = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      const d = new Date(s.timestamp).toISOString().split('T')[0];
      set.add(d);
    });
    if (profile.lastStudyDate) {
      set.add(profile.lastStudyDate);
    }
    return set;
  }, [sessions, profile.lastStudyDate]);

  const hasStudiedToday = activeDatesSet.has(todayStr);

  // Compute current week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    // Calculate difference to Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const isToday = dateString === todayStr;
      const isPast = d < now && !isToday;
      const isCompleted = activeDatesSet.has(dateString);

      days.push({
        name: dayNames[i],
        date: d.getDate(),
        dateString,
        isToday,
        isPast,
        isCompleted
      });
    }
    return days;
  }, [todayStr, activeDatesSet]);

  const streakCount = profile.streakDays || (hasStudiedToday ? 1 : 0);

  // Determine streak tier and motivational message
  const { title, motivationalMessage, nextMilestone, progressToNext } = useMemo(() => {
    let next = 3;
    if (streakCount >= 30) next = 50;
    else if (streakCount >= 14) next = 30;
    else if (streakCount >= 7) next = 14;
    else if (streakCount >= 3) next = 7;

    const progress = Math.min(100, Math.round((streakCount / next) * 100));

    let msg = 'Selesaikan 1 lembar kerja hari ini untuk menyalakan api streak!';
    if (hasStudiedToday) {
      if (streakCount >= 14) {
        msg = 'Luar biasa! Dedikasi dan ketelitian Anda setara dengan siswa berprestasi tingkat tinggi!';
      } else if (streakCount >= 7) {
        msg = 'Hebat! 1 pekan penuh latihan konsisten, daya hitung Anda semakin tajam!';
      } else if (streakCount >= 3) {
        msg = 'Keren! Pertahankan ritme latihan harian ini untuk penguasaan matematika mandiri!';
      } else {
        msg = 'Bagus sekali! Latihan hari ini sudah tuntas. Datang lagi besok untuk melanjutkan streak!';
      }
    } else if (streakCount > 0) {
      msg = `Streak ${streakCount} hari Anda sedang aktif! Selesaikan latihan hari ini agar api tidak padam.`;
    }

    return {
      title: streakCount >= 14 ? 'Matematikawan Tangguh' : streakCount >= 7 ? 'Pejuang Konsisten' : streakCount >= 3 ? 'Pembelajar Rajin' : 'Langkah Awal',
      motivationalMessage: msg,
      nextMilestone: next,
      progressToNext: progress
    };
  }, [streakCount, hasStudiedToday]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 clay-card-sm rounded-full text-amber-900 dark:text-amber-200 select-none shadow-sm">
        <div className="relative flex items-center justify-center">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-black tracking-tight">{streakCount} Hari Streak</span>
      </div>
    );
  }

  return (
    <div className="clay-card rounded-3xl p-5 sm:p-6 transition-all relative overflow-hidden">
      {/* Soft warm clay ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* Left Side: Fire Animation & Streak Count */}
        <div className="flex items-center gap-4">
          {/* Clay Fire Icon Container */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center clay-btn-amber shrink-0 text-white overflow-hidden group">
            {/* Ambient fire glow background */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-600 via-rose-500 to-amber-300 opacity-90 animate-pulse" />
            
            {/* Animated Flame Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Flame className="w-8 h-8 fill-amber-100 text-white drop-shadow-md animate-bounce transform duration-700" />
            </div>

            {/* Sparkle particles */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-200 animate-ping" />
            <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-200 opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 clay-badge text-amber-800 dark:text-amber-300 rounded-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Streak Belajar Aktif
              </span>
              {hasStudiedToday && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 clay-badge rounded-xl flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Hari Ini Selesai
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                {streakCount}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300">
                Hari Beruntun
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                • {title}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug max-w-md">
              {motivationalMessage}
            </p>
          </div>
        </div>

        {/* Right Side: Weekly Activity Tracker (7 Days) */}
        <div className="clay-card-sm p-3.5 rounded-2xl flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Aktivitas Pekan Ini
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">
              Target: <strong className="text-slate-800 dark:text-slate-200">{nextMilestone} Hari</strong>
            </span>
          </div>

          {/* 7 Days Clay Circles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              return (
                <div
                  key={day.dateString}
                  className={`flex flex-col items-center justify-center w-8 sm:w-9 h-11 rounded-xl text-center transition-all ${
                    day.isCompleted
                      ? 'clay-btn-amber text-white font-bold scale-105'
                      : day.isToday
                      ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-2 border-amber-500 font-extrabold shadow-sm'
                      : 'clay-inset text-slate-400 dark:text-slate-500 font-medium'
                  }`}
                  title={`${day.name} (${day.date}): ${day.isCompleted ? 'Latihan Selesai ✓' : day.isToday ? 'Hari ini' : 'Belum latihan'}`}
                >
                  <span className="text-[9px] uppercase tracking-tighter opacity-80">{day.name}</span>
                  <div className="text-[11px] font-mono leading-none mt-0.5">
                    {day.isCompleted ? (
                      <Flame className="w-3.5 h-3.5 mx-auto fill-white text-white animate-pulse" />
                    ) : (
                      <span>{day.date}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clay progress bar toward next milestone */}
          <div className="space-y-1.5 pt-0.5">
            <div className="w-full clay-progress-track h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
              <span>Menuju Lencana {nextMilestone} Hari</span>
              <span>{progressToNext}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
