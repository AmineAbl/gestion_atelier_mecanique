/**
 * ============================================================
 * API SERVICE - COMPLETE IMPLEMENTATION
 * ============================================================
 * 
 * Purpose: Centralized API communication service for all backend requests
 * 
 * Features:
 * - Base URL configuration pointing to Laravel API
 * - Automatic token injection in headers
 * - Error handling and response formatting
 * - CRUD operations for all entities
 * - Authentication management
 * - Token-based API authentication with Laravel Sanctum
 * 
 * Base URL: http://localhost:8000/api
 * All requests include Authorization header with Bearer token when available
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Get authorization token from localStorage
 * @returns {string|null} Bearer token or null if not logged in
 */
const getAuthToken = () => localStorage.getItem('auth_token');

/**
 * Build headers with authorization token
 * @returns {object} Fetch headers object with Content-Type and Authorization
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response errors consistently
 * @param {Response} response - Fetch response object
 * @returns {Promise} Resolved data or rejected error
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'An error occurred',
      errors: data.errors || {},
      data
    };
  }

  return data;
};

/**
 * ============================================================
 * AUTHENTICATION API
 * ============================================================
 * Handles user login, logout, and session management
 */

export const authAPI = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} User data and auth token
   */
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password })
      });

      const result = await handleResponse(response);

      // Store token and user data in localStorage
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   * @returns {Promise} Success message
   */
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(true)
      });

      const result = await handleResponse(response);

      // Clear stored credentials
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return result;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise} User data
   */
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
};

/**
 * ============================================================
 * CLIENTS CRUD API
 * ============================================================
 * Handles client data management operations
 */

export const clientsAPI = {
  /**
   * Get all clients
   * @returns {Promise} Array of clients
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get clients error:', error);
      throw error;
    }
  },

  /**
   * Get single client by ID
   * @param {number} id - Client ID
   * @returns {Promise} Client data
   */
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Get client ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create new client
   * @param {object} data - Client data (nom, prenom, telephone)
   * @returns {Promise} Created client
   */
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  },

  /**
   * Update existing client
   * @param {number} id - Client ID
   * @param {object} data - Updated client data
   * @returns {Promise} Updated client
   */
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Update client ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete client
   * @param {number} id - Client ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Delete client ${id} error:`, error);
      throw error;
    }
  }
};

/**
 * ============================================================
 * FACTURES (INVOICES) CRUD API
 * ============================================================
 * Handles invoice data management operations
 */

export const facturesAPI = {
  /**
   * Get all invoices
   * @returns {Promise} Array of factures
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get factures error:', error);
      throw error;
    }
  },

  /**
   * Get single invoice by ID
   * @param {number} id - Facture ID
   * @returns {Promise} Invoice data
   */
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Get facture ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create new invoice
   * @param {object} data - Invoice data (total_piece, cout, prix_total, date_validation, statut)
   * @returns {Promise} Created invoice
   */
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create facture error:', error);
      throw error;
    }
  },

  /**
   * Update existing invoice
   * @param {number} id - Facture ID
   * @param {object} data - Updated invoice data
   * @returns {Promise} Updated invoice
   */
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Update facture ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete invoice
   * @param {number} id - Facture ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Delete facture ${id} error:`, error);
      throw error;
    }
  }
};

/**
 * ============================================================
 * REPARATIONS (REPAIRS) CRUD API
 * ============================================================
 * Handles repair data management operations
 */

export const reparationsAPI = {
  /**
   * Get all repairs
   * @returns {Promise} Array of reparations
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reparations`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get reparations error:', error);
      throw error;
    }
  },

  /**
   * Get single repair by ID
   * @param {number} id - Reparation ID
   * @returns {Promise} Repair data
   */
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reparations/${id}`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Get reparation ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create new repair
   * @param {object} data - Repair data (client_id, vehicule_id, description, date_entree, date_sortie_prevue, statut)
   * @returns {Promise} Created repair
   */
  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reparations`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Create reparation error:', error);
      throw error;
    }
  },

  /**
   * Update existing repair
   * @param {number} id - Reparation ID
   * @param {object} data - Updated repair data
   * @returns {Promise} Updated repair
   */
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reparations/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Update reparation ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete repair
   * @param {number} id - Reparation ID
   * @returns {Promise} Success message
   */
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reparations/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Delete reparation ${id} error:`, error);
      throw error;
    }
  }
};

/**
 * ============================================================
 * DASHBOARD STATISTICS API
 * ============================================================
 * Handles dashboard metrics and analytics
 */

export const dashboardAPI = {
  /**
   * Get all dashboard statistics
   * Returns calculated metrics for financial overview
   * All values start at 0 for demo purposes
   * @returns {Promise} Dashboard stats (revenue, costs, profit, rates, etc.)
   */
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getHeaders(true)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }
};

/**
 * ============================================================
 * UTILITY FUNCTIONS
 * ============================================================
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if auth token exists
 */
export const isAuthenticated = () => !!getAuthToken();

/**
 * Get stored user data
 * @returns {object|null} User object or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default {
  authAPI,
  clientsAPI,
  facturesAPI,
  reparationsAPI,
  dashboardAPI,
  isAuthenticated,
  getStoredUser
};

