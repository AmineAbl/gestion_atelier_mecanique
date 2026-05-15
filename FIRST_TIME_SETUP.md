# 🚀 First Time Setup Guide - Gestion Atelier Mécanique

If you pulled this code and are getting a **"Failed to fetch"** error, follow these steps:

---

## Prerequisites
- **Node.js** (v16+) - [Download](https://nodejs.org)
- **PHP 8.1+** - [Download](https://www.php.net/downloads)
- **MySQL/MariaDB** - [XAMPP recommended](https://www.apachefriends.org)
- **Composer** - [Download](https://getcomposer.org)

---

## Backend Setup (Laravel)

### Step 1: Install PHP Dependencies
```bash
cd back_end
composer install
```

### Step 2: Create Environment File
Copy the example environment file:
```bash
copy .env.example .env
# or on Mac/Linux:
# cp .env.example .env
```

### Step 3: Generate App Key
```bash
php artisan key:generate
```

### Step 4: Database Setup

Make sure MySQL is running (via XAMPP or another service), then:

```bash
# Run migrations (creates database tables)
php artisan migrate

# (Optional) Seed database with test data
php artisan db:seed
```

### Step 5: Start Backend Server
```bash
php artisan serve
```

You should see:
```
Starting Laravel development server: http://127.0.0.1:8000
```

**Keep this terminal open!** The backend server must run continuously.

---

## Frontend Setup (React)

### Step 1: Install Node Dependencies
```bash
cd front_end
npm install
```

### Step 2: Create Environment File
Copy the example environment file:
```bash
copy .env.example .env
# or on Mac/Linux:
# cp .env.example .env
```

The `.env` file should contain:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENABLE_REPORTS=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ITEMS_PER_PAGE=20
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_LOG_LEVEL=info
```

### Step 3: Start Frontend Server
```bash
npm start
```

You should see:
```
Compiled successfully!
You can now view the app in the browser.
  http://localhost:3000
```

---

## Verification Checklist

Before running the app, verify all of these:

### ✅ Backend Running
- [ ] `php artisan serve` is running (Terminal shows: `http://127.0.0.1:8000`)
- [ ] Database is set up (`php artisan migrate` completed)
- [ ] Try in browser: `http://localhost:8000/api/clients` - Should return JSON data

### ✅ Frontend Running  
- [ ] `npm start` is running (Terminal shows: `http://localhost:3000`)
- [ ] `.env` file exists in `front_end/` folder
- [ ] `REACT_APP_API_BASE_URL=http://localhost:8000/api` is set in `.env`

### ✅ Network
- [ ] Both servers are on the same machine or network
- [ ] No firewall blocking ports 3000 (frontend) or 8000 (backend)
- [ ] Open browser dev tools (F12) → Network tab to see API calls

---

## Troubleshooting "Failed to Fetch"

### Problem: Still getting "Failed to fetch" errors?

**1. Check Backend is Running**
```bash
# Open a new terminal and try:
curl http://localhost:8000/api/clients
# Should return JSON, not "Connection refused"
```

**2. Check .env File Exists**
```bash
# In front_end folder, verify .env exists:
ls .env
# If not found, create it:
copy .env.example .env
```

**3. Clear Browser Cache**
- Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
- Clear browsing data
- Refresh page

**4. Check Port Conflicts**
```bash
# If port 8000 is already in use, run on different port:
php artisan serve --port=8001
# Then update front_end/.env:
# REACT_APP_API_BASE_URL=http://localhost:8001/api
```

**5. Check Database Connection**
```bash
# Verify MySQL is running and .env has correct credentials:
# In back_end/.env, check:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=GAM
DB_USERNAME=root
DB_PASSWORD=
```

---

## Project Structure

```
gestion_atelier_mecanique/
├── back_end/           # Laravel API
│   ├── .env            # ← Create this from .env.example
│   ├── app/
│   ├── routes/api.php  # API endpoints
│   └── database/
├── front_end/          # React App
│   ├── .env            # ← Create this from .env.example
│   ├── src/
│   └── package.json
└── FIRST_TIME_SETUP.md # ← You are here
```

---

## Default Accounts (After Seeding)

After running `php artisan db:seed`, you can login with:

- **Accountant**: `comptable@test.com` / `password`
- **Mechanic**: `mecanicien@test.com` / `password`

---

## Common Ports

| Service | Port | URL |
|---------|------|-----|
| Laravel Backend | 8000 | `http://localhost:8000` |
| React Frontend | 3000 | `http://localhost:3000` |
| MySQL | 3306 | (via XAMPP) |

---

## Getting Help

If you still see errors:

1. **Check terminal output** - Backend and frontend terminals should show no errors
2. **Open DevTools** (F12) → Console tab to see JavaScript errors
3. **Open DevTools** → Network tab to see API calls status
4. **Check both .env files exist** and have correct URLs

---

**Still having issues?** Make sure both terminals are open and showing:
- Backend: "Laravel development server started on http://127.0.0.1:8000"
- Frontend: "Compiled successfully! You can now view the app in the browser"
