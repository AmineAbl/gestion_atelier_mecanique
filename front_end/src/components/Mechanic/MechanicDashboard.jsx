import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
  Wrench,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  Download,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SimpleBarChart } from '../charts/SimpleBarChart';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Spinner,
  StatusBadge,
  Table,
} from '../common/UIComponents';
import { StaffFooter } from '../common/StaffFooter';
import { ThemeToggle } from '../common/ThemeToggle';
import { CircularMenu } from '../common/CircularMenu';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, getRepairsOverview } from '../../utils/helpers';
import { generateMechanicPersonalReportPDF } from '../../utils/pdfGenerator';
import { useMechanicApi } from '../../hooks/useMechanicApi';
import MechanicReparationModal from './MechanicReparationModal';

const REPARATION_STATUTS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

function vehiculeImmat(row) {
  const v = row?.vehicule;
  if (!v) return '—';
  return (v.immat || v.immatriculation || '').trim() || '—';
}

function vehiculeMarqueModele(row) {
  const v = row?.vehicule;
  if (!v) return '—';
  const marque = (v.marque || '').trim();
  const modele = (v.modele || '').trim();
  if (marque && modele) return `${marque}-${modele}`;
  return marque || modele || '—';
}

function tabClass(isActive, isDark) {
  return `px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
    isActive
      ? isDark
        ? 'bg-white text-black shadow-md'
        : 'bg-slate-900 text-white shadow-md'
      : isDark
        ? 'text-gray-400 hover:text-white hover:ring-1 hover:ring-white/20'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
  }`;
}

// Helper functions for chart data
function getStatusChartData(reparations) {
  const statusCounts = {
    'pending': 0,
    'in-progress': 0,
    'completed': 0,
    'cancelled': 0,
  };

  reparations.forEach((r) => {
    if (statusCounts.hasOwnProperty(r.statut)) {
      statusCounts[r.statut]++;
    }
  });

  return [
    { name: 'En attente', value: statusCounts['pending'], color: '#F59E0B' },
    { name: 'En cours', value: statusCounts['in-progress'], color: '#3B82F6' },
    { name: 'Terminées', value: statusCounts['completed'], color: '#10B981' },
    { name: 'Annulées', value: statusCounts['cancelled'], color: '#EF4444' },
  ].filter((item) => item.value > 0);
}

function getCostBreakdownData(reparations) {
  const costRanges = {
    'Moins de 500': 0,
    '500 - 1000': 0,
    '1000 - 2000': 0,
    '2000 - 5000': 0,
    'Plus de 5000': 0,
  };

  reparations.forEach((r) => {
    const cost = r.cout ?? 0;
    if (cost < 500) costRanges['Moins de 500']++;
    else if (cost < 1000) costRanges['500 - 1000']++;
    else if (cost < 2000) costRanges['1000 - 2000']++;
    else if (cost < 5000) costRanges['2000 - 5000']++;
    else costRanges['Plus de 5000']++;
  });

  return Object.entries(costRanges).map(([name, value]) => ({ name, value }));
}

