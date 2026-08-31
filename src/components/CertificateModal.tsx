import React, { useRef } from 'react';
import { Award, Printer, Download, X, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
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

  const handleDownloadHtml = () => {
    if (!printRef.current) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sertifikat Kelulusan Level ${levelId} - ${profile.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; display: flex; flex-direction: column; align-items: center; }
    .certificate-print-sheet { background: #fffdf5; width: 100%; max-width: 210mm; min-height: 275mm; margin: 0 auto; padding: 40px; border: 8px double #d97706; border-radius: 16px; box-sizing: border-box; }
    @media print {
      @page { size: A4 portrait; margin: 8mm; }
      body { background: #ffffff; padding: 0; }
      .certificate-print-sheet { border: 8px double #d97706 !important; margin: 0 auto; padding: 24px; border-radius: 8px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; gap: 12px;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
      🖨️ Cetak / Simpan sebagai PDF (A4)
    </button>
  </div>
  <div class="certificate-print-sheet">
    ${printRef.current.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sertifikat-Level-${levelId}-${profile.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              id="download-certificate-html-btn"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Unduh file dokumen HTML sertifikat"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Unduh Dokumen (.html)</span>
            </button>

            <button
              type="button"
              id="print-certificate-pdf-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak / Simpan PDF</span>
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
          className="certificate-print-sheet p-6 sm:p-10 bg-radial from-amber-50/50 via-white to-amber-50/30 text-center relative border-8 border-double border-amber-500/60 m-3 rounded-2xl print:m-0 print:border-8 print:border-amber-600 print:shadow-none"
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
