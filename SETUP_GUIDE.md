# ============================================================
# FULL SETUP GUIDE - COMPTABLE (ACCOUNTANT) FUNCTIONALITY
# ============================================================

## Overview
This guide walks through setting up the complete "comptable" (accountant) functionality with Laravel backend integration and React frontend.

**Status**: All code has been implemented. This guide covers the remaining setup steps.

---

## Part 1: Laravel Backend Setup

### Step 1.1: Configure Environment
✅ **DONE** - `.env` file created with MySQL configuration for GAM database

**Database Settings in .env:**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=GAM
DB_USERNAME=root
DB_PASSWORD=
```

### Step 1.2: Install Laravel Dependencies
Run this command in the Laravel backend directory:

```bash
cd c:\Users\soula\OneDrive\Documents\IRISI_SIT1\backend\PFM\gestion_atelier_mecanique\back_end
composer install
```

If you haven't installed Composer, download it from: https://getcomposer.org/

### Step 1.3: Generate Application Key
This is required for Laravel encryption:

```bash
php artisan key:generate
```

**Expected Output:** `Application key set successfully.`

### Step 1.4: Run Migrations
This creates all database tables:

```bash
php artisan migrate
```

**Expected Output:**
```
Migrating: 0001_01_01_000000_create_users_table
Migrated: 0001_01_01_000000_create_users_table (xx.xxms)
Migrating: 0001_01_01_000001_create_cache_table
[... more migrations ...]
```

### Step 1.5: Seed Database with Default Comptable User
Creates default accountant login credentials:

```bash
php artisan db:seed
```

**Expected Output:** `✓ Comptable user created successfully`

**Created User:**
- Email: `comptable@gmail.com`
- Password: `12345`
- Role: `comptable`

### Step 1.6: Install Sanctum (if not already installed)
Sanctum handles API token authentication:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Step 1.7: Start Laravel Development Server
Run Laravel development server on port 8000:

```bash
php artisan serve
```

**Expected Output:**
```
Laravel development server started: http://127.0.0.1:8000
```

⚠️ **IMPORTANT**: Keep this terminal running while testing the application.

---

## Part 2: React Frontend Setup

### Step 2.1: Install Dependencies
Run in the React frontend directory:

```bash
cd c:\Users\soula\OneDrive\Documents\IRISI_SIT1\backend\PFM\gestion_atelier_mecanique\front_end
npm install
```

### Step 2.2: Start React Development Server
Run React development server on port 3000 (or 3001):

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view the app in your browser.
  Local:            http://localhost:3000
```

---

## Part 3: Database Connection Verification

### Check XAMPP MySQL Connection

**Windows:**
1. Open XAMPP Control Panel
2. Ensure "MySQL" is running (green "Running" status)
3. Click "MySQL" → "Admin" to open phpMyAdmin
4. Verify database "GAM" exists

**Verify Database Tables:**
```sql
USE GAM;
SHOW TABLES;
```

**Expected Tables:**
- users
- clients
- vehicules
- pieces
- reparations
- reparation_pieces
- factures
- cache
- jobs
- sessions

---

## Part 4: Testing the Application

### Test 4.1: Backend API Health Check

Test the Laravel API endpoints:

```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"comptable@gmail.com","password":"12345"}'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "nom": "Comptable",
    "prenom": "Admin",
    "email": "comptable@gmail.com",
    "role": "comptable"
  },
  "token": "1|xxx..."
}
```

### Test 4.2: Frontend Login

1. Open http://localhost:3000 in your browser
2. Click "Se connecter" (Login) button
3. Enter credentials:
   - Email: `comptable@gmail.com`
   - Password: `12345`
4. Click "Se connecter"

**Expected Result:**
- Modal shows "Connexion en cours..."
- Redirects to Accountant Dashboard
- All counters show 0 (no demo data)

### Test 4.3: Verify Empty Dashboard

Dashboard should display with all metrics at 0:
- Revenus collectés: €0.00
- Factures en attente: €0.00
- Dépenses opérationnelles: €0.00
- Profit net: €0.00
- All charts empty (AreaChart, DonutChart, LineChart, ProgressChart)

### Test 4.4: Test CRUD Operations

**Add a Test Client:**
1. Go to "Clients" tab on dashboard
2. Click "Add Client" button
3. Enter:
   - Nom: "Dupont"
   - Prenom: "Jean"
   - Telephone: "0601234567"
4. Click Submit

**Expected Result:**
- Client appears in list
- Success message shows
- Can edit/delete client

---

