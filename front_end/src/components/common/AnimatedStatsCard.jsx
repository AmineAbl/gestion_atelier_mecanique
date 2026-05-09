import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AnimatedStatsCard = React.forwardRef(
  ({ title, value, change, changePeriod, icon: Icon, color = 'blue' }, ref) => {
    const { isDark } = useTheme();

    const colorClasses = {
      green: isDark 
        ? 'text-green-400 bg-green-500/10 border-green-500/20' 
        : 'text-green-600 bg-green-50 border-green-200',
      yellow: isDark 
        ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' 
        : 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: isDark 
        ? 'text-red-400 bg-red-500/10 border-red-500/20' 
        : 'text-red-600 bg-red-50 border-red-200',
      blue: isDark 
        ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
        : 'text-blue-600 bg-blue-50 border-blue-200',
    };

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
          isDark
            ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        style={{
          animation: 'fadeInUp 0.6s ease-out'
        }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: isDark
              ? 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent)'
              : 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent)'
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {title}
            </h3>
            {Icon && (
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Main value */}
          <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            {value}
          </h2>

          {/* Change indicator */}
          {change !== undefined && (
            <p className={`text-sm font-semibold ${
              change >= 0 
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {change >= 0 ? '+' : ''}{change}% {changePeriod || 'vs last month'}
            </p>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }
);

AnimatedStatsCard.displayName = 'AnimatedStatsCard';
