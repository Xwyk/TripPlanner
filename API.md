# TripPlanner API Documentation

## Overview
TripPlanner est une API REST pour gérer des voyages avec calcul automatique des coûts, gestion des participants et planification des repas.

## Architecture
- **Framework** : Symfony 8.0
- **Base de données** : MySQL avec Doctrine ORM
- **Sérialisation** : Symfony Serializer avec groupes de validation
- **API** : RESTful JSON

## Entités

### Trip (Voyage)
- `id`: Identifiant unique
- `name`: Nom du voyage
- `nights`: Nombre de nuits
- `totalBudget`: Budget total
- `startDate`: Date de début
- `description`: Description (optionnel)
- `createdAt`: Date de création
- `participants`: Collection de participants
- `meals`: Collection de repas

### Participant (Participant)
- `id`: Identifiant unique
- `name`: Nom du participant
- `email`: Email (optionnel)
- `arrivalDate`: Date d'arrivée (optionnel)
- `departureDate`: Date de départ (optionnel)
- `nightsPresent`: Tableau des numéros de nuits présentes
- `trip`: Voyage associé

### Meal (Repas)
- `id`: Identifiant unique
- `name`: Nom du repas
- `mealType`: Type de repas (breakfast, lunch, dinner, snack)
- `date`: Date du repas
- `description`: Description (optionnel)
- `numberOfPortions`: Nombre de portions
- `estimatedCost`: Coût estimé (optionnel)
- `trip`: Voyage associé
- `recipes`: Collection de recettes
- `participants`: Collection de participants présents

### Recipe (Recette)
- `id`: Identifiant unique
- `name`: Nom de la recette
- `description`: Description (optionnel)
- `defaultPortions`: Nombre de portions par défaut
- `instructions`: Instructions de préparation (optionnel)
- `estimatedCost`: Coût estimé (optionnel)

### Ingredient (Ingrédient)
- `id`: Identifiant unique
- `name`: Nom de l'ingrédient
- `defaultUnit`: Unité de mesure par défaut (ex: g, kg, litre)
- `defaultQuantity`: Quantité par défaut
- `averagePrice`: Prix moyen
- `category`: Catégorie (optionnel)
- `notes`: Notes (optionnel)

### RecipeIngredient (Ingrédient de recette)
- `id`: Identifiant unique
- `quantity`: Quantité dans la recette
- `unit`: Unité de mesure
- `preparationNotes`: Notes de préparation (optionnel)
- `recipe`: Recette associée
- `ingredient`: Ingrédient associé

## Routes API

### TRIPS

#### Liste tous les voyages
```
GET /api/trips
```

#### Crée un nouveau voyage
```
POST /api/trips
Content-Type: application/json

{
  "name": "Vacances à la montagne",
  "nights": 10,
  "totalBudget": "2000.00",
  "startDate": "2026-07-15",
  "description": "Semaine de ski entre amis"
}
```

#### Récupère un voyage
```
GET /api/trips/{id}
```

#### Met à jour un voyage
```
PUT /api/trips/{id}
PATCH /api/trips/{id}
Content-Type: application/json

{
  "name": "Vacances à la montagne - été",
  "totalBudget": "2500.00"
}
```

#### Supprime un voyage
```
DELETE /api/trips/{id}
```

#### Calcule les coûts par participant
```
GET /api/trips/{id}/costs
```

**Réponse :**
```json
{
  "trip_id": 1,
  "trip_name": "Vacances à la montagne",
  "total_budget": "2000.00",
  "nights": 10,
  "cost_per_night": 200.0,
  "participants": [
    {
      "id": 1,
      "name": "Alice",
      "nights_count": 10,
      "nights_present": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "total_cost": 2000.0
    },
    {
      "id": 2,
      "name": "Bob",
      "nights_count": 5,
      "nights_present": [1, 2, 3, 4, 5],
      "total_cost": 1000.0
    }
  ],
  "total_participants_costs": 3000.0
}
```

### PARTICIPANTS

#### Liste tous les participants
```
GET /api/participants
```

#### Crée un nouveau participant
```
POST /api/participants
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "arrivalDate": "2026-07-15",
  "departureDate": "2026-07-20",
  "nightsPresent": [1, 2, 3, 4, 5],
  "trip": "/api/trips/1"
}
```

#### Récupère un participant
```
GET /api/participants/{id}
```

#### Met à jour un participant
```
PUT /api/participants/{id}
PATCH /api/participants/{id}
```

#### Supprime un participant
```
DELETE /api/participants/{id}
```

#### Ajoute une nuit de présence
```
POST /api/participants/{id}/nights/{nightNumber}
```

