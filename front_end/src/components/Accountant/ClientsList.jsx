import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  Car
} from 'lucide-react';
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
  StatusBadge,
  Alert,
  EmptyState
} from '../common/UIComponents';
import {
  formatCurrency,
  searchClients,
  validateEmail,
  validatePhone
} from '../../utils/helpers';

import { useTheme } from '../../context/ThemeContext';

/**
 * Clients Management Component
 * CRUD operations for Clients
 */
export default function ClientsList({ clients, factures, reparations, vehicules }) {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'detail'
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: ''
  });

  // Search clients
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients.clients;
    return searchClients(clients.clients, searchTerm);
  }, [clients.clients, searchTerm]);

  const getClientStats = (clientId) => {
    const clientFactures = factures.filter(f => f.clientId === clientId);
    const clientReparations = reparations.filter(r => r.clientId === clientId);
    const clientVehicules = vehicules.filter(v => v.clientId === clientId);

    const totalSpent = clientFactures
      .filter(f => f.statut === 'paid')
      .reduce((sum, f) => sum + f.prix_total, 0);

    return {
      totalFactures: clientFactures.length,
      totalReparations: clientReparations.length,
      totalVehicules: clientVehicules.length,
      totalSpent
    };
  };

  const handleOpenModal = (mode, client = null) => {
    setModalMode(mode);
    if (client) {
      setSelectedClient(client);
      setFormData({
        nom: client.nom,
        prenom: client.prenom,
        telephone: client.telephone,
        email: client.email || ''
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.telephone) {
      setAlertMessage({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires' });
      return false;
    }

    if (!validatePhone(formData.telephone)) {
      setAlertMessage({ type: 'error', message: 'Numéro de téléphone invalide' });
      return false;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setAlertMessage({ type: 'error', message: 'Email invalide' });
      return false;
    }

    return true;
  };

  const handleSaveClient = async () => {
    if (!validateForm()) {
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      if (modalMode === 'create') {
        await clients.addClient(formData);
        setAlertMessage({ type: 'success', message: 'Client créé avec succès' });
      } else if (modalMode === 'edit') {
        await clients.updateClient(selectedClient.id, formData);
        setAlertMessage({ type: 'success', message: 'Client modifié avec succès' });
      }
      handleCloseModal();
    } catch (e) {
      setAlertMessage({ type: 'error', message: e.message || 'Erreur lors de l’enregistrement' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      return;
    }
    try {
      await clients.deleteClient(id);
      setAlertMessage({ type: 'success', message: 'Client supprimé avec succès' });
    } catch (e) {
      setAlertMessage({ type: 'error', message: e.message || 'Suppression impossible' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const columns = [
    {
      key: 'prenom',
      label: 'Nom',
      render: (row) => `${row.prenom} ${row.nom}`
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Phone className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          {row.telephone}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.email ? (
            <>
              <Mail className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              {row.email}
            </>
          ) : (
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Factures',
      render: (row) => getClientStats(row.id).totalFactures
    },
    {
      key: 'spent',
      label: 'Total dépensé',
      render: (row) => formatCurrency(getClientStats(row.id).totalSpent)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('detail', row)}
            className="text-blue-500 hover:text-blue-400"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal('edit', row)}
            className="text-green-500 hover:text-green-400"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClient(row.id)}
            className="text-red-500 hover:text-red-400"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
          </div>
          <Button onClick={() => handleOpenModal('create')} variant="primary" size="md">
            <Plus className="w-5 h-5 mr-2" /> Nouveau client
          </Button>
        </div>
      </Card>

      {filteredClients.length > 0 ? (
        <Card>
          <Table columns={columns} data={filteredClients} />
        </Card>
      ) : (
        <Card>
          <EmptyState message="Aucun client trouvé" />
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          modalMode === 'create'
            ? 'Créer un nouveau client'
            : modalMode === 'edit'
              ? 'Modifier le client'
              : 'Détails du client'
        }
        size="md"
      >
        <div className="space-y-4">
          {(modalMode === 'create' || modalMode === 'edit') && (
            <>
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => handleFormChange('prenom', e.target.value)}
                required
              />

              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleFormChange('nom', e.target.value)}
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleFormChange('telephone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="client@example.com"
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={handleCloseModal} variant="secondary">
                  Annuler
                </Button>
                <Button onClick={handleSaveClient} variant="primary">
                  {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
              </div>
            </>
          )}

          {modalMode === 'detail' && selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50'}`}>
                <h3 className={`font-semibold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedClient.prenom} {selectedClient.nom}
                </h3>
                <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {selectedClient.telephone}
                  </p>
                  {selectedClient.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {selectedClient.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Statistiques</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Factures</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getClientStats(selectedClient.id).totalFactures}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total dépensé</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(getClientStats(selectedClient.id).totalSpent)}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Réparations</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getClientStats(selectedClient.id).totalReparations}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Véhicules</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getClientStats(selectedClient.id).totalVehicules}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicles */}
              {getClientStats(selectedClient.id).totalVehicules > 0 && (
                <div>
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Véhicules</h4>
                  <div className="space-y-2">
                    {vehicules
                      .filter(v => v.clientId === selectedClient.id)
                      .map(v => (
                        <div key={v.id} className={`flex items-center gap-2 p-3 rounded ${isDark ? 'bg-slate-800 border border-white/10 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                          <Car className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span>
                            {v.marque} {v.modele} ({v.annee}) - {v.immatriculation}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => handleOpenModal('edit', selectedClient)} variant="primary">
                  <Edit2 className="w-4 h-4 mr-2" /> Modifier
                </Button>
                <Button onClick={handleCloseModal} variant="secondary">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
