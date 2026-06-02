import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getChartTheme } from './chartTheme';

export function ChartShell({ title, description, children, className = '', height = 320 }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  return (
    <div
      className={`chart-shell rounded-2xl border p-5 md:p-6 shadow-lg transition-all duration-300 ${className}`}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
      }}
    >
      <div className="mb-5 flex flex-col gap-1 border-b pb-4" style={{ borderColor: theme.cardBorder }}>
        <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {description && (
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
        )}
      </div>
      <div className="chart-shell__body w-full" style={{ height }}>
        {children}
      </div>
    </div>
  );
}
