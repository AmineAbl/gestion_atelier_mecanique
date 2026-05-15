import { useState, useCallback, useEffect } from 'react';
import { mecaniciensAPI, piecesAPI, reparationsAPI } from '../services/api';

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
      const [mechanicId, p] = await Promise.all([
        resolveMechanicId(user),
        piecesAPI.getAll(),
      ]);
      const piecesList = Array.isArray(p) ? p : [];

      let r;
      if (mechanicId) {
        r = await reparationsAPI.getByMechanic(mechanicId);
      } else if (user?.email) {
        /* Connexion démo sans `id` : l’API renvoie quand même les réparations avec `mecanicien` — filtrer par email. */
        const all = await reparationsAPI.getAll();
        const arr = Array.isArray(all) ? all : [];
        const em = String(user.email).trim().toLowerCase();
        r = arr.filter((rep) => (rep.mecanicien?.email || '').toLowerCase() === em);
      } else {
        setReparations([]);
        setPieces(piecesList);
        setError('Session mécanicien invalide (email manquant).');
        return;
      }

      setReparations(Array.isArray(r) ? r : []);
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
