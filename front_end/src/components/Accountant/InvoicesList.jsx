import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
  Select,
  StatusBadge,
  Alert,
  EmptyState
} from '../common/UIComponents';
import { useTheme } from '../../context/ThemeContext';
import {
  formatCurrency,
  formatDate,
  generateInvoiceNumber
} from '../../utils/helpers';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

/**
 * Invoices Management Component
 * CRUD operations for Factures (Invoices)
 */
export default function InvoicesList({ factures, clients, reparations, vehicules = [], users = [] }) {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    vehiculeId: '',
    reparationId: '',
    total_piece: 0,
    cout: 0,
    prix_total: 0,
    statut: 'pending',
    date_validation: ''
  });

  // Get vehicles for the selected client
  const availableVehicules = useMemo(() => {
    if (!formData.clientId) return [];
    return (vehicules || []).filter((v) => Number(v.clientId) === Number(formData.clientId));
  }, [formData.clientId, vehicules]);

  // Get reparations for the selected vehicle
  const reparationOptions = useMemo(() => {
    if (!formData.vehiculeId) return [];
    const clientId = formData.clientId;
    if (!clientId) return [];
    const taken = new Set(
      factures.factures
        .filter((f) => modalMode !== 'edit' || !selectedFacture || f.id !== selectedFacture.id)
        .map((f) => Number(f.reparationId))
    );
    const options = (reparations || []).filter((r) => {
      if (Number(r.vehicule_id || r.vehiculeId) !== Number(formData.vehiculeId)) return false;
      const rid = Number(r.id);
      if (taken.has(rid) && rid !== Number(formData.reparationId)) return false;
      return true;
    });

    return options;
  }, [formData.vehiculeId, formData.clientId, formData.reparationId, reparations, factures.factures, modalMode, selectedFacture]);

  // Filter and search factures
  const filteredFactures = useMemo(() => {
    let result = factures.factures;

    if (filterStatus) {
      result = result.filter(f => f.statut === filterStatus);
    }

    if (searchTerm) {
      result = result.filter(f => {
        const client = clients.find(c => c.id === f.clientId);
        const clientName = client ? `${client.prenom} ${client.nom}` : '';
        return (
          f.id.toString().includes(searchTerm) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return result;
  }, [factures.factures, filterStatus, searchTerm, clients]);

  const getClientName = (clientId) => {
    if (!clientId) return 'Inconnu';
    const client = clients.find(c => Number(c.id) === Number(clientId));
    return client ? `${client.prenom} ${client.nom}` : 'Inconnu';
  };

  const getReparationDescription = (reparationId) => {
    if (!reparationId) return 'N/A';
    const reparation = reparations.find(r => Number(r.id) === Number(reparationId));
    return reparation ? reparation.description : 'N/A';
  };

  const handleOpenModal = (mode, facture = null) => {
    setModalMode(mode);
    if (facture) {
      setSelectedFacture(facture);
      const reparation = reparations.find(r => Number(r.id) === Number(facture.reparationId));
      setFormData({
        ...facture,
        clientId: facture.clientId != null ? String(facture.clientId) : '',
        vehiculeId: reparation?.vehicule_id ? String(reparation.vehicule_id) : '',
        reparationId: facture.reparationId != null ? String(facture.reparationId) : '',
        total_piece: facture.total_piece,
        date_validation: facture.date_validation || '',
      });
    } else {
      setFormData({
        clientId: '',
        vehiculeId: '',
        reparationId: '',
        total_piece: 0,
        cout: 0,
        prix_total: 0,
        statut: 'pending',
        date_validation: ''
      });
    }
    setUploadFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFacture(null);
  };

  const handleFormChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };

    if (field === 'clientId') {
      updatedForm.vehiculeId = '';
      updatedForm.reparationId = '';
    } else if (field === 'vehiculeId') {
      updatedForm.reparationId = '';
    }

    // Auto-calculate prix_total if cout changes
    if (field === 'cout' || field === 'total_piece') {
      const cout = field === 'cout' ? parseFloat(value) || 0 : parseFloat(updatedForm.cout) || 0;
      updatedForm.prix_total = cout * 1.20; // Add 20% tax
    }

    setFormData(updatedForm);
  };

  const handleSaveFacture = async () => {
    if (!formData.clientId || !formData.reparationId || !formData.cout) {
      setAlertMessage({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires' });
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      if (modalMode === 'create') {
        await factures.addFacture(formData);
        setAlertMessage({ type: 'success', message: 'Facture créée avec succès' });
      } else if (modalMode === 'edit') {
        await factures.updateFacture(selectedFacture.id, formData);
        setAlertMessage({ type: 'success', message: 'Facture modifiée avec succès' });
      }
      handleCloseModal();
    } catch (e) {
      setAlertMessage({ type: 'error', message: e.message || 'Erreur lors de l’enregistrement' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteFacture = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;
    try {
      await factures.deleteFacture(id);
      setAlertMessage({ type: 'success', message: 'Facture supprimée avec succès' });
    } catch (e) {
      setAlertMessage({ type: 'error', message: e.message || 'Suppression impossible' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDownloadInvoicePDF = async (facture) => {
    try {
      const client = clients.find(c => Number(c.id) === Number(facture.clientId));
      const reparation = reparations.find(r => Number(r.id) === Number(facture.reparationId));
      const vehicule = vehicules.find(v => Number(v.id) === Number(reparation?.vehicule_id || reparation?.vehiculeId));
      const mechanic = users?.find(u => Number(u.id) === Number(reparation?.user_id || reparation?.userId));
      
      await generateInvoicePDF(facture, client, reparation, vehicule, mechanic, {
        name: 'Atelier Mécanique',
        address: 'Adresse de votre atelier',
        phone: 'Téléphone'
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setAlertMessage({ type: 'error', message: 'Erreur lors de la génération du PDF' });
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleUploadInvoicePDF = async () => {
    if (!selectedFacture || !uploadFile) {
      setAlertMessage({ type: 'error', message: 'Veuillez choisir un fichier PDF' });
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      setUploading(true);
      await factures.uploadFacturePdf(selectedFacture.id, uploadFile);
      setAlertMessage({ type: 'success', message: 'Facture PDF mise à jour avec succès' });
      setUploadFile(null);
    } catch (e) {
      setAlertMessage({ type: 'error', message: e.message || 'Erreur lors de l’envoi du PDF' });
    } finally {
      setUploading(false);
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Client', 'Montant', 'Coût', 'Total TTC', 'Statut', 'Date'];
    const rows = filteredFactures.map(f => [
      f.id,
      getClientName(f.clientId),
      formatCurrency(f.cout),
      formatCurrency(f.cout),
      formatCurrency(f.prix_total),
      f.statut,
      formatDate(f.date_validation)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns = [
    {
      key: 'id',
      label: 'N° Facture',
      render: (row) => generateInvoiceNumber(row.id, row.date_validation || new Date().toISOString().split('T')[0])
    },
    {
      key: 'clientId',
      label: 'Client',
      render: (row) => getClientName(row.clientId)
    },
    {
      key: 'cout',
      label: 'Montant HT',
      render: (row) => formatCurrency(row.cout)
    },
    {
      key: 'prix_total',
      label: 'Total TTC',
      render: (row) => formatCurrency(row.prix_total)
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => <StatusBadge status={row.statut} />
    },
    {
      key: 'date_validation',
      label: 'Date',
      render: (row) => formatDate(row.date_validation)
    },
    {
      key: 'facturePdfUrl',
      label: 'PDF',
      render: (row) => (
        row.facturePdfUrl ? (
          <a
            href={row.facturePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Voir
          </a>
        ) : (
          <span className="text-gray-400">Aucun</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('view', row)}
            className="text-blue-600 hover:text-blue-800"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadInvoicePDF(row)}
            className="text-purple-600 hover:text-purple-800"
            title="Télécharger PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal('view', row)}
            className="text-slate-600 hover:text-slate-800"
            title="Ajouter un PDF"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal('edit', row)}
            className="text-green-600 hover:text-green-800"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteFacture(row.id)}
            className="text-red-600 hover:text-red-800"
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

      <Card className="mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par client ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
              }`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={isDark ? { colorScheme: 'dark' } : { colorScheme: 'light' }}
            className={`px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 ${
              isDark
                ? 'bg-slate-800 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/50'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
            }`}
          >
            <option value="">Tous les statuts</option>
            <option value="paid">Payée</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulée</option>
          </select>
          <div className="flex gap-3">
            <Button onClick={() => handleOpenModal('create')} variant="primary" size="md">
              <Plus className="w-5 h-5 mr-2" /> Nouvelle facture
            </Button>
            <Button onClick={handleExportCSV} variant="secondary" size="md">
              <Download className="w-5 h-5 mr-2" /> Exporter
            </Button>
          </div>
        </div>
      </Card>

      {filteredFactures.length > 0 ? (
        <Card>
          <Table columns={columns} data={filteredFactures} />
        </Card>
      ) : (
        <Card>
          <EmptyState message="Aucune facture trouvée" />
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          modalMode === 'create'
            ? 'Créer une nouvelle facture'
            : modalMode === 'edit'
              ? 'Modifier la facture'
              : 'Détails de la facture'
        }
        size="lg"
      >
        <div className="space-y-4">
          {modalMode !== 'view' && (
            <>
              <Select
                label="Client"
                value={formData.clientId}
                onChange={(e) => handleFormChange('clientId', e.target.value)}
                options={clients.map(c => ({
                  value: String(c.id),
                  label: `${c.prenom} ${c.nom}`
                }))}
                required
              />

              <Select
                label="Véhicule"
                value={formData.vehiculeId}
                onChange={(e) => handleFormChange('vehiculeId', e.target.value)}
                options={availableVehicules.map(v => ({
                  value: String(v.id),
                  label: `${v.marque || ''} ${v.modele || ''} - ${v.immat || v.immatriculation || ''}`
                }))}
                required
                disabled={!formData.clientId}
              />
              {formData.clientId && availableVehicules.length === 0 && (
                <div className="text-sm text-orange-600 p-2 bg-orange-50 rounded border border-orange-200">
                  ⚠️ Aucun véhicule trouvé pour ce client.
                </div>
              )}

              <Select
                label="Réparation"
                value={formData.reparationId}
                onChange={(e) => handleFormChange('reparationId', e.target.value)}
                options={reparationOptions.map(r => ({
                  value: String(r.id),
                  label: r.description
                }))}
                required
                disabled={!formData.vehiculeId}
              />
              {formData.clientId && reparationOptions.length === 0 && reparations.length > 0 && (
                <div className="text-sm text-amber-600 p-2 bg-amber-50 rounded border border-amber-200">
                  ℹ️ Aucune réparation disponible pour ce client, ou toutes les réparations sont déjà associées à une facture.
                </div>
              )}
              {formData.clientId && reparationOptions.length === 0 && reparations.length === 0 && (
                <div className="text-sm text-orange-600 p-2 bg-orange-50 rounded border border-orange-200">
                  ⚠️ Aucune réparation trouvée. Veuillez d'abord créer une réparation.
                </div>
              )}

              <Input
                label="Nombre de pièces"
                type="number"
                value={formData.total_piece}
                onChange={(e) => handleFormChange('total_piece', e.target.value)}
                required
              />

              <Input
                label="Montant HT (€)"
                type="number"
                step="0.01"
                value={formData.cout}
                onChange={(e) => handleFormChange('cout', e.target.value)}
                required
              />

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Total TTC (20% TVA incluse):</strong> {formatCurrency(formData.prix_total)}
                </p>
              </div>

              <Select
                label="Statut"
                value={formData.statut}
                onChange={(e) => handleFormChange('statut', e.target.value)}
                options={[
                  { value: 'pending', label: 'En attente' },
                  { value: 'paid', label: 'Payée' },
                  { value: 'cancelled', label: 'Annulée' }
                ]}
              />

              <Input
                label="Date de validation"
                type="date"
                value={formData.date_validation}
                onChange={(e) => handleFormChange('date_validation', e.target.value)}
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={handleCloseModal} variant="secondary">
                  Annuler
                </Button>
                <Button onClick={handleSaveFacture} variant="primary">
                  {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
                </Button>
              </div>
            </>
          )}

          {modalMode === 'view' && selectedFacture && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-semibold">{getClientName(selectedFacture.clientId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Facture #</p>
                  <p className="font-semibold">
                    {generateInvoiceNumber(selectedFacture.id, selectedFacture.date_validation)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Réparation</p>
                  <p className="font-semibold">{getReparationDescription(selectedFacture.reparationId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="font-semibold"><StatusBadge status={selectedFacture.statut} /></p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Montant HT</p>
                  <p className="font-semibold">{formatCurrency(selectedFacture.cout)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total TTC</p>
                  <p className="font-semibold text-lg text-blue-600">
                    {formatCurrency(selectedFacture.prix_total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de validation</p>
                  <p className="font-semibold">{formatDate(selectedFacture.date_validation)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre de pièces</p>
                  <p className="font-semibold">{selectedFacture.total_piece}</p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-gray-300 p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 mb-2">Facture PDF</p>
                {selectedFacture.facturePdfUrl ? (
                  <a
                    href={selectedFacture.facturePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Télécharger la facture existante
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Aucun PDF associé</p>
                )}
                <div className="mt-3 flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleUploadInvoicePDF}
                    variant="primary"
                    disabled={!uploadFile || uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Envoi...' : 'Uploader le PDF'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={() => handleOpenModal('edit', selectedFacture)} variant="primary">
                  <Edit2 className="w-4 h-4 mr-2" /> Modifier
                </Button>
                <Button onClick={() => handleDownloadInvoicePDF(selectedFacture)} variant="secondary">
                  <Download className="w-4 h-4 mr-2" /> Télécharger PDF
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
