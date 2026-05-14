import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function FinancialChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <p className="text-gray-400 text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  // Simple bar chart visualization
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  const isPositive = data[0]?.value >= 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
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
            <span className="text-gray-400 text-sm w-20 truncate">{item.label}</span>
            <div className="flex-1 bg-slate-700 rounded h-2">
              <div
                className={`h-2 rounded transition-all ${
                  item.value >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.abs(item.value / maxValue) * 100}%`,
                  maxWidth: '100%'
                }}
              />
            </div>
            <span className={`text-sm font-semibold w-24 text-right ${
              item.value >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FinancialChart;
