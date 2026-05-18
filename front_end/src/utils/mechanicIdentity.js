import { mecaniciensAPI } from '../services/api';

/**
 * Complète id / cin / nom depuis GET /mecaniciens (connexion API ou démo).
 */
export async function resolveMechanicProfile(user) {
  if (!user?.email || user.role !== 'mecanicien') {
    return user;
  }

  try {
    const list = await mecaniciensAPI.getAll();
    const arr = Array.isArray(list) ? list : [];
    const match = arr.find(
      (m) => String(m.email || '').trim().toLowerCase() === String(user.email).trim().toLowerCase()
    );
    if (!match) {
      return user;
    }

    return {
      ...user,
      id: user.id ?? match.id,
      nom: user.nom ?? match.nom,
      prenom: user.prenom ?? match.prenom,
      cin: user.cin ?? match.cin ?? null,
      email: user.email ?? match.email,
    };
  } catch {
    return user;
  }
}
