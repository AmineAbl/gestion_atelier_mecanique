import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
  Wrench,
  Settings,
} from 'lucide-react';
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
import { Footer } from '../common/Footer';
import { ThemeToggle } from '../common/ThemeToggle';
import { CircularMenu } from '../common/CircularMenu';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, getRepairsOverview } from '../../utils/helpers';
import { useMechanicApi } from '../../hooks/useMechanicApi';
import MechanicReparationModal from './MechanicReparationModal';

const REPARATION_STATUTS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

function tabClass(isActive, isDark) {
  return `px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
    isActive
      ? isDark
        ? 'bg-white text-black shadow-md'
        : 'bg-slate-900 text-white shadow-md'
      : isDark
        ? 'text-gray-400 hover:text-white hover:bg-white/10'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
  }`;
}

export default function MechanicDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pieceSearch, setPieceSearch] = useState('');
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const { isDark } = useTheme();
  const { reparations, pieces, loading, error, clearError, refresh } = useMechanicApi(user);

  const overview = useMemo(() => getRepairsOverview(reparations), [reparations]);

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
                    { key: 'id', label: 'ID', sortable: true },
                    {
                      key: 'vehicule',
                      label: 'Véhicule',
                      render: (row) =>
                        row.vehicule
                          ? `${row.vehicule.marque || ''} ${row.vehicule.modele || ''} (${row.vehicule.immatriculation || row.vehicule.immat || '—'})`
                          : '—',
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
                Référence pour vos fiches réparation. Les stocks sont gérés par l’atelier.
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
                Mon compte
              </h2>
              <dl className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <dt className="font-semibold text-xs uppercase opacity-80">Nom affiché</dt>
                  <dd>{user?.name || `${user?.prenom || ''} ${user?.nom || ''}`.trim() || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-xs uppercase opacity-80">Email</dt>
                  <dd>{user?.email || '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-xs uppercase opacity-80">Identifiant</dt>
                  <dd>{user?.id != null ? user.id : '— (connexion API recommandée)'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-xs uppercase opacity-80">Rôle</dt>
                  <dd>Mécanicien</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </div>

      <Footer />

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
