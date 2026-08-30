import React, { useRef } from 'react';
import { Award, Printer, X, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { KumonLevelId, StudentProfile, LevelProgress } from '../types';
import { KUMON_LEVELS } from '../data/curriculumData';

interface CertificateModalProps {
  levelId: KumonLevelId;
  profile: StudentProfile;
  progress: LevelProgress;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  levelId,
  profile,
  progress,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const levelInfo = KUMON_LEVELS[levelId];
  const dateStr = progress.masteryDate
    ? new Date(progress.masteryDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
      <div className="flex flex-col w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-slate-800 text-sm">Sertifikat Kelulusan Level</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sertifikat</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Sheet (Printable Area) */}
        <div
          ref={printRef}
          className="p-6 sm:p-10 bg-radial from-amber-50/50 via-white to-amber-50/30 text-center relative border-8 border-double border-amber-500/60 m-3 rounded-2xl"
        >
          {/* Certificate Header */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg mb-3">
              <Award className="w-9 h-9 text-amber-100" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-amber-900">
              Sertifikat Kelulusan Level
            </h2>
            <p className="text-xs tracking-wider uppercase font-bold text-amber-700/80 mt-0.5">
              StepUp Math • Sistem Pembelajaran Mandiri Berjenjang
            </p>
          </div>

          {/* Certificate Body */}
          <div className="my-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 italic">
              Dengan bangga diberikan kepada:
            </p>

            <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile.name}
              </h3>
              <p className="text-xs text-indigo-700 font-semibold mt-0.5">{profile.grade}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
              Telah berhasil menyelesaikan seluruh lembar kerja latihan mandiri dan menguasai standar kecepatan serta ketelitian pada:
            </p>

            {/* Level Badge Block */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl max-w-md mx-auto shadow-inner">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Level Terverifikasi</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950 mt-0.5">
                Level {levelId}
              </div>
              <div className="text-xs font-bold text-indigo-800">{levelInfo.name}</div>
              <p className="text-[11px] text-slate-600 mt-1">{levelInfo.targetSkill}</p>
            </div>
          </div>

          {/* Signatures & Verification */}
          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[11px] text-slate-500">Tanggal Kelulusan</p>
              <p className="text-xs font-bold text-slate-800">{dateStr}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-500">Verifikasi Sistem</p>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Terakreditasi Mandiri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
