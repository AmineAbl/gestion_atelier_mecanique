// ============================================================
// ACCOUNTANT DASHBOARD - MAIN FINANCIAL MANAGEMENT INTERFACE
// ============================================================
// Purpose: Central hub for accountants to view financial metrics,
// manage invoices, track repairs, and analyze business performance
// File: src/components/AccountantDashboard.jsx

// ============================================================
// IMPORTS
// ============================================================

// React core - useState for managing component state (activeTab)
import React, { useState } from 'react';

// ============================================================
// ICON IMPORTS FROM LUCIDE REACT
// ============================================================
// Lucide React Icons - Professional icon library for UI elements
// DollarSign: Financial/currency icon for revenue metrics
// Clock: Time-based operations (pending invoices, delays)
// TrendingUp: Performance indicators showing positive metrics
// TrendingDown: Performance indicators showing negative metrics
// LogOut: Exit/logout button icon
// User: User profile/account icon for displaying user info
// BarChart3: Chart/analytics icon for dashboard reference
// CreditCard: Payment/invoice related icon
// Wrench: Repair/maintenance icon for repair tracking
// AlertCircle: Warning/alert icon for issues
// CheckCircle: Success/completion icon for finished tasks
// Settings: Configuration/options icon
// Home: Home/dashboard navigation icon
import {
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  LogOut,
  User,
  BarChart3,
  CreditCard,
  Wrench,
  AlertCircle,
  CheckCircle,
  Settings,
  Home,
} from 'lucide-react';

// ============================================================
// THEME MANAGEMENT
// ============================================================
// Custom hook to access global dark/light theme context
// Returns: { isDark: boolean, toggleTheme: function }
// isDark: true = dark mode enabled, false = light mode enabled
import { useTheme } from '../context/ThemeContext';

// ============================================================
// COMMON UI COMPONENTS
// ============================================================
// AnimatedStatsCard: Reusable card component showing metrics with animations
// Props: title, value, change, changePeriod, icon, color
// Used for displaying financial metrics (revenue, pending, costs, profit)
import { AnimatedStatsCard } from './common/AnimatedStatsCard';

// ThemeToggle: Dark/light mode switcher button
// Props: none - uses useTheme hook internally
// Displays sun icon in light mode, moon icon in dark mode
import { ThemeToggle } from './common/ThemeToggle';

// CircularMenu: Radial navigation menu for tab switching
// Props: items (array), onSelect (callback)
// Shows menu items in circular layout when clicked
import { CircularMenu } from './common/CircularMenu';

// Footer: Shared footer component with branding and links
// Props: none - uses useTheme hook internally
// Displays at bottom of page with theme support
import { Footer } from './common/Footer';

// ============================================================
// ADVANCED CHART COMPONENTS
// ============================================================
// Advanced Chart Components for professional data visualization

// LineChart: Line graph for trends
// Props: title, data, dataKey, label, height
// Shows data points connected by lines with smooth curves

// DonutChart: Circular distribution chart (like pie chart with hole)
// Props: title, data, height
// Shows proportional breakdown of categories

// ProgressChart: Horizontal progress bars
// Props: title, data, height
// Shows percentage-based progress for each category

// AreaChart: Filled area chart for time-series data
// Props: title, data, dataKey, label, height
// Shows trends with area fill between line and axis
import { LineChart, DonutChart, ProgressChart, AreaChart } from './common/AdvancedCharts';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
// formatCurrency: Converts numbers to currency format
// Input: 1000 → Output: "€1,000.00"
// Usage: formatCurrency(financialMetrics.totalRevenue)

// calculateFinancialMetrics: Computes revenue, pending, costs, profit from data
// Input: (factures array, reparations array)
// Output: { totalRevenue, totalPending, totalCosts, totalProfit }
// Used to populate financial metrics cards

// getRepairsOverview: Summarizes repair counts by status
// Input: reparations array
// Output: { total, completed, inProgress, pending, completionRate }
// Used for repair statistics display
import {
  formatCurrency,
  calculateFinancialMetrics,
  getRepairsOverview
} from '../utils/helpers';

// ============================================================
// CUSTOM DATA MANAGEMENT HOOKS
// ============================================================
// useClients: Fetch/manage client data
// Returns: { clients: array, addClient, updateClient, deleteClient, ... }
// Manages all client records and operations

// useFactures: Fetch/manage invoice data
// Returns: { factures: array, addFacture, updateFacture, deleteFacture, ... }
// Manages all invoice records and operations

// useReparations: Fetch/manage repair data
// Returns: { reparations: array, addRepair, updateRepair, deleteRepair, ... }
// Manages all repair records and operations

// useVehicules: Fetch/manage vehicle data
// Returns: { vehicules: array, addVehicle, updateVehicle, deleteVehicle, ... }
// Manages all vehicle records and operations
import {
  useClients,
  useFactures,
  useReparations,
  useVehicules
} from '../hooks/useManagement';

// ============================================================
// SUB-PAGE COMPONENTS (TAB CONTENT)
// ============================================================
// ClientsList: Tab page to view and manage all clients
// Props: clients, factures, reparations, vehicules
// Displays clients in table format with actions
import ClientsList from './Accountant/ClientsList';

