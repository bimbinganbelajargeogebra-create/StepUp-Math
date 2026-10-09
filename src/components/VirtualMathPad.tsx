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
    <div className={`clay-inset p-2.5 sm:p-3.5 rounded-[26px] select-none ${className}`}>
      {/* Dynamic helper row based on level */}
      <div className="flex flex-wrap gap-1.5 mb-2.5 justify-center">
        {isFraction && (
          <>
            <button
              type="button"
              onClick={() => onInsert('/')}
              className="flex-1 min-w-[50px] py-2 px-2.5 clay-btn clay-btn-secondary text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-sm"
            >
              / (per)
            </button>
            <button
              type="button"
              onClick={() => onInsert(' sisa ')}
              className="flex-1 min-w-[65px] py-2 px-2.5 clay-btn clay-btn-secondary text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs"
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
              className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-violet-600 dark:text-violet-400 font-black rounded-xl text-sm"
            >
              x
            </button>
            <button
              type="button"
              onClick={() => onInsert('y')}
              className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-violet-600 dark:text-violet-400 font-black rounded-xl text-sm"
            >
              y
            </button>
            <button
              type="button"
              onClick={() => onInsert(', ')}
              className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-violet-600 dark:text-violet-400 font-black rounded-xl text-sm"
            >
              ,
            </button>
            <button
              type="button"
              onClick={() => onInsert('-')}
              className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-violet-600 dark:text-violet-400 font-black rounded-xl text-sm"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => onInsert('/')}
              className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-violet-600 dark:text-violet-400 font-black rounded-xl text-sm"
            >
              /
            </button>
          </>
        )}

        {!isElementary && !isAlgebra && (
          <button
            type="button"
            onClick={() => onInsert('-')}
            className="flex-1 min-w-[42px] py-2 clay-btn clay-btn-secondary text-slate-700 dark:text-slate-300 font-black rounded-xl text-sm"
          >
            -
          </button>
        )}
      </div>

      {/* Main Keypad Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        {['1', '2', '3'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onInsert(k)}
            className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="clay-keypad-btn h-12 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold"
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
            className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="clay-keypad-btn h-12 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold"
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
            className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
          >
            {k}
          </button>
        ))}
        {onSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            className="row-span-2 clay-btn clay-btn-primary flex flex-col items-center justify-center gap-1 rounded-2xl"
            title="Kirim Jawaban"
          >
            <CornerDownLeft className="w-6 h-6" />
            <span className="text-xs font-black">Jawab</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onInsert('-')}
            className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-lg flex items-center justify-center"
          >
            -
          </button>
        )}

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => onInsert('.')}
          className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => onInsert('0')}
          className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => onInsert('-')}
          className="clay-keypad-btn h-12 text-slate-800 dark:text-slate-100 font-black text-xl flex items-center justify-center"
        >
          -
        </button>
        {!onSubmit && (
          <button
            type="button"
            onClick={() => onInsert('/')}
            className="clay-keypad-btn h-12 text-indigo-600 dark:text-indigo-400 font-black text-base flex items-center justify-center"
          >
            /
          </button>
        )}
      </div>
    </div>
  );
};
