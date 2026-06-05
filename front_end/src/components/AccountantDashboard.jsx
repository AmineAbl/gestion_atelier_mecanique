import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  LogOut,
  User,
  FileText,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  MetricCard,
  Card,
  Alert,
  Spinner
} from './common/UIComponents';
import { StaffFooter } from './common/StaffFooter';
import { ThemeToggle } from './common/ThemeToggle';
import { CircularMenu } from './common/CircularMenu';
import { useTheme } from '../context/ThemeContext';
import FinancialChart from './common/FinancialChart';
import {
  formatCurrency,
  calculateFinancialMetrics,
  getRepairsOverview
} from '../utils/helpers';
import { useAccountantApi } from '../hooks/useAccountantApi';
import ClientsList from './Accountant/ClientsList';
import InvoicesList from './Accountant/InvoicesList';
import FinancialReport from './Accountant/FinancialReport';
import { SimpleFunnelChart } from './charts/SimpleFunnelChart';
import { SimpleLineChart } from './charts/SimpleLineChart';
import { SimpleBarChart } from './charts/SimpleBarChart';
import { SimpleRadarChart } from './charts/SimpleRadarChart';
import { CHART_COLORS } from './charts/chartTheme';
import './charts/accountantCharts.css';

export default function AccountantDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark } = useTheme();
  const { clients, factures, reparations, vehicules, users, loading, error, clearError, refresh } = useAccountantApi(user);

  const financialMetrics = calculateFinancialMetrics(
    factures.factures,
    reparations.reparations
  );

  const repairsOverview = getRepairsOverview(reparations.reparations);

  // Prepare chart data
  const invoicesFunnelData = useMemo(() => {
    const total = factures.factures.length;
    const paid = factures.factures.filter((f) => f.statut === 'paid').length;
    const pending = factures.factures.filter((f) => f.statut === 'pending').length;
    return [
      {
        label: 'Total Factures',
        value: Math.max(total, 1),
        color: CHART_COLORS.blue,
        gradient: [
          { offset: 0, color: CHART_COLORS.blueLight },
          { offset: 1, color: CHART_COLORS.blue },
        ],
      },
      {
        label: 'Factures Payées',
        value: paid,
        color: CHART_COLORS.green,
        gradient: [
          { offset: 0, color: CHART_COLORS.greenLight },
          { offset: 1, color: CHART_COLORS.green },
        ],
      },
      {
        label: 'Factures En Attente',
        value: pending,
        color: CHART_COLORS.amber,
        gradient: [
          { offset: 0, color: CHART_COLORS.amberLight },
          { offset: 1, color: CHART_COLORS.amber },
        ],
      },
    ];
  }, [factures.factures]);

  const repairsLineChartData = useMemo(() => {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'];
  const base = repairsOverview.completed || 1;
  return months.map((month, idx) => ({
    month,
    completed: Math.max(1, Math.floor(base * (0.5 + idx * 0.12))),
    pending:   Math.max(0, Math.floor((repairsOverview.pending || 1) * (1 - idx * 0.1))),
  }));
}, [repairsOverview]);

  const repairsBarChartData = useMemo(
    () => [
      { name: 'Terminées', value: repairsOverview.completed },
      { name: 'En Cours', value: repairsOverview.inProgress },
      { name: 'En Attente', value: repairsOverview.pending },
    ],
    [repairsOverview]
  );

  const repairsBarColors = [CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.amber];

  const financialRadarData = useMemo(() => [
    { name: 'Revenus', value: Math.min(100, (financialMetrics.totalRevenue / 10000) * 100) },
    { name: 'Coûts', value: Math.min(100, (financialMetrics.totalCosts / 10000) * 100) },
    { name: 'Bénéfice', value: Math.min(100, (financialMetrics.totalProfit / 10000) * 100) },
    { name: 'Marge', value: financialMetrics.profitMargin },
  ], [financialMetrics]);
  const topClientsData = useMemo(() => {
  return clients.clients
    .map((client) => {
      const clientInvoices = factures.factures.filter(f => f.client_id === client.id);
      const total = clientInvoices
        .filter(f => f.statut === 'paid')
        .reduce((sum, f) => sum + parseFloat(f.montant_total || 0), 0);
      return {
        name: `${client.prenom || ''} ${client.nom || ''}`.trim() || client.email,
        value: total,
        invoices: clientInvoices.length,
      };
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}, [clients.clients, factures.factures]);

  const menuItems = [
    { icon: BarChart3, label: 'Apercu', action: 'overview' },
    { icon: FileText, label: 'Factures', action: 'invoices' },
    { icon: Users, label: 'Clients', action: 'clients' },
    { icon: BarChart3, label: 'Rapports', action: 'reports' },
    { icon: Settings, label: 'Parametres', action: 'settings' }
  ];

  const handleMenuSelect = (item) => {
    if (item.action) {
      setActiveTab(item.action);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'} flex flex-col items-center justify-center gap-4`}>
        <Spinner />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chargement des donnees...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'} shadow-md border-b-2`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                Interface Comptable
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mt-2 text-sm md:text-lg font-medium`}>
                Gestion des factures, clients et rapports financiers (base de donnees)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
              {user && (
                <div className="text-right flex-1 sm:flex-none">
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2 text-sm md:text-base`}>
                    <User className={`w-4 h-4 md:w-5 md:h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                    <span className="truncate">{user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email}</span>
                  </p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm truncate`}>{user.email}</p>
                </div>
              )}
              <ThemeToggle />
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 border-2 border-red-700 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full flex-1">
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={clearError} />
              <button
                type="button"
                onClick={() => {
                  clearError();
                  refresh().catch(() => {});
                }}
                className="mt-2 text-sm text-amber-300 underline"
              >
                Reessayer
              </button>
            </div>
          )}

          <div className={`flex flex-wrap gap-1 mb-8 border-b-2 ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-300 bg-gray-50'} rounded-t-2xl p-1 shadow-sm`}>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-all duration-300 rounded-lg whitespace-nowrap ${
                activeTab === 'overview'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:ring-1 hover:ring-white/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-all duration-300 rounded-lg whitespace-nowrap ${
                activeTab === 'invoices'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:ring-1 hover:ring-white/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Factures
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-all duration-300 rounded-lg whitespace-nowrap ${
                activeTab === 'clients'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:ring-1 hover:ring-white/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Clients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-3 md:px-6 py-2 md:py-3 font-semibold text-xs md:text-sm transition-all duration-300 rounded-lg whitespace-nowrap ${
                activeTab === 'reports'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:ring-1 hover:ring-white/20' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Rapports
            </button>
          </div>

          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  label="Revenu Total (Paye)"
                  value={formatCurrency(financialMetrics.totalRevenue)}
                  icon={() => <DollarSign className="w-8 h-8" />}
                  color="green"
                />
                <MetricCard
                  label="En attente"
                  value={formatCurrency(financialMetrics.totalPending)}
                  icon={() => <Clock className="w-8 h-8" />}
                  color="yellow"
                />
                <MetricCard
                  label="Couts totaux"
                  value={formatCurrency(financialMetrics.totalCosts)}
                  icon={() => <TrendingDown className="w-8 h-8" />}
                  color="red"
                />
                <MetricCard
                  label="Benefice net"
                  value={formatCurrency(financialMetrics.totalProfit)}
                  icon={() => <TrendingUp className="w-8 h-8" />}
                  color={financialMetrics.totalProfit >= 0 ? 'green' : 'red'}
                />
              </div>
              {topClientsData.length > 0 && (
  <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-gray-200'}`}>
    <h3 className={`text-xl font-bold mb-6 pb-4 border-b-2 ${isDark ? 'text-white border-white/20' : 'text-gray-900 border-gray-200'}`}>
      🏆 Meilleurs Clients
    </h3>
    <div className="space-y-4">
      {topClientsData.map((client, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className={`text-lg font-bold w-6 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-600' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            #{idx + 1}
          </span>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <span className={`flex-1 font-medium text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            {client.name}
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {client.invoices} facture{client.invoices > 1 ? 's' : ''}
          </span>
          <div className="w-32 hidden sm:block">
            <div className={`h-2 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div
                className="h-2 rounded bg-blue-500 transition-all"
                style={{ width: `${(client.value / topClientsData[0].value) * 100}%` }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold w-28 text-right ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {formatCurrency(client.value)}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
              <div className="my-8">
                <FinancialChart
                  title="Resume financier"
                  data={[
                    { label: 'Revenu (Paye)', value: financialMetrics.totalRevenue },
                    { label: 'En attente', value: financialMetrics.totalPending },
                    { label: 'Couts', value: -financialMetrics.totalCosts },
                    { label: 'Benefice net', value: financialMetrics.totalProfit }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white border-white/20' : 'text-gray-900 border-gray-300'} mb-6 pb-4 border-b-2`}>Apercu des reparations</h3>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Total:</span>
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{repairsOverview.total}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Terminees:</span>
                      <span className="font-bold text-lg text-green-400">{repairsOverview.completed}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">En cours:</span>
                      <span className="font-bold text-lg text-blue-400">{repairsOverview.inProgress}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">En attente:</span>
                      <span className="font-bold text-lg text-amber-400">{repairsOverview.pending}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border-2 ${isDark ? 'bg-slate-800 border-white/30 text-gray-300' : 'bg-gray-100 border-gray-400 text-gray-700'}`}>
                      <span className="font-semibold">Taux de reussite:</span>
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{repairsOverview.completionRate}%</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white border-white/20' : 'text-gray-900 border-gray-300'} mb-6 pb-4 border-b-2`}>Indicateurs cles</h3>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Clients:</span>
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{clients.clients.length}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Factures totales:</span>
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{factures.factures.length}</span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Factures payees:</span>
                      <span className="font-bold text-lg text-green-400">
                        {factures.factures.filter(f => f.statut === 'paid').length}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                      <span className="font-semibold">Factures en attente:</span>
                      <span className="font-bold text-lg text-amber-400">
                        {factures.factures.filter(f => f.statut === 'pending').length}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center p-3 rounded-lg border-2 ${isDark ? 'bg-slate-800 border-white/30 text-gray-300' : 'bg-gray-100 border-gray-400 text-gray-700'}`}>
                      <span className="font-semibold">Marge beneficiaire:</span>
                      <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{financialMetrics.profitMargin}%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="my-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleFunnelChart
                    data={invoicesFunnelData}
                    title="Entonnoir des Factures"
                    description="Du volume total aux factures payées et en attente"
                  />
                  <SimpleBarChart
                    data={repairsBarChartData}
                    title="Statut des Réparations"
                    description="Répartition actuelle des interventions"
                    dataKey="value"
                    colors={repairsBarColors}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleLineChart
                    data={repairsLineChartData}
                    title="Tendance des Réparations (6 mois)"
                    description="Évolution estimée des réparations terminées et en attente"
                    lines={[
                      { dataKey: 'completed', color: CHART_COLORS.green, label: 'Terminées' },
                      { dataKey: 'pending', color: CHART_COLORS.amber, label: 'En attente' },
                    ]}
                  />
                  <SimpleRadarChart
                    data={financialRadarData}
                    title="Analyse Financière"
                    description="Revenus, coûts, bénéfice et marge (échelle relative)"
                    dataKey="value"
                    stroke={CHART_COLORS.violet}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <InvoicesList
              factures={factures}
              clients={clients.clients}
              reparations={reparations.reparations}
              vehicules={vehicules.vehicules}
              users={users}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsList
              clients={clients}
              factures={factures.factures}
              reparations={reparations.reparations}
              vehicules={vehicules.vehicules}
            />
          )}

          {activeTab === 'reports' && (
            <FinancialReport
              factures={factures.factures}
              reparations={reparations.reparations}
              clients={clients.clients}
            />
          )}
        </div>
      </div>

      <StaffFooter role="accountant" onNavigate={setActiveTab} />

      <div className="fixed bottom-8 right-8 z-40">
        <CircularMenu items={menuItems} onSelect={handleMenuSelect} />
      </div>
    </div>
  );
}
