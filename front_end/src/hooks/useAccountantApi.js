import { useState, useCallback, useEffect } from 'react';
import {
  clientsAPI,
  facturesAPI,
  reparationsAPI,
  vehiculesAPI,
  mecaniciensAPI,
} from '../services/api';
import { resolveComptableUserId } from '../utils/comptableIdentity';

function normalizeVehicule(v) {
  return {
    ...v,
    clientId: v.client_id,
    immatriculation: v.immat ?? v.immatriculation,
    annee: v.annee != null ? String(v.annee).slice(0, 4) : v.annee,
  };
}

function normalizeReparation(r) {
  // Extract clientId from nested vehicule relationship
  const clientId = r.vehicule?.client_id ?? r.vehicule?.client?.id ?? r.client_id;

  return {
    ...r,
    clientId: clientId ? Number(clientId) : null,
    vehiculeId: r.vehicule_id ? Number(r.vehicule_id) : null,
    userId: r.user_id ? Number(r.user_id) : null,
  };
}

function normalizeFacture(f) {
  // Use Number() to ensure types match when comparing in components
  const reparationId = f.reparationId || f.reparation_id ? Number(f.reparationId || f.reparation_id) : null;
  const userId = f.userId || f.user_id ? Number(f.userId || f.user_id) : null;
  
  // Try to find clientId from direct field (API returns camelCase) or nested relationships
  let clientId = f.clientId ? Number(f.clientId) : null;
  if (!clientId && f.client_id) {
    clientId = Number(f.client_id);
  }
  if (!clientId && f.reparation?.vehicule) {
    clientId = Number(f.reparation.vehicule.client_id);
  }

  return {
    ...f,
    clientId,
    reparationId,
    userId,
    facturePdfUrl: f.facturePdfUrl || f.facture_pdf_url || null,
    facturePdfPath: f.facturePdfPath || f.facture_pdf_path || null,
    taxes: Array.isArray(f.taxes) ? f.taxes : [],
    tax_total: f.tax_total ?? f.taxTotal ?? null,
  };
}

/**
 * Données comptable depuis l’API Laravel (clients, factures, réparations, véhicules).
 */
export function useAccountantApi(user) {
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const [cResponse, fResponse, rResponse, vResponse, uResponse] = await Promise.all([
      clientsAPI.getAll(),
      facturesAPI.getAll(),
      reparationsAPI.getAll(),
      vehiculesAPI.getAll(),
      mecaniciensAPI.getAll(),
    ]);

    const c = cResponse?.data || cResponse;
    const f = fResponse?.data || fResponse;
    const r = rResponse?.data || rResponse;
    const v = vResponse?.data || vResponse;
    const u = uResponse?.data || uResponse;

    setClients(Array.isArray(c) ? c : []);
    setFactures((Array.isArray(f) ? f : []).map(normalizeFacture));

    const normalizedReparations = (Array.isArray(r) ? r : []).map(normalizeReparation);
    if (process.env.NODE_ENV === 'development' && normalizedReparations.length > 0) {
      console.log('First reparation normalized:', normalizedReparations[0]);
    }
    setReparations(normalizedReparations);

    setVehicules((Array.isArray(v) ? v : []).map(normalizeVehicule));
    setUsers(Array.isArray(u) ? u : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message ||
              'Impossible de charger les données. Vérifiez que l’API Laravel est démarrée.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const clientHook = {
    clients,
    addClient: async (formData) => {
      await clientsAPI.create({
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        ...(formData.email ? { email: formData.email } : {}),
      });
      await load();
    },
    updateClient: async (id, formData) => {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
      };
      // Only include email if it's not empty
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email;
      }
      await clientsAPI.update(id, updateData);
      await load();
    },
    deleteClient: async (id) => {
      await clientsAPI.delete(id);
      await load();
    },
    selectedClient: null,
    setSelectedClient: () => {},
  };

  const factureHook = {
    factures,
    addFacture: async (formData) => {
      const userId = await resolveComptableUserId(user);
      await facturesAPI.create({
        client_id: Number(formData.clientId),
        reparation_id: Number(formData.reparationId),
        user_id: userId || 1, // Pass 1 as a safe fallback if ID is unknown
        total_piece: Number(formData.total_piece),
        cout: Number(formData.cout),
        prix_total: Number(formData.prix_total),
        taxes: formData.taxes || [],
        tax_total: Number(formData.tax_total || 0),
        statut: formData.statut,
        date_validation: formData.date_validation || null,
      });
      await load();
    },
    updateFacture: async (id, formData) => {
      await facturesAPI.update(id, {
        client_id: Number(formData.clientId),
        reparation_id: Number(formData.reparationId),
        total_piece: Number(formData.total_piece),
        cout: Number(formData.cout),
        prix_total: Number(formData.prix_total),
        taxes: formData.taxes || [],
        tax_total: Number(formData.tax_total || 0),
        statut: formData.statut,
        date_validation: formData.date_validation || null,
      });
      await load();
    },
    deleteFacture: async (id) => {
      await facturesAPI.delete(id);
      await load();
    },
    uploadFacturePdf: async (id, file) => {
      await facturesAPI.uploadPdf(id, file);
      await load();
    },
    selectedFacture: null,
    setSelectedFacture: () => {},
    getFacturesByClient: () => [],
  };

  const reparationHook = {
    reparations,
    selectedReparation: null,
    setSelectedReparation: () => {},
    addReparation: async () => {},
    updateReparation: async () => {},
    deleteReparation: async () => {},
    getReparationsByClient: (clientId) =>
      reparations.filter((r) => r.clientId === clientId),
  };

  const vehiculeHook = {
    vehicules,
    getVehiculesByClient: (clientId) =>
      vehicules.filter((v) => v.clientId === clientId),
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    clients: clientHook,
    factures: factureHook,
    reparations: reparationHook,
    vehicules: vehiculeHook,
    users,
    loading,
    error,
    clearError,
    refresh: load,
  };
}
