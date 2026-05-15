import { useState, useCallback, useEffect } from 'react';
import {
  clientsAPI,
  facturesAPI,
  reparationsAPI,
  vehiculesAPI,
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
  // API returns: { vehicule: { client_id, client: { id, ... } }, ... }
  const clientId = r.vehicule?.client_id ?? r.vehicule?.client?.id ?? r.client_id;

  return {
    ...r,
    clientId,
    vehiculeId: r.vehicule_id,
    userId: r.user_id,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const [c, f, r, v] = await Promise.all([
      clientsAPI.getAll(),
      facturesAPI.getAll(),
      reparationsAPI.getAll(),
      vehiculesAPI.getAll(),
    ]);
    setClients(Array.isArray(c) ? c : []);
    setFactures(Array.isArray(f) ? f : []);

    const normalizedReparations = (Array.isArray(r) ? r : []).map(normalizeReparation);
    // Log for debugging if needed
    if (process.env.NODE_ENV === 'development' && normalizedReparations.length > 0) {
      console.log('First reparation normalized:', normalizedReparations[0]);
    }
    setReparations(normalizedReparations);

    setVehicules((Array.isArray(v) ? v : []).map(normalizeVehicule));
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
      if (!userId) {
        throw new Error(
          'Identifiant comptable introuvable. Connectez-vous via l’API ou avec un compte issu du seeder.'
        );
      }
      await facturesAPI.create({
        client_id: Number(formData.clientId),
        reparation_id: Number(formData.reparationId),
        user_id: userId,
        total_piece: Number(formData.total_piece),
        cout: Number(formData.cout),
        prix_total: Number(formData.prix_total),
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
        statut: formData.statut,
        date_validation: formData.date_validation || null,
      });
      await load();
    },
    deleteFacture: async (id) => {
      await facturesAPI.delete(id);
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
    loading,
    error,
    clearError,
    refresh: load,
  };
}
