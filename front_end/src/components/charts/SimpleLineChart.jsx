import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function SimpleLineChart({ data, title, dataKey, strokeColor = '#3b82f6' }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) return null;

  return (
    <div className={`w-full p-6 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-300'}`}>
      <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid 
            stroke={isDark ? '#374151' : '#e5e7eb'} 
            strokeDasharray="5 5"
          />
          <XAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#f1f5f9' : '#1f2937'
            }}
            cursor={{ stroke: isDark ? '#64748b' : '#d1d5db' }}
          />
          <Legend 
            wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ fill: strokeColor, r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
