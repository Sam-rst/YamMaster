# Gitflow — Yam Master

## Branches

| Branche | Rôle | CI/CD |
|---------|------|-------|
| `main` | Production | Lint → Tests → Build → SonarCloud → **Déploiement prod** |
| `preview` | Pré-production / Tests en réel | Lint → Tests → Build → SonarCloud → **Déploiement preview** |
| `develop` | Développement / Intégration | Lint → Tests → Build → SonarCloud (pas de déploiement cloud) |
| `feature/*` | Nouvelles fonctionnalités | Lint → Tests → Build → SonarCloud |
| `bugfix/*` | Corrections de bugs | Lint → Tests → Build → SonarCloud |
| `hotfix/*` | Corrections urgentes en prod | Lint → Tests → Build → SonarCloud |

## Environnements

| Environnement | Branche | Backend | BDD | Mobile | Web |
|--------------|---------|---------|-----|--------|-----|
| **Local** | `develop` | `npm run dev` (localhost) | Locale | Expo Go | localhost |
| **Preview** | `preview` | Render `yammaster-preview` | Neon branche `preview` | EAS Build `preview` | Vercel preview |
| **Production** | `main` | Render `yammaster-prod` | Neon branche `main` | EAS Build `production` | Vercel prod |

## Versioning (SemVer strict)

Le projet suit [Semantic Versioning](https://semver.org/lang/fr/) :

```
0.x.y            En développement (état actuel)
1.0.0-alpha.x    Alpha — tests internes (5-10 proches)
1.0.0-beta.x     Beta — testeurs externes (50-200)
1.0.0-rc.x       Release Candidate — feature freeze
1.0.0            Premier lancement public
1.x.y            Post-launch (MINOR = feature, PATCH = bugfix)
```

**Règles** :
- Version centralisée dans `version.json` → synchronisée via `node scripts/sync-version.js`
- Bump PATCH pour les bugfixes, bump MINOR quand tous les tickets de la version sont terminés
- À chaque merge dans `main` : créer un tag Git (`git tag -a v0.x.y -m "description"`)

## Flow

```
feature/YAM-XX-desc  ──merge──▶  develop  ──merge──▶  preview  ──merge──▶  main  ──tag──▶  v0.x.y
bugfix/YAM-XX-desc   ──merge──▶  develop
hotfix/YAM-XX-desc   ──merge──▶  main (+ cherry-pick sur develop)
```

### Lien avec Jira

- Branche nommée avec le ticket : `feature/YAM-42-leaderboard`
- Commits référencent le ticket : `feat: ajoute le classement — YAM-42`
- Merge dans develop → ticket passe en Terminé (DOD)
- Merge dans main → MEP validée

### Développement d'une feature
1. Prendre un ticket **Prêt** sur le board Jira DEV
2. Créer la branche depuis `develop` : `git checkout -b feature/YAM-XX-description develop`
3. Développer en TDD (tests → code → lint → docs → commit)
4. Pousser la branche, CI passe
5. Merger dans `develop`
6. Tester en local avec Expo Go + backend local

### Préparation d'une MEP
1. Tous les tickets du lot sont **Terminés** dans Jira
2. Merge `develop` → `preview`, tester en environnement preview (backend Render + BDD Neon + APK EAS)
3. Si OK, merge `preview` → `main`
4. Créer le tag Git, bump version, CHANGELOG

### Hotfix urgent
1. Créer la branche depuis `main` : `git checkout -b hotfix/YAM-XX-description main`
2. Fix + tests + lint
3. Merger dans `main` (déploiement prod)
4. Cherry-pick le fix sur `develop`

## Convention de nommage

Les branches **doivent** respecter le pattern suivant, sinon la CI bloque :

```
main | develop | preview | feature/* | bugfix/* | hotfix/*
```

Exemples valides :
- `feature/YAM-42-leaderboard`
- `bugfix/YAM-45-timer-crash`
- `hotfix/YAM-61-auth-broken`

Exemples **rejetés** (CI en erreur) :
- `my-branch`
- `test-truc`
- `wip`

## Pipeline CI/CD — Workflows séparés

```
.github/workflows/
├── _ci-shared.yml      # Workflow réutilisable : lint → tests → build → SonarCloud
├── branch-gate.yml     # Vérifie le nommage (branches non-standard)
├── ci-feature.yml      # feature/*, bugfix/*, hotfix/* → _ci-shared
├── ci-develop.yml      # develop → _ci-shared (CI only, pas de déploiement)
├── ci-preview.yml      # preview → _ci-shared + déploiement preview
├── ci-production.yml   # main → _ci-shared + déploiement prod
├── eas-update.yml      # OTA update mobile (preview + main)
└── eas-build.yml       # Rebuild APK/IPA (preview + main)
```

### Workflow partagé (`_ci-shared.yml`)

```
    ┌─────────────┐     ┌──────────────┐
    │ Backend Lint │     │ Frontend Lint│
    │ + Typecheck  │     │              │
    └──────┬──────┘     └──────┬───────┘
           ▼                   ▼
    ┌─────────────┐     ┌──────────────┐
    │Backend Tests│     │Frontend Tests│
    │ (cover≥90%) │     │ (cover≥90%) │
    └──────┬──────┘     └──────┬───────┘
           ▼                   ▼
    ┌─────────────┐     ┌──────────────┐
    │Backend Build│     │Frontend Build│
    │ (TypeScript)│     │ (Expo Web)   │
    └──────┬──────┘     └──────┬───────┘
           └───────┬───────────┘
                   ▼
          ┌─────────────────┐
          │ SonarCloud Scan │
          └─────────────────┘
```

Appelé par chaque workflow d'environnement via `workflow_call` + `secrets: inherit` (zéro duplication).

## Documentation

- **Confluence** : documentation vivante du projet → https://samrst-studies.atlassian.net/wiki/spaces/YAM
- **Repo** : `CLAUDE.md` (instructions dev), `CHANGELOG.md` (historique), `docs/` (architecture, gitflow)
