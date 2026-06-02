import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getChartTheme } from './chartTheme';

export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      className="rounded-lg border px-3 py-2.5 text-xs shadow-xl backdrop-blur-sm"
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText,
      }}
    >
      {displayLabel && (
        <p className="mb-2 font-semibold" style={{ color: theme.tooltipText }}>
          {displayLabel}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
              />
              <span style={{ color: theme.tooltipMuted }}>{entry.name}</span>
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {formatter
                ? formatter(entry.value, entry.name, entry)?.[0] ?? entry.value
                : typeof entry.value === 'number'
                  ? entry.value.toLocaleString('fr-FR')
                  : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