function getVehicleBrandData(reparations) {
  const brandCounts = {};

  reparations.forEach((r) => {
    const brand = r.vehicule?.marque || 'Inconnu';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  return Object.entries(brandCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 brands
}

function getAverageRepairStats(reparations) {
  if (reparations.length === 0) {
    return { avgCost: 0, totalCost: 0, avgDuration: 0 };
  }

  const totalCost = reparations.reduce((sum, r) => sum + (r.cout ?? 0), 0);
  const avgCost = totalCost / reparations.length;

  // Calculate average duration for completed repairs
  const completedReparations = reparations.filter(
    (r) => r.statut === 'completed' && r.date_debut && r.date_fin
  );

  let avgDuration = 0;
  if (completedReparations.length > 0) {
    const totalDuration = completedReparations.reduce((sum, r) => {
      const start = new Date(r.date_debut);
      const end = new Date(r.date_fin);
      return sum + (end - start) / (1000 * 60 * 60 * 24); // in days
    }, 0);
    avgDuration = Math.round(totalDuration / completedReparations.length);
  }

  return {
    avgCost: Math.round(avgCost),
    totalCost: Math.round(totalCost),
    avgDuration,
    completed: completedReparations.length,
  };
}

export default function MechanicDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pieceSearch, setPieceSearch] = useState('');
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const { isDark } = useTheme();
  const { reparations, pieces, loading, error, clearError, refresh } = useMechanicApi(user);

  const overview = useMemo(() => getRepairsOverview(reparations), [reparations]);
  const statusChartData = useMemo(() => getStatusChartData(reparations), [reparations]);
  const costBreakdownData = useMemo(() => getCostBreakdownData(reparations), [reparations]);
  const vehicleBrandData = useMemo(() => getVehicleBrandData(reparations), [reparations]);
  const repairStats = useMemo(() => getAverageRepairStats(reparations), [reparations]);
  const accountStats = useMemo(() => ({
    total: reparations.length,
    completed: reparations.filter((r) => r.statut === 'completed').length,
    inProgress: reparations.filter((r) => r.statut === 'in-progress').length,
    pending: reparations.filter((r) => r.statut === 'pending').length,
    recent: [...reparations]
      .sort((a, b) => new Date(b.date_debut || b.created_at || 0) - new Date(a.date_debut || a.created_at || 0))
      .slice(0, 4),
  }), [reparations]);

  const handleDownloadPersonalReport = () => {
    if (user) generateMechanicPersonalReportPDF(user, reparations);
  };

  const filteredReparations = useMemo(() => {
    const f = statusFilter || 'all';
    if (f === 'all') return reparations;
    return reparations.filter((r) => r.statut === f);
  }, [reparations, statusFilter]);

  const filteredPieces = useMemo(() => {
    const t = pieceSearch.trim().toLowerCase();
    if (!t) return pieces;
    return pieces.filter((p) => (p.nom || '').toLowerCase().includes(t));
  }, [pieces, pieceSearch]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Apercu', action: 'overview' },
    { icon: Wrench, label: 'Reparations', action: 'reparations' },
    { icon: Package, label: 'Pieces', action: 'pieces' },
    { icon: Settings, label: 'Compte', action: 'account' },
  ];

  const handleMenuSelect = (item) => {
    if (item.action) setActiveTab(item.action);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
            : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'
        } flex flex-col items-center justify-center gap-4`}
      >
        <Spinner />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chargement de l’atelier…</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'
      } flex flex-col`}
    >
      <div
        className={`${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'} shadow-md border-b-2`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1
                className={`text-4xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                } tracking-tight flex items-center gap-3`}
              >
                <Wrench className="w-10 h-10 text-amber-400" />
                Espace mécanicien
              </h1>
              <p
                className={`${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mt-2 text-lg font-medium`}
              >
                Mes réparations assignées, suivi d’intervention et pièces catalogue
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p
                    className={`${
                      isDark ? 'text-white' : 'text-gray-900'
                    } font-semibold flex items-center gap-2 justify-end`}
                  >
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
                Déconnexion
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
                Réessayer
              </button>
            </div>
          )}

          <div
            className={`flex gap-1 mb-8 border-b-2 ${
              isDark ? 'border-white/10 bg-slate-900' : 'border-gray-300 bg-gray-50'
            } rounded-t-2xl p-1 shadow-sm flex-wrap`}
          >
            <button
              type="button"
              className={tabClass(activeTab === 'overview', isDark)}
              onClick={() => setActiveTab('overview')}
            >
              <span className="inline-flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Vue d’ensemble
              </span>
            </button>
            <button
              type="button"
              className={tabClass(activeTab === 'reparations', isDark)}
              onClick={() => setActiveTab('reparations')}
            >
              <span className="inline-flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Réparations
              </span>
            </button>
            <button
              type="button"
              className={tabClass(activeTab === 'pieces', isDark)}
              onClick={() => setActiveTab('pieces')}
            >
              <span className="inline-flex items-center gap-2">
                <Package className="w-4 h-4" /> Pièces (catalogue)
              </span>
            </button>
            <button
              type="button"
              className={tabClass(activeTab === 'account', isDark)}
              onClick={() => setActiveTab('account')}
            >
              <span className="inline-flex items-center gap-2">
                <Settings className="w-4 h-4" /> Compte
              </span>
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Mes réparations', value: overview.total, Icon: Wrench },
                { label: 'En cours', value: overview.inProgress, Icon: Wrench },
                { label: 'En attente', value: overview.pending, Icon: Wrench },
                { label: 'Terminées', value: overview.completed, Icon: Wrench },
              ].map(({ label, value, Icon }) => (
                <Card
                  key={label}
                  className={`border ${
                    isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        } uppercase tracking-wide`}
                      >
                        {label}
                      </p>
                      <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                    </div>
                    <Icon className="w-10 h-10 text-amber-400/80" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card
                className={`border ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      } uppercase tracking-wide`}
                    >
                      Coût moyen
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(repairStats.avgCost)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-400/80" />
                </div>
              </Card>
              <Card
                className={`border ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      } uppercase tracking-wide`}
                    >
                      Coût total
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(repairStats.totalCost)}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-400/80" />
                </div>
              </Card>
              <Card
                className={`border ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      } uppercase tracking-wide`}
                    >
                      Durée moy.
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {repairStats.avgDuration} j
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-purple-400/80" />
                </div>
              </Card>
              <Card
                className={`border ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      } uppercase tracking-wide`}
                    >
                      Réparées
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {repairStats.completed}
                    </p>
                  </div>
                  <Wrench className="w-10 h-10 text-amber-400/80" />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Distribution Pie Chart */}
              <Card
                className={`border shadow-xl ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <h2
                  className={`text-lg font-bold mb-4 pb-3 border-b ${
                    isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                  }`}
                >
                  Distribution par statut
                </h2>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: isDark ? '#e2e8f0' : '#1e293b',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aucune réparation pour afficher le graphique
                  </p>
                )}
              </Card>

              {/* Cost Breakdown Bar Chart */}
              <SimpleBarChart
                data={costBreakdownData}
                title="Répartition des coûts"
                description="Répartition des réparations par fourchette de coût"
                dataKey="value"
              />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SimpleBarChart
                  data={vehicleBrandData}
                  title="Véhicules réparés par marque (top 8)"
                  description="Top marques des véhicules réparés"
                  dataKey="value"
                />
              </div>
              <div className="lg:col-span-1">
                <Card
                  className={`border shadow-xl h-full ${
                    isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 pb-3 border-b ${
                      isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                    }`}
                  >
                    Synthèse
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    Taux de réparations terminées sur l’ensemble de vos ordres :{' '}
                    <span className="font-bold text-amber-400">{overview.completionRate}%</span>
                  </p>
                  <Button type="button" onClick={() => setActiveTab('reparations')}>
                    Ouvrir mes réparations
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'reparations' && (
            <Card
              className={`border shadow-xl ${
                isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 pb-3 border-b ${
                  isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                }`}
              >
                Mes réparations
              </h2>
              <div className="max-w-xs mb-4">
                <Select
                  label="Filtrer par statut"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value || 'all')}
                  options={REPARATION_STATUTS}
                />
              </div>
              {filteredReparations.length === 0 ? (
                <EmptyState message="Aucune réparation assignée pour le moment." />
              ) : (
                <Table
                  columns={[
                    {
                      key: 'immat',
                      label: 'Immatriculation',
                      sortable: true,
                      render: (row) => vehiculeImmat(row),
                    },
                    {
                      key: 'vehicule',
                      label: 'Véhicule',
                      render: (row) => vehiculeMarqueModele(row),
                    },
                    {
                      key: 'client',
                      label: 'Client',
                      render: (row) => {
                        const c = row.vehicule?.client;
                        return c ? `${c.prenom || ''} ${c.nom || ''}`.trim() : '—';
                      },
                    },
                    {
                      key: 'description',
                      label: 'Description',
                      render: (row) => (
                        <span className="line-clamp-2 max-w-xs">{row.description || '—'}</span>
                      ),
                    },
                    {
                      key: 'statut',
                      label: 'Statut',
                      render: (row) => <StatusBadge status={row.statut} />,
                    },
                    {
                      key: 'cout',
                      label: 'Coût',
                      render: (row) => formatCurrency(row.cout ?? 0),
                    },
                    {
                      key: 'prevu',
                      label: 'Fin prévue',
                      render: (row) => formatDate(row.date_prevue_fin),
                    },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (row) => (
                        <Button size="sm" variant="secondary" onClick={() => setSelectedRepairId(row.id)}>
                          Modifier
                        </Button>
                      ),
                    },
                  ]}
                  data={filteredReparations}
                />
              )}
            </Card>
          )}

          {activeTab === 'pieces' && (
            <Card
              className={`border shadow-xl ${
                isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <h2
                className={`text-xl font-bold mb-4 pb-3 border-b ${
                  isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                }`}
              >
                Catalogue pièces (consultation)
              </h2>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Référence pour vos fiches réparation. Le stock diminue automatiquement lorsque vous enregistrez des pièces sur une réparation.
              </p>
              <div className="max-w-md mb-4">
                <Input
                  label="Rechercher par nom"
                  value={pieceSearch}
                  onChange={(e) => setPieceSearch(e.target.value)}
                  placeholder="Ex. filtre à huile"
                />
              </div>
              {filteredPieces.length === 0 ? (
                <EmptyState message="Aucune pièce ne correspond à la recherche." />
              ) : (
                <Table
                  columns={[
                    { key: 'id', label: 'ID', sortable: true },
                    { key: 'nom', label: 'Nom', sortable: true },
                    { key: 'prix', label: 'Prix catalogue', render: (row) => formatCurrency(row.prix) },
                    { key: 'quantite', label: 'Stock atelier', sortable: true },
                  ]}
                  data={filteredPieces}
                />
              )}
            </Card>
          )}

          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card
                className={`border shadow-xl ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="mb-6">
                  <h2
                    className={`text-xl font-bold mb-4 pb-3 border-b ${
                      isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                    }`}
                  >
                    Mon compte
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    Vos informations de profil et le résumé de vos interventions pour l’atelier.
                  </p>
                </div>
                <dl className={`grid grid-cols-1 gap-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`rounded-2xl p-4 border ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-slate-50'}`}>
                    <dt className="font-semibold text-xs uppercase opacity-80">Nom affiché</dt>
                    <dd className="mt-1 font-medium text-base text-current">
                      {user?.name || `${user?.prenom || ''} ${user?.nom || ''}`.trim() || '—'}
                    </dd>
                  </div>
                  <div className={`rounded-2xl p-4 border ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-slate-50'}`}>
                    <dt className="font-semibold text-xs uppercase opacity-80">Email</dt>
                    <dd className="mt-1 font-medium text-base text-current">{user?.email || '—'}</dd>
                  </div>
                  <div className={`rounded-2xl p-4 border ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-slate-50'}`}>
                    <dt className="font-semibold text-xs uppercase opacity-80">CIN</dt>
                    <dd className="mt-1 font-medium text-base text-current">{user?.cin || '—'}</dd>
                  </div>
                  <div className={`rounded-2xl p-4 border ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-slate-50'}`}>
                    <dt className="font-semibold text-xs uppercase opacity-80">Rôle</dt>
                    <dd className="mt-1 font-medium text-base text-current">Mécanicien</dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <Button variant="primary" size="lg" onClick={handleDownloadPersonalReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger mon rapport
                  </Button>
                </div>
              </Card>

              <Card
                className={`border shadow-xl ${
                  isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <h2
                  className={`text-xl font-bold mb-4 pb-3 border-b ${
                    isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'
                  }`}
                >
                  Résumé des interventions
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Total', value: accountStats.total },
                    { label: 'Terminées', value: accountStats.completed },
                    { label: 'En cours', value: accountStats.inProgress },
                    { label: 'En attente', value: accountStats.pending },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900/70' : 'bg-slate-50'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <p className="text-xs uppercase opacity-70">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Interventions récentes
                  </h3>
                  {accountStats.recent.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Aucun historique d’intervention disponible.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {accountStats.recent.map((rep) => (
                        <li
                          key={rep.id}
                          className={`rounded-2xl p-4 border ${isDark ? 'border-white/10 bg-slate-900/70' : 'border-gray-200 bg-slate-50'}`}
                        >
                          <p className="text-sm font-semibold">
                            {vehiculeMarqueModele(rep)} • {vehiculeImmat(rep)}
                          </p>
                          <p className="text-xs uppercase mt-1 text-amber-400">{rep.statut || '—'}</p>
                          <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {rep.description ? `${rep.description.slice(0, 80)}${rep.description.length > 80 ? '…' : ''}` : 'Aucune description'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <StaffFooter role="mechanic" onNavigate={setActiveTab} />

      <div className="fixed bottom-8 right-8 z-40">
        <CircularMenu items={menuItems} onSelect={handleMenuSelect} />
      </div>

      <MechanicReparationModal
        isOpen={selectedRepairId != null}
        onClose={() => setSelectedRepairId(null)}
        reparationId={selectedRepairId}
        piecesCatalog={pieces}
        onSaved={refresh}
      />
    </div>
  );
}
