# Déploiement — Yam Master

## Docker Compose (local)

Lancer l'application complète en local :

```bash
docker-compose up --build
```

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | Expo Web servi par Nginx |
| Backend | http://localhost:3000 | WebSocket Server (Node.js) |

Nginx proxy automatiquement les WebSocket (`/socket.io/`) vers le backend.

Pour arrêter :
```bash
docker-compose down
```

## Cloud (gratuit)

### Architecture

| Service | Plateforme | Plan | Raison |
|---------|-----------|------|--------|
| Backend | **Render** (Web Service) | Free | Support WebSocket natif, Node.js |
| Frontend | **Vercel** (Static) | Free | CDN rapide, pas de cold start, build Expo web |

### Backend — Render

1. Créer un compte sur [render.com](https://render.com)
2. **New → Web Service** → connecter le repo GitHub
3. Configuration :

| Champ | Valeur |
|-------|--------|
| Name | `yammaster-backend-dev` |
| Branch | `develop` (ou `recette` / `main` selon l'environnement) |
| Root Directory | `backend` |
| Build Command | `npm ci --legacy-peer-deps && npm run build` |
| Start Command | `node dist/index.js` |
| Plan | Free |

4. Variables d'environnement : `PORT=3000`, `DEV_MODE=true`

### Frontend — Vercel

1. Créer un compte sur [vercel.com](https://vercel.com)
2. **New Project** → importer le repo GitHub
3. Configuration :

| Champ | Valeur |
|-------|--------|
| Framework Preset | `Other` |
| Root Directory | `frontend` |
| Build Command | `npm ci --legacy-peer-deps && npm run build` |
| Output Directory | `dist` |

4. Variables d'environnement :

| Key | Value |
|-----|-------|
| `EXPO_PUBLIC_SERVER_URL` | `https://yammaster-backend-dev.onrender.com` |
| `EXPO_PUBLIC_DEV_MODE` | `true` |

Le fichier `vercel.json` gère le rewrite SPA automatiquement.

### Limitations free tier

**Render (backend)** :
- Cold start ~30s après 15min d'inactivité
- 750h/mois

**Vercel (frontend)** :
- 100 Go de bande passante/mois
- Builds illimités
- Pas de cold start (CDN)

## Variables d'environnement

### Backend (`.env`)
```env
PORT=3000
DEV_MODE=false
```

### Frontend (`.env`)
```env
# URL complète du backend (prioritaire — utilisé en cloud)
EXPO_PUBLIC_SERVER_URL=https://yammaster-backend-dev.onrender.com

# Configuration locale (utilisé si SERVER_URL n'est pas défini)
EXPO_PUBLIC_SERVER_HOST_WEB=localhost
EXPO_PUBLIC_SERVER_HOST_MOBILE=10.61.8.6
EXPO_PUBLIC_SERVER_PORT=3000

EXPO_PUBLIC_DEV_MODE=false
```
