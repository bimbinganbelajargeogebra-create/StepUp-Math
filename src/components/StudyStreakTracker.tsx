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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-900 dark:text-amber-200">
        <div className="relative flex items-center justify-center">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-black">{streakCount} Hari Streak</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/5 dark:from-amber-950/40 dark:via-slate-900 dark:to-indigo-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Fire Animation & Streak Count */}
        <div className="flex items-center gap-3.5">
          {/* Animated Fire Icon Container */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 text-white overflow-hidden group">
            {/* Ambient fire glow background */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-600 via-rose-500 to-amber-300 opacity-90 animate-pulse" />
            
            {/* Animated Flame Icon */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Flame className="w-8 h-8 fill-amber-200 text-white drop-shadow-md animate-bounce transform duration-700" />
            </div>

            {/* Sparkle particles */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-200 animate-ping" />
            <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-200 opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Study Streak Tracker
              </span>
              {hasStudiedToday && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Hari Ini Selesai
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                {streakCount}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300">
                Hari Beruntun
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                • {title}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug max-w-md">
              {motivationalMessage}
            </p>
          </div>
        </div>

        {/* Right Side: Weekly Activity Tracker (7 Days) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/60 dark:border-slate-800 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Aktivitas Pekan Ini
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
              Target: <strong className="text-slate-800 dark:text-slate-200">{nextMilestone} Hari</strong>
            </span>
          </div>

          {/* 7 Days Circles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              return (
                <div
                  key={day.dateString}
                  className={`flex flex-col items-center justify-center w-8 sm:w-9 h-11 rounded-lg text-center transition-all ${
                    day.isCompleted
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-xs font-bold scale-105'
                      : day.isToday
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-2 border-amber-500 font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 font-medium'
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

          {/* Small progress bar toward next milestone */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Menuju Lencana {nextMilestone} Hari</span>
              <span>{progressToNext}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
