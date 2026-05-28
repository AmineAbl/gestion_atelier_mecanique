import React, { useState, useMemo, useEffect } from 'react';
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
  const TAX_PRESETS = [
    {
      id: 'tva-20',
      label: 'TVA 20%',
      rate: 20,
      note: 'Taux standard (main d’oeuvre, réparations, diagnostics, pièces).',
    },
    {
      id: 'tva-14',
      label: 'TVA 14%',
      rate: 14,
      note: 'Certaines opérations/produits liés au transport (rare en atelier).',
    },
    {
      id: 'tva-10',
      label: 'TVA 10%',
      rate: 10,
      note: 'Secteurs/produits spécifiques (lubrifiants ou cas spéciaux).',
    },
    {
      id: 'tva-7',
      label: 'TVA 7%',
      rate: 7,
      note: 'Produits de première nécessité (généralement non utilisé en atelier).',
    },
    {
      id: 'tva-0',
      label: 'TVA 0%',
      rate: 0,
      note: 'Opérations exonérées / export.',
    },
    {
      id: 'tva-exonere',
      label: 'Exonéré (sans TVA)',
      rate: 0,
      note: 'Régime auto-entrepreneur ou exonérations légales.',
    },
    { id: 'custom', label: 'Personnalisé', rate: 0, note: '' },
  ];

  const createTaxLine = (preset = TAX_PRESETS[0]) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    presetId: preset.id,
    label: preset.label,
    rate: preset.rate,
    note: preset.note,
  });

  const computeTotals = (data) => {
    const cout = Number(data.cout) || 0;
    const taxes = Array.isArray(data.taxes) ? data.taxes : [];
    const taxTotal = taxes.reduce(
      (sum, tax) => sum + (cout * (Number(tax.rate) || 0)) / 100,
      0
    );
    return {
      ...data,
      tax_total: taxTotal,
      prix_total: cout + taxTotal,
    };
  };
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(() => computeTotals({
    clientId: '',
    vehiculeId: '',
    reparationId: '',
    total_piece: 0,
    cout: 0,
    prix_total: 0,
    tax_total: 0,
    taxes: [createTaxLine()],
    statut: 'pending',
    date_validation: ''
  }));

  // ── Invoice theme (blue / green / red) – persisted in localStorage ──
  const [invoiceTheme, setInvoiceTheme] = useState(
    () => localStorage.getItem('invoiceTheme') || 'blue'
  );
  const [themeLabels, setThemeLabels] = useState(
    () => {
      try { return JSON.parse(localStorage.getItem('invoiceThemeLabels') || '{}'); }
      catch { return {}; }
    }
  );

  useEffect(() => {
    localStorage.setItem('invoiceTheme', invoiceTheme);
  }, [invoiceTheme]);

  useEffect(() => {
    localStorage.setItem('invoiceThemeLabels', JSON.stringify(themeLabels));
  }, [themeLabels]);

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
      const existingTaxes = Array.isArray(facture.taxes) && facture.taxes.length
        ? facture.taxes.map((tax) => ({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          presetId: tax.presetId || 'custom',
          label: tax.label || 'TVA',
          rate: Number(tax.rate) || 0,
          note: tax.note || '',
        }))
        : [createTaxLine()];
      setFormData(computeTotals({
        ...facture,
        clientId: facture.clientId != null ? String(facture.clientId) : '',
        vehiculeId: reparation?.vehicule_id ? String(reparation.vehicule_id) : '',
        reparationId: facture.reparationId != null ? String(facture.reparationId) : '',
        total_piece: facture.total_piece,
        date_validation: facture.date_validation || '',
        taxes: existingTaxes,
      }));
    } else {
      setFormData(computeTotals({
        clientId: '',
        vehiculeId: '',
        reparationId: '',
        total_piece: 0,
        cout: 0,
        prix_total: 0,
        tax_total: 0,
        taxes: [createTaxLine()],
        statut: 'pending',
        date_validation: ''
      }));
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

    setFormData(computeTotals(updatedForm));
  };

  const handleTaxChange = (id, patch) => {
    const taxes = (formData.taxes || []).map((tax) =>
      tax.id === id ? { ...tax, ...patch } : tax
    );
    setFormData(computeTotals({ ...formData, taxes }));
  };

  const handlePresetChange = (id, presetId) => {
    const preset = TAX_PRESETS.find((p) => p.id === presetId) || TAX_PRESETS[TAX_PRESETS.length - 1];
    handleTaxChange(id, {
      presetId,
      label: preset.label,
      rate: preset.rate,
      note: preset.note,
    });
  };

  const handleAddTax = () => {
    const taxes = [...(formData.taxes || []), createTaxLine()];
    setFormData(computeTotals({ ...formData, taxes }));
  };

  const handleRemoveTax = (id) => {
    const taxes = (formData.taxes || []).filter((tax) => tax.id !== id);
    if (taxes.length === 0) {
      setFormData(computeTotals({ ...formData, taxes: [createTaxLine()] }));
      return;
    }
    setFormData(computeTotals({ ...formData, taxes }));
  };

  const handleSaveFacture = async () => {
    if (!formData.clientId || !formData.reparationId || !formData.cout) {
      setAlertMessage({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires' });
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

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
      const msg = String(e?.message || '').toLowerCase();
      const friendly = msg.includes('validation.unique') || msg.includes('reparation') && msg.includes('unique')
        ? 'Cette réparation a déjà une facture.'
        : e.message || 'Erreur lors de l’enregistrement';
      setAlertMessage({ type: 'error', message: friendly });
    } finally {
      setIsSaving(false);
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
      }, invoiceTheme);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setAlertMessage({ type: 'error', message: error.message || 'Erreur lors de la génération du PDF' });
      setTimeout(() => setAlertMessage(null), 4000);
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

              {/* ── Mechanic preview (read-only) ── */}
              {(() => {
                if (!formData.reparationId) return null;
                const rep = reparations.find(r => Number(r.id) === Number(formData.reparationId));
                const mec = users?.find(u => Number(u.id) === Number(rep?.user_id || rep?.userId));
                const mecName = mec ? `${mec.prenom || ''} ${mec.nom || ''}`.trim() : null;
                return (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}>
                    <span className="text-xl">👨‍🔧</span>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>Mécanicien assigné (lecture seule)</p>
                      <p className="font-semibold mt-0.5">
                        {mecName || <span className="italic opacity-60">Non assigné</span>}
                      </p>
                      {mec?.email && <p className="text-xs opacity-70">{mec.email}</p>}
                      {mec?.telephone && <p className="text-xs opacity-70">{mec.telephone}</p>}
                    </div>
                  </div>
                );
              })()}

              <Input
                label="Nombre de pièces"
                type="number"
                value={formData.total_piece}
                onChange={(e) => handleFormChange('total_piece', e.target.value)}
                required
              />

              {formData.reparationId && (() => {
                const rep = reparations.find(r => Number(r.id) === Number(formData.reparationId));
                if (!rep || rep.cout == null) return null;
                return (
                  <div className={`rounded-xl border p-3 text-sm ${
                    isDark ? 'border-white/10 bg-slate-800/50 text-slate-200' : 'border-gray-200 bg-gray-50 text-gray-800'
                  }`}>
                    <p className="font-semibold">Coût estimé (manager)</p>
                    <p className="mt-1">{formatCurrency(rep.cout)}</p>
                  </div>
                );
              })()}

              <Input
                label="Montant HT (MAD)"
                type="number"
                step="0.01"
                value={formData.cout}
                onChange={(e) => handleFormChange('cout', e.target.value)}
                required
              />

              <div className={`rounded-xl border p-4 ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>Taxes / TVA</p>
                <div className="space-y-3">
                  {(formData.taxes || []).map((tax) => (
                    <div key={tax.id} className={`rounded-lg border p-3 ${
                      isDark ? 'border-white/10 bg-slate-900/40' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select
                          label="Type"
                          value={tax.presetId || 'custom'}
                          onChange={(e) => handlePresetChange(tax.id, e.target.value)}
                          options={TAX_PRESETS.map((preset) => ({
                            value: preset.id,
                            label: preset.label,
                          }))}
                        />
                        <Input
                          label="Libellé"
                          value={tax.label || ''}
                          onChange={(e) => handleTaxChange(tax.id, { label: e.target.value })}
                        />
                        <Input
                          label="Taux (%)"
                          type="number"
                          step="0.1"
                          min="0"
                          value={tax.rate ?? ''}
                          onChange={(e) => handleTaxChange(tax.id, { rate: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Note"
                        value={tax.note || ''}
                        onChange={(e) => handleTaxChange(tax.id, { note: e.target.value })}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveTax(tax.id)}
                          disabled={(formData.taxes || []).length <= 1}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            (formData.taxes || []).length <= 1
                              ? 'opacity-50 cursor-not-allowed'
                              : isDark
                                ? 'border-white/10 text-slate-300 hover:text-white hover:border-white/30'
                                : 'border-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddTax}
                  className={`mt-3 text-sm font-semibold px-4 py-2 rounded-lg border transition-all ${
                    isDark
                      ? 'border-white/10 text-slate-200 hover:text-white hover:border-white/30'
                      : 'border-gray-300 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  + Ajouter une taxe
                </button>
              </div>

              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-slate-700/50 text-slate-200' : 'bg-blue-50 text-blue-700'
              }`}>
                <p className="text-sm">
                  <strong>Taxes totales :</strong> {formatCurrency(formData.tax_total || 0)}
                </p>
                <p className="text-sm mt-1">
                  <strong>Total TTC (taxes incluses) :</strong> {formatCurrency(formData.prix_total)}
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

              {/* ── Invoice theme picker ── */}
              <div className={`rounded-xl border p-4 ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>🎨 Thème de la facture PDF</p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'blue',  dot: '#3b82f6', defaultLabel: 'Bleu (défaut)' },
                    { key: 'green', dot: '#16a34a', defaultLabel: 'Vert' },
                    { key: 'red',   dot: '#dc2626', defaultLabel: 'Rouge' },
                  ].map(({ key, dot, defaultLabel }) => (
                    <div key={key} className="flex items-center gap-3">
                      {/* Radio */}
                      <button
                        type="button"
                        onClick={() => setInvoiceTheme(key)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          invoiceTheme === key
                            ? 'border-current scale-110'
                            : isDark ? 'border-slate-500' : 'border-gray-300'
                        }`}
                        style={{ borderColor: invoiceTheme === key ? dot : undefined }}
                        aria-label={`Thème ${key}`}
                      >
                        {invoiceTheme === key && (
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
                        )}
                      </button>
                      {/* Color swatch */}
                      <span
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{ background: dot }}
                      />
                      {/* Optional label input */}
                      <input
                        type="text"
                        placeholder={defaultLabel}
                        value={themeLabels[key] || ''}
                        onChange={(e) =>
                          setThemeLabels(prev => ({ ...prev, [key]: e.target.value }))
                        }
                        className={`flex-1 text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 transition-all ${
                          isDark
                            ? 'bg-slate-700 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-blue-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${
                  isDark ? 'text-slate-500' : 'text-gray-400'
                }`}>Le libellé est optionnel — laissez vide pour utiliser le nom par défaut.</p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button onClick={handleCloseModal} variant="secondary">
                  Annuler
                </Button>
                <Button onClick={handleSaveFacture} variant="primary" disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
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
