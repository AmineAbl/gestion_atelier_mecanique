import React, { useId } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ChartShell } from './ChartShell';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS, CHART_MARGIN, getChartTheme } from './chartTheme';
import './accountantCharts.css';

const BAR_PALETTE = [
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.rose,
];

export function SimpleBarChart({
  data,
  title,
  description,
  dataKey = 'value',
  fill = CHART_COLORS.green,
  colors,
  formatValue,
}) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const gradBase = useId().replace(/:/g, '');

  if (!data?.length) return null;

  const barColors = colors ?? data.map((_, i) => BAR_PALETTE[i % BAR_PALETTE.length]);
  const valueFormatter = formatValue ? (v) => [formatValue(v), ''] : undefined;

  return (
    <ChartShell title={title} description={description} height={320}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN} barCategoryGap="28%">
          <defs>
            {data.map((entry, i) => {
              const c = barColors[i] ?? fill;
              return (
                <linearGradient
                  key={entry.name ?? i}
                  id={`${gradBase}-bar-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: theme.tick, fontSize: 12 }}
            axisLine={{ stroke: theme.axis }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.tick, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} cursor={{ fill: theme.cursor }} />
          <Bar dataKey={dataKey} radius={[8, 8, 4, 4]} maxBarSize={56} isAnimationActive>
            {data.map((entry, i) => (
              <Cell key={entry.name ?? i} fill={`url(#${gradBase}-bar-${i})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
