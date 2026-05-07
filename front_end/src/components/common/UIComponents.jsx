import React from 'react';
import { getStatusBadgeColor, getStatusLabel } from '../../utils/helpers';

/**
 * Reusable Card Component - Modern, professional styling
 */
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl ${className}`}>
    {children}
  </div>
);

/**
 * Status Badge Component - Consistent styling with professional colors
 */
export const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(status)} transition-colors duration-200`}>
    {getStatusLabel(status)}
  </span>
);

/**
 * Financial Metric Card - Modern card with icon and value
 */
export const MetricCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  };

  return (
    <Card className={`border-2 ${colorClasses[color]} cursor-default transition-all duration-300`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="flex-shrink-0 text-4xl opacity-30 transition-opacity duration-300">
            <Icon className="w-10 h-10" />
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Modal Component - Professional modal with backdrop
 */
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300">
      <Card className={`w-full ${sizeClasses[size]} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-light"
          >
            ×
          </button>
        </div>
        <div>{children}</div>
      </Card>
    </div>
  );
};

/**
 * Button Component - Professional button with multiple variants
 */
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm font-medium',
    md: 'px-6 py-2.5 text-base font-medium',
    lg: 'px-8 py-3 text-lg font-semibold'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
};

/**
 * Input Field Component - Modern input with better focus states
 */
export const Input = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  required = false,
  error = null
}) => (
  <div className="mb-5">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
      }`}
    />
    {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
  </div>
);

/**
 * Select Dropdown Component - Modern select with consistent styling
 */
export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [],
  required = false,
  error = null
}) => (
  <div className="mb-5">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 appearance-none bg-white ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
      }`}
    >
      <option value="">-- Sélectionnez une option --</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
  </div>
);

/**
 * Table Component - Professional table with better styling
 */
export const Table = ({ columns, data, onRowClick = null }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200">
    <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          {columns.map(col => (
            <th 
              key={col.key}
              className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            onClick={() => onRowClick?.(row)}
            className={`border-b border-gray-100 transition-all duration-200 ${
              onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''
            }`}
          >
            {columns.map(col => (
              <td key={col.key} className="px-6 py-4 text-sm text-gray-700 font-medium">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Loading Spinner - Professional animated spinner
 */
export const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
    </div>
  </div>
);

/**
 * Empty State - Professional empty state message
 */
export const EmptyState = ({ message = 'Aucune donnée disponible' }) => (
  <div className="text-center py-16">
    <p className="text-gray-500 text-lg font-medium">{message}</p>
  </div>
);

/**
 * Alert Component - Professional alerts with consistent styling
 */
export const Alert = ({ type = 'info', message, onClose = null }) => {
  const typeClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  return (
    <div className={`border-2 rounded-xl p-4 mb-6 flex justify-between items-center transition-all duration-300 ${typeClasses[type]}`}>
      <p className="font-medium">{message}</p>
      {onClose && (
        <button 
          onClick={onClose} 
          className="font-bold text-xl ml-4 hover:opacity-75 transition-opacity duration-200"
        >
          ×
        </button>
      )}
    </div>
  );
};
