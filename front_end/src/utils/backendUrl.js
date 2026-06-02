const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, '');
}

export function getBackendOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}
