# TripPlanner 🏕️

Application de planification de voyage avec gestion intelligente du budget, des participants et des repas.

## Architecture

- **Backend API**: Symfony 8.0 + API Platform
- **Base de données**: MySQL avec Doctrine ORM
- **Frontend**: React + TypeScript + Vite
- **Communication**: REST API avec API Platform

## Fonctionnalités

### 📊 Gestion des Voyages
- Création de voyages avec nombre de nuits et budget total
- Calcul automatique du coût par nuitée
- Visualisation des coûts détaillés par participant

### 👥 Gestion des Participants
- Ajout de participants avec dates d'arrivée/départ
- **Calendrier visuel interactif** pour gérer les présences nuit par nuit
- Calcul automatique du coût individuel selon les nuits présentes

### 🍽️ Gestion des Repas Avancée
- Création de repas avec types (petit-déjeuner, déjeuner, dîner, en-cas)
- Gestion des recettes avec ingrédients et portions
- Ajustement automatique des quantités selon le nombre de convives
- Calcul des coûts par portion
- Vue d'ensemble des ingrédients nécessaires

### 🧾 Gestion des Ingrédients
- Base d'ingrédients avec portions par défaut
- Prix moyens et catégories
- Calcul automatique des quantités ajustées

## Installation

### Prérequis
- PHP 8.4 ou supérieur
- Composer
- MySQL ou MariaDB
- Node.js 18+ et npm

### Backend (Symfony + API Platform)

```bash
# Installer les dépendances PHP
composer install

# Configurer la base de données
cp .env .env.local
# Éditer .env.local avec vos paramètres de base de données

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Démarrer le serveur Symfony
symfony server:start
```

L'API sera accessible sur `http://localhost:8000/api`
- Documentation interactive: `http://localhost:8000/api/docs`
- Interface d'administration: `http://localhost:8000/api`

### Frontend (React TypeScript)

```bash
# Aller dans le répertoire frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## Structure du Projet

```
tripplanner/
├── assets/                    # Assets Symfony (plus utilisés)
├── config/                    # Configuration Symfony
├── frontend/                  # Application React TypeScript
│   ├── src/
│   │   ├── components/       # Composants React
│   │   │   ├── TripList.tsx
│   │   │   ├── TripForm.tsx
│   │   │   ├── TripDetails.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── ParticipantForm.tsx
│   │   │   └── MealList.tsx
│   │   ├── services/         # Services API
│   │   │   └── api.ts
│   │   ├── App.tsx           # Application principale
│   │   └── App.css
│   ├── package.json
│   └── vite.config.ts
├── migrations/               # Migrations de base de données
├── src/
│   ├── Entity/              # Entités Doctrine avec API Platform
│   │   ├── Trip.php
│   │   ├── Participant.php
│   │   ├── Meal.php
│   │   ├── Recipe.php
│   │   ├── Ingredient.php
│   │   └── RecipeIngredient.php
│   └── Repository/          # Repositories Doctrine
└── templates/               # Templates Symfony (plus utilisés)
```

## API Documentation

### Resources API Platform

L'API expose automatiquement les endpoints suivants :

#### Voyages (`/api/trips`)
- `GET /api/trips` - Liste tous les voyages
- `POST /api/trips` - Crée un nouveau voyage
- `GET /api/trips/{id}` - Récupère un voyage
- `PUT /api/trips/{id}` - Met à jour un voyage
- `DELETE /api/trips/{id}` - Supprime un voyage
- `GET /api/trips/{id}/costs` - Calcule les coûts par participant

#### Participants (`/api/participants`)
- `GET /api/participants` - Liste tous les participants
- `POST /api/participants` - Crée un nouveau participant
- `GET /api/participants/{id}` - Récupère un participant
- `PUT /api/participants/{id}` - Met à jour un participant
- `DELETE /api/participants/{id}` - Supprime un participant
- `POST /api/participants/{id}/nights/{nightNumber}` - Ajoute une nuit de présence
- `DELETE /api/participants/{id}/nights/{nightNumber}` - Retire une nuit de présence

#### Repas (`/api/meals`)
- `GET /api/meals` - Liste tous les repas
- `POST /api/meals` - Crée un nouveau repas
- `GET /api/meals/{id}` - Récupère un repas
- `PUT /api/meals/{id}` - Met à jour un repas
- `DELETE /api/meals/{id}` - Supprime un repas
- `GET /api/meals/{id}/ingredients` - Récupère les ingrédients d'un repas

#### Recettes (`/api/recipes`)
- `GET /api/recipes` - Liste toutes les recettes
- `POST /api/recipes` - Crée une nouvelle recette
- `GET /api/recipes/{id}` - Récupère une recette
- `PUT /api/recipes/{id}` - Met à jour une recette
- `DELETE /api/recipes/{id}` - Supprime une recette

#### Ingrédients (`/api/ingredients`)
- `GET /api/ingredients` - Liste tous les ingrédients
- `POST /api/ingredients` - Crée un nouvel ingrédient
- `GET /api/ingredients/{id}` - Récupère un ingrédient
- `PUT /api/ingredients/{id}` - Met à jour un ingrédient
- `DELETE /api/ingredients/{id}` - Supprime un ingrédient
- `GET /api/ingredients/categories` - Liste les catégories d'ingrédients

### Documentation Interactive

API Platform fournit une documentation interactive automatique :
- **JSON-LD/HAL**: `http://localhost:8000/api`
- **Swagger UI**: `http://localhost:8000/api/docs`
- **GraphQL** (si activé): `http://localhost:8000/api/graphql`

