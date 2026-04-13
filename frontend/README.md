# TripPlanner Frontend

Application React TypeScript pour le frontend de TripPlanner.

## Technologies

- **React 18**: Bibliothèque JavaScript pour les interfaces utilisateur
- **TypeScript**: Typage statique pour JavaScript
- **Vite**: Build tool et serveur de développement ultra-rapide
- **React Router**: Routage client-side
- **Axios**: Client HTTP pour communiquer avec l'API
- **date-fns**: Manipulation et formatage de dates

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Preview du build de production
npm run preview
```

Le serveur de développement sera accessible sur `http://localhost:5173`

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Structure du Projet

```
src/
├── components/          # Composants React
│   ├── TripList.tsx    # Liste des voyages
│   ├── TripForm.tsx    # Formulaire de création/édition
│   ├── TripDetails.tsx # Détails d'un voyage
│   ├── Calendar.tsx    # Calendrier interactif des présences
│   ├── ParticipantForm.tsx # Formulaire participant
│   └── MealList.tsx    # Liste des repas
├── services/           # Services API
│   └── api.ts         # Client Axios et types TypeScript
├── App.tsx            # Application principale avec routing
├── App.css            # Styles globaux
└── main.tsx           # Point d'entrée
```

## Composants Principaux

### TripList
Affiche la liste de tous les voyages avec possibilité de créer, modifier ou supprimer.

### TripForm
Formulaire pour créer ou modifier un voyage avec validation.

### TripDetails
Vue détaillée d'un voyage incluant :
- Budget et coûts par participant
- Calendrier des présences
- Liste des participants
- Repas planifiés

### Calendar
Composant interactif pour gérer les présences des participants nuit par nuit avec des cases à cocher.

### ParticipantForm
Formulaire pour ajouter ou modifier un participant.

### MealList
Affichage des repas avec filtres et actions.

## Services API

Le fichier `services/api.ts` contient :
- **Client Axios** configuré pour communiquer avec API Platform
- **Types TypeScript** pour toutes les entités
- **Services** pour chaque ressource (trips, participants, meals, recipes, ingredients)

### Exemple d'utilisation

```typescript
import { tripService } from './services/api';

// Récupérer tous les voyages
const response = await tripService.getAll();
const trips = response['hydra:member'];

// Créer un voyage
const newTrip = await tripService.create({
  name: 'Mon Voyage',
  nights: 5,
  totalBudget: '1000.00',
  startDate: '2026-07-01'
});

// Calculer les coûts
const costs = await tripService.getCosts(tripId);
```

## Routing

L'application utilise React Router avec les routes suivantes :

- `/` → Redirection vers `/trips`
- `/trips` → Liste des voyages
- `/trips/new` → Créer un voyage
- `/trips/:id` → Détails d'un voyage
- `/trips/:id/edit` → Modifier un voyage
- `/trips/:tripId/participants/new` → Ajouter un participant
- `/participants/:id/edit` → Modifier un participant
- `/meals` → Liste des repas

## Styles

L'application utilise du CSS personnalisé avec :
- **Design responsive** pour mobile et desktop
- **CSS Grid** et **Flexbox** pour la mise en page
- **Variables CSS** pour la cohérence des couleurs
- **Animations** pour les interactions

## Développement

### Build

```bash
# Build pour développement
npm run dev

# Build pour production
npm run build

# Preview du build de production
npm run preview
```

### Linting

```bash
# Linter ESLint
npm run lint

# Fixer les problèmes ESLint
npm run lint:fix
```

## Fonctionnalités

- ✅ Interface moderne et responsive
- ✅ Calendrier interactif pour les présences
- ✅ Calcul automatique des coûts
- ✅ Gestion des participants et des repas
- ✅ Navigation fluide avec React Router
- ✅ Types TypeScript pour la sécurité du code
- ✅ Intégration avec API Platform

## Communication avec l'API

Le frontend communique avec l'API Platform Symfony via :

1. **Axios** comme client HTTP
2. **Format JSON-LD** pour les échanges de données
3. **Gestion d'erreur** centralisée
4. **Loading states** pour meilleure UX

### Format des réponses API Platform

```json
{
  "@context": "/api/contexts/Trip",
  "@id": "/api/trips/1",
  "@type": "Trip",
  "id": 1,
  "name": "Mon Voyage",
  "nights": 5,
  "totalBudget": "1000.00",
  "startDate": "2026-07-01",
  "costPerNight": 200.0,
  "participantsCosts": {
    "1": 1000.0
  }
}
```

## Performance

- **Vite** pour des builds ultra-rapides
- **Code splitting** automatique
- **Lazy loading** des composants si nécessaire
- **Optimisation des assets** pour la production

## Browser Support

- Chrome (dernière version)
- Firefox (dernière version)
- Safari (dernière version)
- Edge (dernière version)

## Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
