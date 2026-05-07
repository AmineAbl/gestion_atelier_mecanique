/**
 * API Service Layer
 * This file will handle all API calls to the Laravel backend
 * Currently using mock data - replace fetch calls to use real endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Utility function to make API requests
const apiCall = async (method, endpoint, data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add authentication token if available
        // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
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

export default {
  clientsAPI,
  facturesAPI,
  reparationsAPI,
  vehiculesAPI,
  reportsAPI,
  authAPI
};