## Utilisation

### Lancer l'application complète

```bash
# Terminal 1 - Backend
symfony server:start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Exemples d'utilisation

#### 1. Créer un voyage
```bash
curl -X POST http://localhost:8000/api/trips \
  -H "Content-Type: application/ld+json" \
  -d '{
    "name": "Semaine au Ski",
    "nights": 7,
    "totalBudget": "3500.00",
    "startDate": "2026-02-15"
  }'
```

#### 2. Ajouter un participant
```bash
curl -X POST http://localhost:8000/api/participants \
  -H "Content-Type: application/ld+json" \
  -d '{
    "name": "Alice",
    "trip": "/api/trips/1",
    "nightsPresent": [1, 2, 3, 4, 5]
  }'
```

#### 3. Gérer les présences via le calendrier
Utilisez l'interface React pour cocher/décocher les nuits directement dans le calendrier interactif.

#### 4. Calculer les coûts
```bash
curl http://localhost:8000/api/trips/1/costs
```

## Calculs Automatiques

### Coût par nuit
```javascript
coût_par_nuit = budget_total / nombre_de_nuits
```

### Coût par participant
```javascript
coût_participant = nuits_présentes × coût_par_nuit
```

### Ajustement des portions (repas)
```javascript
ratio = portions_repas / portions_recette
quantité_ajustée = quantité_recette × ratio
```

## Développement

### Tests Backend
```bash
# Tests PHP Unit
php bin/phpunit

# Tests avec couverture de code
php bin/phpunit --coverage-html coverage
```

### Tests Frontend
```bash
cd frontend
npm test
```

### Migrations
```bash
# Créer une nouvelle migration
php bin/console doctrine:migrations:generate

# Exécuter les migrations en attente
php bin/console doctrine:migrations:migrate

# Annuler la dernière migration
php bin/console doctrine:migrations:migrate --down
```

### Build Frontend
```bash
cd frontend

# Build pour développement
npm run dev

# Build pour production
npm run build

# Preview du build de production
npm run preview
```

## Technologies

### Backend
- **Symfony 8.0**: Framework PHP
- **API Platform 4.3**: Framework API REST
- **Doctrine ORM**: ORM pour la base de données
- **MySQL**: Base de données relationnelle

### Frontend
- **React 18**: Bibliothèque JavaScript
- **TypeScript**: Typage statique
- **Vite**: Build tool et serveur de développement
- **React Router**: Routage client
- **Axios**: Client HTTP
- **date-fns**: Manipulation de dates

## Fonctionnalités API Platform

- **Documentation automatique**: Swagger/OpenAPI
- **Filtrage**: Query parameters pour filtrer les ressources
- **Pagination**: Pagination automatique des collections
- **Validation**: Validation automatique des données
- **Sérialisation**: Groupes de sérialisation pour contrôler les données exposées
- **Hydra**: Hypermedia API avec JSON-LD/HAL

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence propriétaire.

## Support

Pour toute question ou problème, merci d'ouvrir une issue sur le repository.

---

**Développé avec ❤️ pour faciliter la planification de vos voyages**
