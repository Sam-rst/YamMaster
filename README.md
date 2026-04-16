# 🎲 Yam Master

> **Jeu de Yam (Yahtzee) multijoueur en temps reel** avec matchmaking, bot IA multi-niveaux, replay de parties et profil joueur.

<p>
  <a href="https://yammaster.vercel.app/">
    <img alt="Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
  <a href="https://itunes.apple.com/app/apple-store/id982107779">
    <img alt="iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent">
    <img alt="Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  </a>
  <img alt="License" src="https://img.shields.io/badge/license-GPL%20v3-blue.svg?style=flat-square" />
  <img alt="Version" src="https://img.shields.io/badge/version-0.15.0-green.svg?style=flat-square" />
</p>

---

## 🎯 Apercu

Yam Master est un jeu de des multijoueur inspire du Yahtzee, jouable en ligne ou contre un bot. Les joueurs s'affrontent au tour par tour sur une grille 5x5 en combinant des lancers de des pour poser des pions. La victoire s'obtient par alignement de 5 pions ou par accumulation de points.

### ✨ Fonctionnalites principales

- 🌐 **Partie en ligne** — Matchmaking temps reel via Socket.IO
- 🤖 **Vs Bot (3 niveaux)** — Facile, Moyen, Difficile avec strategies IA distinctes
- 🔄 **Replay** — Revivez vos parties tour par tour avec plateau visuel
- 📊 **Historique** — Consultez vos resultats et statistiques de parties
- 👤 **Profil joueur** — Statistiques completes, systeme de rang (Bronze → Maitre), selection d'avatar
- 📖 **Regles du jeu** — Ecran dedie avec accordeons et animations interactives
- 🌙 **Design Neon Nocturne** — Interface sombre avec accents coral/cyan/dore

---

## 🛠️ Stack technique

| Couche | Technologies |
|--------|-------------|
| 📱 **Frontend** | React Native, Expo SDK 54, JavaScript/TypeScript |
| ⚙️ **Backend** | Node.js, Express, Socket.IO, TypeScript (strict) |
| 🗄️ **Base de donnees** | PostgreSQL 16, Prisma ORM |
| 🧪 **Tests** | Jest, Testing Library (90%+ couverture) |
| 🔄 **CI/CD** | GitHub Actions (lint, tests, build, deploiement) |
| 🚀 **Deploiement** | Render (backend), Expo (frontend) |
| 🐳 **Dev local** | Docker Compose (PostgreSQL) |

---

## 🏗️ Architecture

Le projet suit une **architecture Feature-Sliced** — chaque feature est organisee en `screens/`, `controllers/`, `components/`, `services/`, `models/`.

```
YamMaster/
├── 📂 backend/                 # API Express + Socket.IO
│   └── src/
│       ├── features/           # auth, game, matchmaking, bot, history, profile
│       ├── infrastructure/     # BDD (Prisma), Socket.IO setup
│       └── shared/             # Types, logger, exceptions
├── 📂 frontend/                # App React Native / Expo
│   └── src/
│       ├── features/           # auth, home, game, history, replay, rules, profile
│       └── shared/             # Contextes, theme, hooks, services
├── 📂 shared/                  # Types partages (frontend + backend)
│   └── types/                  # game.types.ts, socket-events.types.ts
├── 📂 docs/                    # Documentation du projet
├── 📄 docker-compose.yml       # PostgreSQL pour le dev local
└── 📄 render.yaml              # Config deploiement Render
```

🔌 **Communication temps reel** : Socket.IO avec evenements `domain.action` (ex: `game.dices.roll`, `game.grid.selected`). REST API pour les donnees persistees (auth, historique, profil).

🧠 **Principe cle** : zero logique metier cote frontend. Le backend calcule tout et envoie les donnees pretes a afficher.

---

## 🚀 Installation

### Prerequis

- 📦 Node.js >= 18
- 📦 npm >= 9
- 🐳 Docker et Docker Compose (pour la base de donnees locale)

### 🐳 Base de donnees (Docker)

```bash
# Demarrer PostgreSQL en local
docker-compose up -d

# La base est accessible sur localhost:5432
# User: yammaster | Password: yammaster | Database: yammaster
```

### ⚙️ Backend

