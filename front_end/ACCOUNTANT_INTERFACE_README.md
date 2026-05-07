# Gestion Atelier Mécanique - Frontend (Accountant Interface)

## Overview

This is a static React frontend for a mechanical workshop management system. The focus is on the **Accountant Interface** which handles:
- Invoice management (Factures)
- Client management
- Financial reporting and analytics
- Repair tracking

## Project Structure

```
src/
├── components/
│   ├── AccountantDashboard.jsx       # Main dashboard component
│   ├── Accountant/
│   │   ├── InvoicesList.jsx          # Invoice CRUD operations
│   │   ├── ClientsList.jsx           # Client CRUD operations
│   │   └── FinancialReport.jsx       # Financial reports and analytics
│   └── common/
│       └── UIComponents.jsx          # Reusable UI components
├── hooks/
│   └── useManagement.js              # Custom hooks for state management
├── utils/
│   └── helpers.js                    # Utility functions
├── data/
│   └── mockData.js                   # Mock data for static development
├── App.js                            # Main app entry point
└── App.css                           # Global styles
```

## Components

### AccountantDashboard
Main dashboard with 4 tabs:
- **Overview**: Financial summary, key metrics
- **Invoices**: Invoice management (Create, Read, Update, Delete)
- **Clients**: Client management
- **Reports**: Financial analytics and reports

### InvoicesList
Manage invoices with:
- Create new invoices
- Edit existing invoices
- View invoice details
- Delete invoices
- Filter by status (Paid, Pending, Cancelled)
- Search functionality
- Export to CSV
- Auto-calculate total with 20% tax

### ClientsList
Manage clients with:
- Create new clients
- Edit client information
- View client details with statistics
- Delete clients
- Search by name, phone, email
- Phone and email validation
- View client history (invoices, repairs, vehicles)

### FinancialReport
Comprehensive financial analytics:
- Monthly revenue vs costs trend
- Invoice status distribution (pie chart)
- Repair status distribution (pie chart)
- Top 5 clients by spending
- Key financial metrics
- Detailed statistics table

## Data Models

### Client
```javascript
{
  id: number,
  nom: string,
  prenom: string,
  telephone: string,
  email: string,
  createdAt: date string (YYYY-MM-DD)
}
```

### Facture (Invoice)
```javascript
{
  id: number,
  clientId: number,
  reparationId: number,
  total_piece: number,
  cout: number,           // Amount before tax
  prix_total: number,     // Amount with 20% tax
  date_validation: date string (YYYY-MM-DD),
  statut: 'paid' | 'pending' | 'cancelled'
}
```

### Reparation (Repair)
```javascript
{
  id: number,
  description: string,
  statut: 'completed' | 'in-progress' | 'pending',
  date_debut: date string,
  date_fin: date string,
  date_prevue_fin: date string,
  cout: number,
  clientId: number,
  vehiculeId: number
}
```

### Vehicule (Vehicle)
```javascript
{
  id: number,
  marque: string,
  modele: string,
  immatriculation: string,
  annee: number,
  clientId: number
}
```

## API Operations Required

When integrating with the Laravel backend, implement these API endpoints:

### Clients Endpoints
```
GET    /api/clients              # Get all clients
GET    /api/clients/:id          # Get client by ID
POST   /api/clients              # Create new client
PUT    /api/clients/:id          # Update client
DELETE /api/clients/:id          # Delete client
```

### Factures (Invoices) Endpoints
```
GET    /api/factures             # Get all invoices
GET    /api/factures/:id         # Get invoice by ID
GET    /api/factures/client/:id  # Get invoices for a client
POST   /api/factures             # Create new invoice
PUT    /api/factures/:id         # Update invoice
DELETE /api/factures/:id         # Delete invoice
```

