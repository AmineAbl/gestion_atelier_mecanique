/**
 * Design System / Theme Definitions
 * Ensures consistent styling across all pages
 */

export const designSystem = {
  // Typography
  typography: {
    fontFamily: {
      base: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '48px',
      '5xl': '64px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Colors
  colors: {
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceAlt: '#f1f5f9',
      border: '#e2e8f0',
      text: '#1e293b',
      textMuted: '#64748b',
      textLight: '#94a3b8',
      
      primary: '#2563eb',
      primaryLight: '#3b82f6',
      primaryLighter: '#60a5fa',
      
      success: '#059669',
      successLight: '#10b981',
      
      warning: '#d97706',
      warningLight: '#f59e0b',
      
      error: '#dc2626',
      errorLight: '#ef4444',
      
      info: '#0891b2',
      infoLight: '#06b6d4',
    },
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceAlt: '#334155',
      border: 'rgba(255,255,255,0.1)',
      text: '#f1f5f9',
      textMuted: '#cbd5e1',
      textLight: '#94a3b8',
      
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryLighter: '#93c5fd',
      
      success: '#10b981',
      successLight: '#34d399',
      
      warning: '#f59e0b',
      warningLight: '#fbbf24',
      
      error: '#ef4444',
      errorLight: '#f87171',
      
      info: '#06b6d4',
      infoLight: '#22d3ee',
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // Border Radius
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    light: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    },
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      md: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    },
  },

  // Transitions
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
    slowest: 'all 0.7s ease-in-out',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Grid
  grid: {
    container: '1200px',
    gap: '24px',
    gapSm: '16px',
  },
};

// Helper function for theme-aware styles
export const getThemeStyles = (isDark) => {
  const colors = isDark ? designSystem.colors.dark : designSystem.colors.light;
  return {
    ...colors,
    spacing: designSystem.spacing,
    typography: designSystem.typography,
    borderRadius: designSystem.borderRadius,
    shadows: isDark ? designSystem.shadows.dark : designSystem.shadows.light,
  };
};

// Reusable CSS classes for consistency
export const baseStyles = {
  card: `rounded-2xl border-2 transition-all duration-300`,
  button: `font-semibold transition-all duration-300 rounded-lg cursor-pointer`,
  input: `rounded-lg border-2 px-4 py-2 transition-colors duration-300 font-medium`,
  heading: `font-bold tracking-tight`,
  text: `transition-colors duration-300`,
};
