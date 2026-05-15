/**
 * Retrieves the logged-in comptable's identity from localStorage.
 */
export const getComptableIdentity = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };
  
  export const getComptableId = () => {
    const identity = getComptableIdentity();
    return identity?.id ?? null;
  };
  
  export const isComptable = () => {
    const identity = getComptableIdentity();
    return identity?.role === 'comptable';
  };
  
  export default getComptableIdentity;

  export const resolveComptableUserId = () => {
    return getComptableId();
  };