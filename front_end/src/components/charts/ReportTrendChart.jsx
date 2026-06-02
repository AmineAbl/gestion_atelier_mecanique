import React, { useId } from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { ChartShell } from './ChartShell';
import { ChartTooltip } from './ChartTooltip';
import { CHART_MARGIN, getChartTheme } from './chartTheme';
import './accountantCharts.css';

/** Multi-series line chart for financial reports (currency tooltips). */
export function ReportTrendChart({
  data,
  title,
  description,
  lines,
  xKey = 'month',
  formatValue,
  height = 340,
}) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const gradientId = useId().replace(/:/g, '');

  if (!data?.length || !lines?.length) return null;

  const valueFormatter = formatValue
    ? (v) => [formatValue(v), '']
    : undefined;

  const yTickFormatter = formatValue
    ? (v) => {
        if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
        return String(v);
      }
    : undefined;

  return (
    <ChartShell title={title} description={description} height={height} className="col-span-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ ...CHART_MARGIN, left: 8, bottom: 4 }}>
          <defs>
            {lines.map((s) => (
              <linearGradient
                key={s.dataKey}
                id={`${gradientId}-${s.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={{ stroke: theme.axis }}
            tickLine={false}
            interval="preserveStartEnd"
            dy={8}
          />
          <YAxis
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            content={<ChartTooltip formatter={valueFormatter} />}
            cursor={{ stroke: theme.cursor, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ color: theme.tick, fontSize: 12, paddingBottom: 8 }}
          />
          {lines.map((s) => (
            <Area
              key={`area-${s.dataKey}`}
              type="monotone"
              dataKey={s.dataKey}
              stroke="none"
              fill={`url(#${gradientId}-${s.dataKey})`}
              isAnimationActive
            />
          ))}
          {lines.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.label ?? s.dataKey}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ fill: s.color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }}
              isAnimationActive
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}
