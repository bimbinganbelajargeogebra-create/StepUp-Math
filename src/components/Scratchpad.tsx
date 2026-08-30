import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Trash2, PenTool, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState('#2563eb');
  const [penSize, setPenSize] = useState(3);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initial white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  }, [isOpen]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (historyRef.current.length > 10) {
        historyRef.current.shift();
      }
      historyRef.current.push(imgData);
    } catch {
      // Ignore security errors if any
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : penColor;
    ctx.lineWidth = mode === 'eraser' ? 24 : penSize;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyRef.current.pop(); // Remove current state
    const previousState = historyRef.current[historyRef.current.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-3xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <PenTool className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Papan Coretan / Scratchpad</h3>
              <p className="text-xs text-slate-500 hidden sm:block">Gunakan untuk coret-coret hitungan bersusun, pecahan, atau aljabar</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Color pickers */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 mr-1">
              {[
                { color: '#2563eb', label: 'Biru' },
                { color: '#dc2626', label: 'Merah' },
                { color: '#059669', label: 'Hijau' },
                { color: '#1e293b', label: 'Hitam' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    setMode('pen');
                    setPenColor(c.color);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    mode === 'pen' && penColor === c.color ? 'scale-110 border-slate-800 shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            {/* Eraser */}
            <button
              type="button"
              onClick={() => setMode(mode === 'eraser' ? 'pen' : 'eraser')}
              className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                mode === 'eraser'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
              title="Penghapus"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Urungkan Coretan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear All */}
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              title="Bersihkan Semua Coretan"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors ml-1"
              title="Tutup Scratchpad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas drawing area */}
        <div className="relative flex-1 bg-white cursor-crosshair touch-none select-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Sentuh layar atau geser kursor mouse untuk menulis rumus & hitungan.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-xs transition-colors"
          >
            Selesai Menghitung
          </button>
        </div>
      </div>
    </div>
  );
};
