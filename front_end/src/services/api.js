/**
 * API Service Layer
 * This file will handle all API calls to the Laravel backend
 * Currently using mock data - replace fetch calls to use real endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const apiCall = async (method, endpoint, data = null) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const headers = {
    Accept: 'application/json',
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
  };

  if (data != null && method !== 'GET' && method !== 'DELETE') {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    let msg = `Erreur ${response.status}`;
    if (body && typeof body === 'object') {
      if (body.message) msg = body.message;
      else if (body.errors) {
        const first = Object.values(body.errors)[0];
        msg = Array.isArray(first) ? first[0] : String(first);
      }
    }
    throw new Error(msg);
  }

  if (response.status === 204) return null;
  return body;
};

// ============= CLIENTS API =============

export const clientsAPI = {
  getAll: () => apiCall('GET', '/clients'),
  getById: (id) => apiCall('GET', `/clients/${id}`),
  create: (data) => apiCall('POST', '/clients', data),
  update: (id, data) => apiCall('PUT', `/clients/${id}`, data),
  delete: (id) => apiCall('DELETE', `/clients/${id}`)
};

// ============= FACTURES (INVOICES) API =============

export const facturesAPI = {
  getAll: () => apiCall('GET', '/factures'),
  getById: (id) => apiCall('GET', `/factures/${id}`),
  getByClient: (clientId) => apiCall('GET', `/factures?client_id=${clientId}`),
  create: (data) => apiCall('POST', '/factures', data),
  update: (id, data) => apiCall('PUT', `/factures/${id}`, data),
  delete: (id) => apiCall('DELETE', `/factures/${id}`),
  uploadPdf: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall('POST', `/factures/${id}/pdf`, formData);
  },
  
  // Additional operations
  getByStatus: (status) => apiCall('GET', `/factures?statut=${status}`),
  getByDateRange: (startDate, endDate) => 
    apiCall('GET', `/factures?start_date=${startDate}&end_date=${endDate}`),
  
  // Export operations
  exportCSV: () => apiCall('GET', '/factures/export/csv'),
  exportPDF: () => apiCall('GET', '/factures/export/pdf'),
};

// ============= REPARATIONS (REPAIRS) API =============

export const reparationsAPI = {
  getAll: () => apiCall('GET', '/reparations'),
  getById: (id) => apiCall('GET', `/reparations/${id}`),
  getByClient: (clientId) => apiCall('GET', `/reparations?client_id=${clientId}`),
  create: (data) => apiCall('POST', '/reparations', data),
  update: (id, data) => apiCall('PUT', `/reparations/${id}`, data),
  delete: (id) => apiCall('DELETE', `/reparations/${id}`),
  
  // Additional operations
  getByStatus: (status) => apiCall('GET', `/reparations?statut=${status}`),
  getByVehicle: (vehicleId) => apiCall('GET', `/reparations?vehicule_id=${vehicleId}`),
  /** Filtre optionnel côté API : réparations assignées au mécanicien (user_id). */
  getByMechanic: (userId) =>
    apiCall('GET', `/reparations?user_id=${encodeURIComponent(userId)}`),
};

// ============= VEHICULES (VEHICLES) API =============

export const vehiculesAPI = {
  getAll: () => apiCall('GET', '/vehicules'),
  getById: (id) => apiCall('GET', `/vehicules/${id}`),
  getByClient: (clientId) => apiCall('GET', `/vehicules?client_id=${clientId}`),
  create: (data) => apiCall('POST', '/vehicules', data),
  update: (id, data) => apiCall('PUT', `/vehicules/${id}`, data),
  delete: (id) => apiCall('DELETE', `/vehicules/${id}`)
};

// ============= FINANCIAL REPORTS API =============

export const reportsAPI = {
  // Get financial summary
  getSummary: (startDate, endDate) => 
    apiCall('GET', `/reports/summary?start_date=${startDate}&end_date=${endDate}`),
  
  // Get monthly breakdown
  getMonthlyBreakdown: (year, month) => 
    apiCall('GET', `/reports/monthly?year=${year}&month=${month}`),
  
  // Get client statistics
  getClientStats: (clientId) => 
    apiCall('GET', `/reports/client/${clientId}`),
  
  // Get repair statistics
  getRepairStats: () => 
    apiCall('GET', '/reports/repairs'),
  
  // Get invoice statistics
  getInvoiceStats: () => 
    apiCall('GET', '/reports/invoices'),
  
  // Export reports
  exportMonthlyPDF: (year, month) => 
    apiCall('GET', `/reports/export/monthly?year=${year}&month=${month}`),
  
  exportYearlyPDF: (year) => 
    apiCall('GET', `/reports/export/yearly?year=${year}`)
};

// ============= AUTHENTICATION API (Optional) =============

export const piecesAPI = {
  getAll: () => apiCall('GET', '/pieces'),
  getById: (id) => apiCall('GET', `/pieces/${id}`),
  create: (data) => apiCall('POST', '/pieces', data),
  update: (id, data) => apiCall('PUT', `/pieces/${id}`, data),
  delete: (id) => apiCall('DELETE', `/pieces/${id}`),
};

export const mecaniciensAPI = {
  getAll: () => apiCall('GET', '/mecaniciens'),
  getById: (id) => apiCall('GET', `/mecaniciens/${id}`),
  create: (data) => apiCall('POST', '/mecaniciens', data),
  update: (id, data) => apiCall('PUT', `/mecaniciens/${id}`, data),
  delete: (id) => apiCall('DELETE', `/mecaniciens/${id}`),
};

export const comptablesAPI = {
  getAll: () => apiCall('GET', '/comptables'),
  getById: (id) => apiCall('GET', `/comptables/${id}`),
  create: (data) => apiCall('POST', '/comptables', data),
  update: (id, data) => apiCall('PUT', `/comptables/${id}`, data),
  delete: (id) => apiCall('DELETE', `/comptables/${id}`),
};

export const authAPI = {
  login: (email, password) =>
    apiCall('POST', '/auth/login', { email, password }),
  
  logout: () => 
    apiCall('POST', '/auth/logout'),
  
  getProfile: () => 
    apiCall('GET', '/auth/profile'),
  
  updateProfile: (data) => 
    apiCall('PUT', '/auth/profile', data)
};

const apiServices = {
  clientsAPI,
  facturesAPI,
  reparationsAPI,
  vehiculesAPI,
  piecesAPI,
  mecaniciensAPI,
  comptablesAPI,
  reportsAPI,
  authAPI,
};

export default apiServices;
