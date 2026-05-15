import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function SimpleRadarChart({ data, title, dataKey, stroke = '#8b5cf6' }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) return null;

  return (
    <div className={`w-full p-6 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-300'}`}>
      <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid 
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeDasharray="5 5"
          />
          <PolarAngleAxis 
            dataKey="name"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <PolarRadiusAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <Radar
            name={dataKey}
            dataKey={dataKey}
            stroke={stroke}
            fill={stroke}
            fillOpacity={0.6}
            isAnimationActive={true}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#f1f5f9' : '#1f2937'
            }}
          />
          <Legend 
            wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
