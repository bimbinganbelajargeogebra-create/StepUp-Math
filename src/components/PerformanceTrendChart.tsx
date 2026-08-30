import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Filter,
  BarChart2,
  Calendar,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { WorksheetSessionResult, KumonLevelId } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';

interface PerformanceTrendChartProps {
  sessions: WorksheetSessionResult[];
  activeLevelId?: KumonLevelId | null;
  className?: string;
}

// Sample dataset for demonstration when student has few or no sessions yet
const SAMPLE_SESSIONS: WorksheetSessionResult[] = [
  {
    id: 'demo-1',
    levelId: 'E',
    worksheetNum: 1,
    timestamp: Date.now() - 6 * 86400000,
    totalQuestions: 10,
    correctCount: 8,
    score: 80,
    timeSpentSeconds: 420,
    standardTimeSeconds: 300,
    isMastered: false,
    answers: []
  },
  {
    id: 'demo-2',
    levelId: 'E',
    worksheetNum: 1,
    timestamp: Date.now() - 5 * 86400000,
    totalQuestions: 10,
    correctCount: 9,
    score: 90,
    timeSpentSeconds: 340,
    standardTimeSeconds: 300,
    isMastered: false,
    answers: []
  },
  {
    id: 'demo-3',
    levelId: 'E',
    worksheetNum: 2,
    timestamp: Date.now() - 4 * 86400000,
    totalQuestions: 10,
    correctCount: 9,
    score: 90,
    timeSpentSeconds: 290,
    standardTimeSeconds: 300,
    isMastered: true,
    answers: []
  },
  {
    id: 'demo-4',
    levelId: 'E',
    worksheetNum: 3,
    timestamp: Date.now() - 3 * 86400000,
    totalQuestions: 10,
    correctCount: 10,
    score: 100,
    timeSpentSeconds: 240,
    standardTimeSeconds: 300,
    isMastered: true,
    answers: []
  },
  {
    id: 'demo-5',
    levelId: 'F',
    worksheetNum: 1,
    timestamp: Date.now() - 2 * 86400000,
    totalQuestions: 10,
    correctCount: 9,
    score: 90,
    timeSpentSeconds: 360,
    standardTimeSeconds: 360,
    isMastered: true,
    answers: []
  },
  {
    id: 'demo-6',
    levelId: 'F',
    worksheetNum: 2,
    timestamp: Date.now() - 1 * 86400000,
    totalQuestions: 10,
    correctCount: 10,
    score: 100,
    timeSpentSeconds: 280,
    standardTimeSeconds: 360,
    isMastered: true,
    answers: []
  },
  {
    id: 'demo-7',
    levelId: 'F',
    worksheetNum: 3,
    timestamp: Date.now() - 12 * 3600000,
    totalQuestions: 10,
    correctCount: 10,
    score: 100,
    timeSpentSeconds: 220,
    standardTimeSeconds: 360,
    isMastered: true,
    answers: []
  }
];

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  sessions,
  activeLevelId,
  className = '',
}) => {
  const [metricTab, setMetricTab] = useState<'accuracy' | 'time' | 'combined'>('combined');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [useSampleData, setUseSampleData] = useState<boolean>(sessions.length === 0);

  // Auto switch sample toggle if sessions change
  const currentDataSource = useMemo(() => {
    if (useSampleData || sessions.length === 0) {
      return SAMPLE_SESSIONS;
    }
    return sessions;
  }, [sessions, useSampleData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    let list = [...currentDataSource];
    if (selectedLevelFilter !== 'all') {
      list = list.filter((s) => s.levelId === selectedLevelFilter);
    }
    // Sort chronologically ascending for the chart
    list.sort((a, b) => a.timestamp - b.timestamp);

    return list.map((session, index) => {
      const dateObj = new Date(session.timestamp);
      const dateLabel = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
      const timeMinutes = Number((session.timeSpentSeconds / 60).toFixed(1));
      const standardMinutes = Number((session.standardTimeSeconds / 60).toFixed(1));

      return {
        index: index + 1,
        sessionId: session.id,
        levelId: session.levelId,
        worksheetNum: session.worksheetNum,
        label: `#${index + 1} (Lv ${session.levelId})`,
        shortLabel: `S${index + 1}`,
        dateLabel,
        score: session.score,
        timeSpentSeconds: session.timeSpentSeconds,
        standardTimeSeconds: session.standardTimeSeconds,
        timeMinutes,
        standardMinutes,
        isMastered: session.isMastered,
        correctCount: session.correctCount,
        totalQuestions: session.totalQuestions,
      };
    });
  }, [currentDataSource, selectedLevelFilter]);

  // Key KPI stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgScore: 0,
        avgTimeSec: 0,
        masteryRate: 0,
        totalSessions: 0,
      };
    }

    const totalScore = filteredData.reduce((acc, curr) => acc + curr.score, 0);
    const totalTime = filteredData.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
    const masteredCount = filteredData.filter((curr) => curr.isMastered).length;

    return {
      avgScore: Math.round(totalScore / filteredData.length),
      avgTimeSec: Math.round(totalTime / filteredData.length),
      masteryRate: Math.round((masteredCount / filteredData.length) * 100),
      totalSessions: filteredData.length,
    };
  }, [filteredData]);

  // Distinct levels present in data
  const availableLevels = useMemo(() => {
    const set = new Set(currentDataSource.map((s) => s.levelId));
    return Array.from(set);
  }, [currentDataSource]);

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  // Custom Chart Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[200px] backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <span className="font-bold text-indigo-300">
              Sesi #{data.index} • Level {data.levelId}
            </span>
            <span className="text-[10px] text-slate-400">{data.dateLabel}</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Lembar Kerja:</span>
              <span className="font-semibold text-white">Lembar #{data.worksheetNum}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300">Akurasi / Skor:</span>
              <span className={`font-bold ${data.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.score}% ({data.correctCount}/{data.totalQuestions} Benar)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300">Waktu Pengerjaan:</span>
              <span className="font-mono text-white font-semibold">{formatSeconds(data.timeSpentSeconds)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300">Standar Waktu (SCT):</span>
              <span className="font-mono text-slate-400">{formatSeconds(data.standardTimeSeconds)}</span>
            </div>

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Hasil Evaluasi:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  data.isMastered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {data.isMastered ? '✓ Tuntas / Master' : 'Ulangi untuk Kecepatan'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Grafik Tren Performa Siswa
                </h3>
                {useSampleData && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md">
                    Data Simulasi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Pemantauan akurasi skor dan kecepatan waktu pengerjaan setiap sesi (Standar Waktu SCT).
              </p>
            </div>
          </div>

          {/* Right Controls: Filter and Demo Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Level Filter */}
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold py-1 px-1.5 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Semua Level ({availableLevels.length})</option>
                {availableLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl} ({KUMON_LEVELS[lvl]?.name || lvl})
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Metric View Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMetricTab('combined')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricTab === 'combined'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gabungan
              </button>
              <button
                type="button"
                onClick={() => setMetricTab('accuracy')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricTab === 'accuracy'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Akurasi (%)
              </button>
              <button
                type="button"
                onClick={() => setMetricTab('time')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  metricTab === 'time'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waktu (Menit)
              </button>
            </div>

            {/* Sample Data Toggle if real sessions exist or user wants to preview */}
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => setUseSampleData(!useSampleData)}
                className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
                title={useSampleData ? 'Beralih ke Riwayat Nyata' : 'Lihat Data Contoh'}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Stat Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rata-rata Akurasi</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.avgScore}%</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Target Kelulusan: ≥ 90%</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Rata-rata Durasi</span>
            </div>
            <p className="text-lg font-bold font-mono text-slate-800">{formatSeconds(stats.avgTimeSec)}</p>
            <span className="text-[10px] text-slate-500">Per lembar kerja</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tingkat Ketuntasan</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.masteryRate}%</p>
            <span className="text-[10px] text-indigo-600 font-semibold">Skor ≥90% & Tepat Waktu</span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Total Sesi Rekam</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.totalSessions} Sesi</p>
            <span className="text-[10px] text-slate-500">Tersimpan di perangkat</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="p-5 sm:p-6">
        {filteredData.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada data latihan untuk filter ini</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Selesaikan lembar kerja latihan mandiri untuk melihat grafik tren performa secara langsung.
            </p>
            <button
              type="button"
              onClick={() => setUseSampleData(true)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tampilkan Contoh Grafik Performa</span>
            </button>
          </div>
        ) : (
          <div className="h-[280px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metricTab === 'accuracy' ? (
                // View 1: Akurasi (%)
                <AreaChart data={filteredData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 90, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={90}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Target Kelulusan (90%)',
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideTopRight',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Akurasi Skor (%)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : metricTab === 'time' ? (
                // View 2: Waktu (Menit)
                <BarChart data={filteredData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit=" m"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
                  />
                  <Bar
                    dataKey="timeMinutes"
                    name="Waktu Pengerjaan (Menit)"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="standardMinutes"
                    name="Standar Waktu SCT (Menit)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </BarChart>
              ) : (
                // View 3: Combined Dual-Axis (Akurasi & Waktu)
                <LineChart data={filteredData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  {/* Left Axis: Score % */}
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tick={{ fill: '#4f46e5', fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                  />
                  {/* Right Axis: Time in Minutes */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#f59e0b', fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    unit=" m"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={90}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="score"
                    name="Akurasi Skor (%)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 4, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="timeMinutes"
                    name="Durasi Pengerjaan (Menit)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend / Guide Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              <span>Skor Akurasi (%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Durasi Pengerjaan</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-500 inline-block"></span>
              <span>Garis Target Kelulusan (90%)</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 italic">
            Metode latihan bertahap menekankan Akurasi 100% dan Kecepatan Waktu Ideal (SCT).
          </span>
        </div>
      </div>
    </div>
  );
};
