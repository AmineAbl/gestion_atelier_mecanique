import React from 'react';
import { useTheme } from '../../context/ThemeContext';

// Line Chart Component
export function LineChart({ title, data, dataKey, label = '', height = '300px' }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl border-2 p-6 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Aucune donnée</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: ((d[dataKey] || 0) / maxValue) * 100,
    value: d[dataKey],
    label: d.label
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`).join(' ');
  const gradientId = `gradient-${Math.random()}`;

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <h3 className={`font-semibold mb-6 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
      <svg viewBox="0 0 100 100" style={{ height, width: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#3b82f6' : '#2563eb'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isDark ? '#3b82f6' : '#2563eb'} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={`grid-${y}`} x1="0" y1={y} x2="100" y2={y} stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth="0.5" />
        ))}
        {/* Area under line */}
        <path d={`${pathD} L 100 100 L 0 100 Z`} fill={`url(#${gradientId})`} />
        {/* Line */}
        <path d={pathD} stroke={isDark ? '#3b82f6' : '#2563eb'} strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={100 - p.y} r="1.5" fill={isDark ? '#3b82f6' : '#2563eb'} />
        ))}
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, i) => (
          <div key={i} className={`text-xs p-2 rounded border ${isDark ? 'bg-slate-800/50 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
            <div className="font-semibold">{item.label}</div>
            <div className="text-blue-500">{item[dataKey]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie/Donut Chart Component
export function DonutChart({ title, data, height = '300px' }) {
  const { isDark } = useTheme();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl border-2 p-6 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Aucune donnée</div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  const slices = data.map((item, i) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const radius = 35;
    const innerRadius = 25;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = 50 + radius * Math.cos(toRad(startAngle - 90));
    const y1 = 50 + radius * Math.sin(toRad(startAngle - 90));
    const x2 = 50 + radius * Math.cos(toRad(endAngle - 90));
    const y2 = 50 + radius * Math.sin(toRad(endAngle - 90));
    const ix1 = 50 + innerRadius * Math.cos(toRad(startAngle - 90));
    const iy1 = 50 + innerRadius * Math.sin(toRad(startAngle - 90));
    const ix2 = 50 + innerRadius * Math.cos(toRad(endAngle - 90));
    const iy2 = 50 + innerRadius * Math.sin(toRad(endAngle - 90));

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`;

    currentAngle = endAngle;
    return { path, color: colors[i % colors.length], ...item };
  });

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <h3 className={`font-semibold mb-6 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
      <div className="flex gap-6">
        <svg viewBox="0 0 100 100" style={{ height, width: height }}>
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} opacity="0.85" className="hover:opacity-100 transition-opacity cursor-pointer" />
          ))}
          <circle cx="50" cy="50" r="18" fill={isDark ? '#1e293b' : '#ffffff'} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className={`text-xs font-bold ${isDark ? 'fill-white' : 'fill-black'}`}>
            {total}
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {slices.map((item, i) => (
            <div key={i} className={`p-2 rounded border flex items-center justify-between ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: item.color }}>{((item.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress Bar Chart
export function ProgressChart({ title, data, height = '250px' }) {
  const { isDark } = useTheme();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <h3 className={`font-semibold mb-6 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
              <span className="text-xs font-bold" style={{ color: colors[i % colors.length] }}>{item.value}%</span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: colors[i % colors.length],
                  animation: `slideIn 0.8s ease-out ${i * 0.1}s both`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { width: 0 !important; }
        }
      `}</style>
    </div>
  );
}

// Area Chart Component
export function AreaChart({ title, data, dataKey, label = '', height = '300px' }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-2xl border-2 p-6 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-gray-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Aucune donnée</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: ((d[dataKey] || 0) / maxValue) * 100,
    value: d[dataKey],
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`).join(' ');
  const areaPathD = `${pathD} L 100 100 L 0 100 Z`;
  const gradientId = `gradient-area-${Math.random()}`;

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <h3 className={`font-semibold mb-6 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
      <svg viewBox="0 0 100 100" style={{ height, width: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isDark ? '#10b981' : '#059669'} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Background grid */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={`grid-${y}`} x1="0" y1={y} x2="100" y2={y} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="0.5" />
        ))}
        {/* Area */}
        <path d={areaPathD} fill={`url(#${gradientId})`} />
        {/* Line */}
        <path d={pathD} stroke={isDark ? '#10b981' : '#059669'} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={100 - p.y} r="1.5" fill={isDark ? '#10b981' : '#059669'} />
        ))}
      </svg>
      <div className={`mt-4 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {label && <span>{label} - </span>}
        <span>Max: {maxValue} | Avg: {(data.reduce((sum, d) => sum + (d[dataKey] || 0), 0) / data.length).toFixed(1)}</span>
      </div>
    </div>
  );
}
