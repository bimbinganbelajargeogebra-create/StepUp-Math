import React from 'react';
import { Delete, CornerDownLeft, Eraser } from 'lucide-react';

interface VirtualMathPadProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  levelId: string;
  className?: string;
}

export const VirtualMathPad: React.FC<VirtualMathPadProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
  levelId,
  className = ''
}) => {
  // Check if advanced algebra / calculus keys are needed
  const isElementary = ['6A', '5A', '4A', '3A', '2A', 'A', 'B', 'C'].includes(levelId);
  const isFraction = ['D', 'E', 'F'].includes(levelId);
  const isAlgebra = ['G', 'H', 'I', 'J', 'K', 'L', 'M'].includes(levelId);

  const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className={`bg-slate-100 p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-inner select-none ${className}`}>
      {/* Dynamic helper row based on level */}
      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 justify-center">
        {isFraction && (
          <>
            <button
              type="button"
              onClick={() => onInsert('/')}
              className="flex-1 min-w-[50px] py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              / (per)
            </button>
            <button
              type="button"
              onClick={() => onInsert(' sisa ')}
              className="flex-1 min-w-[65px] py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 text-xs active:scale-95 transition-all shadow-xs"
            >
              sisa
            </button>
          </>
        )}

        {isAlgebra && (
          <>
            <button
              type="button"
              onClick={() => onInsert('x')}
              className="flex-1 min-w-[40px] py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              x
            </button>
            <button
              type="button"
              onClick={() => onInsert('y')}
              className="flex-1 min-w-[40px] py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              y
            </button>
            <button
              type="button"
              onClick={() => onInsert(', ')}
              className="flex-1 min-w-[40px] py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              ,
            </button>
            <button
              type="button"
              onClick={() => onInsert('-')}
              className="flex-1 min-w-[40px] py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => onInsert('/')}
              className="flex-1 min-w-[40px] py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 text-sm active:scale-95 transition-all shadow-xs"
            >
              /
            </button>
          </>
        )}

        {!isElementary && !isAlgebra && (
          <button
            type="button"
            onClick={() => onInsert('-')}
            className="flex-1 min-w-[40px] py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm active:scale-95 transition-all"
          >
            -
          </button>
        )}
      </div>

      {/* Main Keypad Grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Row 1 */}
        {['1', '2', '3'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onInsert(k)}
            className="h-11 sm:h-12 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-800 font-bold text-lg sm:text-xl rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="h-11 sm:h-12 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl border border-amber-200 flex items-center justify-center active:scale-95 transition-all shadow-xs"
          title="Hapus Satu Karakter"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Row 2 */}
        {['4', '5', '6'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onInsert(k)}
            className="h-11 sm:h-12 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-800 font-bold text-lg sm:text-xl rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="h-11 sm:h-12 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl flex items-center justify-center active:scale-95 transition-all"
          title="Bersihkan Semua"
        >
          <Eraser className="w-5 h-5" />
        </button>

        {/* Row 3 */}
        {['7', '8', '9'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onInsert(k)}
            className="h-11 sm:h-12 bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-800 font-bold text-lg sm:text-xl rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
          >
            {k}
          </button>
        ))}
        {onSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            className="row-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-all gap-1"
            title="Kirim Jawaban"
          >
            <CornerDownLeft className="w-6 h-6" />
            <span className="text-xs">Jawab</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onInsert('-')}
            className="h-11 sm:h-12 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-lg rounded-xl flex items-center justify-center active:scale-95 transition-all"
          >
            -
          </button>
        )}

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => onInsert('.')}
          className="h-11 sm:h-12 bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => onInsert('0')}
          className="h-11 sm:h-12 bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg sm:text-xl rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => onInsert('-')}
          className="h-11 sm:h-12 bg-white hover:bg-slate-50 text-slate-800 font-bold text-lg rounded-xl border border-slate-200 shadow-xs active:scale-95 transition-all"
        >
          -
        </button>
        {!onSubmit && (
          <button
            type="button"
            onClick={() => onInsert('/')}
            className="h-11 sm:h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-base rounded-xl border border-indigo-200 shadow-xs active:scale-95 transition-all"
          >
            /
          </button>
        )}
      </div>
    </div>
  );
};
