import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SimpleChart({ title, data, dataKey, color = 'blue', height = '300px' }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div
        className={`rounded-2xl border-2 p-6 ${
          isDark
            ? 'bg-slate-900/50 border-white/10'
            : 'bg-white border-gray-200'
        }`}
      >
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          {title}
        </h3>
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Simple bar chart implementation
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const colorMap = {
    blue: isDark ? '#3b82f6' : '#2563eb',
    green: isDark ? '#10b981' : '#059669',
    red: isDark ? '#ef4444' : '#dc2626',
    purple: isDark ? '#a855f7' : '#9333ea',
  };

  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
        isDark
          ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      style={{
        animation: 'fadeInUp 0.6s ease-out 0.2s both'
      }}
    >
      <h3 className={`font-semibold mb-6 text-lg ${isDark ? 'text-white' : 'text-black'}`}>
        {title}
      </h3>

      <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        {data.map((item, index) => {
          const value = item[dataKey] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
              style={{
                animation: `barFillUp 0.8s ease-out ${index * 0.05}s both`
              }}
            >
              <div
                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: colorMap[color],
                  minHeight: percentage > 0 ? '10px' : '2px',
                }}
              />
              <div
                className={`text-xs font-medium text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {item.label || `${index}`}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes barFillUp {
          from {
            height: 0 !important;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
