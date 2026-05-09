import { useState, useCallback, useEffect } from 'react';
import {
  clientsAPI,
  comptablesAPI,
  facturesAPI,
  reparationsAPI,
  vehiculesAPI,
} from '../services/api';

function normalizeVehicule(v) {
  return {
    ...v,
    clientId: v.client_id,
    immatriculation: v.immat ?? v.immatriculation,
    annee: v.annee != null ? String(v.annee).slice(0, 4) : v.annee,
  };
}

function normalizeReparation(r) {
  return {
    ...r,
    clientId: r.vehicule?.client_id ?? r.client_id,
    vehiculeId: r.vehicule_id,
    userId: r.user_id,
  };
}

async function resolveComptableUserId(user) {
  if (user?.id) return user.id;
  if (!user?.email) return null;
  const list = await comptablesAPI.getAll();
  const match = list.find((c) => c.email === user.email);
  return match?.id ?? null;
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
    setReparations((Array.isArray(r) ? r : []).map(normalizeReparation));
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
      await clientsAPI.update(id, {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email ? formData.email : null,
      });
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
