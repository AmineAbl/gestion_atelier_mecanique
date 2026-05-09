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

function tabClass(isActive) {
  return `px-5 py-3 font-semibold text-sm transition-all duration-300 rounded-lg ${
    isActive
      ? 'bg-white text-black shadow-md'
      : 'text-gray-400 hover:text-white hover:bg-white/10'
  }`;
}

export default function WorkshopManagerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
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
          'Impossible de joindre l’API Laravel. Démarrez le serveur (php artisan serve) et vérifiez REACT_APP_API_BASE_URL.'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-black shadow-md border-b-2 border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                <Wrench className="w-10 h-10 text-amber-400" />
                Espace responsable atelier
              </h1>
              <p className="text-gray-300 mt-2 text-lg font-medium">
                Réparations, clients, véhicules, mécaniciens, comptables et pièces
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold flex items-center gap-2 justify-end">
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
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="flex gap-1 mb-8 border-b-2 border-white/10 bg-slate-900 rounded-t-2xl p-1 shadow-sm flex-wrap">
          <button type="button" className={tabClass(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
            <span className="inline-flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Vue d’ensemble
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'reparations')} onClick={() => setActiveTab('reparations')}>
            <span className="inline-flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Réparations
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'clients')} onClick={() => setActiveTab('clients')}>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4" /> Clients
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'vehicules')} onClick={() => setActiveTab('vehicules')}>
            <span className="inline-flex items-center gap-2">
              <Car className="w-4 h-4" /> Véhicules
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'mecaniciens')} onClick={() => setActiveTab('mecaniciens')}>
            <span className="inline-flex items-center gap-2">
              <User className="w-4 h-4" /> Mécaniciens
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'comptables')} onClick={() => setActiveTab('comptables')}>
            <span className="inline-flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Comptables
            </span>
          </button>
          <button type="button" className={tabClass(activeTab === 'pieces')} onClick={() => setActiveTab('pieces')}>
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
                    className="bg-slate-800/90 border border-white/10 text-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="text-3xl font-bold mt-1">{value}</p>
                      </div>
                      <Icon className="w-10 h-10 text-amber-400/80" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'clients' && (
              <SectionCard title="Clients">
                <div className="mb-4 flex justify-end">
                  <Button variant="primary" onClick={() => setDialog({ resource: 'client', id: null })}>
                    Ajouter un client
                  </Button>
                </div>
                {clients.length === 0 ? (
                  <EmptyState message="Aucun client" />
                ) : (
                  <Table
                    columns={[
                      { key: 'nom', label: 'Nom' },
                      { key: 'prenom', label: 'Prénom' },
                      { key: 'telephone', label: 'Téléphone' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'client', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('client', row.id, `${row.prenom} ${row.nom}`)}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={clients}
                  />
                )}
              </SectionCard>
            )}

            {activeTab === 'vehicules' && (
              <SectionCard title="Véhicules">
                <div className="mb-4 flex justify-end">
                  <Button variant="primary" onClick={() => setDialog({ resource: 'vehicule', id: null })}>
                    Ajouter un véhicule
                  </Button>
                </div>
                {vehicules.length === 0 ? (
                  <EmptyState message="Aucun véhicule" />
                ) : (
                  <Table
                    columns={[
                      { key: 'immat', label: 'Immat.' },
                      { key: 'marque', label: 'Marque' },
                      { key: 'modele', label: 'Modèle' },
                      {
                        key: 'client',
                        label: 'Client',
                        render: (row) =>
                          row.client ? `${row.client.prenom} ${row.client.nom}` : '—',
                      },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'vehicule', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('vehicule', row.id, row.immat)}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={vehicules}
                  />
                )}
              </SectionCard>
            )}

            {activeTab === 'mecaniciens' && (
              <SectionCard title="Mécaniciens">
                <div className="mb-4 flex justify-end">
                  <Button variant="primary" onClick={() => setDialog({ resource: 'mecanicien', id: null })}>
                    Ajouter un mécanicien
                  </Button>
                </div>
                {mecaniciens.length === 0 ? (
                  <EmptyState message="Aucun mécanicien" />
                ) : (
                  <Table
                    columns={[
                      { key: 'nom', label: 'Nom' },
                      { key: 'prenom', label: 'Prénom' },
                      { key: 'email', label: 'Email' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'mecanicien', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('mecanicien', row.id, row.email)}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={mecaniciens}
                  />
                )}
              </SectionCard>
            )}

            {activeTab === 'comptables' && (
              <SectionCard title="Comptables">
                <div className="mb-4 flex justify-end">
                  <Button variant="primary" onClick={() => setDialog({ resource: 'comptable', id: null })}>
                    Ajouter un comptable
                  </Button>
                </div>
                {comptables.length === 0 ? (
                  <EmptyState message="Aucun comptable" />
                ) : (
                  <Table
                    columns={[
                      { key: 'nom', label: 'Nom' },
                      { key: 'prenom', label: 'Prénom' },
                      { key: 'email', label: 'Email' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'comptable', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('comptable', row.id, row.email)}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={comptables}
                  />
                )}
              </SectionCard>
            )}

            {activeTab === 'pieces' && (
              <SectionCard title="Pièces détachées">
                <div className="mb-4 flex justify-end">
                  <Button variant="primary" onClick={() => setDialog({ resource: 'piece', id: null })}>
                    Ajouter une pièce
                  </Button>
                </div>
                {pieces.length === 0 ? (
                  <EmptyState message="Aucune pièce en stock" />
                ) : (
                  <Table
                    columns={[
                      { key: 'nom', label: 'Désignation' },
                      {
                        key: 'prix',
                        label: 'Prix unitaire',
                        render: (row) => formatCurrency(row.prix),
                      },
                      { key: 'quantite', label: 'Stock' },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'piece', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('piece', row.id, row.nom)}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={pieces}
                  />
                )}
              </SectionCard>
            )}

            {activeTab === 'reparations' && (
              <SectionCard title="Réparations">
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setDialog({ resource: 'reparation', id: null })}
                    disabled={vehicules.length === 0 || mecaniciens.length === 0}
                  >
                    Nouvelle réparation
                  </Button>
                </div>
                {vehicules.length === 0 || mecaniciens.length === 0 ? (
                  <p className="text-amber-200 text-sm mb-4">
                    Créez au moins un véhicule et un mécanicien avant d’ajouter une réparation.
                  </p>
                ) : null}
                {reparations.length === 0 ? (
                  <EmptyState message="Aucune réparation" />
                ) : (
                  <Table
                    columns={[
                      {
                        key: 'description',
                        label: 'Description',
                        render: (row) => (
                          <span className="line-clamp-2 max-w-xs">{row.description}</span>
                        ),
                      },
                      {
                        key: 'statut',
                        label: 'Statut',
                        render: (row) => <StatusBadge status={row.statut} />,
                      },
                      {
                        key: 'vehicule',
                        label: 'Véhicule',
                        render: (row) =>
                          row.vehicule ? `${row.vehicule.marque} ${row.vehicule.immat}` : '—',
                      },
                      {
                        key: 'mecanicien',
                        label: 'Mécanicien',
                        render: (row) =>
                          row.mecanicien
                            ? `${row.mecanicien.prenom} ${row.mecanicien.nom}`
                            : '—',
                      },
                      {
                        key: 'cout',
                        label: 'Coût',
                        render: (row) => formatCurrency(row.cout),
                      },
                      {
                        key: 'actions',
                        label: 'Actions',
                        render: (row) => (
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setDialog({ resource: 'reparation', id: row.id, initial: row })}>
                              Modifier
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete('reparation', row.id, row.description?.slice(0, 40))}>
                              Supprimer
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={reparations}
                  />
                )}
              </SectionCard>
            )}
          </>
        )}
      </div>

      {dialog && (
        <EntityDialog
          dialog={dialog}
          clients={clients}
          vehicules={vehicules}
          mecaniciens={mecaniciens}
          onClose={closeDialog}
          onSaved={refresh}
          setError={setError}
        />
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card className="bg-slate-800/90 border border-white/10 text-gray-100 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/15">{title}</h2>
      {children}
    </Card>
  );
}

function EntityDialog({ dialog, clients, vehicules, mecaniciens, onClose, onSaved, setError }) {
  const { resource, id, initial } = dialog;
  const isEdit = id != null;

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [immat, setImmat] = useState('');
  const [carb, setCarb] = useState('Essence');
  const [transmission, setTransmission] = useState('Manuelle');
  const [annee, setAnnee] = useState('2020-01-01');
  const [clientId, setClientId] = useState('');

  const [prix, setPrix] = useState('');
  const [quantite, setQuantite] = useState('');

  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState('pending');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [datePrevue, setDatePrevue] = useState('');
  const [cout, setCout] = useState('');
  const [vehiculeId, setVehiculeId] = useState('');
  const [userId, setUserId] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = initial;
    setNom(init?.nom || '');
    setPrenom(init?.prenom || '');
    setTelephone(init?.telephone || '');
    setEmail(init?.email || '');
    setPassword('');
    setMarque(init?.marque || '');
    setModele(init?.modele || '');
    setImmat(init?.immat || '');
    setCarb(init?.carb || 'Essence');
    setTransmission(init?.transmission || 'Manuelle');
    setAnnee(init?.annee ? String(init.annee).slice(0, 10) : '2020-01-01');
    setClientId(init?.client_id ? String(init.client_id) : clients[0]?.id ? String(clients[0].id) : '');
    setPrix(init?.prix != null ? String(init.prix) : '');
    setQuantite(init?.quantite != null ? String(init.quantite) : '');
    setDescription(init?.description || '');
    setStatut(init?.statut || 'pending');
    setDateDebut(init?.date_debut || '');
    setDateFin(init?.date_fin || '');
    setDatePrevue(init?.date_prevue_fin || '');
    setCout(init?.cout != null ? String(init.cout) : '');
    setVehiculeId(
      init?.vehicule_id ? String(init.vehicule_id) : vehicules[0]?.id ? String(vehicules[0].id) : ''
    );
    setUserId(
      init?.user_id ? String(init.user_id) : mecaniciens[0]?.id ? String(mecaniciens[0].id) : ''
    );
  }, [dialog, initial, clients, vehicules, mecaniciens]);

  const title =
    resource === 'client'
      ? isEdit ? 'Modifier le client' : 'Nouveau client'
      : resource === 'vehicule'
        ? isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule'
        : resource === 'mecanicien'
          ? isEdit ? 'Modifier le mécanicien' : 'Nouveau mécanicien'
          : resource === 'comptable'
            ? isEdit ? 'Modifier le comptable' : 'Nouveau comptable'
          : resource === 'piece'
            ? isEdit ? 'Modifier la pièce' : 'Nouvelle pièce'
            : isEdit ? 'Modifier la réparation' : 'Nouvelle réparation';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (resource === 'client') {
        const payload = { nom, prenom, telephone };
        if (isEdit) await clientsAPI.update(id, payload);
        else await clientsAPI.create(payload);
      } else if (resource === 'vehicule') {
        const payload = {
          marque,
          modele,
          immat,
          carb,
          transmission,
          annee,
          client_id: Number(clientId),
        };
        if (isEdit) await vehiculesAPI.update(id, payload);
        else await vehiculesAPI.create(payload);
      } else if (resource === 'mecanicien') {
        if (isEdit) {
          const payload = { nom, prenom, email };
          if (password.trim()) payload.password = password;
          await mecaniciensAPI.update(id, payload);
        } else {
          await mecaniciensAPI.create({ nom, prenom, email, password });
        }
      } else if (resource === 'comptable') {
        if (isEdit) {
          const payload = { nom, prenom, email };
          if (password.trim()) payload.password = password;
          await comptablesAPI.update(id, payload);
        } else {
          await comptablesAPI.create({ nom, prenom, email, password });
        }
      } else if (resource === 'piece') {
        const payload = {
          nom,
          prix: Number(prix),
          quantite: Number(quantite),
        };
        if (isEdit) await piecesAPI.update(id, payload);
        else await piecesAPI.create(payload);
      } else if (resource === 'reparation') {
        const payload = {
          description,
          statut,
          date_debut: dateDebut || null,
          date_fin: dateFin || null,
          date_prevue_fin: datePrevue || null,
          cout: Number(cout),
          vehicule_id: Number(vehiculeId),
          user_id: Number(userId),
        };
        if (isEdit) await reparationsAPI.update(id, payload);
        else await reparationsAPI.create(payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} title={title} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-2">
        {resource === 'client' && (
          <>
            <Input label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            <Input label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            <Input label="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
          </>
        )}

        {resource === 'vehicule' && (
          <>
            <Select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              options={clients.map((c) => ({
                value: String(c.id),
                label: `${c.prenom} ${c.nom}`,
              }))}
            />
            <Input label="Marque" value={marque} onChange={(e) => setMarque(e.target.value)} required />
            <Input label="Modèle" value={modele} onChange={(e) => setModele(e.target.value)} required />
            <Input label="Immatriculation" value={immat} onChange={(e) => setImmat(e.target.value)} required />
            <Input label="Carburant" value={carb} onChange={(e) => setCarb(e.target.value)} required />
            <Input label="Transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} required />
            <Input label="Année (date)" type="date" value={annee} onChange={(e) => setAnnee(e.target.value)} required />
          </>
        )}

        {(resource === 'mecanicien' || resource === 'comptable') && (
          <>
            <Input label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            <Input label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
          </>
        )}

        {resource === 'piece' && (
          <>
            <Input label="Désignation" value={nom} onChange={(e) => setNom(e.target.value)} required />
            <Input label="Prix unitaire" type="number" step="0.01" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} required />
            <Input label="Quantité en stock" type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
          </>
        )}

        {resource === 'reparation' && (
          <>
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Select label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} options={REPARATION_STATUTS} required />
            <Select
              label="Véhicule"
              value={vehiculeId}
              onChange={(e) => setVehiculeId(e.target.value)}
              required
              options={vehicules.map((v) => ({
                value: String(v.id),
                label: `${v.immat} — ${v.marque} ${v.modele}`,
              }))}
            />
            <Select
              label="Mécanicien assigné"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              options={mecaniciens.map((m) => ({
                value: String(m.id),
                label: `${m.prenom} ${m.nom}`,
              }))}
            />
            <Input label="Coût (réparation)" type="number" step="0.01" min="0" value={cout} onChange={(e) => setCout(e.target.value)} required />
            <Input label="Date début" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            <Input label="Date fin" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            <Input label="Date prévue fin" type="date" value={datePrevue} onChange={(e) => setDatePrevue(e.target.value)} />
            <p className="text-sm text-gray-500 pt-2">
              Les pièces utilisées peuvent être liées via l’API (`pieces` sur POST/PUT) ou une future évolution de ce formulaire.
            </p>
          </>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