// InvoicesList: Tab page to view and manage all invoices
// Props: factures, clients, reparations
// Displays invoices in table format with payment status
import InvoicesList from './Accountant/InvoicesList';

// FinancialReport: Tab page for detailed financial reports and analysis
// Props: factures, reparations, clients
// Displays comprehensive financial analysis and trends
import FinancialReport from './Accountant/FinancialReport';

// ============================================================
// MAIN COMPONENT DEFINITION
// ============================================================

/**
 * AccountantDashboard Component
 * 
 * Props:
 *   - user (object): Current logged-in user data { name, email, id }
 *   - onLogout (function): Callback to handle user logout action
 * 
 * Purpose: Render the complete financial dashboard with multiple tabs,
 * metrics, charts, and management interfaces for business operations
 * 
 * State Management:
 *   - activeTab: Controls which dashboard section is currently displayed
 * 
 * Data Flow:
 *   1. Fetch data from hooks (clients, factures, reparations, vehicules)
 *   2. Calculate financial metrics and repair statistics
 *   3. Prepare data structures for chart components
 *   4. Render appropriate content based on activeTab
 */
export default function AccountantDashboard({ user, onLogout }) {

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // activeTab: Controls which dashboard section is currently displayed
  // Type: string
  // Values: 'overview' (main dashboard), 'invoices', 'clients', 'reports'
  // Initial value: 'overview' shows the main financial overview when component loads
  // Updated: When user clicks tab buttons or menu items
  // Purpose: Conditionally renders different tab content based on this value
  // Example: activeTab === 'overview' && <div>...overview content...</div>
  const [activeTab, setActiveTab] = useState('overview');
  
  // Destructure isDark from theme context
  // Type: boolean
  // isDark: true = dark mode enabled, false = light mode enabled
  // Used throughout component to apply conditional Tailwind classes
  // Example: isDark ? 'bg-slate-900' : 'bg-white'
  // Allows theme-aware styling without needing to pass props down
  const { isDark } = useTheme();

  // ============================================================
  // DATA FETCHING - CUSTOM HOOKS
  // ============================================================
  
  // clients: Contains all client records with methods to add/update/delete
  // Type: object
  // Example structure: { clients: [{id, name, email, phone}, ...], addClient, deleteClient }
  // Data source: Fetched from backend API or local storage
  // Used for: Displaying client count, client list tab, client selections in forms
  const clients = useClients();
  
  // factures: Contains all invoice records with business logic
  // Type: object
  // Example structure: { factures: [{id, amount, status, date}, ...], addFacture, updateFacture }
  // Status values: 'paid', 'pending', 'overdue'
  // Used for: Financial metrics, invoice filtering, invoice list tab
  const factures = useFactures();
  
  // reparations: Contains all repair records for tracking workshop activity
  // Type: object
  // Example structure: { reparations: [{id, status, client_id, cost}, ...], addRepair, updateRepair }
  // Status values: 'completed', 'in_progress', 'pending'
  // Used for: Repair statistics, completion rates, repair overview card
  const reparations = useReparations();
  
  // vehicules: Contains all vehicle records (cars being repaired)
  // Type: object
  // Example structure: { vehicules: [{id, brand, model, owner_id}, ...], addVehicle, deleteVehicle }
  // Used for: Vehicle tracking, repair assignments, details display
  const vehicules = useVehicules();

  // ============================================================
  // FINANCIAL CALCULATIONS & METRICS
  // ============================================================
  
  // financialMetrics: Computed object containing key financial indicators
  // Type: object
  // Calculated by: calculateFinancialMetrics(factures array, reparations array)
  // Contains:
  //   - totalRevenue: Sum of all paid invoices (€)
  //   - totalPending: Sum of unpaid invoices still owed (€)
  //   - totalCosts: Sum of repair/operational costs (€)
  //   - totalProfit: Revenue - Costs (€)
  //   - profitMargin: Percentage of profit vs revenue (0-100%)
  // Used for: Populating AnimatedStatsCard components in grid
  // Example: formatCurrency(financialMetrics.totalRevenue) displays formatted value
  const financialMetrics = calculateFinancialMetrics(
    factures.factures,        // Pass invoice array to calculate revenue
    reparations.reparations   // Pass repair array to calculate costs
  );

  // repairsOverview: Summarized repair statistics
  // Type: object
  // Calculated by: getRepairsOverview(reparations array)
  // Categorizes repairs by completion status
  // Contains:
  //   - total: Total number of repairs in system
  //   - completed: Number of finished/closed repairs
  //   - inProgress: Number of repairs currently being worked on
  //   - pending: Number of repairs waiting for parts/client approval
  //   - completionRate: Percentage of completed repairs (0-100%)
  //     Formula: (completed / total) * 100
  // Used for: Repair statistics display, distribution charts
  const repairsOverview = getRepairsOverview(reparations.reparations);

  // ============================================================
  // CHART DATA PREPARATION - DATA TRANSFORMATION
  // ============================================================
  
  // repairsChartData: Array of repair status categories for bar/column charts
  // Type: array of objects
  // Structure: [{ label: string, repaired: number }, ...]
  // Example: [
  //   { label: 'Terminées', repaired: 45 },
  //   { label: 'En cours', repaired: 12 },
  //   { label: 'En attente', repaired: 8 }
  // ]
  // Used to visualize breakdown of repairs by status
  // Note: Currently unused but kept for potential future use
  const repairsChartData = [
    { label: 'Terminées', repaired: repairsOverview.completed },        // Completed repairs count
    { label: 'En cours', repaired: repairsOverview.inProgress },         // In-progress repairs count
    { label: 'En attente', repaired: repairsOverview.pending },          // Pending repairs count
  ];

  // revenueTrendData: Monthly revenue data for trend visualization
  // Type: array of objects
  // Structure: [{ label: string (month name), revenue: number }, ...]
  // Example: [
  //   { label: 'Janvier', revenue: 8500 },
  //   { label: 'Février', revenue: 12300 }
  // ]
  // Currently hardcoded simulated data showing 6-month revenue progression
  // Shows month-over-month growth trend
  // Used by LineChart and AreaChart components for time-series visualization
  // Real implementation would fetch historical invoice data grouped by month
  // TODO: Replace with dynamic data from database queries
  const revenueTrendData = [
    { label: 'Janvier', revenue: 8500 },        // January: €8,500
    { label: 'Février', revenue: 12300 },       // February: €12,300 (+44.7% growth)
    { label: 'Mars', revenue: 15200 },          // March: €15,200 (+23.6% growth)
    { label: 'Avril', revenue: 14800 },         // April: €14,800 (-2.6% decline)
    { label: 'Mai', revenue: 18900 },           // May: €18,900 (+27.7% growth)
    { label: 'Juin', revenue: 21450 },          // June: €21,450 (+13.5% growth - best month)
  ];

  // repairsDistribution: Pie/Donut chart data showing repair status breakdown
  // Type: array of objects
  // Structure: [{ label: string, value: number }, ...]
  // Example: [
  //   { label: 'Terminées', value: 45 },
  //   { label: 'En cours', value: 12 },
  //   { label: 'En attente', value: 8 }
  // ]
  // Visual representation: How repairs are distributed across statuses
  // Used by DonutChart component to show proportions visually
  // Donut chart colors each segment differently based on status
  const repairsDistribution = [
    { label: 'Terminées', value: repairsOverview.completed },           // Completed count
    { label: 'En cours', value: repairsOverview.inProgress },            // Active count
    { label: 'En attente', value: repairsOverview.pending },             // Waiting count
  ];

  // invoiceStatus: Progress bar data showing invoice payment status percentages
  // Type: array of objects
  // Structure: [{ label: string, value: number (0-100) }, ...]
  // Example: [
  //   { label: 'Payées', value: 65.5 },
  //   { label: 'En attente', value: 25.3 },
  //   { label: 'Retard', value: 9.2 }
  // ]
  // Calculations:
  //   - Paid: (count of paid invoices / total invoices) * 100
  //   - Pending: (count of pending invoices / total invoices) * 100
  //   - Overdue: (count of overdue invoices / total invoices) * 100
  // || 0: Fallback to 0 if no invoices exist (prevents division by zero errors)
  // Used by ProgressChart to show payment collection rates
  // Displayed as horizontal progress bars with percentages
  const invoiceStatus = [
    {
      label: 'Payées',
      // Calculate percentage of paid invoices
      // filter(): Gets only invoices with status 'paid'
      // .length: Counts how many paid invoices exist
      // / factures.factures.length: Divides by total invoices
      // * 100: Converts to percentage (0-100)
      // || 0: If no invoices, default to 0 instead of NaN
      value: (factures.factures.filter(f => f.statut === 'paid').length / factures.factures.length) * 100 || 0
    },
    {
      label: 'En attente',
      // Calculate percentage of pending invoices
      value: (factures.factures.filter(f => f.statut === 'pending').length / factures.factures.length) * 100 || 0
    },
    {
      label: 'Retard',
      // Calculate percentage of overdue invoices
      value: (factures.factures.filter(f => f.statut === 'overdue').length / factures.factures.length) * 100 || 0
    },
  ];

  // ============================================================
  // NAVIGATION MENU CONFIGURATION
  // ============================================================
  
  // menuItems: Array of navigation tabs for dashboard sections
  // Type: array of objects
  // Each item has:
  //   - label: Display text for the button/menu (in French)
  //   - icon: Visual symbol (emoji or icon string)
  //   - id: Unique identifier to set activeTab when clicked
  // Used for both:
  //   1. Horizontal tab buttons at top of dashboard
  //   2. Circular radial menu as alternative navigation
  // When user clicks item, handleMenuSelect() sets activeTab to item.id
  const menuItems = [
    {
      label: 'Vue d\'ensemble',    // "Overview" - main dashboard
      icon: '📊',                   // Chart emoji
      id: 'overview'                // Sets activeTab='overview' when clicked
    },
    {
      label: 'Factures',            // "Invoices" - invoice management
      icon: '📄',                   // Document emoji
      id: 'invoices'                // Sets activeTab='invoices' when clicked
    },
    {
      label: 'Clients',             // "Clients" - client management
      icon: '👥',                   // People emoji
      id: 'clients'                 // Sets activeTab='clients' when clicked
    },
    {
      label: 'Rapports',            // "Reports" - financial reports
      icon: '📈',                   // Chart/trend emoji
      id: 'reports'                 // Sets activeTab='reports' when clicked
    },
  ];

  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  
  // handleMenuSelect: Callback function triggered when user clicks menu item
  // Parameter: item - the menu object { label, icon, id }
  // Action: Updates activeTab state to switch to selected tab
  // Flow:
  //   1. User clicks menu button
  //   2. CircularMenu component calls this handler with menu item
  //   3. setActiveTab(item.id) updates state
  //   4. Component re-renders with new activeTab
  //   5. Conditional rendering shows appropriate tab content
  // Example: User clicks "Factures" → handleMenuSelect({ ..., id: 'invoices' }) → activeTab becomes 'invoices' → InvoicesList renders
  const handleMenuSelect = (item) => {
    setActiveTab(item.id);
  };

  // ============================================================
  // COMPONENT RENDER - JSX STRUCTURE
  // ============================================================
  return (
    // MAIN CONTAINER - Full-height div with responsive gradient background
    // min-h-screen: Minimum height of full viewport (prevents footer from floating)
    // transition-colors duration-300: Smooth animation when theme switches (0.3s duration)
    // Conditional gradient:
    //   - Dark theme: from slate-950 → via slate-900 → to slate-950 (multiple dark shades)
    //   - Light theme: from white → via gray-50 → to white (subtle gray gradient)
    // to-br: Gradient direction is "top-left to bottom-right"
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'  // Dark mode gradient
        : 'bg-gradient-to-br from-white via-gray-50 to-white'            // Light mode gradient
    }`}>
      
      {/* ========== HEADER SECTION ========== */}
      {/* Top navigation bar with dashboard title and user controls */}
      {/* Features: Title, subtitle, theme toggle, user info, logout button */}
      {/* Fixed at top with shadow and border for visual separation */}
      <div className={`shadow-md border-b-2 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 border-white/10'    // Dark mode: slate background, subtle white border
          : 'bg-white border-gray-200'         // Light mode: white background, gray border
      }`}>
        {/* Container: Max-width constraint (1280px) + horizontal/vertical padding */}
        {/* max-w-7xl: Limits content width for better readability on large screens */}
        {/* mx-auto: Centers container horizontally */}
        {/* px-6: Horizontal padding (left/right) = 1.5rem on all screen sizes */}
        {/* py-8: Vertical padding (top/bottom) = 2rem for spacious header */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Flex container: Spreads title on left, controls on right */}
          {/* flex: Enable flexbox layout */}
          {/* justify-between: Space title and controls to opposite ends */}
          {/* items-start: Align items to top of container */}
          <div className="flex justify-between items-start">
            
            {/* LEFT SECTION - Dashboard Title & Subtitle */}
            {/* flex-1: Takes all available space on left side */}
            <div className="flex-1">
              
              {/* Main heading: Dashboard title "Tableau de Bord Comptable" */}
              {/* text-4xl: Large title size (2.25rem) for visual hierarchy */}
              {/* font-bold: Font weight 700 for strong visual weight */}
              {/* tracking-tight: Reduce letter spacing (-0.05em) for professional look */}
              {/* transition-colors duration-300: Smooth color change on theme switch (0.3s) */}
              {/* Conditional text color: white in dark mode, black in light mode */}
              <h1 className={`text-4xl font-bold tracking-tight transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                Tableau de Bord Comptable
              </h1>
              
              {/* Subtitle describing dashboard functionality */}
              {/* mt-2: Small margin top (0.5rem) for spacing below title */}
              {/* text-lg: Slightly smaller than title (1.125rem) */}
              {/* font-medium: Font weight 500 (between regular and bold) */}
              {{/* Conditional text color: gray in both modes (lighter shade) */}}
              <p className={`mt-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Suivi financier en temps réel et gestion administrative
              </p>
            </div>

            {/* RIGHT SECTION - User Controls & Theme Toggle */}
            {{/* ml-8: Large left margin (2rem) to push away from title */}}
            {{/* Conditionally render only if user is logged in */}}
            {{/* This prevents errors if user data is undefined */}}
            {user && (
              // flex: Enable flexbox for horizontal layout
              // items-center: Vertically center all controls
              // gap-4: Space between controls (1rem)
              <div className="flex items-center gap-4 ml-8">
                
                {/* Theme Toggle Button - Sun/Moon icon switcher */}
                {/* Component: Shows sun in light mode, moon in dark mode */}
                {/* On click: Toggles isDark state in theme context */}
                {/* Provides visual feedback with color changes and animations */}
                <ThemeToggle />
                
                {/* USER INFO CARD - Displays current user details */}
                {/* Styled box with border and conditional background/colors */}
                {/* text-right: Align content to right side of box */}
                {/* px-4 py-2: Horizontal padding 1rem, vertical padding 0.5rem */}
                {/* rounded-lg: Border radius 0.5rem for subtle rounded corners */}
                {/* border-2: Border width 2px for visual definition */}
                {/* transition-colors duration-300: Smooth color transitions */}
                <div className={`text-right px-4 py-2 rounded-lg border-2 transition-colors duration-300 ${
                  isDark
                    ? 'border-white/10 bg-white/5'      // Dark mode: subtle white border and background
                    : 'border-gray-200 bg-gray-50'       // Light mode: gray border and background
                }`}>
                  
                  {/* User name with icon */}
                  {/* flex items-center gap-2: Icon and text aligned horizontally with 0.5rem spacing */}
                  {/* font-semibold: Font weight 600 for emphasis */}
                  {/* gap-2: Space between icon and name text */}
                  <p className={`font-semibold flex items-center gap-2 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    <User className="w-5 h-5" />
                    {user.name}
                  </p>
                  
                  {/* User email below name */}
                  {/* text-sm: Smaller text size for secondary info (0.875rem) */}
                  {{/* Conditional color: lighter shade than name */}}
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user.email}
                  </p>
                </div>
                
                {/* LOGOUT BUTTON */}
                {{/* Click handler: onClick={onLogout} triggers logout callback */}}
                {{/* Callback props: Parent passes onLogout function that handles: */}}
                {{/*   1. Clear session/authentication state */}}
                {{/*   2. Remove user from localStorage */}}
                {{/*   3. Navigate back to landing page */}}
                {{/* flex items-center gap-2: Icon + text horizontally aligned */}}
                {{/* px-4 py-2: Button padding for touch-friendly size */}}
                {{/* rounded-lg: Rounded corners for modern appearance */}}
                {{/* font-semibold: Bold text for visibility */}}
                {{/* transition-all duration-300: Smooth animation on hover/click */}}
                {{/* hover:scale-105: Grows 5% on hover for interactive feedback */}}
                {{/* Conditional red styling: different red shades for dark/light mode */}}
                <button
                  onClick={onLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      {{/* Container with max width and padding */}}
      {{/* max-w-7xl: Limits content width (1280px) for readability */}}
      {{/* mx-auto: Centers content horizontally */}}
      {{/* px-6: Horizontal padding (1.5rem) */}}
      {{/* py-8: Vertical padding (2rem) creates space from header */}}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ========== TAB NAVIGATION & MENU ========== */}
        {{/* flex gap-4 mb-8: Horizontal layout with 1rem gap, margin below */}}
        {{/* items-center: Vertically align children (buttons and menu) */}}
        <div className="flex gap-4 mb-8 items-center">
          
          {/* HORIZONTAL TAB BUTTONS */}
          {{/* flex-1: Takes remaining space, pushes circular menu to right */}}
          {{/* flex gap-1: Buttons grouped with small 0.25rem spacing */}}
          {{/* border-2 rounded-2xl p-1: Container styling */}}
          {{/* rounded-2xl: Very rounded corners (1rem radius) for modern look */}}
          {{/* p-1: Small padding (0.25rem) inside container around buttons */}}
          {{/* transition-colors duration-300: Smooth theme switch */}}
          <div className={`flex-1 flex gap-1 border-2 rounded-2xl p-1 transition-colors duration-300 ${
            isDark
              ? 'bg-slate-900/50 border-white/10'    // Dark mode: 50% transparent slate background
              : 'bg-gray-100 border-gray-200'         // Light mode: light gray background
          }`}>
            
            {/* Loop through menuItems to create tab buttons */}
            {{/* .map(): Iterates over each menu item */}}
            {{/* key={item.id}: React key for list rendering optimization */}}
            {{/* Prevents unnecessary re-renders and maintains component state */}}
            {menuItems.map((item) => (
              <button
                key={item.id}
                
                // Click handler: Sets activeTab to this item's id
                // Example: Click "Factures" button → setActiveTab('invoices')
                // Triggers component re-render with new activeTab value
                onClick={() => setActiveTab(item.id)}
                
                // Conditional styling: Active tab gets highlight, inactive gets hover effect
                // Smooth transition when switching (0.3s)
                // px-6: Horizontal padding inside button (1.5rem)
                // py-3: Vertical padding (0.75rem)
                // font-semibold: Bold text (600 weight)
                // text-sm: Smaller text size (0.875rem)
                // transition-all duration-300: Smooth animation
                // rounded-lg: Rounded corners (0.5rem)
                className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
                  activeTab === item.id
                    // ACTIVE TAB STYLE - Inverted colors for clear distinction
                    ? isDark
                      ? 'bg-white text-black shadow-lg'           // Dark: white bg, black text, shadow
                      : 'bg-black text-white shadow-lg'            // Light: black bg, white text, shadow
                    // INACTIVE TAB STYLE - Subtle, ready for hover interaction
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'      // Dark: gray text, white on hover
                      : 'text-gray-600 hover:text-black hover:bg-white/50'      // Light: gray text, black on hover
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* CIRCULAR MENU - Alternative navigation (mobile-friendly radial menu) */}
          {{/* flex justify-end: Aligns to right side of container */}}
          <div className="flex justify-end">
            
            {/* CircularMenu component: Shows menu items in circular layout */}
            {{/* items={menuItems}: Uses same menu config as horizontal buttons */}}
            {{/* onSelect={handleMenuSelect}: Callback when user selects item */}}
            {{/* MenuItem click → onSelect(item) → handleMenuSelect(item) → setActiveTab(item.id) */}}
            {{/* Component displays main toggle button, items appear on click */}}
            {{/* Items arranged in circle around center point */}}
            <CircularMenu items={menuItems} onSelect={handleMenuSelect} />
          </div>
        </div>

        {/* ========== CONDITIONAL TAB CONTENT RENDERING ========== */}
        {{/* Different content renders based on activeTab state value */}}
        {{/* Only ONE section renders at a time */}}
        {{/* Angular: && operator shows content only if condition is true */}}

        {/* ========== OVERVIEW TAB CONTENT ========== */}
        {{/* Main dashboard view with financial metrics and charts */}}
        {{/* Displays when activeTab === 'overview' */}}
        {{/* Shows 4 key metrics + 4 charts + 2 info cards */}}
        {activeTab === 'overview' && (
          // space-y-8: Vertical spacing of 2rem between all child elements
          // Creates clear separation between sections
          <div className="space-y-8">
            
            {/* ========== FINANCIAL METRICS GRID ========== */}
            {{/* Grid showing 4 key financial metrics */}}
            {{/* grid grid-cols-1: Single column on mobile */}}
            {{/* md:grid-cols-2: 2 columns on medium screens */}}
            {{/* lg:grid-cols-4: 4 columns on large screens */}}
            {{/* gap-6: 1.5rem spacing between cards */}}
            {{/* Responsive design adapts to screen size */}}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* CARD 1: REVENUE COLLECTED */}
              {{/* AnimatedStatsCard component with props */}}
              {{/* title: Label shown above number */}}
              {{/* value: Main metric value (formatted currency) */}}
              {{/* change: Percentage change indicator (+12%) */}}
              {{/* changePeriod: Time period for change ("ce mois" = "this month") */}}
              {{/* icon: Lucide icon component (DollarSign) */}}
              {{/* color: Color theme for card ("green" = green accent) */}}
              <AnimatedStatsCard
                title="Revenus collectés"
                value={formatCurrency(financialMetrics.totalRevenue)}
                change={12}
                changePeriod="ce mois"
                icon={DollarSign}
                color="green"
              />
              
              {/* CARD 2: PENDING INVOICES */}
              {{/* Shows invoices waiting for payment */}}
              {{/* Negative change (-5%) indicates fewer pending invoices (good) */}}
              <AnimatedStatsCard
                title="Factures en attente"
                value={formatCurrency(financialMetrics.totalPending)}
                change={-5}
                changePeriod="ce mois"
                icon={Clock}
                color="yellow"
              />
              
              {/* CARD 3: OPERATIONAL EXPENSES */}
              {{/* Shows business costs and expenses */}}
              {{/* TrendingDown icon indicates expense tracking */}}
              {{/* +8% means expenses increased (neutral, just tracking) */}}
              <AnimatedStatsCard
                title="Dépenses opérationnelles"
                value={formatCurrency(financialMetrics.totalCosts)}
                change={8}
                changePeriod="ce mois"
                icon={TrendingDown}
                color="red"
              />
              
              {/* CARD 4: NET PROFIT */}
              {{/* Bottom line - revenue minus expenses */}}
              {{/* color changes based on profit value */}}
              {{/* Positive profit → green card, negative → red card */}}
              {{/* Conditional change: 15% if profitable, -10% if losses */}}
              <AnimatedStatsCard
                title="Profit net"
                value={formatCurrency(financialMetrics.totalProfit)}
                change={financialMetrics.totalProfit >= 0 ? 15 : -10}
                changePeriod="ce mois"
                icon={TrendingUp}
                color={financialMetrics.totalProfit >= 0 ? 'green' : 'red'}
              />
            </div>

            {/* ========== CHARTS GRID - 2x2 LAYOUT ========== */}
            {{/* Grid with 4 advanced charts */}}
            {{/* lg:grid-cols-2: 2 columns on large screens, 1 on small */}}
            {{/* gap-6: 1.5rem spacing between charts */}}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CHART 1: REVENUE TREND (Area Chart) */}
              {{/* Shows revenue progression over 6 months */}}
              {{/* Area chart displays trend with filled area under line */}}
              {{/* title: Chart header */}}
              {{/* data={revenueTrendData}: Monthly revenue data */}}
              {{/* dataKey="revenue": Which property to use for Y-axis values */}}
              {{/* label="Revenus mensuels": Legend label */}}
              {{/* height="300px": Chart display height */}}
              <AreaChart
                title="Tendance des revenus"
                data={revenueTrendData}
                dataKey="revenue"
                label="Revenus mensuels"
                height="300px"
              />

              {/* CHART 2: REPAIRS DISTRIBUTION (Donut Chart) */}
              {{/* Pie/Donut chart showing repair status breakdown */}}
              {{/* Visual proportions show status distribution */}}
              {{/* data={repairsDistribution}: Repair count by status */}}
              {{/* Donut shape (not full pie) for modern appearance */}}
              <DonutChart
                title="Distribution des réparations"
                data={repairsDistribution}
                height="300px"
              />

              {/* CHART 3: REVENUE GROWTH (Line Chart) */}
              {{/* Line graph showing monthly revenue progression */}}
              {{/* Smooth curves connect data points */}}
              {{/* Allows seeing trends and growth patterns */}}
              <LineChart
                title="Croissance des revenus"
                data={revenueTrendData}
                dataKey="revenue"
                label="Revenus"
                height="300px"
              />

              {/* CHART 4: INVOICE STATUS (Progress Chart) */}
              {{/* Horizontal progress bars showing payment collection */}}
              {{/* Shows % of invoices in each status (Paid, Pending, Overdue) */}}
              {{/* data={invoiceStatus}: Payment status percentages */}}
              <ProgressChart
                title="État des factures"
                data={invoiceStatus}
                height="300px"
              />
            </div>

            {/* ========== QUICK STATS OVERVIEW ========== */}
            {{/* Grid with 4 simple statistic cards */}}
            {{/* Compact display of key business numbers */}}
            {{/* grid-cols-1 md:grid-cols-2 lg:grid-cols-4: Responsive 4-column on desktop */}}
            {{/* gap-4: Smaller 1rem spacing for compact cards */}}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* STAT CARD 1: ACTIVE CLIENTS */}
              {{/* Displays total count of active clients */}}
              {{/* Data source: clients.clients.length (array length) */}}
              {{/* rounded-2xl: Rounded corners (1rem radius) */}}
              {{/* border-2: 2px border for definition */}}
              {{/* p-4: 1rem padding inside card */}}
              {{/* transition-all duration-300: Smooth hover effects */}}
              {{/* hover:border-white/20 / hover:border-gray-300: Highlight on hover */}}
              <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                {{/* Label text */}}
                {{/* text-sm: Small label size */}}
                {{/* font-semibold: Bold for emphasis */}}
                {{/* mb-2: 0.5rem margin below label */}}
                <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Clients actifs
                </p>
                {{/* Main number value */}}
                {{/* text-2xl: Large text size (1.5rem) */}}
                {{/* font-bold: Bold weight (700) */}}
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {clients.clients.length}
                </p>
                {{/* Growth indicator */}}
                {{/* text-xs: Very small text (0.75rem) */}}
                {{/* text-green-400: Green color for positive metric */}}
                {{/* mt-1: 0.25rem top margin for spacing */}}
                <p className="text-xs text-green-400 mt-1">+12% croissance</p>
              </div>
              
              {/* STAT CARD 2: INVOICES THIS MONTH */}
              {{/* Displays count of invoices in current month */}}
              {{/* Data: factures.factures.length (total invoices) */}}
              {{/* Blue growth indicator for neutral metric */}}
              <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Factures ce mois
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {factures.factures.length}
                </p>
                <p className="text-xs text-blue-400 mt-1">+8 nouvelles</p>
              </div>
              
              {/* STAT CARD 3: COMPLETION RATE */}
              {{/* Percentage of repairs that are completed */}}
              {{/* Data: repairsOverview.completionRate (0-100%) */}}
              {{/* Green indicator shows excellent performance */}}
              <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Taux de complétion
                </p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {repairsOverview.completionRate}%
                </p>
                <p className="text-xs text-green-400 mt-1">Excellent</p>
              </div>
              
              {/* STAT CARD 4: RECOVERY RATE */}
              {{/* Percentage of invoices that are paid vs issued */}}
              {{/* Calculation: (paid invoices / total invoices) * 100 */}}
              {{/* toFixed(0): Round to whole number (no decimals) */}}
              {{/* Math.max(..., 1): Prevents division by zero */}}
              <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                <p className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Recouvrement
                </p>
                {{/* Green text for positive metric */}}
                <p className={`text-2xl font-bold text-green-400`}>
                  {/* Calculate recovery rate */}
                  {/* Filter: Get only paid invoices */}
                  {/* Length: Count how many paid invoices exist */}
                  {/* Divide by total invoices, multiply by 100 for percentage */}
                  {/* toFixed(0): Round to whole number */}
                  {/* Math.max(..., 1): Use 1 as minimum denominator (prevents division by 0) */}
                  {((factures.factures.filter(f => f.statut === 'paid').length / Math.max(factures.factures.length, 1)) * 100).toFixed(0)}%
                </p>
                {{/* Amber (yellow) indicator means "needs attention" */}}
                <p className="text-xs text-amber-400 mt-1">À suivre</p>
              </div>
            </div>

            {/* ========== DETAILS CARDS - 2 COLUMN LAYOUT ========== */}
            {{/* Grid with 2 detailed information cards */}}
            {{/* Left: Repair status breakdown */}}
            {{/* Right: Key statistics */}}
            {{/* lg:grid-cols-2: 2 columns on large screens, 1 on small */}}
            {{/* gap-6: 1.5rem spacing between cards */}}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ========== CARD: REPAIRS OVERVIEW ========== */}
              {{/* Detailed breakdown of repair statuses */}}
              <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                {{/* Card title with bottom border */}}
                {{/* text-xl: Large title size (1.25rem) */}}
                {{/* font-bold: Bold weight */}}
                {{/* mb-6: 1.5rem margin below title */}}
                {{/* pb-4: 1rem padding below title */}}
                {{/* border-b-2: Bottom border for separation */}}
                <h3 className={`text-xl font-bold mb-6 pb-4 border-b-2 transition-colors duration-300 ${
                  isDark
                    ? 'text-white border-white/10'
                    : 'text-black border-gray-200'
                }`}>
                  État des réparations
                </h3>
                {{/* space-y-4: 1rem vertical spacing between items */}}
                <div className="space-y-4">
                  {{/* Array of repair statistics to display */}}
                  {{/* Each item: {label: string, value: number, color: string} */}}
                  {{/* Map creates a row for each statistic */}}
                  {[
                    { label: 'Total réparations', value: repairsOverview.total, color: isDark ? 'text-white' : 'text-black' },
                    { label: 'Réparations terminées', value: repairsOverview.completed, color: 'text-green-400' },
                    { label: 'En cours de traitement', value: repairsOverview.inProgress, color: 'text-blue-400' },
                    { label: 'En attente de pièces', value: repairsOverview.pending, color: 'text-amber-400' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      {{/* Flex row layout - label on left, value on right */}}
                      {{/* justify-between: Spread items to opposite ends */}}
                      {{/* items-center: Vertically center text */}}
                      {{/* p-3: 0.75rem padding inside row */}}
                      {{/* rounded-lg: Rounded corners (0.5rem) */}}
                      {{/* border: 1px border (default) */}}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
                        isDark
                          ? 'bg-slate-800/50 border-white/10'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      // CSS animation: Fade in from bottom with staggered delays
                      // delay increases by 0.1s per item (idx * 0.1)
                      // Creates cascade effect when component loads
                      style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                    >
                      {{/* Label text on left */}}
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.label}:
                      </span>
                      {{/* Value number on right */}}
                      {{/* font-bold: Make number stand out */}}
                      {{/* text-lg: Larger text for emphasis (1.125rem) */}}
                      {{/* item.color: Apply color based on status */}}
                      <span className={`font-bold text-lg ${item.color}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========== CARD: KEY STATISTICS ========== */}
              {{/* Summary statistics section */}}
              {{/* Similar layout to repairs card */}}
              <div className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}>
                {{/* Card title */}}
                <h3 className={`text-xl font-bold mb-6 pb-4 border-b-2 transition-colors duration-300 ${
                  isDark
                    ? 'text-white border-white/10'
                    : 'text-black border-gray-200'
                }`}>
                  Statistiques clés
                </h3>
                {{/* Statistics rows */}}
                <div className="space-y-4">
                  {[
                    { label: 'Clients actifs', value: clients.clients.length, color: isDark ? 'text-white' : 'text-black' },
                    { label: 'Factures émises', value: factures.factures.length, color: isDark ? 'text-white' : 'text-black' },
                    { label: 'Factures payées', value: factures.factures.filter(f => f.statut === 'paid').length, color: 'text-green-400' },
                    { label: 'Factures impayées', value: factures.factures.filter(f => f.statut === 'pending').length, color: 'text-amber-400' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors duration-300 ${
                        isDark
                          ? 'bg-slate-800/50 border-white/10'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both` }}
                    >
                      <span className={`font-semibold transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.label}:
                      </span>
                      <span className={`font-bold text-lg ${item.color}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== INVOICES TAB ========== */}
        {{/* Tab content: Invoice management and display */}}
        {{/* Renders InvoicesList component only when activeTab === 'invoices' */}}
        {{/* Pass all required data as props */}}
        {activeTab === 'invoices' && (
          <InvoicesList
            factures={factures}                      // Invoice data and methods
            clients={clients.clients}                 // Client list for reference
            reparations={reparations.reparations}     // Repair data linked to invoices
          />
        )}

        {/* ========== CLIENTS TAB ========== */}
        {{/* Tab content: Client management and display */}}
        {{/* Renders ClientsList component only when activeTab === 'clients' */}}
        {{/* Pass all required data as props */}}
        {activeTab === 'clients' && (
          <ClientsList
            clients={clients}                         // Client data and methods
            factures={factures.factures}              // Invoices for each client
            reparations={reparations.reparations}     // Repairs for each client
            vehicules={vehicules.vehicules}           // Vehicles owned by clients
          />
        )}

        {/* ========== REPORTS TAB ========== */}
        {{/* Tab content: Financial reports and analysis */}}
        {{/* Renders FinancialReport component only when activeTab === 'reports' */}}
        {{/* Pass all required data as props */}}
        {activeTab === 'reports' && (
          <FinancialReport
            factures={factures.factures}              // Invoice data for analysis
            reparations={reparations.reparations}     // Repair data for trends
            clients={clients.clients}                 // Client information
          />
        )}

        {/* ========== ANIMATION STYLES ========== */}
        {{/* CSS keyframes defined inline for component scoping */}}
        {{/* fadeInUp: Fade in while moving up from below */}}
        {{/* Used for detail card rows - creates cascade effect */}}
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

      {/* ========== FOOTER ========== */}
      {{/* Footer component - Shared across all pages */}}
      {{/* Contains branding, links, copyright, theme toggle */}}
      {{/* Positioned at bottom of page */}}
      <Footer />
    </div>
  );
}
