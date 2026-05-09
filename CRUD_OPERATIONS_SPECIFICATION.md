# CRUD Operations Specification for Laravel Backend

This document specifies all CRUD (Create, Read, Update, Delete) operations needed for the Accountant Interface.

## 1. CLIENTS (Clients) Management

### 1.1 Create Client
**Endpoint**: `POST /api/clients`

**Request Body**:
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33612345678",
  "email": "jean@example.com"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33612345678",
  "email": "jean@example.com",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z"
}
```

### 1.2 Get All Clients
**Endpoint**: `GET /api/clients`

**Query Parameters**:
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 20)
- `search` (optional): Search by name or phone

**Expected Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "+33612345678",
      "email": "jean@example.com",
      "created_at": "2026-04-06T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 4,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1
  }
}
```

### 1.3 Get Client by ID
**Endpoint**: `GET /api/clients/:id`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33612345678",
  "email": "jean@example.com",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z",
  "vehicules": [
    {
      "id": 1,
      "marque": "Peugeot",
      "modele": "308",
      "immatriculation": "AB-123-CD"
    }
  ]
}
```

### 1.4 Update Client
**Endpoint**: `PUT /api/clients/:id`

**Request Body** (all fields optional):
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+33612345678",
  "email": "jean@example.com"
}
```

**Expected Response** (200 OK):
Same as client object

### 1.5 Delete Client
**Endpoint**: `DELETE /api/clients/:id`

**Expected Response** (204 No Content or 200 OK):
```json
{
  "message": "Client deleted successfully"
}
```

---

## 2. FACTURES (Invoices) Management

### 2.1 Create Invoice
**Endpoint**: `POST /api/factures`

**Request Body**:
```json
{
  "client_id": 1,
  "reparation_id": 1,
  "total_piece": 2,
  "cout": 450.00,
  "prix_total": 540.00,
  "statut": "pending",
  "date_validation": "2026-04-06"
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "client_id": 1,
  "reparation_id": 1,
  "total_piece": 2,
  "cout": 450.00,
  "prix_total": 540.00,
  "statut": "pending",
  "date_validation": "2026-04-06",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z"
}
```

### 2.2 Get All Invoices
**Endpoint**: `GET /api/factures`

**Query Parameters**:
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `statut` (optional): Filter by status (paid, pending, cancelled)
- `client_id` (optional): Filter by client
- `start_date` (optional): Start date for date range
- `end_date` (optional): End date for date range

