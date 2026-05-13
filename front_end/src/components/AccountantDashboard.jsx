import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  LogOut,
  User
} from 'lucide-react';
import {
  MetricCard,
  Card,
  Alert,
  Spinner
} from './common/UIComponents';
import {
  formatCurrency,
  calculateFinancialMetrics,
  getRepairsOverview
} from '../utils/helpers';
import { useAccountantApi } from '../hooks/useAccountantApi';
import ClientsList from './Accountant/ClientsList';
import InvoicesList from './Accountant/InvoicesList';
import FinancialReport from './Accountant/FinancialReport';

/**
 * Main Accountant Dashboard — données chargées depuis l’API Laravel.
 */
export default function AccountantDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { clients, factures, reparations, vehicules, loading, error, clearError, refresh } = useAccountantApi(user);

  const financialMetrics = calculateFinancialMetrics(
    factures.factures,
    reparations.reparations
  );

  const repairsOverview = getRepairsOverview(reparations.reparations);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-gray-400">Chargement des données…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-black shadow-md border-b-2 border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Interface Comptable
              </h1>
              <p className="text-gray-300 mt-2 text-lg font-medium">
                Gestion des factures, clients et rapports financiers (base de données)
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-300" />
                    {user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email}
                  </p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 border-2 border-red-700 rounded-lg font-semibold transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
              Réessayer
            </button>
          </div>
        )}

        <div className="flex gap-1 mb-8 border-b-2 border-white/10 bg-slate-900 rounded-t-2xl p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
              activeTab === 'overview'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
              activeTab === 'invoices'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Factures
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
              activeTab === 'clients'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
              activeTab === 'reports'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Rapports
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Revenu Total (Payé)"
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
                label="Coûts totaux"
                value={formatCurrency(financialMetrics.totalCosts)}
                icon={() => <TrendingDown className="w-8 h-8" />}
                color="red"
              />
              <MetricCard
                label="Bénéfice net"
                value={formatCurrency(financialMetrics.totalProfit)}
                icon={() => <TrendingUp className="w-8 h-8" />}
                color={financialMetrics.totalProfit >= 0 ? 'green' : 'red'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b-2 border-white/20">Aperçu des réparations</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Total:</span>
                    <span className="font-bold text-lg text-white">{repairsOverview.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Terminées:</span>
                    <span className="font-bold text-lg text-green-400">{repairsOverview.completed}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">En cours:</span>
                    <span className="font-bold text-lg text-blue-400">{repairsOverview.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">En attente:</span>
                    <span className="font-bold text-lg text-amber-400">{repairsOverview.pending}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border-2 border-white/30">
                    <span className="text-gray-300 font-semibold">Taux de réussite:</span>
                    <span className="font-bold text-lg text-white">{repairsOverview.completionRate}%</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b-2 border-white/20">Indicateurs clés</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Clients:</span>
                    <span className="font-bold text-lg text-white">{clients.clients.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Factures totales:</span>
                    <span className="font-bold text-lg text-white">{factures.factures.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Factures payées:</span>
                    <span className="font-bold text-lg text-green-400">
                      {factures.factures.filter(f => f.statut === 'paid').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-semibold">Factures en attente:</span>
                    <span className="font-bold text-lg text-amber-400">
                      {factures.factures.filter(f => f.statut === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border-2 border-white/30">
                    <span className="text-gray-300 font-semibold">Marge bénéficiaire:</span>
                    <span className="font-bold text-lg text-white">{financialMetrics.profitMargin}%</span>
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
  );
}
