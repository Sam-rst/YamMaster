# Gitflow — Yam Master

## Branches

| Branche | Rôle | CI/CD |
|---------|------|-------|
| `main` | Production | Lint → Tests → Build → **Déploiement prod** |
| `recette` | Pré-production / Tests en réel | Lint → Tests → Build → **Déploiement recette** |
| `develop` | Développement / Intégration | Lint → Tests → Build → **Déploiement dev** |
| `feature/*` | Nouvelles fonctionnalités | Lint → Tests → Build |
| `bugfix/*` | Corrections de bugs | Lint → Tests → Build |
| `hotfix/*` | Corrections urgentes en prod | Lint → Tests → Build |

## Flow

```
feature/xxx  ──PR──▶  develop  ──PR──▶  recette  ──PR──▶  main
bugfix/xxx   ──PR──▶  develop
hotfix/xxx   ──PR──▶  main (+ cherry-pick sur develop)
```

### Développement d'une feature
1. Créer la branche depuis `develop` : `git checkout -b feature/nom-feature develop`
2. Développer en TDD (tests → code → lint → docs → commit)
3. Ouvrir une PR vers `develop`
4. Après merge, la CI déploie en environnement dev

### Préparation d'une release
1. Ouvrir une PR de `develop` vers `recette`
2. Tester en environnement recette
3. Si OK, ouvrir une PR de `recette` vers `main`
4. Merge déclenche le déploiement production

### Hotfix urgent
1. Créer la branche depuis `main` : `git checkout -b hotfix/description main`
2. Fix + tests + lint
3. PR vers `main` (déploiement prod)
4. Cherry-pick le fix sur `develop`

## Convention de nommage

Les branches **doivent** respecter le pattern suivant, sinon la CI bloque :

```
main | develop | recette | feature/* | bugfix/* | hotfix/*
```

Exemples valides :
- `feature/auth-login`
- `bugfix/timer-crash`
- `hotfix/fix-victory-detection`

Exemples **rejetés** (CI en erreur) :
- `my-branch`
- `test-truc`
- `wip`

## Pipeline CI/CD — Workflows séparés

```
.github/workflows/
├── _ci-shared.yml      # Workflow réutilisable : lint → tests → build
├── branch-gate.yml     # Vérifie le nommage (branches non-standard)
├── ci-feature.yml      # feature/*, bugfix/*, hotfix/* → _ci-shared
├── ci-develop.yml      # develop → _ci-shared + déploiement dev
├── ci-recette.yml      # recette → _ci-shared + déploiement recette
└── ci-production.yml   # main → _ci-shared + déploiement prod
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
    │ (cover≥90%) │     │              │
    └──────┬──────┘     └──────┬───────┘
           ▼                   ▼
    ┌─────────────┐     ┌──────────────┐
    │Backend Build│     │Frontend Build│
    │ (TypeScript)│     │ (Expo Web)   │
    └─────────────┘     └──────────────┘
```

Appelé par chaque workflow d'environnement via `workflow_call` (zéro duplication).