**Expected Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "client_id": 1,
      "reparation_id": 1,
      "total_piece": 2,
      "cout": 450.00,
      "prix_total": 540.00,
      "statut": "paid",
      "date_validation": "2026-04-06",
      "created_at": "2026-04-06T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 20,
    "current_page": 1
  }
}
```

### 2.3 Get Invoice by ID
**Endpoint**: `GET /api/factures/:id`

**Expected Response** (200 OK):
```json
{
  "id": 1,
  "client_id": 1,
  "reparation_id": 1,
  "total_piece": 2,
  "cout": 450.00,
  "prix_total": 540.00,
  "statut": "paid",
  "date_validation": "2026-04-06",
  "client": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean"
  },
  "reparation": {
    "id": 1,
    "description": "Réparation moteur",
    "cout": 450.00
  },
  "created_at": "2026-04-06T10:00:00Z"
}
```

### 2.4 Get Invoices by Client
**Endpoint**: `GET /api/factures?client_id=:id`

**Expected Response** (200 OK):
Returns array of invoices for the client

### 2.5 Update Invoice
**Endpoint**: `PUT /api/factures/:id`

**Request Body** (all fields optional):
```json
{
  "statut": "paid",
  "date_validation": "2026-04-06",
  "cout": 450.00,
  "prix_total": 540.00
}
```

**Expected Response** (200 OK):
Updated invoice object

### 2.6 Delete Invoice
**Endpoint**: `DELETE /api/factures/:id`

**Expected Response** (204 No Content or 200 OK):
```json
{
  "message": "Invoice deleted successfully"
}
```

### 2.7 Export Invoices (CSV)
**Endpoint**: `GET /api/factures/export/csv`

**Query Parameters**:
- `statut` (optional): Filter by status
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Expected Response** (200 OK):
CSV file download

### 2.8 Export Invoices (PDF)
**Endpoint**: `GET /api/factures/export/pdf`

**Expected Response** (200 OK):
PDF file download

---

## 3. REPARATIONS (Repairs) Management

### 3.1 Create Repair
**Endpoint**: `POST /api/reparations`

**Request Body**:
```json
{
  "description": "Réparation moteur",
  "client_id": 1,
  "vehicule_id": 1,
  "statut": "pending",
  "date_debut": "2026-04-01",
  "date_fin": null,
  "date_prevue_fin": "2026-04-07",
  "cout": 450.00
}
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "description": "Réparation moteur",
  "client_id": 1,
  "vehicule_id": 1,
  "statut": "pending",
  "date_debut": "2026-04-01",
  "date_fin": null,
  "date_prevue_fin": "2026-04-07",
  "cout": 450.00,
  "created_at": "2026-04-06T10:00:00Z"
}
```

### 3.2 Get All Repairs
**Endpoint**: `GET /api/reparations`

**Query Parameters**:
- `page` (optional): Page number
- `statut` (optional): Filter by status
- `client_id` (optional): Filter by client
- `vehicule_id` (optional): Filter by vehicle

**Expected Response** (200 OK):
Array of repairs with pagination

### 3.3 Get Repair by ID
**Endpoint**: `GET /api/reparations/:id`

**Expected Response** (200 OK):
Repair object with related client and vehicle

### 3.4 Get Repairs by Client
**Endpoint**: `GET /api/reparations?client_id=:id`

**Expected Response** (200 OK):
Array of repairs for the client

### 3.5 Update Repair
**Endpoint**: `PUT /api/reparations/:id`

**Request Body** (all fields optional):
```json
{
  "statut": "completed",
  "date_fin": "2026-04-05",
  "cout": 450.00,
  "description": "Réparation moteur"
}
```

**Expected Response** (200 OK):
Updated repair object

### 3.6 Delete Repair
**Endpoint**: `DELETE /api/reparations/:id`

**Expected Response** (204 No Content or 200 OK):
Success message

---

## 4. VEHICULES (Vehicles) Management

### 4.1 Create Vehicle
**Endpoint**: `POST /api/vehicules`

**Request Body**:
```json
{
  "client_id": 1,
  "marque": "Peugeot",
  "modele": "308",
  "immatriculation": "AB-123-CD",
  "annee": 2019
}
```

**Expected Response** (201 Created):
Vehicle object

### 4.2 Get All Vehicles
**Endpoint**: `GET /api/vehicules`

**Expected Response** (200 OK):
Array of vehicles

### 4.3 Get Vehicle by ID
**Endpoint**: `GET /api/vehicules/:id`

**Expected Response** (200 OK):
Vehicle object with client info

### 4.4 Get Vehicles by Client
**Endpoint**: `GET /api/vehicules?client_id=:id`

**Expected Response** (200 OK):
Array of vehicles for the client

### 4.5 Update Vehicle
**Endpoint**: `PUT /api/vehicules/:id`

**Request Body**:
```json
{
  "marque": "Peugeot",
  "modele": "308",
  "immatriculation": "AB-123-CD",
  "annee": 2019
}
```

**Expected Response** (200 OK):
Updated vehicle object

### 4.6 Delete Vehicle
**Endpoint**: `DELETE /api/vehicules/:id`

**Expected Response** (204 No Content or 200 OK):
Success message

---

## 5. FINANCIAL REPORTS API

### 5.1 Get Financial Summary
**Endpoint**: `GET /api/reports/summary`

**Query Parameters**:
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Expected Response** (200 OK):
```json
{
  "total_revenue": 2190.00,
  "total_pending": 240.00,
  "total_costs": 1330.00,
  "total_profit": 860.00,
  "profit_margin": 39.27,
  "invoices_count": 5,
  "invoices_paid": 3,
  "invoices_pending": 2,
  "repairs_count": 5,
  "repairs_completed": 2,
  "repairs_in_progress": 1,
  "clients_count": 4
}
```

### 5.2 Get Monthly Breakdown
**Endpoint**: `GET /api/reports/monthly`

**Query Parameters**:
- `year` (required): Year
- `month` (required): Month (1-12)

**Expected Response** (200 OK):
```json
{
  "month": "2026-04",
  "revenue": 1230.00,
  "costs": 680.00,
  "profit": 550.00,
  "invoices_paid": 2,
  "invoices_pending": 1,
  "repairs_completed": 2,
  "repairs_in_progress": 1
}
```

### 5.3 Get Client Statistics
**Endpoint**: `GET /api/reports/client/:id`

**Expected Response** (200 OK):
```json
{
  "client_id": 1,
  "client_name": "Jean Dupont",
  "total_spent": 876.00,
  "invoices_count": 2,
  "invoices_paid": 2,
  "repairs_count": 2,
  "vehicles_count": 1,
  "last_invoice_date": "2026-04-06"
}
```

### 5.4 Export Monthly Report (PDF)
**Endpoint**: `GET /api/reports/export/monthly`

**Query Parameters**:
- `year` (required): Year
- `month` (required): Month

**Expected Response** (200 OK):
PDF file download

### 5.5 Export Yearly Report (PDF)
**Endpoint**: `GET /api/reports/export/yearly`

**Query Parameters**:
- `year` (required): Year

**Expected Response** (200 OK):
PDF file download

---

## Error Responses

All endpoints should return appropriate error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": {
    "nom": ["Le champ nom est obligatoire"],
    "telephone": ["Le numéro de téléphone est invalide"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please authenticate"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error",
  "message": "An error occurred while processing your request"
}
```

---

## Status Codes

- `200 OK` - Successful GET or PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

---

## Validation Rules

### Client Validation
- `nom` - Required, max 100 characters
- `prenom` - Required, max 100 characters
- `telephone` - Required, valid French phone number
- `email` - Optional, valid email format

### Invoice Validation
- `client_id` - Required, must exist
- `reparation_id` - Required, must exist
- `cout` - Required, positive number
- `prix_total` - Required, positive number
- `statut` - Required, one of: paid, pending, cancelled
- `date_validation` - Optional, valid date

### Repair Validation
- `description` - Required, max 500 characters
- `client_id` - Required, must exist
- `vehicule_id` - Required, must exist
- `statut` - Required, one of: pending, in-progress, completed
- `cout` - Required, positive number
- `date_debut` - Optional, valid date
- `date_fin` - Optional, valid date
- `date_prevue_fin` - Optional, valid date

### Vehicle Validation
- `client_id` - Required, must exist
- `marque` - Required, max 100 characters
- `modele` - Required, max 100 characters
- `immatriculation` - Required, unique
- `annee` - Required, valid year
