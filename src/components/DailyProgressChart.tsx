import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { WorksheetSessionResult } from '../types';

interface DailyProgressChartProps {
  sessions: WorksheetSessionResult[];
  className?: string;
}

interface DailyDataPoint {
  dateKey: string;
  displayDate: string;
  dayName: string;
  fullDate: string;
  worksheetsCount: number;
  totalTimeMinutes: number;
  totalTimeSeconds: number;
  avgTimePerSheetMinutes: number;
  avgScore: number;
  masteredCount: number;
  levels: string[];
}

// Generate realistic mock daily history for demo if student hasn't completed any sessions yet
const generateSampleDailyData = (): DailyDataPoint[] => {
  const points: DailyDataPoint[] = [];
  const now = new Date();
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const sampleCounts = [2, 3, 1, 4, 3, 5, 4];
  const sampleTimes = [12, 18, 6, 22, 16, 28, 20];
  const sampleScores = [95, 100, 90, 100, 90, 100, 100];
  const sampleMastered = [2, 3, 1, 4, 2, 5, 4];
  const sampleLevels = [['E'], ['E'], ['E'], ['E', 'F'], ['F'], ['F'], ['F']];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    const idx = 6 - i;

    points.push({
      dateKey,
      displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      dayName: dayNames[d.getDay()],
      fullDate: `${fullDayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      worksheetsCount: sampleCounts[idx],
      totalTimeMinutes: sampleTimes[idx],
      totalTimeSeconds: sampleTimes[idx] * 60,
      avgTimePerSheetMinutes: Number((sampleTimes[idx] / sampleCounts[idx]).toFixed(1)),
      avgScore: sampleScores[idx],
      masteredCount: sampleMastered[idx],
      levels: sampleLevels[idx],
    });
  }

  return points;
};

export const DailyProgressChart: React.FC<DailyProgressChartProps> = ({
  sessions,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '14days' | '30days' | 'all'>('7days');
  // Always default to real data. Only use sample data if explicitly turned on or when 0 sessions and user wants to preview
  const [useSampleData, setUseSampleData] = useState<boolean>(false);

  const hasRealData = sessions.length > 0;
  const isDisplayingReal = hasRealData && !useSampleData;

  // Group actual sessions by date
  const processedDailyData = useMemo(() => {
    if (!hasRealData && useSampleData) {
      return generateSampleDailyData();
    }

    if (!hasRealData) {
      // Return clean real empty 7-day range
      const emptyPoints: DailyDataPoint[] = [];
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      let daysCount = 7;
      if (timeRange === '14days') daysCount = 14;
      if (timeRange === '30days') daysCount = 30;

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        emptyPoints.push({
          dateKey,
          displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
          dayName: dayNames[d.getDay()],
          fullDate: `${fullDayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          worksheetsCount: 0,
          totalTimeMinutes: 0,
          totalTimeSeconds: 0,
          avgTimePerSheetMinutes: 0,
          avgScore: 0,
          masteredCount: 0,
          levels: [],
        });
      }
      return emptyPoints;
    }

    const map = new Map<string, {
      dateObj: Date;
      sessions: WorksheetSessionResult[];
    }>();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Fill days within the range so there are no empty gaps
    const sortedSessions = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
    const earliestTime = sortedSessions.length > 0 ? sortedSessions[0].timestamp : Date.now();
    const latestTime = Date.now();

    let daysToInclude = 7;
    if (timeRange === '14days') daysToInclude = 14;
    else if (timeRange === '30days') daysToInclude = 30;
    else if (timeRange === 'all') {
      const diffDays = Math.ceil((latestTime - earliestTime) / 86400000);
      daysToInclude = Math.max(7, diffDays + 1);
    }

    // Pre-populate days
    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date(latestTime - i * 86400000);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      map.set(key, { dateObj: d, sessions: [] });
    }

    // Add actual sessions
    sessions.forEach((s) => {
      const d = new Date(s.timestamp);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      if (map.has(key)) {
        map.get(key)!.sessions.push(s);
      } else {
        map.set(key, { dateObj: d, sessions: [s] });
      }
    });

    const result: DailyDataPoint[] = [];
    Array.from(map.entries())
      .sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime())
      .forEach(([key, val]) => {
        const d = val.dateObj;
        const count = val.sessions.length;
        const totalSec = val.sessions.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
        const totalMin = Number((totalSec / 60).toFixed(1));
        const totalScore = val.sessions.reduce((acc, curr) => acc + curr.score, 0);
        const mastered = val.sessions.filter((curr) => curr.isMastered).length;
        const distinctLevels = Array.from(new Set(val.sessions.map((curr) => curr.levelId)));

        result.push({
          dateKey: key,
          displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
          dayName: dayNames[d.getDay()],
          fullDate: `${fullDayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          worksheetsCount: count,
          totalTimeMinutes: totalMin,
          totalTimeSeconds: totalSec,
          avgTimePerSheetMinutes: count > 0 ? Number((totalMin / count).toFixed(1)) : 0,
          avgScore: count > 0 ? Math.round(totalScore / count) : 0,
          masteredCount: mastered,
          levels: distinctLevels,
        });
      });

    return result;
  }, [sessions, timeRange, useSampleData, hasRealData]);

  // Overall aggregate metrics
  const summaryMetrics = useMemo(() => {
    const totalSheets = processedDailyData.reduce((acc, curr) => acc + curr.worksheetsCount, 0);
    const totalMinutes = processedDailyData.reduce((acc, curr) => acc + curr.totalTimeMinutes, 0);
    const activeDaysCount = processedDailyData.filter((curr) => curr.worksheetsCount > 0).length;
    const avgSheetsPerActiveDay = activeDaysCount > 0 ? (totalSheets / activeDaysCount).toFixed(1) : '0';
    const avgTimePerActiveDay = activeDaysCount > 0 ? (totalMinutes / activeDaysCount).toFixed(1) : '0';
    const totalMastered = processedDailyData.reduce((acc, curr) => acc + curr.masteredCount, 0);

    return {
      totalSheets,
      totalMinutes: Number(totalMinutes.toFixed(1)),
      activeDaysCount,
      avgSheetsPerActiveDay,
      avgTimePerActiveDay,
      totalMastered,
    };
  }, [processedDailyData]);

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Custom Chart Tooltip
  const CustomDailyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2.5 min-w-[220px] backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {data.fullDate}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-400" />
                Lembar Kerja Selesai:
              </span>
              <span className="font-bold text-white text-sm">
                {data.worksheetsCount} lembar
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Total Waktu Belajar:
              </span>
              <span className="font-semibold text-emerald-300">
                {data.totalTimeMinutes} menit ({formatSeconds(data.totalTimeSeconds)})
              </span>
            </div>

            {data.worksheetsCount > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Rata-rata Waktu / Lembar:</span>
                  <span className="font-medium text-slate-200">{data.avgTimePerSheetMinutes} menit</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Rata-rata Akurasi:</span>
                  <span className={`font-bold ${data.avgScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data.avgScore}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Lembar Tuntas (Master):</span>
                  <span className="font-bold text-amber-400">
                    {data.masteredCount} / {data.worksheetsCount}
                  </span>
                </div>

                {data.levels.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Level yang Dikerjakan:</span>
                    <div className="flex gap-1">
                      {data.levels.map((lvl) => (
                        <span key={lvl} className="px-1.5 py-0.2 bg-indigo-900/80 text-indigo-200 rounded font-bold">
                          Lv {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {data.worksheetsCount === 0 && (
              <div className="text-[11px] text-slate-400 italic text-center py-1">
                Tidak ada latihan pada hari ini
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="daily-progress-chart-card"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors duration-200 ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Grafik Kemajuan Harian Siswa
              </h3>
              {hasRealData ? (
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Data Riil ({sessions.length} Sesi)
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full border border-slate-200 dark:border-slate-700">
                  {useSampleData ? 'Data Simulasi' : 'Belum Ada Sesi'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualisasi jumlah lembar kerja aktual yang diselesaikan vs total durasi waktu belajar harian.
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {(['7days', '14days', '30days', 'all'] as const).map((range) => {
            const labelMap = {
              '7days': '7 Hari',
              '14days': '14 Hari',
              '30days': '30 Hari',
              'all': 'Semua',
            };
            const isSelected = timeRange === range;
            return (
              <button
                key={range}
                type="button"
                id={`time-range-${range}-btn`}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {labelMap[range]}
              </button>
            );
          })}

          {!hasRealData && (
            <button
              type="button"
              id="toggle-daily-sample-data-btn"
              onClick={() => setUseSampleData(!useSampleData)}
              className={`ml-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                useSampleData
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {useSampleData ? 'Tampilkan Kosong' : 'Lihat Contoh'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Lembar Kerja */}
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Lembar</span>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {summaryMetrics.totalSheets} <span className="text-xs font-semibold text-slate-500">lbr</span>
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            ~{summaryMetrics.avgSheetsPerActiveDay} lbr / hari aktif
          </div>
        </div>

        {/* Total Waktu Belajar */}
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Waktu</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {summaryMetrics.totalMinutes} <span className="text-xs font-semibold text-slate-500">menit</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            ~{summaryMetrics.avgTimePerActiveDay} menit / hari aktif
          </div>
        </div>

        {/* Hari Aktif Belajar */}
        <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 space-y-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hari Aktif</span>
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {summaryMetrics.activeDaysCount} <span className="text-xs font-semibold text-slate-500">hari</span>
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Konsistensi latihan mandiri
          </div>
        </div>

        {/* Lembar Tuntas (Master) */}
        <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-1">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lulus Tuntas</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {summaryMetrics.totalMastered} <span className="text-xs font-semibold text-slate-500">lbr</span>
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            Nilai 100 & waktu ideal (SCT)
          </div>
        </div>
      </div>

      {/* Main Recharts Composed Chart (Bar: Lembar Kerja, Line: Waktu Belajar) */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processedDailyData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

            {/* X Axis: Date */}
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#cbd5e1', opacity: 0.3 }}
              tickLine={false}
            />

            {/* Left Y Axis: Jumlah Lembar Kerja */}
            <YAxis
              yAxisId="left"
              orientation="left"
              allowDecimals={false}
              domain={[0, 'dataMax + 2']}
              tick={{ fontSize: 11, fill: '#6366f1' }}
              axisLine={{ stroke: '#6366f1', opacity: 0.3 }}
              tickLine={false}
              label={{
                value: 'Lembar',
                angle: -90,
                position: 'insideLeft',
                offset: 20,
                style: { textAnchor: 'middle', fontSize: 10, fill: '#6366f1', fontWeight: 'bold' }
              }}
            />

            {/* Right Y Axis: Total Waktu Belajar (Menit) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 'dataMax + 5']}
              tick={{ fontSize: 11, fill: '#10b981' }}
              axisLine={{ stroke: '#10b981', opacity: 0.3 }}
              tickLine={false}
              label={{
                value: 'Menit',
                angle: 90,
                position: 'insideRight',
                offset: 20,
                style: { textAnchor: 'middle', fontSize: 10, fill: '#10b981', fontWeight: 'bold' }
              }}
            />

            <Tooltip content={<CustomDailyTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px', paddingTop: '0px' }}
              formatter={(value) => {
                if (value === 'worksheetsCount') return <span className="text-slate-700 dark:text-slate-300 font-semibold">Jumlah Lembar Kerja (Bar)</span>;
                if (value === 'totalTimeMinutes') return <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Waktu Belajar (Menit)</span>;
                return value;
              }}
            />

            {/* Bar: Jumlah Lembar Kerja */}
            <Bar
              yAxisId="left"
              dataKey="worksheetsCount"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />

            {/* Line: Total Waktu Belajar (Menit) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalTimeMinutes"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer / Caption */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            Bilah ungu menunjukkan <strong>kuantitas lembar kerja</strong> yang dituntaskan, dan garis hijau menunjukkan <strong>durasi belajar</strong> per hari.
          </span>
        </div>

        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Target Ideal: 2 – 5 lembar per hari
        </span>
      </div>
    </div>
  );
};
