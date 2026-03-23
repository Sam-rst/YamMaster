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

## Render (cloud gratuit)

### Architecture Render

| Service | Type | Plan | Branche |
|---------|------|------|---------|
| `yammaster-backend` | Web Service | Free | Configurable par environnement |
| `yammaster-frontend` | Static Site | Free | Configurable par environnement |

### Mise en place

1. Créer un compte sur [render.com](https://render.com)
2. Connecter le repo GitHub
3. Créer un **Blueprint** depuis le fichier `render.yaml` à la racine
4. (Optionnel) Configurer les deploy hooks dans GitHub Secrets :
   - `RENDER_DEPLOY_HOOK_PROD` — pour le déploiement production
   - `RENDER_DEPLOY_HOOK_DEV` — pour le déploiement dev
   - `RENDER_DEPLOY_HOOK_RECETTE` — pour le déploiement recette

### Limitations du free tier

- **Cold start** : le serveur s'endort après 15min d'inactivité (~30s de réveil)
- **750h/mois** de temps de calcul (suffisant pour un projet)
- Pas de custom domain HTTPS sur le plan gratuit

## Variables d'environnement

### Backend (`.env`)
```env
PORT=3000
DEV_MODE=false    # true pour activer le panneau dev
```

### Frontend (`.env`)
```env
EXPO_PUBLIC_SERVER_HOST_WEB=localhost
EXPO_PUBLIC_SERVER_HOST_MOBILE=10.61.8.6
EXPO_PUBLIC_SERVER_PORT=3000
EXPO_PUBLIC_DEV_MODE=false
```

En production Render, les variables sont configurées dans le dashboard ou dans `render.yaml`.
