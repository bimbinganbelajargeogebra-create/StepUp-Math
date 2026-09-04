import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import {
  BarChart3,
  Award,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  ChevronRight,
  Info,
  Filter
} from 'lucide-react';
import { KumonLevelId, LevelProgress, StudentProfile, WorksheetSessionResult } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';

interface StudentLevelProgressChartProps {
  profile: StudentProfile;
  levelProgress?: Record<KumonLevelId, LevelProgress>;
  sessions?: WorksheetSessionResult[];
  className?: string;
  onSelectLevel?: (levelId: KumonLevelId) => void;
}

type ViewMetric = 'worksheets' | 'percentage' | 'composed';
type CategoryFilter = 'all' | 'unlocked' | 'Pra-Sekolah' | 'SD Dasar' | 'SD Lanjut' | 'SMP & SMA';

export const StudentLevelProgressChart: React.FC<StudentLevelProgressChartProps> = ({
  profile,
  levelProgress,
  sessions = [],
  className = '',
  onSelectLevel
}) => {
  const [metricView, setMetricView] = useState<ViewMetric>('worksheets');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedLevelId, setSelectedLevelId] = useState<KumonLevelId | null>(null);

  // Compile aggregated data for all 18 levels
  const fullLevelData = useMemo(() => {
    return KUMON_LEVEL_ORDER.map((levelId, index) => {
      const levelMeta = KUMON_LEVELS[levelId];
      const prog = levelProgress ? levelProgress[levelId] : undefined;

      // Extract unique completed worksheet numbers from progress object and sessions
      const progressCompleted = prog?.completedWorksheets || [];
      const sessionCompleted = sessions
        .filter((s) => s.levelId === levelId && s.score >= 70)
        .map((s) => s.worksheetNum);

      const uniqueCompletedSet = new Set<number>([
        ...progressCompleted,
        ...sessionCompleted
      ]);
      const completedList = Array.from(uniqueCompletedSet).sort((a, b) => a - b);
      const completedCount = Math.min(10, completedList.length);

      // Average score calculation for this level
      const levelSessions = sessions.filter((s) => s.levelId === levelId);
      let avgScore = 0;
      if (levelSessions.length > 0) {
        const sum = levelSessions.reduce((acc, s) => acc + s.score, 0);
        avgScore = Math.round(sum / levelSessions.length);
      } else if (prog?.highestScores && Object.keys(prog.highestScores).length > 0) {
        const scores = Object.values(prog.highestScores);
        avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }

      const isMastered = prog?.mastered || completedCount === 10;
      const isCurrentLevel = profile.currentLevel === levelId || profile.lastStudiedLevel === levelId;
      const isStartingLevel = profile.startingLevel === levelId;

      // Unlock status
      let isUnlocked = Boolean(prog?.unlocked);
      if (!isUnlocked && (isCurrentLevel || isStartingLevel || completedCount > 0)) {
        isUnlocked = true;
      }
      if (profile.isAdmin) {
        isUnlocked = true;
      }

      // Progress percentage (0 - 100%)
      const completionPercent = Math.round((completedCount / 10) * 100);

      // Status label
      let statusLabel: 'Master' | 'Sedang Belajar' | 'Terbuka' | 'Terkunci';
      if (isMastered) {
        statusLabel = 'Master';
      } else if (completedCount > 0) {
        statusLabel = 'Sedang Belajar';
      } else if (isUnlocked) {
        statusLabel = 'Terbuka';
      } else {
        statusLabel = 'Terkunci';
      }

      return {
        levelId,
        order: index + 1,
        name: levelMeta.name,
        category: levelMeta.category,
        totalWorksheets: 10,
        completedCount,
        remainingCount: 10 - completedCount,
        completionPercent,
        avgScore,
        isMastered,
        isUnlocked,
        isCurrentLevel,
        isStartingLevel,
        statusLabel,
        completedList,
        targetSkill: levelMeta.targetSkill
      };
    });
  }, [profile, levelProgress, sessions]);

  // Filtered dataset for Recharts
  const chartData = useMemo(() => {
    return fullLevelData.filter((item) => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'unlocked') return item.isUnlocked || item.completedCount > 0;
      if (categoryFilter === 'Pra-Sekolah') return item.category === 'Pra-Sekolah';
      if (categoryFilter === 'SD Dasar') return item.category === 'SD Dasar';
      if (categoryFilter === 'SD Lanjut') return item.category === 'SD Lanjut';
      if (categoryFilter === 'SMP & SMA') {
        return (
          item.category === 'SMP Aljabar' ||
          item.category === 'SMA Aljabar & Fungsi' ||
          item.category === 'SMA Kalkulus'
        );
      }
      return true;
    });
  }, [fullLevelData, categoryFilter]);

  // Overall curriculum summary metrics
  const totalCompletedWorksheets = useMemo(() => {
    return fullLevelData.reduce((acc, item) => acc + item.completedCount, 0);
  }, [fullLevelData]);

  const totalMasteredLevels = useMemo(() => {
    return fullLevelData.filter((item) => item.isMastered).length;
  }, [fullLevelData]);

  const overallProgressPercentage = Math.round((totalCompletedWorksheets / 180) * 100);

  const activeLevelData = useMemo(() => {
    if (selectedLevelId) {
      return fullLevelData.find((item) => item.levelId === selectedLevelId);
    }
    return (
      fullLevelData.find((item) => item.levelId === profile.currentLevel) ||
      fullLevelData.find((item) => item.levelId === profile.startingLevel) ||
      fullLevelData[0]
    );
  }, [selectedLevelId, fullLevelData, profile]);

  // Color generator for bars
  const getBarColor = (item: (typeof fullLevelData)[0]) => {
    if (item.isMastered) return '#10b981'; // Emerald 500
    if (item.isCurrentLevel) return '#6366f1'; // Indigo 500
    if (item.completedCount > 0) return '#3b82f6'; // Blue 500
    if (item.isUnlocked) return '#94a3b8'; // Slate 400
    return '#cbd5e1'; // Light Slate 300
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as (typeof fullLevelData)[0];
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs min-w-[220px] max-w-[280px] backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs">
                Level {data.levelId}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{data.category}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                data.isMastered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : data.completedCount > 0
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : data.isUnlocked
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-rose-500/10 text-rose-300'
              }`}
            >
              {data.statusLabel}
            </span>
          </div>

          <p className="font-bold text-slate-100 text-xs mb-2 leading-snug">{data.name}</p>

          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Lembar Kerja Tuntas:</span>
              <span className="font-bold text-white">
                {data.completedCount} / {data.totalWorksheets} lembar ({data.completionPercent}%)
              </span>
            </div>

            {data.avgScore > 0 && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Rata-rata Skor:</span>
                <span className={`font-bold ${data.avgScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {data.avgScore} / 100
                </span>
              </div>
            )}

            <div className="pt-1.5 mt-1 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 mb-1 font-semibold">Lembar Selesai:</div>
              {data.completedList.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {data.completedList.map((num) => (
                    <span
                      key={num}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] font-semibold"
                    >
                      #{num}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 italic">Belum ada lembar yang diselesaikan</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="student-level-progress-chart-card"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 ${className}`}
    >
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Grafik Kemajuan Lembar Kerja per Level
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualisasi target pengerjaan 10 lembar kerja pada 18 level kurikulum matematika mandiri.
          </p>
        </div>

        {/* View Metric Toggles */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricView('worksheets')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricView === 'worksheets'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Jumlah Lembar (0–10)
          </button>
          <button
            type="button"
            onClick={() => setMetricView('percentage')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricView === 'percentage'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Persentase (%)
          </button>
          <button
            type="button"
            onClick={() => setMetricView('composed')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metricView === 'composed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Lembar + Skor
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Total Lembar Selesai</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">
              {totalCompletedWorksheets}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/ 180</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgressPercentage)}%` }}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Level Tuntas (Master)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {totalMasteredLevels}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/ 18 Level</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {totalMasteredLevels >= 18 ? 'Kurikulum Selesai!' : `${18 - totalMasteredLevels} level berikutnya`}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>Level Belajar Aktif</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              Level {profile.currentLevel || profile.startingLevel || '6A'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {KUMON_LEVELS[profile.currentLevel || '6A']?.name || 'Kurikulum Mandiri'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Persentase Kurikulum</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              {overallProgressPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Tercapai</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {totalCompletedWorksheets} lembar diverifikasi
          </p>
        </div>
      </div>

      {/* Filter Tabs for Levels */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" />
          Filter:
        </span>
        {(
          [
            { id: 'all', label: 'Semua (18)' },
            { id: 'unlocked', label: 'Terbuka / Aktif' },
            { id: 'Pra-Sekolah', label: 'Pra-Sekolah (6A–2A)' },
            { id: 'SD Dasar', label: 'SD Dasar (A–C)' },
            { id: 'SD Lanjut', label: 'SD Lanjut (D–F)' },
            { id: 'SMP & SMA', label: 'SMP & SMA (G–M)' }
          ] as { id: CategoryFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-[11px] ${
              categoryFilter === tab.id
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Recharts Container */}
      <div className="h-[270px] sm:h-[300px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metricView === 'composed' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedLevel = e.activePayload[0].payload.levelId;
                  setSelectedLevelId(clickedLevel);
                  if (onSelectLevel) onSelectLevel(clickedLevel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.25} />
              <XAxis
                dataKey="levelId"
                stroke="#64748b"
                tick={{ fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                unit="%"
                stroke="#64748b"
                tick={{ fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
              <ReferenceLine
                yAxisId="left"
                y={10}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: 'Target 10', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 700 }}
              />
              <Bar
                yAxisId="left"
                dataKey="completedCount"
                name="Lembar Selesai"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.levelId}`}
                    fill={getBarColor(entry)}
                    stroke={selectedLevelId === entry.levelId ? '#4338ca' : 'none'}
                    strokeWidth={2}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                  />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgScore"
                name="Rata-rata Skor"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
            </ComposedChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedLevel = e.activePayload[0].payload.levelId;
                  setSelectedLevelId(clickedLevel);
                  if (onSelectLevel) onSelectLevel(clickedLevel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.25} />
              <XAxis
                dataKey="levelId"
                stroke="#64748b"
                tick={{ fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={metricView === 'worksheets' ? [0, 10] : [0, 100]}
                ticks={metricView === 'worksheets' ? [0, 2, 4, 6, 8, 10] : [0, 25, 50, 75, 100]}
                unit={metricView === 'percentage' ? '%' : ''}
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
              <ReferenceLine
                y={metricView === 'worksheets' ? 10 : 100}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: metricView === 'worksheets' ? 'Target Tuntas (10)' : '100% Selesai',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
              <Bar
                dataKey={metricView === 'worksheets' ? 'completedCount' : 'completionPercent'}
                name={metricView === 'worksheets' ? 'Lembar Selesai' : 'Persentase Progres'}
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.levelId}`}
                    fill={getBarColor(entry)}
                    stroke={selectedLevelId === entry.levelId ? '#4338ca' : 'none'}
                    strokeWidth={2}
                    className="transition-all duration-300 cursor-pointer hover:opacity-85"
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Color Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#10b981] inline-block shadow-xs" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Tuntas Master (10/10)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#6366f1] inline-block shadow-xs" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Level Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#3b82f6] inline-block shadow-xs" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Sedang Dikerjakan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#94a3b8] inline-block" />
            <span>Terbuka (0 Lembar)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#cbd5e1] dark:bg-slate-700 inline-block" />
            <span>Terkunci</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 italic">
          *Klik salah satu batang level untuk melihat rincian
        </span>
      </div>

      {/* Selected Level Quick Card */}
      {activeLevelData && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                activeLevelData.isMastered
                  ? 'bg-emerald-600'
                  : activeLevelData.isCurrentLevel
                  ? 'bg-indigo-600'
                  : activeLevelData.completedCount > 0
                  ? 'bg-blue-600'
                  : 'bg-slate-600'
              }`}
            >
              {activeLevelData.levelId}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                  Level {activeLevelData.levelId}: {activeLevelData.name}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">({activeLevelData.category})</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Target: {activeLevelData.targetSkill}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {activeLevelData.completedCount} / 10 Lembar Selesai
              </span>
              <span className="text-[10px] text-slate-500">
                {activeLevelData.completionPercent}% Tercapai
              </span>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                activeLevelData.isMastered
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : activeLevelData.completedCount > 0
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {activeLevelData.statusLabel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
