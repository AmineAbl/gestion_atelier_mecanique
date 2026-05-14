import React, { useState } from 'react';
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
import { Footer } from './common/Footer';
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

export default function AccountantDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark } = useTheme();
  const { clients, factures, reparations, vehicules, loading, error, clearError, refresh } = useAccountantApi(user);

  const financialMetrics = calculateFinancialMetrics(
    factures.factures,
    reparations.reparations
  );

  const repairsOverview = getRepairsOverview(reparations.reparations);

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
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
                Interface Comptable
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mt-2 text-lg font-medium`}>
                Gestion des factures, clients et rapports financiers (base de donnees)
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2`}>
                    <User className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                    {user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email}
                  </p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{user.email}</p>
                </div>
              )}
              <ThemeToggle />
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 border-2 border-red-700 rounded-lg font-semibold transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
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

          <div className={`flex gap-1 mb-8 border-b-2 ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-300 bg-gray-50'} rounded-t-2xl p-1 shadow-sm`}>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
                activeTab === 'overview'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
                activeTab === 'invoices'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Factures
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
                activeTab === 'clients'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Clients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
                activeTab === 'reports'
                  ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
            </div>
          )}

          {activeTab === 'invoices' && (
            <InvoicesList
              factures={factures}
              clients={clients.clients}
              reparations={reparations.reparations}
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

      <Footer />

      <div className="fixed bottom-8 right-8 z-40">
        <CircularMenu items={menuItems} onSelect={handleMenuSelect} />
      </div>
    </div>
  );
}
