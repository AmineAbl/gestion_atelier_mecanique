import { authAPI } from '../services/api';

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
};

/**
 * @returns {Promise<{ id?: number, nom?: string, prenom?: string, email: string, role: string, name: string }>}
 */
export async function loginWithApiOrDemo(email, password) {
  try {
    const userData = await authAPI.login(email, password);
    return normalizeUser(userData);
  } catch {
    /* API indisponible ou identifiants invalides */
  }

  const demo = DEMO_USERS[email];
  if (!demo || demo.password !== password) {
    throw new Error('Email ou mot de passe incorrect');
  }

  return normalizeUser({
    email,
    role: demo.role,
    name: demo.name,
  });
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
