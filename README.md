# 🎲 Yam Master

> **Jeu de Yam (Yahtzee) multijoueur en temps réel** avec matchmaking, bot IA et replay de parties.

<p>
  <a href="https://docs.expo.dev/workflow/web/">
    <img alt="Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
  <a href="https://itunes.apple.com/app/apple-store/id982107779">
    <img alt="iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent">
    <img alt="Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  </a>
  <img alt="License" src="https://img.shields.io/badge/license-GPL%20v3-blue.svg?style=flat-square" />
</p>

---

## 🎯 Apercu

Yam Master est un jeu de dés multijoueur inspiré du Yahtzee, jouable en ligne ou contre un bot. Les joueurs s'affrontent au tour par tour sur une grille 5x5 en combinant des lancers de dés pour poser des pions. La victoire s'obtient par alignement de 5 pions ou par accumulation de points.

### ✨ Fonctionnalites principales

- 🌐 **Partie en ligne** — Matchmaking temps réel via Socket.IO
- 🤖 **Vs Bot** — Affrontez un bot avec stratégie adaptative
- 🔄 **Replay** — Revivez vos parties tour par tour avec plateau visuel
- 📊 **Historique** — Consultez vos résultats et statistiques
- 👤 **Mode invité** — Jouez sans créer de compte
- 🌙 **Design Neon Nocturne** — Interface sombre avec accents coral/cyan/doré

---

## 🛠️ Stack technique

| Couche | Technologies |
|--------|-------------|
| 📱 **Frontend** | React Native, Expo SDK 54, TypeScript |
| ⚙️ **Backend** | Node.js, Express, Socket.IO, TypeScript |
| 🗄️ **Base de données** | PostgreSQL, Prisma ORM |
| 🧪 **Tests** | Jest, Testing Library (90%+ couverture) |
| 🔄 **CI/CD** | GitHub Actions (lint, tests, build, déploiement) |
| 🚀 **Déploiement** | Render (backend), Expo (frontend) |

---

## 🏗️ Architecture

Le projet suit une **architecture Feature-Sliced** — chaque feature est organisée en `screens/`, `controllers/`, `components/`, `services/`, `models/`.

```
YamMaster/
├── 📂 backend/                 # API Express + Socket.IO
│   └── src/
│       ├── features/           # auth, game, matchmaking, bot, history
│       ├── infrastructure/     # BDD, Socket.IO setup
│       └── shared/             # Types, logger, exceptions
├── 📂 frontend/                # App React Native / Expo
│   └── src/
│       ├── features/           # auth, home, game, history, replay
│       └── shared/             # Contextes, thème, services
├── 📂 shared/                  # Types partagés (frontend + backend)
└── 📂 docs/                    # Documentation du projet
```

🔌 **Communication temps réel** : Socket.IO avec événements `domain.action` (ex: `game.dices.roll`, `game.grid.selected`). REST API pour les données persistées (auth, historique).

🧠 **Principe clé** : zéro logique métier côté frontend. Le backend calcule tout et envoie les données prêtes à afficher.

---

## 🚀 Installation

### Prérequis

- 📦 Node.js >= 18
- 📦 npm >= 9
- 🐘 PostgreSQL (ou variable `DATABASE_URL` vers une instance distante)

### ⚙️ Backend

```bash
cd backend
npm install
cp .env.example .env    # Configurer DATABASE_URL
npx prisma generate     # Générer le client Prisma
npx prisma db push      # Appliquer le schéma
npm run dev             # Démarrer en mode développement (port 3000)
```

### 📱 Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Configurer l'adresse du serveur
npm run start           # Démarrer Expo
```

Le frontend se connecte au backend via les variables d'environnement :
- 🌐 **Web** : `http://localhost:3000`
- 📱 **Mobile** : Configurer `EXPO_PUBLIC_SERVER_HOST_MOBILE` avec l'IP locale

---

## 📋 Scripts

### ⚙️ Backend

| Commande | Description |
|----------|-------------|
| `npm run dev` | 🔧 Serveur de développement (ts-node) |
| `npm run build` | 📦 Compile TypeScript vers `dist/` |
| `npm start` | 🚀 Démarre le serveur compilé |
| `npm test` | 🧪 Lance les tests Jest |
| `npm run test:coverage` | 📊 Tests + rapport de couverture |
| `npm run lint` | 🔍 ESLint |

### 📱 Frontend

| Commande | Description |
|----------|-------------|
| `npm start` | 🔧 Serveur Expo dev |
| `npm test` | 🧪 Lance les tests Jest |
| `npm run test:coverage` | 📊 Tests + rapport de couverture |
| `npm run lint` | 🔍 ESLint |
| `npm run build` | 📦 Export web Expo |

---

## 🌿 Gitflow

Le projet suit un workflow Git strict avec CI/CD par environnement :

| Branche | Environnement | CI/CD |
|---------|--------------|-------|
| 🟢 `main` | Production | Lint, tests, build, déploiement prod |
| 🟡 `recette` | Pré-production | Lint, tests, build, déploiement recette |
| 🔵 `develop` | Développement | Lint, tests, build, déploiement dev |
| 🟣 `feature/*` | — | Lint, tests, build |
| 🟠 `bugfix/*` | — | Lint, tests, build |
| 🔴 `hotfix/*` | — | Lint, tests, build |

> ⚠️ Les branches qui ne respectent pas la convention de nommage sont **bloquées par la CI**.

---

## 🧪 Tests

Le projet vise **90% de couverture minimum** sur les deux environnements.

```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

Trois niveaux de tests :
- 🔬 **Unitaires** — Services, logique pure
- 🔗 **Intégration** — Handlers avec mock sockets
- 🌍 **E2E** — Navigation complète avec serveur simulé

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📋 [Cahier des charges](docs/00-cahier-des-charges.md) | Règles du jeu, spécifications fonctionnelles |
| 🔍 [Audit](docs/01-audit.md) | Audit du code existant |
| 🗺️ [Roadmap](docs/02-roadmap.md) | Planification des features |
| 🏗️ [Architecture](docs/03-architecture.md) | Architecture technique |
| 🌿 [Gitflow](docs/05-gitflow.md) | Workflow Git et CI/CD |
| 🚀 [Déploiement](docs/06-deploiement.md) | Guide de déploiement |
| 🎯 [Architecture cible](docs/07-architecture-cible.md) | Architecture Feature-Sliced détaillée |

---

## 📄 Licence

Ce projet est distribué sous licence **GNU General Public License v3.0** — voir le fichier [LICENSE](LICENSE) pour plus de détails.

Projet académique — EPSI M1 Architecture Applicative.
