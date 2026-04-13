# 🚀 Guide de Démarrage Rapide - TripPlanner

Suivez ces étapes pour démarrer TripPlanner en quelques minutes !

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **PHP 8.4+**
- **Composer**
- **MySQL/MariaDB**
- **Node.js 18+**
- **npm**

## 1️⃣ Configuration du Backend (Symfony + API Platform)

```bash
# À la racine du projet
composer install

# Configuration de la base de données
cp .env .env.local
```

Éditez `.env.local` et configurez votre base de données :
```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/tripplanner?serverVersion=8.0"
```

```bash
# Créer la base de données et exécuter les migrations
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Démarrer le serveur Symfony
symfony server:start
```

✅ **Backend prêt !** API disponible sur `http://localhost:8000/api`

## 2️⃣ Configuration du Frontend (React TypeScript)

```bash
# Aller dans le répertoire frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ **Frontend prêt !** Application disponible sur `http://localhost:5173`

## 3️⃣ Premier Test

1. **Ouvrez votre navigateur** sur `http://localhost:5173`

2. **Créez votre premier voyage** :
   - Cliquez sur "+ Nouveau Voyage"
   - Remplissez le formulaire :
     - Nom: "Semaine au Ski"
     - Nombre de nuits: 7
     - Budget total: 3500
     - Date de début: 2026-02-15

3. **Ajoutez des participants** :
   - Cliquez sur "+ Ajouter Participant"
   - Créez 2-3 participants

4. **Utilisez le calendrier** :
   - Cochez les nuits où chaque participant est présent
   - Observez les coûts se mettre à jour automatiquement !

## 📚 Fonctionnalités à Tester

### ✅ Gestion des Voyages
- [ ] Créer un voyage
- [ ] Modifier les détails d'un voyage
- [ ] Voir le calcul automatique du coût par nuit

### ✅ Gestion des Participants
- [ ] Ajouter des participants
- [ ] Utiliser le calendrier interactif
- [ ] Voir les coûts individuels se calculer automatiquement

### ✅ API Platform
- [ ] Visiter `http://localhost:8000/api/docs` pour la documentation interactive
- [ ] Tester les endpoints directement depuis l'interface Swagger

## 🔧 Commandes Utiles

### Backend
```bash
# Voir les logs
symfony server:log

# Redémarrer le serveur
symfony server:start

# Créer une nouvelle migration
php bin/console doctrine:migrations:generate

# Vider le cache
php bin/console cache:clear
```

### Frontend
```bash
# Build pour production
npm run build

# Preview du build de production
npm run preview

# Linter le code
npm run lint
```

## 🐛 Problèmes Courants

### Port déjà utilisé
```bash
# Backend - utiliser un port différent
symfony server:start --port=8001

# Frontend - Vite demandera automatiquement d'utiliser un autre port
```

### Erreur de connexion à la base de données
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les identifiants dans .env.local
```

### Erreur CORS entre frontend et backend
Ajoutez ceci à `config/packages/framework.yaml` :
```yaml
framework:
    cors:
        allowed_origins: ['http://localhost:5173']
        allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allowed_headers: ['Content-Type', 'Authorization']
```

## 📖 Documentation Complète

- **README.md**: Documentation principale du projet
- **frontend/README.md**: Documentation spécifique au frontend
- **API.md**: Documentation détaillée de l'API
- **EXAMPLES.md**: Exemples de données et scénarios

## 🎯 Étapes Suivantes

Une fois l'application démarrée :

1. **Explorez la documentation API** sur `http://localhost:8000/api/docs`
2. **Testez l'interface React** sur `http://localhost:5173`
3. **Créez des voyages de test** avec les exemples du fichier EXAMPLES.md
4. **Explorez le code source** pour comprendre l'architecture

## 💡 Astuces

- Utilisez **Swagger UI** (`/api/docs`) pour tester l'API directement
- Le **calendrier interactif** met à jour les coûts en temps réel
- Les **calculs automatiques** gèrent les divisions complexes du budget
- Le frontend utilise **TypeScript** pour une meilleure sécurité du code

---

**Bon voyage avec TripPlanner ! 🏕️✨**
