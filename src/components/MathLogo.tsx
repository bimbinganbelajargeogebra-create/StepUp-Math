import React from 'react';

interface MathLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
  className?: string;
  glow?: boolean;
  variant?: 'primary' | 'white' | 'dark' | 'monochrome';
}

export const MathLogo: React.FC<MathLogoProps> = ({
  size = 'md',
  showText = false,
  textClassName = '',
  subtitle,
  className = '',
  glow = false,
  variant = 'primary'
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', icon: 16, text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9 rounded-xl', icon: 20, text: 'text-base sm:text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12 rounded-2xl', icon: 26, text: 'text-xl sm:text-2xl', sub: 'text-xs' },
    xl: { box: 'w-14 h-14 rounded-2xl', icon: 30, text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    '2xl': { box: 'w-16 h-16 rounded-3xl', icon: 36, text: 'text-3xl sm:text-4xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  const getBgClass = () => {
    switch (variant) {
      case 'white':
        return 'bg-white text-indigo-600 shadow-sm border border-slate-200';
      case 'dark':
        return 'bg-slate-900 text-white border border-slate-800';
      case 'monochrome':
        return 'bg-black text-white';
      case 'primary':
      default:
        return 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-md shadow-indigo-600/25';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center font-bold shrink-0 transition-transform ${currentSize.box} ${getBgClass()} ${
          glow ? 'ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30' : ''
        }`}
        aria-label="AlgoriMath Logo"
      >
        {/* Crisp Mathematical Emblem SVG: Stylized Sigma (∑) & Pi (π) / Function symbol */}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transform"
        >
          {/* Main Mathematical Sigma (∑) Symbol */}
          <path d="M19 4H5L12 12L5 20H19" />
          {/* Subtle math accent dot / delta mark */}
          <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" opacity="0.8" />
        </svg>

        {/* Small corner decorative math plus/sparkle */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 shadow-xs" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${currentSize.text} ${textClassName}`}>
              Algori<span className="text-indigo-600 dark:text-indigo-400">Math</span>
            </span>
          </div>
          {subtitle && (
            <span className={`text-slate-500 dark:text-slate-400 font-medium mt-0.5 ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
