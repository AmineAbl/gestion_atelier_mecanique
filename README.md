<p align="center">
  <img src="front_end/public/logo_white.png" alt="MECINDIE" width="860" />
</p>
<h1 align="center">MECINDIE — Gestion d'Atelier Mécanique</h1>
 
<p align="center">
  Application web complète de gestion d'atelier mécanique.<br/>
  Laravel 12 · React · MySQL · XAMPP
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-red?logo=laravel" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/MySQL-MariaDB_10.4-orange?logo=mysql" />
  <img src="https://img.shields.io/badge/PHP-8.2%2B-purple?logo=php" />
</p>
---
 
## Sommaire
 
- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Base de données](#base-de-données)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide-avec-le-script-powershell)
- [Installation manuelle](#installation-manuelle)
- [Comptes par défaut](#comptes-par-défaut)
- [Endpoints API](#endpoints-api)
- [Dépannage](#dépannage)
---
 
## Présentation
 
MECINDIE est une plateforme tout-en-un développée en équipe (3 personnes) pour digitaliser la gestion d'un atelier mécanique. Elle couvre les réparations, la gestion des clients et véhicules, le stock de pièces, la facturation et les rapports financiers — avec une séparation stricte des rôles entre responsable, mécanicien et comptable.
 
---
 
## Fonctionnalités
 
| Module | Description |
|--------|-------------|
| **Authentification** | Connexion par rôle (responsable, mécanicien, comptable), tokens Sanctum |
| **Clients** | CRUD complet, historique des véhicules et réparations |
| **Véhicules** | Rattachés à un client, avec marque, modèle, immatriculation, carburant |
| **Réparations** | Suivi de statut (pending / in-progress / completed), affectation mécanicien |
| **Pièces** | Gestion du stock, association à une réparation avec quantité et prix utilisé |
| **Factures** | Génération PDF, taxes, statuts paid/pending, totaux automatiques |
| **Tableau de bord comptable** | Métriques financières, graphiques (funnel, barres, radar, ligne), top clients |
| **Interface mécanicien** | Vue des réparations assignées, mise à jour des statuts |
| **Interface responsable** | Gestion des utilisateurs, vue globale de l'atelier |
| **Landing page** | Page publique avec formulaire de démo (EmailJS), tarifs, FAQ |
| **Logs d'activité** | Traçabilité complète des actions (création, modification, suppression, connexion) |
 
---
 
## Architecture
 
```
gestion_atelier_mecanique/
├── back_end/          # Laravel 12 — API REST
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ClientController.php
│   │   │   ├── FactureController.php
│   │   │   ├── ReparationController.php
│   │   │   └── ...
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
└── front_end/         # React 18 — SPA
    ├── public/
    │   ├── logo_white.png
    │   └── logo_app_black.png
    └── src/
        ├── components/
        │   ├── Landing/       # LandingPage, LoginModal, PrivacyPage
        │   ├── Accountant/    # ClientsList, InvoicesList, FinancialReport
        │   ├── Manager/
        │   ├── Mechanic/
        │   └── common/        # UIComponents, Footer, ThemeToggle, Charts
        ├── hooks/
        ├── services/
        └── utils/
```
 
---
 
## Base de données
 
**Nom de la base :** `gam`  
**Serveur :** MariaDB 10.4 (via XAMPP)
 
### Tables principales
 
| Table | Description |
|-------|-------------|
| `users` | Utilisateurs avec rôles (responsable, comptable, mecanicien) |
| `clients` | Clients de l'atelier |
| `vehicules` | Véhicules rattachés aux clients |
| `reparations` | Interventions avec statut, dates, coût, mécanicien |
| `pieces` | Stock de pièces détachées |
| `reparation_pieces` | Liaison réparation ↔ pièces (quantité, prix utilisé) |
| `factures` | Factures liées aux réparations (PDF, taxes, statut) |
| `activity_logs` | Journal d'audit complet |
| `demo_requests` | Demandes de démo depuis la landing page |
| `personal_access_tokens` | Tokens Sanctum |
 
### Importer la base de données
 
1. Ouvrir **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Créer une base nommée `gam`
3. Onglet **Importer** → sélectionner le fichier `gam.sql`
4. Cliquer **Exécuter**
---
 
## Prérequis
 
- **XAMPP** (Apache + MySQL) — [télécharger](https://www.apachefriends.org/)
- **PHP 8.2+** (inclus dans XAMPP)
- **Composer** — [télécharger](https://getcomposer.org/)
- **Node.js LTS + NPM** — [télécharger](https://nodejs.org/)
---
 
## Installation rapide avec le script PowerShell
 
Un script `start-dev.ps1` est disponible à la racine de `gestion_atelier_mecanique/`. Il démarre automatiquement le backend Laravel et le frontend React dans deux fenêtres séparées.
 
### Étapes
 
**1. Autoriser l'exécution de scripts PowerShell** (une seule fois) :
 
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
 
**2. S'assurer que XAMPP MySQL est démarré** — ouvrir XAMPP Control Panel et cliquer **Start** sur MySQL.
 
**3. Importer la base de données** si ce n'est pas encore fait (voir section ci-dessus).
 
**4. Lancer le script depuis le dossier `gestion_atelier_mecanique/`** :
 
```powershell
cd C:\Users\soula\OneDrive\Documents\IRISI_SIT1\backend\PFM\gestion_atelier_mecanique
.\start-dev.ps1
```
 
Le script va :
- Ouvrir un terminal pour `php artisan serve` sur `http://localhost:8000`
- Ouvrir un terminal pour `npm start` sur `http://localhost:3000`
**5. Ouvrir** `http://localhost:3000` dans le navigateur.
 
> ⚠️ **Premier lancement seulement** : si `vendor/` ou `node_modules/` n'existent pas encore, suivre l'installation manuelle ci-dessous avant de relancer le script.
 
---
 
## Installation manuelle
 
### Backend Laravel
 
```powershell
cd back_end
 
# 1. Installer les dépendances PHP
composer install
 
# 2. Générer la clé d'application
php artisan key:generate
 
# 3. Vérifier le fichier .env (déjà configuré)
# DB_DATABASE=gam
# DB_USERNAME=root
# DB_PASSWORD=
 
# 4. Lancer les migrations (si vous ne pas importez le SQL)
php artisan migrate
 
# 5. Seeder les utilisateurs par défaut (si base vide)
php artisan db:seed
 
# 6. Démarrer le serveur
php artisan serve
```
 
### Frontend React
 
```powershell
cd front_end
 
# 1. Installer les dépendances
npm install
 
# 2. Démarrer l'application
npm start
```
 
---
 
## Comptes par défaut
 
> Tous ces comptes sont inclus dans le fichier `gam.sql`.
 
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Responsable** | `responsable@atelier.com` | `12345` |
| **Comptable** | `comptable@gmail.com` | `12345` |
| **Comptable** | `comptable@atelier.com` | `12345` |
| **Mécanicien** | `mecanicien@atelier.com` | `12345` |
| **Mécanicien** | `mecanicien2@atelier.com` | `12345` |
 
---
 
## Endpoints API
 
### Authentification
```
POST   /api/login           Connexion
POST   /api/logout          Déconnexion
GET    /api/user            Utilisateur courant
```
 
### Clients
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/{id}
PUT    /api/clients/{id}
DELETE /api/clients/{id}
```
 
### Réparations
```
GET    /api/reparations
POST   /api/reparations
GET    /api/reparations/{id}
PUT    /api/reparations/{id}
DELETE /api/reparations/{id}
```
 
### Factures
```
GET    /api/factures
POST   /api/factures
GET    /api/factures/{id}
PUT    /api/factures/{id}
DELETE /api/factures/{id}
```
 
### Autres
```
GET    /api/vehicules
GET    /api/pieces
GET    /api/users
GET    /api/dashboard/stats
POST   /api/demo-requests
```
 
---
 
## Dépannage
 
### MySQL ne démarre pas dans XAMPP
→ Vérifier qu'aucun autre service n'occupe le port 3306 (ex: MySQL natif Windows).  
→ Dans XAMPP Config → changer le port MySQL vers 3307 si nécessaire, et mettre à jour `DB_PORT=3307` dans `.env`.
 
### Erreur "No application encryption key has been specified"
```powershell
cd back_end
php artisan key:generate
```
 
### Erreur CORS dans la console navigateur
→ Vérifier que Laravel tourne bien sur `http://localhost:8000`.  
→ Vérifier que `REACT_APP_API_URL=http://localhost:8000` est dans `front_end/.env`.
 
### Login échoue avec "identifiants incorrects"
→ S'assurer que le fichier `gam.sql` a bien été importé dans phpMyAdmin.  
→ Vérifier que la table `users` contient les données avec :
```sql
SELECT id, nom, prenom, email, role FROM users;
```
 
### Le dashboard comptable affiche 0 partout
→ Vérifier que les tokens Sanctum fonctionnent — ouvrir F12 → Network → chercher une requête `/api/factures` et vérifier qu'elle retourne `200` avec des données.
 
### "vendor" manquant / "node_modules" manquant
```powershell
# Backend
cd back_end && composer install
 
# Frontend  
cd front_end && npm install
```
 
---

 
## Équipe
 
Projet réalisé dans le cadre d'un PFM (Projet de Fin de Module) — IRISI SIT1, 2026.  
ETTABAA SOULAIMANE (putbullet)
ALAOUI M'DAGHRI Yassine 
ABOU-LAICHE AMINE
 
---
 
*© 2026 MECINDIE. Tous droits réservés.*