#### Retire une nuit de présence
```
DELETE /api/participants/{id}/nights/{nightNumber}
```

### MEALS

#### Liste tous les repas
```
GET /api/meals
```

#### Crée un nouveau repas
```
POST /api/meals
Content-Type: application/json

{
  "name": "Pasta Dinner",
  "mealType": "dinner",
  "date": "2026-07-15",
  "numberOfPortions": 8,
  "estimatedCost": "50.00",
  "trip": "/api/trips/1"
}
```

#### Récupère un repas
```
GET /api/meals/{id}
```

#### Met à jour un repas
```
PUT /api/meals/{id}
PATCH /api/meals/{id}
```

#### Supprime un repas
```
DELETE /api/meals/{id}
```

#### Récupère les ingrédients d'un repas
```
GET /api/meals/{id}/ingredients
```

**Réponse :**
```json
{
  "meal_id": 1,
  "meal_name": "Pasta Dinner",
  "number_of_portions": 8,
  "estimated_cost": "50.00",
  "cost_per_portion": 6.25,
  "ingredients": [
    {
      "name": "Pâtes",
      "quantity": 1000.0,
      "unit": "g"
    },
    {
      "name": "Tomates",
      "quantity": 800.0,
      "unit": "g"
    }
  ]
}
```

### RECIPES

#### Liste toutes les recettes
```
GET /api/recipes
```

#### Crée une nouvelle recette
```
POST /api/recipes
Content-Type: application/json

{
  "name": "Spaghetti Bolognese",
  "description": "Pâtes traditionnelles à la sauce bolognaise",
  "defaultPortions": 4,
  "instructions": "1. Faire cuire les pâtes...",
  "estimatedCost": "15.00",
  "recipeIngredients": [
    {
      "quantity": 500.0,
      "unit": "g",
      "ingredient": {"name": "Pâtes", "defaultUnit": "g", "defaultQuantity": "500"}
    }
  ]
}
```

#### Récupère une recette
```
GET /api/recipes/{id}
```

#### Met à jour une recette
```
PUT /api/recipes/{id}
PATCH /api/recipes/{id}
```

#### Supprime une recette
```
DELETE /api/recipes/{id}
```

### INGREDIENTS

#### Liste tous les ingrédients
```
GET /api/ingredients
```

#### Crée un nouvel ingrédient
```
POST /api/ingredients
Content-Type: application/json

{
  "name": "Tomates",
  "defaultUnit": "kg",
  "defaultQuantity": "1.0",
  "averagePrice": "3.50",
  "category": "Légumes",
  "notes": "De préférence bio"
}
```

#### Récupère un ingrédient
```
GET /api/ingredients/{id}
```

#### Met à jour un ingrédient
```
PUT /api/ingredients/{id}
PATCH /api/ingredients/{id}
```

#### Supprime un ingrédient
```
DELETE /api/ingredients/{id}
```

#### Liste les catégories d'ingrédients
```
GET /api/ingredients/categories
```

## Calculs automatiques

### Coût par nuitée
Le système calcule automatiquement le coût par nuit :
```
coût_par_nuit = budget_total / nombre_de_nuits
```

### Coût par participant
Le coût pour chaque participant est calculé selon ses nuits présentes :
```
coût_participant = nombre_de_nuits_présentes × coût_par_nuit
```

### Quantités ajustées pour les repas
Lorsqu'une recette est utilisée dans un repas, les quantités sont ajustées :
```
ratio = portions_repas / portions_recette
quantité_ajustée = quantité_recette × ratio
```

### Coût par portion
Pour chaque repas et chaque recette, le coût par portion est calculé :
```
coût_par_portion = coût_total / nombre_de_portions
```

## Configuration des dates

Les dates doivent être au format ISO 8601 : `YYYY-MM-DD`

Les nuits sont numérotées de 1 à N (où N est le nombre de nuits du voyage).

Exemple : Pour un voyage de 10 nuits commençant le 15 juillet 2026 :
- Nuit 1 : 15-16 juillet 2026
- Nuit 2 : 16-17 juillet 2026
- ...
- Nuit 10 : 24-25 juillet 2026

## Groupes de sérialisation

Les entités utilisent des groupes pour contrôler les données exposées :
- `{entity}:read` : Pour la lecture des données
- `{entity}:write` : Pour l'écriture des données
- `trip:read` : Inclus dans les réponses complètes de voyage

## Installation

```bash
# Installer les dépendances
composer install

# Configurer la base de données
cp .env .env.local
# Éditer .env.local avec vos paramètres de base de données

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Démarrer le serveur
symfony server:start
```

L'API sera accessible sur `http://localhost:8000`
