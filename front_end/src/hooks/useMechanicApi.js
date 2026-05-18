import { useState, useCallback, useEffect } from 'react';
import { mecaniciensAPI, piecesAPI, reparationsAPI, vehiculesAPI } from '../services/api';
import { resolveMechanicProfile } from '../utils/mechanicIdentity';

function enrichReparationsWithVehicules(reparations, vehicules) {
  const byId = new Map((Array.isArray(vehicules) ? vehicules : []).map((v) => [v.id, v]));

  return (Array.isArray(reparations) ? reparations : []).map((r) => {
    if (r.vehicule?.marque || r.vehicule?.modele || r.vehicule?.immat || r.vehicule?.immatriculation) {
      return r;
    }
    const vid = r.vehicule_id ?? r.vehiculeId;
    const v = vid != null ? byId.get(vid) : null;
    if (!v) {
      return r;
    }
    return {
      ...r,
      vehicule: {
        id: v.id,
        marque: v.marque,
        modele: v.modele,
        immat: v.immat,
        immatriculation: v.immat,
        client_id: v.client_id,
        client: v.client ?? null,
      },
    };
  });
}

async function resolveMechanicId(user) {
  if (user?.id) return user.id;
  if (!user?.email) return null;
  try {
    const list = await mecaniciensAPI.getAll();
    const arr = Array.isArray(list) ? list : [];
    const match = arr.find((m) => m.email === user.email);
    return match?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Données atelier pour l’espace mécanicien : réparations assignées + catalogue pièces.
 */
export function useMechanicApi(user) {
  const [reparations, setReparations] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await resolveMechanicProfile(user);
      const mechanicId = profile?.id ?? (await resolveMechanicId(user));

      const [p, vehiculesList] = await Promise.all([piecesAPI.getAll(), vehiculesAPI.getAll()]);
      const piecesList = Array.isArray(p) ? p : [];

      let r;
      if (mechanicId) {
        r = await reparationsAPI.getByMechanic(mechanicId);
      } else if (profile?.email || user?.email) {
        const all = await reparationsAPI.getAll();
        const arr = Array.isArray(all) ? all : [];
        const em = String(profile?.email || user.email).trim().toLowerCase();
        r = arr.filter((rep) => (rep.mecanicien?.email || '').toLowerCase() === em);
      } else {
        setReparations([]);
        setPieces(piecesList);
        setError('Session mécanicien invalide (email manquant).');
        return;
      }

      setReparations(enrichReparationsWithVehicules(r, vehiculesList));
      setPieces(piecesList);
    } catch (e) {
      setReparations([]);
      setPieces([]);
      setError(
        e.message ||
          'Impossible de charger les données. Vérifiez que l’API Laravel est démarrée et REACT_APP_API_BASE_URL.'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const clearError = useCallback(() => setError(null), []);

  return {
    reparations,
    pieces,
    loading,
    error,
    clearError,
    refresh: load,
  };
}
