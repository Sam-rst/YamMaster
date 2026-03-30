# Niveaux de difficulté du bot — Spec de design

## Objectif

Ajouter 3 niveaux de difficulté au bot (Facile, Intermédiaire, Pro) avec un écran de sélection dédié, des stratégies différenciées côté backend, et le stockage de la difficulté en BDD pour l'historique.

## Base de données

### Modification du schéma Prisma

Ajouter un enum `BotDifficulty` et un champ `difficulty` nullable sur `GamePlayer` :

```prisma
enum BotDifficulty {
  EASY
  MEDIUM
  HARD
}

model GamePlayer {
  // ... champs existants
  difficulty BotDifficulty?  // null pour les joueurs humains, renseigné pour isBot=true
}
```

Migration Prisma standard. Les parties existantes auront `difficulty: null` (rétro-compatible).

### Évolution future

Si on ajoute d'autres types de bots (agressif, défensif, adaptatif...), on pourra migrer vers un modèle `Bot` séparé avec `GamePlayer.botId` sans perte de données : script de migration qui mappe `difficulty` → `botId`.

## Backend — Stratégies par difficulté

### BotService — 3 stratégies

Le `BotService` expose les mêmes 3 méthodes mais paramétrées par `difficulty: BotDifficulty` :

#### Facile ("Bot Débutant")

