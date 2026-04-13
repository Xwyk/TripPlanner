# Exemples de Données TripPlanner

Ce document contient des exemples de données pour tester et comprendre le fonctionnement de TripPlanner.

## Scénario de Test : "Semaine au Ski"

### Voyage

```json
{
  "name": "Semaine au Ski - Alpes",
  "nights": 7,
  "totalBudget": "3500.00",
  "startDate": "2026-02-15",
  "description": "Semaine de ski entre amis à Chamonix"
}
```

**Calculs automatiques :**
- Coût par nuit : 3500 / 7 = 500€
- Dates : 15-22 février 2026

### Participants

#### Participant 1 - Toute la semaine
```json
{
  "name": "Alice Martin",
  "email": "alice@example.com",
  "arrivalDate": "2026-02-15",
  "departureDate": "2026-02-22",
  "nightsPresent": [1, 2, 3, 4, 5, 6, 7],
  "trip": "/api/trips/1"
}
```
**Coût :** 7 nuits × 500€ = **3 500€**

#### Participant 2 - Week-end prolongé
```json
{
  "name": "Bob Dubois",
  "email": "bob@example.com",
  "arrivalDate": "2026-02-15",
  "departureDate": "2026-02-18",
  "nightsPresent": [1, 2, 3],
  "trip": "/api/trips/1"
}
```
**Coût :** 3 nuits × 500€ = **1 500€**

#### Participant 3 - Milieu de semaine
```json
{
  "name": "Charlie Durand",
  "email": "charlie@example.com",
  "arrivalDate": "2026-02-17",
  "departureDate": "2026-02-21",
  "nightsPresent": [3, 4, 5, 6],
  "trip": "/api/trips/1"
}
```
**Coût :** 4 nuits × 500€ = **2 000€**

**Résumé des coûts :**
- Total à répartir : 3 500€
- Total des présences : 14 nuitées
- Alice paie : 3 500€ (7/14)
- Bob paie : 1 500€ (3/14)
- Charlie paie : 2 000€ (4/14)

### Recettes

#### Recette 1 - Raclette Traditionnelle
```json
{
  "name": "Raclette Traditionnelle",
  "description": "Raclette au fromage classique avec charcuteries et pommes de terre",
  "defaultPortions": 4,
  "instructions": "1. Faire cuire les pommes de terre\n2. Faire fondre le fromage\n3. Servir avec la charcuterie",
  "estimatedCost": "40.00",
  "recipeIngredients": [
    {
      "quantity": 1.5,
      "unit": "kg",
      "ingredient": {
        "name": "Fromage à raclette",
        "defaultUnit": "kg",
        "defaultQuantity": "1.0",
        "averagePrice": "25.00",
        "category": "Fromages"
      }
    },
    {
      "quantity": 2.0,
      "unit": "kg",
      "ingredient": {
        "name": "Pommes de terre",
        "defaultUnit": "kg",
        "defaultQuantity": "1.0",
        "averagePrice": "2.50",
        "category": "Légumes"
      }
    },
    {
      "quantity": 400,
      "unit": "g",
      "ingredient": {
        "name": "Jambon blanc",
        "defaultUnit": "g",
        "defaultQuantity": "200",
        "averagePrice": "12.00",
        "category": "Charcuteries"
      }
    }
  ]
}
```

**Coût par portion :** 40€ / 4 = **10€**

#### Recette 2 - Tartiflette Savoyarde
```json
{
  "name": "Tartiflette Savoyarde",
  "description": "Gratin de pommes de terre au reblochon, lardons et oignons",
  "defaultPortions": 6,
  "instructions": "1. Faire revenir les lardons et oignons\n2. Disposer les pommes de terre\n3. Ajouter le reblochon\n4. Gratiner 25 min à 200°C",
  "estimatedCost": "35.00",
  "recipeIngredients": [
    {
      "quantity": 2.0,
      "unit": "kg",
      "ingredient": {
        "name": "Pommes de terre",
        "defaultUnit": "kg",
        "defaultQuantity": "1.0",
        "averagePrice": "2.50",
        "category": "Légumes"
      }
    },
    {
      "quantity": 1.2,
      "unit": "kg",
      "ingredient": {
        "name": "Reblochon",
        "defaultUnit": "kg",
        "defaultQuantity": "0.5",
        "averagePrice": "18.00",
        "category": "Fromages"
      }
    },
    {
      "quantity": 300,
      "unit": "g",
      "ingredient": {
        "name": "Lardons fumés",
        "defaultUnit": "g",
        "defaultQuantity": "200",
        "averagePrice": "8.00",
        "category": "Charcuteries"
      }
    }
  ]
}
```

