import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  FileSpreadsheet, 
  User, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  Layers,
  Calendar,
  Award,
  BookOpen,
  Target
} from 'lucide-react';
import { KumonLevelId, UserAccount } from '../types';
import { KUMON_LEVEL_ORDER, KUMON_LEVELS } from '../data/curriculumData';
import { MathLogo } from './MathLogo';

interface StudentProgressBlankoPrintModalProps {
  accounts: UserAccount[];
  initialSelectedUsername?: string;
  onClose: () => void;
}

export const StudentProgressBlankoPrintModal: React.FC<StudentProgressBlankoPrintModalProps> = ({
  accounts,
  initialSelectedUsername,
  onClose
}) => {
  const [selectedUsername, setSelectedUsername] = useState<string>(
    initialSelectedUsername || (accounts.length > 0 ? accounts[0].username : 'BLANK_TEMPLATE')
  );
  const [levelRange, setLevelRange] = useState<'ALL_18' | 'FROM_STARTING_LEVEL'>('ALL_18');

  // Selected student account object
  const currentStudent = useMemo(() => {
    if (selectedUsername === 'BLANK_TEMPLATE') return null;
    return accounts.find(a => a.username.toLowerCase() === selectedUsername.toLowerCase()) || null;
  }, [accounts, selectedUsername]);

  // Levels to render in the table
  const levelsToRender: KumonLevelId[] = useMemo(() => {
    if (levelRange === 'FROM_STARTING_LEVEL' && currentStudent?.startingLevel) {
      const idx = KUMON_LEVEL_ORDER.indexOf(currentStudent.startingLevel);
      if (idx !== -1) {
        return KUMON_LEVEL_ORDER.slice(idx);
      }
    }
    return KUMON_LEVEL_ORDER;
  }, [levelRange, currentStudent]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      {/* Top Controls Bar (Hidden during Print) */}
      <div className="print:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-amber-300">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white">
              Cetak Blanko Progres Belajar Siswa (Administrasi Cetak / PDF)
            </h3>
            <p className="text-xs text-indigo-200">
              Format blanko resmi untuk pencatatan tanggal kemajuan level secara manual oleh Guru / Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Student Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Pilih Siswa:</span>
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="BLANK_TEMPLATE">📄 Blanko Kosong (Template Baru)</option>
              <optgroup label="Siswa Terdaftar">
                {accounts.map(acc => (
                  <option key={acc.username} value={acc.username}>
                    {acc.name} (@{acc.username}) - {acc.accessType === 'full' ? 'Full Akses' : 'Berjenjang'} (Level {acc.currentLevel || acc.startingLevel || '6A'})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Level range selector */}
          <select
            value={levelRange}
            onChange={(e) => setLevelRange(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hidden sm:block"
          >
            <option value="ALL_18">Semua 18 Level (6A s/d M)</option>
            {currentStudent?.startingLevel && (
              <option value="FROM_STARTING_LEVEL">
                Mulai Level Diagnostik ({currentStudent.startingLevel} s/d M)
              </option>
            )}
          </select>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            title="Buka dialog cetak browser (Pilih 'Save as PDF' untuk menyimpan berkas PDF)"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak / Simpan PDF</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div className="flex-1 p-4 sm:p-8 flex justify-center bg-slate-900/40 print:bg-white print:p-0">
        <div 
          id="blanko-progres-print-area"
          className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 shadow-2xl rounded-2xl print:rounded-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none border border-slate-300 print:border-none flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
        >
          <div>
            {/* Header Kop Bimbingan Belajar */}
            <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MathLogo size="md" variant="monochrome" />
                <div>
                  <h1 className="text-xl font-black tracking-tight text-black uppercase font-serif">
                    ALGORIMATH &bull; BIMBINGAN BELAJAR MATEMATIKA MANDIRI
                  </h1>
                  <h2 className="text-sm font-extrabold text-black uppercase tracking-wider">
                    LEMBAR KONTROL &amp; BLANKO PROGRES BELAJAR SISWA
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Sistem Belajar Mandiri Berjenjang (Metode Kumon) &bull; Formulir Catatan Tanggal Progres Administrasi Guru
                  </p>
                </div>
              </div>

              <div className="text-right border-2 border-black p-2 rounded-xs text-[10px] bg-slate-50 font-bold shrink-0">
                <div>KODE DOKUMEN: <span className="font-mono">ADM-PROGRES-2026</span></div>
                <div>TANGGAL CETAK: <span className="font-mono">{formattedDate}</span></div>
                <div>STATUS DOKUMEN: <span className="font-black">RESMI</span></div>
              </div>
            </div>

            {/* Identitas Siswa Box */}
            <div className="border-2 border-black mb-4 rounded-xs overflow-hidden text-xs">
              <div className="bg-slate-100 border-b border-black px-3 py-1 font-black uppercase tracking-wider flex items-center justify-between">
                <span>DATA IDENTITAS &amp; STATUS PENDAFTARAN SISWA</span>
                <span className="text-[10px] font-bold text-slate-700">
                  Tipe Akses: {currentStudent?.accessType === 'full' ? 'FULL AKSES (OTOMATIS)' : 'AKSES BERJENJANG (PERSETUJUAN GURU)'}
                </span>
              </div>

              <div className="grid grid-cols-2 divide-x border-black p-2.5 gap-x-4 gap-y-1.5 text-[11px]">
                {/* Left Column */}
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-800">Nama Siswa:</span>
                    <span className="font-black text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? currentStudent.name : '...........................................................................................'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-800">Username / ID Siswa:</span>
                    <span className="font-mono font-bold text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? `@${currentStudent.username}` : '...........................................................................................'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-800">Jenjang / Kelas:</span>
                    <span className="font-bold text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? currentStudent.grade : '...........................................................................................'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 font-bold text-slate-800">Asal Sekolah:</span>
                    <span className="font-bold text-black border-b border-black flex-1 pl-1">
                      {currentStudent?.school ? currentStudent.school : '...........................................................................................'}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1.5 pl-3">
                  <div className="flex items-center">
                    <span className="w-36 font-bold text-slate-800">Tipe Akses Belajar:</span>
                    <span className="font-black text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? (
                        currentStudent.accessType === 'full'
                          ? 'Full Akses (Otomatis Buka Level)'
                          : 'Akses Berjenjang (Persetujuan Guru)'
                      ) : 'Akses Berjenjang / Full Akses'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-36 font-bold text-slate-800">Hasil Tes Diagnostik:</span>
                    <span className="font-black text-black border-b border-black flex-1 pl-1">
                      {currentStudent?.startingLevel ? `Level ${currentStudent.startingLevel} (${KUMON_LEVELS[currentStudent.startingLevel]?.name})` : 'Level ......... (Titik Penempatan Awal)'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-36 font-bold text-slate-800">Level Belajar Terakhir:</span>
                    <span className="font-black text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? `Level ${currentStudent.currentLevel || currentStudent.startingLevel || '6A'}` : 'Level ......... Lembar #.........'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-36 font-bold text-slate-800">Status Pendaftaran:</span>
                    <span className="font-bold text-black border-b border-black flex-1 pl-1">
                      {currentStudent ? 'Disetujui / Aktif Mengikuti Bimbingan' : 'Aktif / Baru Mendaftar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-slate-50 border border-black p-2 mb-3 text-[10px] text-slate-800 rounded-xs flex items-center justify-between">
              <span>
                <strong>Petunjuk Guru:</strong> Kolom "Tanggal Mulai", "Tanggal Selesai / Tes", "Skor", dan "Paraf Guru" ditulis secara manual oleh Guru Pembimbing saat lembar kerja atau tes kenaikan level terlaksana.
              </span>
              <span className="font-bold text-black shrink-0 ml-2">
                1 Level = 10 Lembar Kerja (@10 Soal)
              </span>
            </div>

            {/* Main Progress Control Table */}
            <div className="border-2 border-black rounded-xs overflow-hidden mb-4">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-black font-black text-center text-black">
                    <th className="border-r border-black p-1.5 w-8">No</th>
                    <th className="border-r border-black p-1.5 w-16">Level</th>
                    <th className="border-r border-black p-1.5 text-left w-52">Materi Pokok &amp; Keterampilan Target</th>
                    <th className="border-r border-black p-1.5 w-14">SCT</th>
                    <th className="border-r border-black p-1.5 w-24">Tgl Mulai (Manual)</th>
                    <th className="border-r border-black p-1.5 w-24">Tgl Selesai / Tes Level</th>
                    <th className="border-r border-black p-1.5 w-14">Skor / Nilai</th>
                    <th className="border-r border-black p-1.5 w-16">Paraf Guru</th>
                    <th className="p-1.5 text-left">Catatan Perkembangan Siswa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-medium">
                  {levelsToRender.map((lvlId, index) => {
                    const info = KUMON_LEVELS[lvlId];
                    const isStudentStartingLvl = currentStudent?.startingLevel === lvlId;
                    const isStudentCurrentLvl = currentStudent?.currentLevel === lvlId;

                    return (
                      <tr 
                        key={lvlId}
                        className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                        style={{ height: '36px' }}
                      >
                        <td className="border-r border-black text-center font-bold text-slate-700">
                          {index + 1}
                        </td>
                        <td className="border-r border-black text-center font-black">
                          <span className={`px-1.5 py-0.5 rounded-xs ${
                            isStudentStartingLvl || isStudentCurrentLvl
                              ? 'bg-black text-white'
                              : 'bg-slate-100 text-black border border-slate-300'
                          }`}>
                            Level {lvlId}
                          </span>
                        </td>
                        <td className="border-r border-black px-2 py-1 leading-tight">
                          <strong className="block text-black">{info.name}</strong>
                          <span className="text-[9px] text-slate-600 italic">{info.targetSkill}</span>
                        </td>
                        <td className="border-r border-black text-center font-bold">
                          {info.standardTimeMinutes}m
                        </td>
                        {/* Tanggal Mulai (Manual Guru) */}
                        <td className="border-r border-black text-center text-slate-400 font-mono text-[9px]">
                          &nbsp;
                        </td>
                        {/* Tanggal Selesai (Manual Guru) */}
                        <td className="border-r border-black text-center text-slate-400 font-mono text-[9px]">
                          &nbsp;
                        </td>
                        {/* Skor / Nilai */}
                        <td className="border-r border-black text-center font-mono">
                          &nbsp;
                        </td>
                        {/* Paraf Guru */}
                        <td className="border-r border-black text-center">
                          &nbsp;
                        </td>
                        {/* Catatan Guru */}
                        <td className="px-2 py-1 text-slate-400 text-[9px]">
                          &nbsp;
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Standard Operating Procedure & Evaluation Rules */}
            <div className="grid grid-cols-2 gap-3 border-2 border-black p-3 mb-4 text-[10px] rounded-xs bg-slate-50">
              <div>
                <strong className="block text-black font-extrabold uppercase mb-1">
                  Pedoman Kelulusan &amp; Akses Belajar:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  <li><strong>Akses Berjenjang:</strong> Siswa hanya dapat melanjutkan ke level berikutnya setelah disetujui Guru di Panel Admin.</li>
                  <li><strong>Full Akses:</strong> Siswa otomatis melangkah ke level berikutnya setelah seluruh 10 lembar diselesaikan.</li>
                  <li><strong>Standar Tuntas:</strong> Akurasi minimal 85–100% dan waktu pengerjaan di bawah SCT (Standard Completion Time).</li>
                </ul>
              </div>

              <div>
                <strong className="block text-black font-extrabold uppercase mb-1">
                  Kriteria Pengulangan Lembar Kerja (Repetisi):
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  <li>Skor di bawah 80% memerlukan drill ulang lembar bersangkutan 1–2 kali.</li>
                  <li>Waktu pengerjaan melebihi 2x SCT memerlukan evaluasi trik hitung cepat.</li>
                  <li>Setiap kenaikan level ditandai dengan pembaharuan status di database cloud.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan */}
          <div className="border-t-2 border-black pt-3 flex items-end justify-between text-xs">
            <div className="text-center w-56">
              <p className="text-[11px] text-slate-700 mb-1">Mengetahui Orang Tua / Wali Siswa,</p>
              <div className="h-16"></div>
              <p className="font-bold border-t border-black pt-1">( ........................................................... )</p>
              <p className="text-[9px] text-slate-500">Tanda Tangan &amp; Nama Terang</p>
            </div>

            <div className="text-center text-[10px] text-slate-500 italic max-w-xs">
              <p>Simpan dokumen ini di map arsip siswa sebagai bukti administrasi resmi kenaikan level.</p>
              <p className="font-mono mt-0.5">AlgoriMath Integrated System &bull; 2026</p>
            </div>

            <div className="text-center w-56">
              <p className="text-[11px] text-slate-700 mb-1">
                Diverifikasi Guru Pembimbing,
              </p>
              <div className="h-16"></div>
              <p className="font-black border-t border-black pt-1 text-black">
                ( Pak GuruAI / Instruktur )
              </p>
              <p className="text-[9px] text-slate-600 font-semibold">NIP / ID Instruktur Matematika</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
