import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXMathProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const KaTeXMath: React.FC<KaTeXMathProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    if (!math) return '';

    // If string contains explicit LaTeX commands or math tokens, prepare it
    let cleanMath = math.trim();

    // Sanitize unsupported @{...} in array specifiers (e.g. \begin{array}{r@{\quad}r} -> \begin{array}{rr})
    cleanMath = cleanMath.replace(/\\begin\{array\}\{([^}]*?)@\{[^}]*?\}([^}]*?)\}/g, (_match, before, after) => {
      const colSpecs = (before + after).replace(/[^crl]/g, '');
      return `\\begin{array}{${colSpecs || 'rr'}}`;
    });

    // Auto-apply \displaystyle for fractions and equations in block mode to ensure full height fractions
    if (block && !cleanMath.startsWith('\\displaystyle') && (cleanMath.includes('\\frac') || cleanMath.includes('\\int') || cleanMath.includes('\\sum') || cleanMath.includes('\\begin') || cleanMath.includes('\\cases'))) {
      cleanMath = `\\displaystyle ${cleanMath}`;
    }

    try {
      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      // Fallback: try standard rendering without \displaystyle if that was the culprit
      try {
        return katex.renderToString(math.trim(), {
          displayMode: block,
          throwOnError: false,
          strict: false,
          trust: true,
        });
      } catch {
        return `<span class="katex-fallback font-mono text-sm">${math}</span>`;
      }
    }
  }, [math, block]);

  return (
    <span
      className={`katex-math-wrapper ${
        block 
          ? 'block my-2 text-center overflow-x-auto overflow-y-visible max-w-full py-1 px-2' 
          : 'inline-flex items-center align-middle overflow-x-auto overflow-y-visible px-0.5'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * MathText renders text containing LaTeX mathematical expressions formatted as:
 * - Block math: $$formula$$
 * - Inline math: $formula$
 * - LaTeX commands directly embedded (e.g. \frac{a}{b}, \times, \div, \int, \log)
 */
export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Check if text has $...$ or $$...$$ delimiters
    if (text.includes('$')) {
      const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          return <KaTeXMath key={index} math={formula} block />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return <KaTeXMath key={index} math={formula} block={false} />;
        }
        return <span key={index}>{part}</span>;
      });
    }

    // If text contains pure LaTeX commands without $ delimiters (like \frac, \int, \sqrt)
    if (/\\(frac|int|sqrt|cdot|times|div|sum|log|lim|alpha|beta|theta|le|ge|ne|pm|begin|dots|quad)/.test(text) && !text.includes('\n')) {
      // If it looks like a single formula
      if (!text.includes(' ') || text.length < 50) {
        return <KaTeXMath math={text} block={false} />;
      }
    }

    return <span>{text}</span>;
  }, [text]);

  return <span className={`math-text-container ${className}`}>{renderedContent}</span>;
};

