<p align="center">
  <img src="/mecanic.png" alt="Atelier mécanique" width="900" />
</p>

# Gestion d’atelier mécanique

Application web de gestion d’un atelier mécanique, réalisée en équipe (3 personnes). Le projet couvre la gestion des clients, de leurs véhicules, des réparations, des pièces utilisées et de la facturation, avec une séparation claire entre interface utilisateur et serveur applicatif.

## Sommaire

- [Périmètre fonctionnel](#périmètre-fonctionnel)
- [Technologies](#technologies)
- [Architecture du dépôt](#architecture-du-dépôt)
- [Modèle de données (MLD)](#modèle-de-données-mld)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Installation & démarrage](#installation--démarrage)
  - [Back-end (Laravel)](#back-end-laravel)
  - [Front-end (React)](#front-end-react)
- [Tests](#tests)
- [Notes](#notes)

## Périmètre fonctionnel

- Gestion des utilisateurs et des rôles (ex. responsable, mécanicien, comptable).
- Gestion des clients.
- Gestion des véhicules (rattachés à un client).
- Suivi des réparations (statut, dates, coût, véhicule concerné, mécanicien associé).
- Gestion du stock de pièces et association des pièces à une réparation (quantité + prix utilisé).
- Édition/suivi des factures liées à une réparation (totaux, statut, date de validation).

## Technologies

- **Back-end** : Laravel 12 (PHP 8.2+)
- **Base de données** : MySQL/MariaDB ou PostgreSQL (selon configuration `.env`)
- **Front-end** : React (Create React App)
- **Outillage** : Composer, Node.js/NPM

> Remarque : le back-end contient aussi un setup Vite/Tailwind pour l’interface Laravel (si vous utilisez les vues Blade). Le front-end React est une application séparée.

## Architecture du dépôt

- [back_end/](back_end/) : application Laravel (serveur applicatif)
- [front_end/](front_end/) : application React (interface utilisateur)

## Modèle de données (MLD)

Le MLD cible (présenté dans la documentation) est organisé autour des entités suivantes :

### Tables

- **utilisateurs** : `id`, `nom`, `prénom`, `email`, `mot_de_passe`, `role`
- **clients** : `id`, `nom`, `prénom`, `téléphone`
- **vehicules** : `id`, `marque`, `modèle`, `immatriculation`, `type_carburant`, `type_transmission`, `annee`, `client_id`
- **reparations** : `id`, `description`, `statut`, `date_debut`, `date_fin`, `date_prevue_fin`, `cout`, `vehicule_id`, `mecanicien_id`
- **pieces** : `id`, `nom`, `prix`, `quantité`
- **reparation_piece** (table de liaison) : `reparation_id`, `piece_id`, `quantite`, `prix_utilisé`
- **factures** : `id`, `total_piece`, `cout`, `prix_total`, `statut`, `reparation_id`, `date_validation`

### Relations (résumé)

- Un **client** peut avoir plusieurs **véhicules**.
- Un **véhicule** peut avoir plusieurs **réparations**.
- Une **réparation** est associée à un **mécanicien** (utilisateur) et peut consommer plusieurs **pièces**.
- Une **facture** est associée à une **réparation**.

## Prérequis

- PHP **8.2+**
- Composer
- Node.js (LTS recommandé) + NPM
- Un serveur de base de données (MySQL/MariaDB ou PostgreSQL)


## Notes

- Les fichiers [back_end/README.md](back_end/README.md) et [front_end/README.md](front_end/README.md) sont des README générés par les templates (Laravel / Create React App). Le présent fichier décrit le projet dans son ensemble.
- Le modèle de données ci-dessus correspond à la conception (MLD). Assurez-vous d’aligner les migrations Laravel et le code applicatif avec ce modèle.