### Reparations (Repairs) Endpoints
```
GET    /api/reparations          # Get all repairs
GET    /api/reparations/:id      # Get repair by ID
GET    /api/reparations/client/:id  # Get repairs for a client
POST   /api/reparations          # Create new repair
PUT    /api/reparations/:id      # Update repair
DELETE /api/reparations/:id      # Delete repair
```

### Vehicules Endpoints
```
GET    /api/vehicules            # Get all vehicles
GET    /api/vehicules/:id        # Get vehicle by ID
GET    /api/vehicules/client/:id # Get vehicles for a client
POST   /api/vehicules            # Create new vehicle
PUT    /api/vehicules/:id        # Update vehicle
DELETE /api/vehicules/:id        # Delete vehicle
```

## Custom Hooks

### useClients()
Manages client state and CRUD operations:
- `addClient(newClient)` - Create client
- `updateClient(id, updatedData)` - Update client
- `deleteClient(id)` - Delete client
- `clients` - Array of clients
- `selectedClient` - Currently selected client

### useFactures()
Manages invoice state:
- `addFacture(newFacture)` - Create invoice
- `updateFacture(id, updatedData)` - Update invoice
- `deleteFacture(id)` - Delete invoice
- `getFacturesByClient(clientId)` - Get client invoices
- `factures` - Array of invoices

### useReparations()
Manages repair state:
- `addReparation(newReparation)` - Create repair
- `updateReparation(id, updatedData)` - Update repair
- `deleteReparation(id)` - Delete repair
- `getReparationsByClient(clientId)` - Get client repairs

### useVehicules()
Manages vehicle data:
- `getVehiculesByClient(clientId)` - Get client vehicles

## Utility Functions

### Formatting
- `formatCurrency(amount)` - Format as EUR currency
- `formatDate(dateString)` - Format date in French
- `generateInvoiceNumber(factureId, date)` - Generate invoice number

### Validation
- `validateEmail(email)` - Email validation
- `validatePhone(phone)` - French phone validation

### Calculations
- `calculateFinancialMetrics(factures, reparations)` - Financial KPIs
- `calculateInvoiceTotal(cost, taxRate)` - Invoice total with tax
- `calculateTotalWithTax(amount, taxRate)` - Add tax percentage
- `getRepairsOverview(reparations)` - Repair statistics

### Filtering & Searching
- `searchClients(clients, searchTerm)` - Search clients
- `filterByStatus(items, status)` - Filter by status
- `sortByDate(items, dateField, ascending)` - Sort by date

## UI Components

### Basic Components
- `Card` - Container component
- `Button` - Reusable button
- `Input` - Text input field
- `Select` - Dropdown select
- `Table` - Data table with columns

### Status Components
- `StatusBadge` - Status display badge
- `MetricCard` - Financial metric display

### Feedback
- `Modal` - Modal dialog
- `Alert` - Alert message
- `EmptyState` - Empty state display
- `Spinner` - Loading spinner

## Integration Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create API service**:
   Create `src/services/api.js` to handle API calls to Laravel backend

3. **Update hooks** to use API calls instead of local state

4. **Configure CORS** in Laravel backend to accept requests from React frontend

5. **Add authentication** if needed (JWT tokens, session management)

6. **Connect forms** to API endpoints for persistence

## Mock Data

Currently using mock data in `src/data/mockData.js`:
- 4 sample clients
- 5 sample repairs
- 5 sample invoices
- 4 sample vehicles

## Technologies

- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Recharts** - Charts and graphs
- **Lucide React** - Icons
- **JavaScript ES6+** - Language

## Next Steps

1. Create API service layer
2. Implement authentication
3. Connect to Laravel backend
4. Add loading states
5. Add error handling
6. Implement real-time updates
7. Add user preferences/settings
8. Create Mechanic interface
9. Create Responsible interface

## Notes

- All data is currently static using mock data
- No API calls are made yet
- State management is local using React hooks
- Ready to integrate with Laravel backend
- CSS uses Tailwind with custom styling
- Fully responsive design
- Accessibility features included