## Part 5: Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Verify XAMPP MySQL is running
2. Check `.env` file has correct credentials
3. Verify "GAM" database exists in phpMyAdmin
4. Try running migrations again: `php artisan migrate`

### Issue: "CORS error in browser console"

**Solution:**
Already handled by Laravel's default configuration. If issues persist:
1. Check API is running on `http://localhost:8000`
2. Verify React frontend calls `http://localhost:8000/api`

### Issue: "Login fails with 'credentials incorrect'"

**Solution:**
1. Verify seeder ran: `php artisan db:seed`
2. Check users table: `SELECT * FROM users;` in phpMyAdmin
3. Reset password: `php artisan tinker` then:
   ```php
   $user = User::find(1);
   $user->mdp = Hash::make('12345');
   $user->save();
   ```

### Issue: "Dashboard shows '0 clients' but I added one"

**Solution:**
1. Verify API returned client in console network tab
2. Check React API service is using correct endpoint
3. Verify token is being sent in Authorization header
4. Check backend logs: `php artisan log:tail`

---

## Part 6: API Endpoints Summary

### Authentication
```
POST   /api/login                    # Login
POST   /api/logout                   # Logout (auth required)
GET    /api/user                     # Get current user (auth required)
```

### Clients CRUD
```
GET    /api/clients                  # Get all clients
POST   /api/clients                  # Create client
GET    /api/clients/{id}             # Get single client
PUT    /api/clients/{id}             # Update client
DELETE /api/clients/{id}             # Delete client
```

### Factures (Invoices) CRUD
```
GET    /api/factures                 # Get all invoices
POST   /api/factures                 # Create invoice
GET    /api/factures/{id}            # Get single invoice
PUT    /api/factures/{id}            # Update invoice
DELETE /api/factures/{id}            # Delete invoice
```

### Reparations (Repairs) CRUD
```
GET    /api/reparations              # Get all repairs
POST   /api/reparations              # Create repair
GET    /api/reparations/{id}         # Get single repair
PUT    /api/reparations/{id}         # Update repair
DELETE /api/reparations/{id}         # Delete repair
```

### Dashboard Statistics
```
GET    /api/dashboard/stats          # Get financial metrics
```

---

## Part 7: File Changes Summary

### Backend Files Created/Modified:
1. ✅ `routes/api.php` - Complete API routes
2. ✅ `app/Http/Controllers/AuthController.php` - Authentication
3. ✅ `app/Http/Controllers/ClientController.php` - Client CRUD
4. ✅ `app/Http/Controllers/FactureController.php` - Invoice CRUD + stats
5. ✅ `app/Http/Controllers/ReparationController.php` - Repair CRUD
6. ✅ `app/Models/User.php` - Added Sanctum trait
7. ✅ `database/seeders/DatabaseSeeder.php` - Default comptable user
8. ✅ `.env` - MySQL database configuration

### Frontend Files Created/Modified:
1. ✅ `src/services/api.js` - Complete API service with authentication
2. ✅ `src/components/Landing/LoginModal.jsx` - Real backend login
3. ✅ `src/hooks/useManagement.js` - API-based hooks (zero starting data)
4. ✅ `src/App.js` - Updated for authentication flow

---

## Part 8: Quick Start Commands

**Backend Setup (Run in backend directory):**
```bash
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

**Frontend Setup (Run in frontend directory):**
```bash
npm install
npm start
```

**Then Access:** http://localhost:3000

**Default Login:**
- Email: `comptable@gmail.com`
- Password: `12345`

---

## Part 9: Next Steps (Optional Enhancements)

1. **Add More Seeders**: Create additional test data
2. **Implement Validation**: Add form validation on frontend
3. **Error Handling**: Add user-friendly error notifications
4. **Pagination**: Add pagination to large data lists
5. **Search/Filter**: Add search functionality for clients/invoices
6. **Export**: Add export to PDF/CSV functionality
7. **Reports**: Add detailed financial reports
8. **Notifications**: Add real-time notifications

---

## Important Notes

⚠️ **Database Persistence:**
- All data entered will be saved in the MySQL "GAM" database
- Data persists even after restarting servers
- To reset: `php artisan migrate:reset && php artisan migrate && php artisan db:seed`

⚠️ **Authentication:**
- API tokens are valid for the session
- Logout clears tokens from localStorage
- Each login generates a new token

⚠️ **CORS:**
- React frontend (http://localhost:3000) can access Laravel API (http://localhost:8000)
- This is configured in Laravel's default settings

---

## Support

For issues or questions:
1. Check browser console (F12 → Console tab) for errors
2. Check Laravel logs: `php artisan log:tail`
3. Verify both servers are running
4. Check network requests (F12 → Network tab)

