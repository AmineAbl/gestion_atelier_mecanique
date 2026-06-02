import React, { useId } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ChartShell } from './ChartShell';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS, getChartTheme } from './chartTheme';
import './accountantCharts.css';

export function SimpleRadarChart({
  data,
  title,
  description,
  dataKey = 'value',
  stroke = CHART_COLORS.violet,
  formatValue,
}) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const fillId = useId().replace(/:/g, '');

  if (!data?.length) return null;

  const valueFormatter = formatValue ? (v) => [formatValue(v), ''] : undefined;

  return (
    <ChartShell title={title} description={description} height={320}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.55} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <PolarGrid stroke={theme.polarGrid} strokeDasharray="4 4" gridType="polygon" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: theme.tick, fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: theme.tooltipMuted, fontSize: 10 }}
            axisLine={false}
            tickCount={4}
          />
          <Radar
            name="Indicateur"
            dataKey={dataKey}
            stroke={stroke}
            fill={`url(#${fillId})`}
            strokeWidth={2}
            dot={{ fill: stroke, r: 4, strokeWidth: 0 }}
            isAnimationActive
          />
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
