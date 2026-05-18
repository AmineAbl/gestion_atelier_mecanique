import { authAPI } from '../services/api';
import { resolveComptableUserId } from './comptableIdentity';
import { resolveMechanicProfile } from './mechanicIdentity';

/**
 * Comptes de secours si l’API Laravel n’est pas joignable.
 * Un seul compte « responsable » en démo (cohérent avec la base).
 */
const DEMO_USERS = {
  'accountant@atelier.com': {
    password: 'password123',
    role: 'comptable',
    name: 'Comptable (démo)',
  },
  'comptable@atelier.com': {
    password: 'password123',
    role: 'comptable',
    name: 'Comptable atelier',
  },
  'responsable@atelier.com': {
    password: 'password123',
    role: 'responsable',
    name: 'Responsable atelier',
  },
  'mecanicien@atelier.com': {
    password: 'password123',
    role: 'mecanicien',
    name: 'Paul Garage',
  },
};

/**
 * @returns {Promise<{ id?: number, nom?: string, prenom?: string, email: string, role: string, name: string }>}
 */
export async function loginWithApiOrDemo(email, password) {
  try {
    const userData = await authAPI.login(email, password);
    let normalized = normalizeUser(userData);
    if (normalized.role === 'comptable') {
      try {
        const id = await resolveComptableUserId(normalized);
        if (id != null) {
          normalized = { ...normalized, id };
        }
      } catch {
        /* GET /comptables indisponible */
      }
    }
    if (normalized.role === 'mecanicien') {
      normalized = await resolveMechanicProfile(normalized);
    }
    return normalized;
  } catch {
    /* API indisponible ou identifiants invalides */
  }

  const demo = DEMO_USERS[email];
  if (!demo || demo.password !== password) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const base = normalizeUser({
    email,
    role: demo.role,
    name: demo.name,
  });

  if (base.role === 'comptable') {
    try {
      const id = await resolveComptableUserId(base);
      if (id != null) {
        return { ...base, id };
      }
    } catch {
      /* API indisponible : pas d’id (création de facture échouera côté hook) */
    }
  }

  if (base.role === 'mecanicien') {
    return resolveMechanicProfile(base);
  }

  return base;
}

export function normalizeUser(userData) {
  let role = userData.role;
  if (role === 'accountant') role = 'comptable';
  if (role === 'manager' || role === 'admin') role = 'responsable';

  const name =
    userData.name ||
    [userData.prenom, userData.nom].filter(Boolean).join(' ').trim() ||
    userData.email?.split('@')[0] ||
    '';

  return {
    ...userData,
    role,
    name,
  };
}

export { DEMO_USERS };
