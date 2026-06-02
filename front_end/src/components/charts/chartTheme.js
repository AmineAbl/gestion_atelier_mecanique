/** Shared palette & Recharts styling for accountant dashboards */

export const CHART_COLORS = {
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  green: '#22c55e',
  greenLight: '#4ade80',
  amber: '#f59e0b',
  amberLight: '#fbbf24',
  violet: '#8b5cf6',
  violetLight: '#a78bfa',
  rose: '#f43f5e',
  cyan: '#06b6d4',
};

export function getChartTheme(isDark) {
  return {
    grid: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.08)',
    axis: isDark ? '#94a3b8' : '#64748b',
    tick: isDark ? '#cbd5e1' : '#475569',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(226, 232, 240, 0.9)',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
    tooltipMuted: isDark ? '#94a3b8' : '#64748b',
    cursor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.06)',
    polarGrid: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.12)',
    cardBg: isDark
      ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.55) 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    cardBorder: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(226, 232, 240, 0.9)',
    dotGrid: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
  };
}

export const CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 8 };
