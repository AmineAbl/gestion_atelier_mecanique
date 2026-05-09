import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center rounded-full border-2 transition-all duration-300 p-1 backdrop-blur-md" style={{
      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
    }}>
      <button
        onClick={() => toggleTheme()}
        className={`relative flex items-center justify-center rounded-full p-2.5 transition-all duration-300 font-semibold ${
          isDark
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-amber-300 hover:from-slate-600 hover:to-slate-700 shadow-lg shadow-amber-500/20'
            : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-500/30'
        }`}
        style={{
          animation: isDark ? 'rotateSun 0.6s ease-out' : 'rotateMoon 0.6s ease-out'
        }}
        aria-label="Toggle theme"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Moon className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <Sun className="w-5 h-5" strokeWidth={2.5} />
        )}
      </button>

      <style>{`
        @keyframes rotateSun {
          from { transform: rotate(-180deg); opacity: 0; }
          to { transform: rotate(0); opacity: 1; }
        }
        @keyframes rotateMoon {
          from { transform: rotate(180deg); opacity: 0; }
          to { transform: rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
