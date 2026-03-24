# Déploiement — Yam Master

## Architecture globale

```
                    ┌─────────────┐
                    │   GitHub    │
                    │   Repo      │
                    └──────┬──────┘
                           │ push
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         develop       recette        main
              │            │            │
    ┌─────────┴──┐  ┌──────┴───┐  ┌────┴───────┐
    │  CI/CD Dev │  │CI/CD Rec.│  │ CI/CD Prod │
    └─────┬──────┘  └────┬─────┘  └─────┬──────┘
          │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌────┴──────┐
    │ Render    │  │ Render    │  │ Render    │
    │ Back Dev  │  │ Back Rec. │  │ Back Prod │
    ├───────────┤  ├───────────┤  ├───────────┤
    │ Vercel    │  │ Vercel    │  │ Vercel    │
    │ Front Dev │  │ Front Rec.│  │ Front Prod│
    └───────────┘  └───────────┘  └───────────┘
```

| Env | Branche | Backend (Render) | Frontend (Vercel) |
|-----|---------|-----------------|-------------------|
| **Dev** | `develop` | `yammaster-backend-dev` | Preview deploy |
| **Recette** | `recette` | `yammaster-backend-recette` | Preview deploy |
| **Production** | `main` | `yammaster-backend-prod` | Production deploy |

---

## 1. Docker Compose (local)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:3000 |

---

## 2. Backend — Render (3 services)

### 2.1 Créer les 3 services

Pour chaque environnement, créer un **Web Service** sur [render.com](https://render.com) :

#### Service Dev
| Champ | Valeur |
|-------|--------|
| Name | `yammaster-backend-dev` |
| Branch | `develop` |
| Root Directory | `backend` |
| Build Command | `npm ci --legacy-peer-deps && npm run build` |
| Start Command | `node dist/index.js` |
| Plan | Free |

Variables d'environnement :
| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `DEV_MODE` | `true` |
| `NODE_ENV` | `development` |

#### Service Recette
| Champ | Valeur |
|-------|--------|
| Name | `yammaster-backend-recette` |
| Branch | `recette` |
| _(reste identique au dev)_ | |

Variables d'environnement :
| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `DEV_MODE` | `false` |
| `NODE_ENV` | `staging` |

#### Service Production
| Champ | Valeur |
|-------|--------|
| Name | `yammaster-backend-prod` |
| Branch | `main` |
| _(reste identique au dev)_ | |

Variables d'environnement :
| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `DEV_MODE` | `false` |
| `NODE_ENV` | `production` |

### 2.2 URLs obtenues

Après création, Render attribue des URLs :
```
Dev:      https://yammaster-backend-dev.onrender.com
Recette:  https://yammaster-backend-recette.onrender.com
Prod:     https://yammaster-backend-prod.onrender.com
```

---

## 3. Frontend — Vercel (1 projet, 3 scopes)

### 3.1 Créer le projet

1. [vercel.com](https://vercel.com) → **Add New Project** → importer **YamMaster**
2. Configuration :

| Champ | Valeur |
|-------|--------|
| Framework Preset | `Other` |
| Root Directory | `frontend` |

3. **Settings → Git → Production Branch** : `main`

### 3.2 Variables d'environnement par scope

Dans **Settings → Environment Variables**, ajouter :

#### EXPO_PUBLIC_SERVER_URL

| Scope | Value |
|-------|-------|
| **Production** | `https://yammaster-backend-prod.onrender.com` |
| **Preview** | `https://yammaster-backend-dev.onrender.com` |

> Pour la recette : par défaut les branches non-main utilisent le scope **Preview**.
> Si tu veux un backend recette distinct, tu peux ajouter un **Override** sur la branche `recette` :
> Settings → Environment Variables → `EXPO_PUBLIC_SERVER_URL` → **Add Branch Override** → `recette` → `https://yammaster-backend-recette.onrender.com`

#### EXPO_PUBLIC_DEV_MODE

| Scope | Value |
|-------|-------|
| **Production** | `false` |
| **Preview** | `true` |

Override optionnel pour recette : `false` (pas de panneau dev en recette).

### 3.3 URLs obtenues

| Branche | URL | Type |
|---------|-----|------|
| `main` | `yammaster-xxx.vercel.app` | Production (fixe) |
| `develop` | `yammaster-xxx-git-develop-xxx.vercel.app` | Preview |
| `recette` | `yammaster-xxx-git-recette-xxx.vercel.app` | Preview |

> L'URL de production est stable. Les URLs de preview sont générées à chaque deploy mais restent accessibles.

### 3.4 Résumé Vercel

```
Push sur main     → Build + Deploy Production  → yammaster.vercel.app
Push sur develop   → Build + Deploy Preview     → URL preview (backend dev)
Push sur recette   → Build + Deploy Preview     → URL preview (backend recette)
Push sur feature/* → Build + Deploy Preview     → URL preview (backend dev)
```

---

## 4. CI/CD — GitHub Actions

Les workflows déclenchent les déploiements automatiquement :

| Workflow | Déclencheur | Actions |
|----------|-------------|---------|
| `ci-production.yml` | push `main` | CI + trigger Render prod |
| `ci-recette.yml` | push `recette` | CI + trigger Render recette |
| `ci-develop.yml` | push `develop` | CI + trigger Render dev |
| `ci-feature.yml` | push `feature/*` | CI uniquement |

Render et Vercel écoutent aussi directement les push GitHub (auto-deploy).

### GitHub Secrets (optionnels)

Pour un contrôle plus fin via deploy hooks Render :

| Secret | Usage |
|--------|-------|
| `RENDER_DEPLOY_HOOK_DEV` | Trigger deploy backend dev |
| `RENDER_DEPLOY_HOOK_RECETTE` | Trigger deploy backend recette |
| `RENDER_DEPLOY_HOOK_PROD` | Trigger deploy backend prod |

---

## 5. Checklist de mise en place

- [ ] **Render** : Créer `yammaster-backend-dev` (branche `develop`)
- [ ] **Render** : Créer `yammaster-backend-recette` (branche `recette`)
- [ ] **Render** : Créer `yammaster-backend-prod` (branche `main`)
- [ ] **Vercel** : Créer le projet frontend (branche prod = `main`)
- [ ] **Vercel** : Configurer `EXPO_PUBLIC_SERVER_URL` (Production + Preview)
- [ ] **Vercel** : Configurer override branche `recette` si backend recette distinct
- [ ] **Vercel** : Configurer `EXPO_PUBLIC_DEV_MODE` (Production=false, Preview=true)
- [ ] **GitHub** : Ajouter les deploy hooks Render en Secrets (optionnel)
- [ ] **Tester** : Ouvrir l'URL dev, jouer une partie