```bash
cd backend
npm install
cp .env.example .env    # Configurer les variables d'environnement
npx prisma generate     # Generer le client Prisma
npx prisma db push      # Appliquer le schema a la BDD
npm run dev             # Demarrer en mode developpement (port 3000)
```

### 📱 Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Configurer l'adresse du serveur
npm run start           # Demarrer Expo
```

### 🔧 Variables d'environnement

**Backend** (`backend/.env`) :

| Variable | Description | Valeur par defaut |
|----------|-------------|-------------------|
| `PORT` | Port du serveur Express | `3000` |
| `DATABASE_URL` | URL de connexion PostgreSQL | *(requis)* |
| `DEV_MODE` | Active le mode developpement (panel dev) | `false` |

> Avec Docker Compose : `DATABASE_URL=postgresql://yammaster:yammaster@localhost:5432/yammaster`

**Frontend** (`frontend/.env`) :

| Variable | Description | Valeur par defaut |
|----------|-------------|-------------------|
| `EXPO_PUBLIC_SERVER_URL` | URL complete du backend (cloud) | *(optionnel, prioritaire)* |
| `EXPO_PUBLIC_SERVER_HOST_WEB` | Host backend pour le web | `localhost` |
| `EXPO_PUBLIC_SERVER_HOST_MOBILE` | Host backend pour mobile | *(votre IP locale)* |
| `EXPO_PUBLIC_SERVER_PORT` | Port du backend | `3000` |
| `EXPO_PUBLIC_DEV_MODE` | Active le mode developpement | `false` |

> **Trouver votre IP locale** (pour mobile) :
> - Windows : `ipconfig` → adresse IPv4 de votre carte reseau
> - macOS/Linux : `ifconfig` ou `ip addr` → adresse de votre interface WiFi

---

## 📋 Scripts

### ⚙️ Backend

| Commande | Description |
|----------|-------------|
| `npm run dev` | 🔧 Serveur de developpement (ts-node) |
| `npm run build` | 📦 Compile TypeScript vers `dist/` |
| `npm start` | 🚀 Demarre le serveur compile |
| `npm test` | 🧪 Lance les tests Jest |
| `npm run test:coverage` | 📊 Tests + rapport de couverture |
| `npm run lint` | 🔍 ESLint |
| `npm run typecheck` | ✅ Verification des types sans emission |

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
| 🟢 `main` | Production | Lint, tests, build, deploiement prod |
| 🟡 `recette` | Pre-production | Lint, tests, build, deploiement recette |
| 🔵 `develop` | Developpement | Lint, tests, build, deploiement dev |
| 🟣 `feature/*` | — | Lint, tests, build |
| 🟠 `bugfix/*` | — | Lint, tests, build |
| 🔴 `hotfix/*` | — | Lint, tests, build |

> ⚠️ Les branches qui ne respectent pas la convention de nommage sont **bloquees par la CI**.

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
- 🔗 **Integration** — Handlers avec mock sockets
- 🌍 **E2E** — Navigation complete avec serveur simule

---

## 🚀 Deploiement

### Backend (Render)

Le deploiement est configure via `render.yaml` :
- **Runtime** : Node.js
- **Build** : `npm ci --legacy-peer-deps --include=dev && npm run build`
- **Start** : `node dist/index.js`
- **Variables** : `PORT=3000`, `DEV_MODE=false`, `NODE_ENV=production`

### Frontend (Expo)

Le frontend est deploye via Expo / Vercel pour la version web.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📋 [Cahier des charges](docs/00-cahier-des-charges.md) | Regles du jeu, specifications fonctionnelles |
| 🔍 [Audit](docs/01-audit.md) | Audit du code existant |
| 🗺️ [Roadmap](docs/02-roadmap.md) | Planification des features |
| 🏗️ [Architecture](docs/03-architecture.md) | Architecture technique |
| 🌿 [Gitflow](docs/05-gitflow.md) | Workflow Git et CI/CD |
| 🚀 [Deploiement](docs/06-deploiement.md) | Guide de deploiement |
| 🎯 [Architecture cible](docs/07-architecture-cible.md) | Architecture Feature-Sliced detaillee |
| 📝 [Changelog](CHANGELOG.md) | Historique des versions et modifications |

---

## 📄 Licence

Ce projet est distribue sous licence **GNU General Public License v3.0** — voir le fichier [LICENSE](LICENSE) pour plus de details.

Projet academique — EPSI M1 Architecture Applicative.
