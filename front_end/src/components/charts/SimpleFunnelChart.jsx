import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function SimpleFunnelChart({ data, title }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`w-full p-6 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-300'}`}>
      <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.value} ({Math.round((item.value / maxValue) * 100)}%)
              </span>
            </div>
            <div className={`h-8 rounded-lg overflow-hidden border ${isDark ? 'bg-slate-700 border-white/10' : 'bg-gray-100 border-gray-300'}`}>
              <div
                className={`h-full rounded-lg transition-all duration-500 ${item.color || 'bg-blue-500'}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
