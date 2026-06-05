import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function FinancialChart({ data, title }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aucune donnée disponible</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  const isPositive = data[0]?.value >= 0;

  return (
    <div className={`rounded-lg p-6 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {isPositive ? (
          <TrendingUp className="text-green-400" size={20} />
        ) : (
          <TrendingDown className="text-red-400" size={20} />
        )}
        {title}
      </h3>

      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className={`text-sm w-20 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.label}
            </span>
            <div className={`flex-1 rounded h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded transition-all ${item.value >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.abs(item.value / maxValue) * 100}%`, maxWidth: '100%' }}
              />
            </div>
            <span className={`text-sm font-semibold w-24 text-right ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FinancialChart;