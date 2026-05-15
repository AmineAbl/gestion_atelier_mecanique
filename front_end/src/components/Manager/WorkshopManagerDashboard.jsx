import React, { useCallback, useEffect, useState } from 'react';
import {
  Calculator,
  Car,
  LayoutDashboard,
  LogOut,
  Package,
  User,
  Users,
  Wrench,
  Settings
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Spinner,
  StatusBadge,
  Table,
} from '../common/UIComponents';
import { Footer } from '../common/Footer';
import { ThemeToggle } from '../common/ThemeToggle';
import { CircularMenu } from '../common/CircularMenu';
import { useTheme } from '../../context/ThemeContext';
import {
  clientsAPI,
  comptablesAPI,
  mecaniciensAPI,
  piecesAPI,
  reparationsAPI,
  vehiculesAPI,
} from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const REPARATION_STATUTS = [
  { value: 'pending', label: 'En attente' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

const CARB_OPTIONS = [
  { value: 'Essence', label: 'Essence' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybride', label: 'Hybride' },
  { value: 'Électrique', label: 'Électrique' },
  { value: 'GPL', label: 'GPL' },
];

const TRANSMISSION_OPTIONS = [
  { value: 'Manuelle', label: 'Manuelle' },
  { value: 'Automatique', label: 'Automatique' },
  { value: 'Semi-automatique', label: 'Semi-automatique' },
];

function vehiculePlate(row) {
  if (!row) return '';
  return row.immatriculation ?? row.immat ?? '';
}

function tabClass(isActive, isDark) {
  return `px-6 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
    isActive
      ? isDark ? 'bg-white text-black shadow-md' : 'bg-slate-900 text-white shadow-md'
      : isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
  }`;
}

export default function WorkshopManagerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [mecaniciens, setMecaniciens] = useState([]);
  const [comptables, setComptables] = useState([]);
  const [dialog, setDialog] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [c, v, r, p, m, co] = await Promise.all([
        clientsAPI.getAll(),
        vehiculesAPI.getAll(),
        reparationsAPI.getAll(),
        piecesAPI.getAll(),
        mecaniciensAPI.getAll(),
        comptablesAPI.getAll(),
      ]);
      setClients(Array.isArray(c) ? c : []);
      setVehicules(Array.isArray(v) ? v : []);
      setReparations(Array.isArray(r) ? r : []);
      setPieces(Array.isArray(p) ? p : []);
      setMecaniciens(Array.isArray(m) ? m : []);
      setComptables(Array.isArray(co) ? co : []);
    } catch (e) {
      setError(
        e.message ||
          'Impossible de joindre l\'API Laravel. Demarrez le serveur (php artisan serve) et verifiez REACT_APP_API_BASE_URL.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeDialog = () => setDialog(null);

  const handleDelete = async (resource, id, label) => {
    if (!window.confirm(`Supprimer ${label} ?`)) return;
    try {
      if (resource === 'client') await clientsAPI.delete(id);
      if (resource === 'vehicule') await vehiculesAPI.delete(id);
      if (resource === 'reparation') await reparationsAPI.delete(id);
      if (resource === 'piece') await piecesAPI.delete(id);
      if (resource === 'mecanicien') await mecaniciensAPI.delete(id);
      if (resource === 'comptable') await comptablesAPI.delete(id);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Apercu', action: 'overview' },
    { icon: Wrench, label: 'Reparations', action: 'reparations' },
    { icon: Users, label: 'Clients', action: 'clients' },
    { icon: Car, label: 'Vehicules', action: 'vehicules' },
    { icon: User, label: 'Mecaniciens', action: 'mecaniciens' },
    { icon: Calculator, label: 'Comptables', action: 'comptables' },
    { icon: Package, label: 'Pieces', action: 'pieces' }
  ];

  const handleMenuSelect = (item) => {
    if (item.action) {
      setActiveTab(item.action);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-black border-white/20' : 'bg-white border-gray-300'} shadow-md border-b-2`}>
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight flex items-center gap-3`}>
                <Wrench className="w-10 h-10 text-amber-400" />
                Espace responsable atelier
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mt-2 text-lg font-medium`}>
                Réparations, clients, véhicules, mécaniciens, comptables et pièces
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-semibold flex items-center gap-2 justify-end`}>
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
            <Alert type="error" message={error} onClose={() => setError(null)} />
          )}

          <div className={`flex gap-1 mb-8 border-b-2 ${isDark ? 'border-white/10 bg-slate-900' : 'border-gray-300 bg-gray-50'} rounded-t-2xl p-1 shadow-sm flex-wrap`}>
            <button type="button" className={tabClass(activeTab === 'overview', isDark)} onClick={() => setActiveTab('overview')}>
              <span className="inline-flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Vue d'ensemble
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'reparations', isDark)} onClick={() => setActiveTab('reparations')}>
              <span className="inline-flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Réparations
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'clients', isDark)} onClick={() => setActiveTab('clients')}>
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4" /> Clients
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'vehicules', isDark)} onClick={() => setActiveTab('vehicules')}>
              <span className="inline-flex items-center gap-2">
                <Car className="w-4 h-4" /> Véhicules
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'mecaniciens', isDark)} onClick={() => setActiveTab('mecaniciens')}>
              <span className="inline-flex items-center gap-2">
                <User className="w-4 h-4" /> Mécaniciens
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'comptables', isDark)} onClick={() => setActiveTab('comptables')}>
              <span className="inline-flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Comptables
              </span>
            </button>
            <button type="button" className={tabClass(activeTab === 'pieces', isDark)} onClick={() => setActiveTab('pieces')}>
              <span className="inline-flex items-center gap-2">
                <Package className="w-4 h-4" /> Pièces
              </span>
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Réparations', value: reparations.length, Icon: Wrench },
                    { label: 'Clients', value: clients.length, Icon: Users },
                    { label: 'Véhicules', value: vehicules.length, Icon: Car },
                    { label: 'Mécaniciens', value: mecaniciens.length, Icon: User },
                    { label: 'Comptables', value: comptables.length, Icon: Calculator },
                    { label: 'Pièces (réf.)', value: pieces.length, Icon: Package },
                  ].map(({ label, value, Icon }) => (
                    <Card
                      key={label}
                      className={`border ${isDark ? 'bg-slate-800/90 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide`}>{label}</p>
                          <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                        </div>
                        <Icon className="w-10 h-10 text-amber-400/80" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'reparations' && (
                <SectionCard title="Réparations">
                  <Table
                    columns={[
                      { key: 'id', label: 'ID', sortable: true },
                      { key: 'description', label: 'Description', sortable: true },
                      { key: 'statut', label: 'Statut', render: (row) => <StatusBadge status={row.statut} /> },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'reparation', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('reparation', row.id, `Réparation ${row.id}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={reparations}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'reparation' })} className="mt-4">
                    + Ajouter Réparation
                  </Button>
                </SectionCard>
              )}

              {activeTab === 'clients' && (
                <SectionCard title="Clients">
                  <Table
                    columns={[
                      { key: 'cin', label: 'CIN', sortable: true },
                      { key: 'prenom', label: 'Prénom', sortable: true },
                      { key: 'nom', label: 'Nom', sortable: true },
                      { key: 'email', label: 'Email' },
                      { key: 'telephone', label: 'Téléphone' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'client', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('client', row.id, `Client ${row.prenom} ${row.nom}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={clients}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'client' })} className="mt-4">
                    + Ajouter Client
                  </Button>
                </SectionCard>
              )}

              {activeTab === 'vehicules' && (
                <SectionCard title="Véhicules">
                  <Table
                    columns={[
                      {
                        key: 'immat',
                        label: 'Immatriculation',
                        render: (row) => vehiculePlate(row),
                      },
                      { key: 'marque', label: 'Marque', sortable: true },
                      { key: 'modele', label: 'Modèle', sortable: true },
                      {
                        key: 'proprietaire',
                        label: 'Propriétaire',
                        render: (row) => row.client ? `${row.client.prenom} ${row.client.nom}` : '-',
                      },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'vehicule', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('vehicule', row.id, `Véhicule ${vehiculePlate(row)}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={vehicules}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'vehicule' })} className="mt-4">
                    + Ajouter Véhicule
                  </Button>
                </SectionCard>
              )}

              {activeTab === 'mecaniciens' && (
                <SectionCard title="Mécaniciens">
                  <Table
                    columns={[
                      { key: 'cin', label: 'CIN', sortable: true },
                      { key: 'prenom', label: 'Prénom', sortable: true },
                      { key: 'nom', label: 'Nom', sortable: true },
                      { key: 'email', label: 'Email' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'mecanicien', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('mecanicien', row.id, `Mécanicien ${row.prenom} ${row.nom}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={mecaniciens}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'mecanicien' })} className="mt-4">
                    + Ajouter Mécanicien
                  </Button>
                </SectionCard>
              )}

              {activeTab === 'comptables' && (
                <SectionCard title="Comptables">
                  <Table
                    columns={[
                      { key: 'cin', label: 'CIN', sortable: true },
                      { key: 'prenom', label: 'Prénom', sortable: true },
                      { key: 'nom', label: 'Nom', sortable: true },
                      { key: 'email', label: 'Email' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'comptable', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('comptable', row.id, `Comptable ${row.prenom} ${row.nom}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={comptables}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'comptable' })} className="mt-4">
                    + Ajouter Comptable
                  </Button>
                </SectionCard>
              )}

              {activeTab === 'pieces' && (
                <SectionCard title="Pièces">
                  <Table
                    columns={[
                      { key: 'id', label: 'ID', sortable: true },
                      { key: 'nom', label: 'Nom', sortable: true },
                      { key: 'quantite', label: 'Stock', sortable: true },
                      { key: 'prix', label: 'Prix', render: (row) => formatCurrency(row.prix) },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setDialog({ type: 'edit', resource: 'piece', data: row })}
                              size="sm"
                              variant="secondary"
                            >
                              Modifier
                            </Button>
                            <Button
                              onClick={() => handleDelete('piece', row.id, `Pièce ${row.nom}`)}
                              size="sm"
                              variant="danger"
                            >
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={pieces}
                  />
                  <Button onClick={() => setDialog({ type: 'create', resource: 'piece' })} className="mt-4">
                    + Ajouter Pièce
                  </Button>
                </SectionCard>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      <div className="fixed bottom-8 right-8 z-40">
        <CircularMenu items={menuItems} onSelect={handleMenuSelect} />
      </div>

      {dialog && (
        <EntityDialog
          isOpen={true}
          onClose={closeDialog}
          resource={dialog.resource}
          mode={dialog.type}
          data={dialog.data}
          onRefresh={refresh}
          vehicules={vehicules}
          mecaniciens={mecaniciens}
          clients={clients}
          onSubmitError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  const { isDark } = useTheme();
  return (
    <Card className={`border shadow-xl ${isDark ? 'bg-slate-800/90 border-white/10 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
      <h2 className={`text-xl font-bold mb-4 pb-3 border-b ${isDark ? 'text-white border-white/15' : 'text-gray-900 border-gray-300'}`}>{title}</h2>
      {children}
    </Card>
  );
}

function EntityDialog({ isOpen, onClose, resource, mode, data, onRefresh, vehicules, mecaniciens, clients, onSubmitError }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (resource === 'vehicule') {
      if (data) {
        setFormData({
          ...data,
          immatriculation: data.immatriculation ?? data.immat ?? '',
          client_id: data.client_id ?? data.client?.id ?? '',
          annee: data.annee ? String(data.annee).slice(0, 4) : '',
        });
      } else {
        setFormData({});
      }
      return;
    }
    setFormData(data || {});
  }, [resource, mode, data, isOpen]);

  const buildVehiculeApiPayload = () => {
    const year = parseInt(formData.annee, 10);
    const annee =
      Number.isFinite(year) && year >= 1900 && year <= 2100 ? `${year}-01-01` : '';
    return {
      marque: formData.marque,
      modele: formData.modele,
      immat: (formData.immatriculation || formData.immat || '').trim(),
      carb: formData.carb,
      transmission: formData.transmission,
      annee,
      client_id: parseInt(formData.client_id, 10),
    };
  };

  const buildPieceApiPayload = () => ({
    nom: (formData.nom || '').trim(),
    prix: Number(formData.prix),
    quantite: parseInt(formData.quantite, 10),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        if (resource === 'client') await clientsAPI.create(formData);
        if (resource === 'vehicule') await vehiculesAPI.create(buildVehiculeApiPayload());
        if (resource === 'reparation') await reparationsAPI.create(formData);
        if (resource === 'piece') await piecesAPI.create(buildPieceApiPayload());
        if (resource === 'mecanicien') await mecaniciensAPI.create(formData);
        if (resource === 'comptable') await comptablesAPI.create(formData);
      } else {
        if (resource === 'client') await clientsAPI.update(formData.id, formData);
        if (resource === 'vehicule') await vehiculesAPI.update(formData.id, buildVehiculeApiPayload());
        if (resource === 'reparation') await reparationsAPI.update(formData.id, formData);
        if (resource === 'piece') await piecesAPI.update(formData.id, buildPieceApiPayload());
        if (resource === 'mecanicien') await mecaniciensAPI.update(formData.id, formData);
        if (resource === 'comptable') await comptablesAPI.update(formData.id, formData);
      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      onSubmitError?.(error?.message || 'Enregistrement impossible.');
    }
  };

  const renderForm = () => {
    switch (resource) {
      case 'client':
        return (
          <form onSubmit={handleSubmit}>
            <Input
              label="Prénom"
              value={formData.prenom || ''}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Téléphone"
              value={formData.telephone || ''}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
            <Input
              label="CIN"
              value={formData.cin || ''}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            />
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Client' : 'Mettre à jour Client'}
            </Button>
          </form>
        );
      case 'vehicule':
        return (
          <form onSubmit={handleSubmit}>
            <Select
              label="Client"
              value={formData.client_id || ''}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value ? parseInt(e.target.value, 10) : '' })}
              options={clients.map((c) => ({
                value: c.id,
                label: `${c.prenom} ${c.nom}`.trim() || `Client #${c.id}`,
              }))}
              required
            />
            <Input
              label="Marque"
              value={formData.marque || ''}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              required
            />
            <Input
              label="Modèle"
              value={formData.modele || ''}
              onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              required
            />
            <Input
              label="Immatriculation"
              value={formData.immatriculation || ''}
              onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
              required
            />
            <Select
              label="Carburant"
              value={formData.carb || ''}
              onChange={(e) => setFormData({ ...formData, carb: e.target.value })}
              options={CARB_OPTIONS}
              required
            />
            <Select
              label="Transmission"
              value={formData.transmission || ''}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              options={TRANSMISSION_OPTIONS}
              required
            />
            <Input
              label="Année"
              type="number"
              min="1900"
              max="2100"
              value={formData.annee || ''}
              onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
              required
            />
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Véhicule' : 'Mettre à jour Véhicule'}
            </Button>
          </form>
        );
      case 'reparation':
        return (
          <form onSubmit={handleSubmit}>
            <Input
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Select
              label="Véhicule"
              value={formData.vehicule_id || ''}
              onChange={(e) => setFormData({ ...formData, vehicule_id: parseInt(e.target.value) })}
              options={vehicules.map((v) => ({
                value: v.id,
                label: `${v.marque} ${v.modele} (${vehiculePlate(v)})`,
              }))}
              required
            />
            <Select
              label="Mécanicien"
              value={formData.user_id || ''}
              onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
              options={mecaniciens.map(m => ({ 
                value: m.id, 
                label: `${m.prenom} ${m.nom}` 
              }))}
              required
            />
            <Input
              label="Coût"
              type="number"
              value={formData.cout || ''}
              onChange={(e) => setFormData({ ...formData, cout: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              required
            />
            <Input
              label="Date de début"
              type="date"
              value={formData.date_debut || ''}
              onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
            />
            <Input
              label="Date prévue de fin"
              type="date"
              value={formData.date_prevue_fin || ''}
              onChange={(e) => setFormData({ ...formData, date_prevue_fin: e.target.value })}
            />
            <Select
              label="Statut"
              value={formData.statut || ''}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              options={REPARATION_STATUTS}
              required
            />
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Réparation' : 'Mettre à jour Réparation'}
            </Button>
          </form>
        );
      case 'piece':
        return (
          <form onSubmit={handleSubmit}>
            <Input
              label="Nom"
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <Input
              label="Prix unitaire"
              type="number"
              value={formData.prix ?? ''}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              required
            />
            <Input
              label="Quantité en stock"
              type="number"
              min="0"
              step="1"
              value={formData.quantite ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantite: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                })
              }
              required
            />
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Pièce' : 'Mettre à jour Pièce'}
            </Button>
          </form>
        );
      case 'mecanicien':
        return (
          <form onSubmit={handleSubmit}>
            <Input
              label="Prénom"
              value={formData.prenom || ''}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required={mode === 'create'}
            />
            <Input
              label="CIN"
              value={formData.cin || ''}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            />
            {mode === 'create' && (
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Min. 6 caractères"
              />
            )}
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Mécanicien' : 'Mettre à jour Mécanicien'}
            </Button>
          </form>
        );
      case 'comptable':
        return (
          <form onSubmit={handleSubmit}>
            <Input
              label="Prénom"
              value={formData.prenom || ''}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              required
            />
            <Input
              label="Nom"
              value={formData.nom || ''}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required={mode === 'create'}
            />
            <Input
              label="CIN"
              value={formData.cin || ''}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
            />
            {mode === 'create' && (
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Min. 6 caractères"
              />
            )}
            <Button type="submit" className="mt-4">
              {mode === 'create' ? 'Créer Comptable' : 'Mettre à jour Comptable'}
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${mode === 'create' ? 'Créer' : 'Modifier'} ${resource}`} size="md">
      {renderForm()}
    </Modal>
  );
}
