# Integration Guide: Frontend to Laravel Backend

## Overview

This guide explains how to integrate the React Accountant Interface with the Laravel backend.

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `front_end` directory:

```bash
cp .env.example .env
```

Update the `REACT_APP_API_BASE_URL` to match your Laravel backend:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

### 2. Enable CORS in Laravel

In your Laravel backend (`config/cors.php`), add the React frontend URL:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [
    'http://localhost:3000',  // React development server
    'http://localhost:5173',  // Vite development server
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 3. Update Hooks to Use API

Replace the mock data in `src/hooks/useManagement.js` with actual API calls:

#### Example: Update useClients Hook

**Before (Mock Data):**
```javascript
import { mockClients } from '../data/mockData';

export const useClients = () => {
  const [clients, setClients] = useState(mockClients);
  // ... rest of hook
};
```

**After (API Calls):**
```javascript
import { clientsAPI } from '../services/api';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await clientsAPI.getAll();
        setClients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadClients();
  }, []);

  const addClient = useCallback(async (newClient) => {
    try {
      const created = await clientsAPI.create(newClient);
      setClients(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id, updatedData) => {
    try {
      const updated = await clientsAPI.update(id, updatedData);
      setClients(prev =>
        prev.map(client => client.id === id ? updated : client)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id) => {
    try {
      await clientsAPI.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient
  };
};
```

### 4. Update Components to Handle Loading States

Update components to show loading states while data is being fetched:

```javascript
import { useClients } from '../hooks/useManagement';
import { Spinner } from './common/UIComponents';

export default function ClientsList() {
  const { clients, loading, error } = useClients();

  if (loading) return <Spinner />;
  if (error) return <Alert type="error" message={error} />;
  
  // ... rest of component
}
```

### 5. Add Error Handling

Create an error handling service:

```javascript
// src/services/errorHandler.js

export const handleAPIError = (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Handle forbidden
    return 'Accès refusé';
  } else if (error.response?.status === 404) {
    // Handle not found
    return 'Ressource non trouvée';
  } else if (error.response?.status === 500) {
    // Handle server error
    return 'Erreur serveur';
  }
  return error.message || 'Une erreur est survenue';
};
```

### 6. Add Authentication (Optional)

If your Laravel backend uses authentication:

```javascript
// src/services/auth.js

export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Update API service to include token
const apiCall = async (method, endpoint, data = null) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // ... rest of apiCall
};
```

### 7. Install Dependencies

```bash
cd front_end
npm install
```

### 8. Run Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## API Response Format Expected

### Success Response

```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errors": { /* validation errors */ }
}
```

## CRUD Operations Mapping

### Create Client
```javascript
// Frontend
const newClient = {
  nom: "Dupont",
  prenom: "Jean",
  telephone: "+33612345678",
  email: "jean@example.com"
};
await clientsAPI.create(newClient);

// Laravel Endpoint
POST /api/clients
Request: { nom, prenom, telephone, email }
Response: { id, nom, prenom, telephone, email, created_at }
```

### Get All Invoices
```javascript
// Frontend
const factures = await facturesAPI.getAll();

// Laravel Endpoint
GET /api/factures
Response: [{ id, clientId, cout, prix_total, statut, date_validation }, ...]
```

### Update Invoice
```javascript
// Frontend
await facturesAPI.update(factureId, {
  statut: 'paid',
  date_validation: '2026-04-06'
});

// Laravel Endpoint
PUT /api/factures/:id
Request: { statut, date_validation }
Response: { id, clientId, cout, prix_total, statut, date_validation }
```

### Delete Repair
```javascript
// Frontend
await reparationsAPI.delete(reparationId);

// Laravel Endpoint
DELETE /api/reparations/:id
Response: { message: "Deleted successfully" }
```

## Testing API Integration

1. **Check Network Requests**: Open DevTools (F12) → Network tab
2. **Verify Responses**: Ensure API returns expected data format
3. **Test Error Handling**: Disconnect backend and verify error messages
4. **Test CRUD Operations**: Create, read, update, delete each resource

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure CORS is enabled in Laravel backend and frontend URL is whitelisted

### Issue: 401 Unauthorized
**Solution**: Check authentication token, ensure token is sent in request headers

### Issue: 404 Not Found
**Solution**: Verify API endpoint URL matches Laravel routes

### Issue: Network Error
**Solution**: Ensure Laravel development server is running (`php artisan serve`)

## Performance Optimization

### 1. Pagination

Update API to support pagination:

```javascript
// Frontend
const getClientsPaginated = (page = 1, perPage = 20) => 
  apiCall('GET', `/clients?page=${page}&per_page=${perPage}`);

// Laravel (backend should implement pagination)
Facture::paginate(20);
```

### 2. Caching

Implement request caching:

```javascript
const cache = new Map();

const cachedAPICall = async (key, fn) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await fn();
  cache.set(key, result);
  return result;
};
```

### 3. Debouncing

Add debouncing to search and filter operations:

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((searchTerm) => {
  // Perform search
}, 500);
```

## Security Considerations

1. **Never commit `.env` with sensitive data**
2. **Use HTTPS in production**
3. **Validate all user input**
4. **Sanitize API responses**
5. **Use environment variables for sensitive data**
6. **Implement rate limiting**
7. **Use CSRF protection if needed**

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Hosting

1. Upload build files to your hosting provider
2. Configure API endpoint for production
3. Ensure backend API is accessible from frontend URL
4. Test all features in production environment

## Next Steps

1. ✅ Set up environment variables
2. ✅ Enable CORS in Laravel
3. ✅ Update hooks to use API
4. ✅ Add error handling
5. ✅ Implement authentication
6. ✅ Test all CRUD operations
7. ✅ Optimize performance
8. ✅ Deploy to production