**Coût par portion :** 35€ / 6 = **5.83€**

### Repas

#### Repas 1 - Premier soir (Raclette pour 6 personnes)
```json
{
  "name": "Raclette de bienvenue",
  "mealType": "dinner",
  "date": "2026-02-15",
  "numberOfPortions": 6,
  "estimatedCost": "60.00",
  "trip": "/api/trips/1"
}
```

**Ajustement des quantités :**
- Ratio : 6 / 4 = 1.5
- Fromage : 1.5 kg × 1.5 = **2.25 kg**
- Pommes de terre : 2.0 kg × 1.5 = **3.0 kg**
- Jambon : 400 g × 1.5 = **600 g**

**Coût par portion :** 60€ / 6 = **10€**

#### Repas 2 - Deuxième soir (Tartiflette pour 8 personnes)
```json
{
  "name": "Tartiflette après-ski",
  "mealType": "dinner",
  "date": "2026-02-16",
  "numberOfPortions": 8,
  "estimatedCost": "46.67",
  "trip": "/api/trips/1"
}
```

**Ajustement des quantités :**
- Ratio : 8 / 6 = 1.33
- Pommes de terre : 2.0 kg × 1.33 = **2.66 kg**
- Reblochon : 1.2 kg × 1.33 = **1.6 kg**
- Lardons : 300 g × 1.33 = **400 g**

**Coût par portion :** 46.67€ / 8 = **5.83€**

### Vue d'ensemble des ingrédients

Pour organiser les courses, voici la liste consolidée pour les deux repas :

| Ingrédient | Quantité Totale | Unité | Catégorie |
|------------|-----------------|-------|-----------|
| Pommes de terre | 5.66 | kg | Légumes |
| Fromage à raclette | 2.25 | kg | Fromages |
| Reblochon | 1.6 | kg | Fromages |
| Jambon blanc | 600 | g | Charcuteries |
| Lardons fumés | 400 | g | Charcuteries |

## Scénario 2 : "Week-end Camping"

### Voyage
```json
{
  "name": "Week-end Camping en Forêt",
  "nights": 2,
  "totalBudget": "300.00",
  "startDate": "2026-06-20",
  "description": "Week-end camping avec 4 amis"
}
```

### Participants
Tous présents les 2 nuits, coût par personne = 300€ / 4 = 75€

### Repas simples

#### Repas 1 - Barbecue
```json
{
  "name": "Barbecue du premier soir",
  "mealType": "dinner",
  "date": "2026-06-20",
  "numberOfPortions": 4,
  "estimatedCost": "80.00"
}
```

#### Repas 2 - Petit-déjeuner
```json
{
  "name": "Petit-déjeuner copieux",
  "mealType": "breakfast",
  "date": "2026-06-21",
  "numberOfPortions": 4,
  "estimatedCost": "25.00"
}
```

## Tests API

### Tester les coûts

```bash
# Créer un voyage
curl -X POST http://localhost:8000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Voyage",
    "nights": 5,
    "totalBudget": "1000.00",
    "startDate": "2026-07-01"
  }'

# Récupérer les coûts calculés
curl http://localhost:8000/api/trips/1/costs
```

### Gérer les nuits d'un participant

```bash
# Ajouter une nuit de présence
curl -X POST http://localhost:8000/api/participants/1/nights/3

# Retirer une nuit de présence
curl -X DELETE http://localhost:8000/api/participants/1/nights/3
```

### Récupérer les ingrédients d'un repas

```bash
curl http://localhost:8000/api/meals/1/ingredients
```

## Formules de Calcul

### Coût par participant
```javascript
coût_participant = nuits_présentes × (budget_total / nombre_de_nuits)
```

### Ajustement des portions
```javascript
ratio = portions_repas / portions_recette
quantité_ajustée = quantité_recette × ratio
```

### Coût par portion
```javascript
coût_par_portion = coût_total / nombre_de_portions
```

Ces exemples peuvent être utilisés pour :
- Tester l'application
- Comprendre les calculs automatiques
- Former les nouveaux utilisateurs
- Créer des tests automatisés