| Aspect | Comportement |
|--------|-------------|
| **Combinaisons** | Priorise les simples : brelan > moinshuit > suite > full > carré > yam |
| **Verrouillage** | Correct — verrouille les dés qui apparaissent 2+ fois (même logique que l'actuel) |
| **Choix de case** | Première case libre, sans réfléchir aux alignements |
| **Actions spéciales** | Jamais de Défi, jamais de Yam Predator — rate ces opportunités |

Le bot joue proprement mais de manière naïve. Bonnes bases mécaniques, zéro stratégie offensive.

#### Intermédiaire ("Bot Stratège")

| Aspect | Comportement |
|--------|-------------|
| **Combinaisons** | Priorise les fortes : yam > carré > full > suite > sec > défi > moinshuit (stratégie actuelle) |
| **Verrouillage** | Correct — verrouille les dés qui apparaissent 2+ fois |
| **Choix de case** | Préfère une case adjacente à un de ses pions existants (favorise les alignements) |
| **Actions spéciales** | Utilise le Défi quand il a un bon lancer au 1er jet |

Amélioration du bot actuel avec un placement plus intelligent (adjacence).

#### Pro ("Bot Champion")

| Aspect | Comportement |
|--------|-------------|
| **Combinaisons** | Priorise selon la grille — choisit la combo qui donne accès à la meilleure case (alignement potentiel) |
| **Verrouillage** | Optimal — analyse quelle combinaison est la plus rentable selon les cases disponibles et verrouille en conséquence |
| **Choix de case** | Maximise ses alignements + bloque les alignements adverses. Évalue chaque case candidate avec un score (alignements propres - alignements adverses menacés) |
| **Actions spéciales** | Défi quand avantageux + Yam Predator stratégique (retire le pion qui casse le meilleur alignement adverse) |

Adversaire redoutable : pense placement, bloque, et exploite toutes les mécaniques.

### Architecture du BotService

Les 3 méthodes existantes reçoivent un paramètre `difficulty` supplémentaire :

```typescript
chooseBestCombination(availableChoices, grid, difficulty: BotDifficulty): Choice | null
chooseBestCell(choiceId, grid, difficulty: BotDifficulty): { rowIndex, cellIndex } | null
chooseDicesToLock(dices, grid, availableChoices, difficulty: BotDifficulty): number[]
```

En interne, chaque méthode dispatche vers la bonne stratégie selon `difficulty`. Les stratégies sont des fonctions pures séparées (facile à tester individuellement).

### Propagation de la difficulté

Le flow complet :

1. Frontend émet `game.vsbot` avec `{ difficulty: 'EASY' | 'MEDIUM' | 'HARD' }`
2. `socket.setup.ts` passe la difficulté à `createGameVsBot(socket, games, difficulty)`
3. `createGameVsBot` stocke la difficulté dans le `Game` object en mémoire et en BDD (via `GamePlayer.difficulty`)
4. `setupBotListeners` reçoit la difficulté et la passe aux appels `BotService`
5. Le bot handler utilise `difficulty` à chaque décision

### Types partagés

Ajouter dans `shared/types/socket-events.types.ts` :

```typescript
type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// ClientToServerEvents
'game.vsbot': (data: { difficulty: BotDifficulty }) => void;
```

Ajouter dans `shared/types/game.types.ts` :

```typescript
export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
```

## Frontend

### Écran de sélection de difficulté (basé sur la maquette Stitch)

Nouvel écran `BotDifficultyScreen` accessible depuis le Home (remplace la navigation directe vers VsBotGameScreen).

Structure Feature-Sliced :

```
frontend/src/features/game/screens/bot-difficulty.screen.tsx
frontend/src/features/game/screens/bot-difficulty.screen.test.tsx
```

#### Layout de l'écran (maquette Stitch "VS Bot Difficulty - Néon Style")

1. **Header** : flèche retour (Feather `arrow-left`) + titre "Yam Master"
2. **Sous-titre** : "Mode Entraînement" centré
3. **Section** : "Choisir la Difficulté" + description "Affrontez nos maîtres du Yam."
4. **3 cartes de difficulté** empilées verticalement :

| Carte | Étoiles | Nom | Sous-titre | Description | Couleur |
|-------|---------|-----|------------|-------------|---------|
| Facile | ★ | Débutant | Facile | Idéal pour se chauffer. Le bot fait des erreurs simples. | `colors.success` (vert) |
| Intermédiaire | ★★ | Tactique | Intermédiaire | Un défi équilibré. Ce bot connaît ses probabilités. | `colors.gold` (doré) |
| Pro | ★★★ | Maître IA | Pro | Aucun droit à l'erreur. Ce bot joue pour le Grand Yam. | `colors.primary` (coral) |

5. **Section XP multiplicateurs** (Facile 1x, Pro 3x) — **désactivée pour l'instant**, sera implémentée avec le système de monnaie virtuelle. Pas affichée dans cette version.

- Au clic sur une carte → navigation vers VsBotGameScreen avec `{ difficulty }` en param

#### Style Neon Nocturne

- Fond : `colors.background` avec mesh gradient subtil (même pattern que le splash screen)
- Cartes : glass card (`colors.glass` + `colors.border`), bordure teintée de la couleur du niveau au hover/actif
- Étoiles : remplies dans la couleur du niveau
- Sous-titre du niveau (Facile/Intermédiaire/Pro) en uppercase, letterSpacing
- Fonts : Outfit (titres, noms de bot), Inter (descriptions)

### Modification du flow de navigation

```
HomeScreen → "Vs Bot" → BotDifficultyScreen → choix → VsBotGameScreen({ difficulty })
```

- `App.tsx` : ajouter `BotDifficultyScreen` dans le HomeStack
- `home.screen.tsx` : le bouton "Vs Bot" navigue vers `BotDifficultyScreen` au lieu de `VsBotGameScreen`
- `VsBotGameScreen` reçoit `difficulty` en route param et le passe au controller
- `VsBotGameController` émet `game.vsbot` avec `{ difficulty }` au lieu de `game.vsbot` sans payload

### Affichage de la difficulté dans l'historique

L'écran historique affiche déjà le mode (ONLINE / VS_BOT). Pour les parties VS_BOT, afficher aussi la difficulté : "Vs Bot (Intermédiaire)".

Les données sont déjà disponibles via le GamePlayer bot qui porte le champ `difficulty`.

## Tests

### Backend
- **BotService** : tests unitaires pour chaque stratégie × chaque méthode (chooseBestCombination, chooseBestCell, chooseDicesToLock) — au moins 3 tests par difficulté
- **Bot handler** : test d'intégration vérifiant que la difficulté est propagée correctement
- **Matchmaking handler** : test que `createGameVsBot` reçoit et stocke la difficulté

### Frontend
- **BotDifficultyScreen** : affiche les 3 cartes, navigation au clic
- **VsBotGameController** : émet `game.vsbot` avec la difficulté
- **HistoryScreen** : affiche la difficulté pour les parties VS_BOT
