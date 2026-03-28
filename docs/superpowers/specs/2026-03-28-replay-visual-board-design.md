# Spec : Replay visuel avec plateau de jeu

**Date** : 2026-03-28
**Scope** : Backend (enrichir turn-recorder) + Frontend (composants read-only + refactoring thème)

---

## Objectif

Transformer le replay post-partie d'une liste d'actions textuelles en un vrai spectateur visuel : grille 5x5 avec pions, dés, scores et jetons, qui évolue à chaque step comme un vrai plateau de jeu.

## Décisions de design

| Question | Choix | Raison |
|---|---|---|
| Point de vue | Commentateur (voit tout) | Le replay est une relecture, pas une simulation du point de vue d'un joueur |
| Composants frontend | Read-only séparés (isolation replay/game) | Évite les régressions croisées, plus facile à faire évoluer indépendamment |
| Contenu du snapshot | GameState complet après chaque action | Simple, ~150 KB/partie, négligeable |
| Optimisation stockage | Aucune pour l'instant | On optimisera si problème de performance avéré |
| Styles visuels | Centralisés dans shared/theme/ | Évite la duplication entre game board et replay board |

---

## 1. Backend — Enrichir le turn-recorder

### Changement dans `game.handler.ts`

Ajouter une fonction `recordGameSnapshot` appelée après chaque `recordTurn` :

```typescript
const recordGameSnapshot = (game: Game): void => {
    if (!game.turnRecorder) return;
    game.turnRecorder.recordGameState(
        JSON.parse(JSON.stringify(game.gameState))
    );
};
```

Appels ajoutés après chaque action enregistrée :
- Après `recordTurn(game, 'roll', ...)` → `recordGameSnapshot(game)`
- Après `recordTurn(game, 'lock', ...)` → `recordGameSnapshot(game)`
- Après `recordTurn(game, 'choice', ...)` → `recordGameSnapshot(game)`
- Après `recordTurn(game, 'grid', ...)` → `recordGameSnapshot(game)`
- Après `recordTurn(game, 'defi', ...)` → `recordGameSnapshot(game)` (si existant)
- Après `recordTurn(game, 'predator', ...)` → `recordGameSnapshot(game)` (si existant)

### Résultat en BDD

Les turns alternent : `[action, snapshot, action, snapshot, ...]`

Le snapshot à l'index `i*2 + 1` est l'état du jeu APRÈS l'action à l'index `i*2`.

### Contenu du snapshot (GameState)

```typescript
{
    currentTurn: PlayerKey;        // "player:1" | "player:2"
    timer: number;
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    grid: GridCell[][];            // 5x5 avec owners
    choices: Choices;              // isDefi, availableChoices, idSelectedChoice
    deck: Deck;                   // dices[], rollsCounter, rollsMaximum
}
```

---

## 2. Refactoring styles — shared/theme/

### Fichiers à créer/modifier

**`shared/theme/fonts.ts`** (nouveau) :
- Exporte `fontDisplay` et `fontSans` (Platform.select)
- Remplace les ~15 déclarations dupliquées dans les composants

**`shared/theme/colors.ts`** (enrichir) :
- Ajouter les couleurs spécifiques au jeu : `playerToken`, `opponentToken`, `cellPlayerOwned`, `cellOpponentOwned`, `cellHighlight`, `cellPredatorTarget`

**`shared/theme/game-styles.ts`** (nouveau) :
- `diceStyles` : tailles (52px player, 36px opponent), border radius, lock state (anneau doré)
- `gridCellStyles` : glass bg, owned states (coral/cyan), predator state
- `scoreStyles` : label + value layout
- `tokenStyles` : icône disc + texte doré
- `timerStyles` : badge avec icône clock

**`shared/theme/index.ts`** (nouveau) :
- Barrel export de tous les modules thème

### Migration des composants existants

Les composants du game board (`die.component.tsx`, `grid.component.tsx`, `player-score.component.tsx`, etc.) importeront depuis `@/shared/theme` au lieu de déclarer leurs styles localement. Aucun changement visuel — pure centralisation.

---

## 3. Composants read-only du replay

### Structure

```
replay/components/
├── replay-board/
│   ├── replay-board.component.tsx
│   ├── replay-board.component.test.tsx
│   ├── replay-grid/
│   │   ├── replay-grid.component.tsx
│   │   └── replay-grid.component.test.tsx
│   ├── replay-dice/
│   │   ├── replay-dice.component.tsx
│   │   └── replay-dice.component.test.tsx
│   ├── replay-scores/
│   │   ├── replay-scores.component.tsx
│   │   └── replay-scores.component.test.tsx
│   └── replay-action-info/
│       ├── replay-action-info.component.tsx
│       └── replay-action-info.component.test.tsx
```

### Props

**`ReplayBoard`** (orchestrateur) :
```typescript
interface ReplayBoardProps {
    gameState: GameState;
    action: TurnAction | null;
    playerName: string;
}
```

**`ReplayGrid`** :
```typescript
interface ReplayGridProps {
    grid: GridCell[][];
}
```

**`ReplayDice`** :
```typescript
interface ReplayDiceProps {
    dices: Dice[];
}
```

**`ReplayScores`** :
```typescript
interface ReplayScoresProps {
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    currentTurn: PlayerKey;
}
```

**`ReplayActionInfo`** :
```typescript
interface ReplayActionInfoProps {
    action: TurnAction | null;
    playerName: string;
}
```

### Suppression

Les anciens composants `replay/components/replay-action/` (replay-roll, replay-lock, replay-choice, replay-grid, replay-defi, replay-predator, replay-action orchestrateur) sont supprimés — remplacés par le replay-board visuel.

---

## 4. Intégration dans le controller replay

### Parsing des turns

Le controller parcourt les turns par paires :
- `turns[i * 2]` = action (roll, lock, choice, etc.)
- `turns[i * 2 + 1]` = snapshot (GameState complet)

Le nombre de steps = `Math.floor(turns.length / 2)`.

### Layout du replay

```
┌─────────────────────────────────┐
│ ← Replay          (header)     │
├─────────────────────────────────┤
│ Tour 2/15    ████░░░  (counter) │
├─────────────────────────────────┤
│ J1 — Lancer de dés  (info bar) │
├─────────────────────────────────┤
│                                 │
│   Scores J1: 2  J2: 1          │
│   Jetons J1: 10/12  J2: 11/12  │
│                                 │
│   ┌───┬───┬───┬───┬───┐        │
│   │   │ ● │   │   │   │        │
│   ├───┼───┼───┼───┼───┤        │
│   │   │   │   │ ○ │   │  Grille│
│   ├───┼───┼───┼───┼───┤        │
│   │   │   │   │   │   │        │
│   ├───┼───┼───┼───┼───┤        │
│   │   │   │   │   │   │        │
│   ├───┼───┼───┼───┼───┤        │
│   │   │   │   │   │   │        │
│   └───┴───┴───┴───┴───┘        │
│                                 │
│   ⚁ ⚃ ⚁ ⚅ ⚂     (dés actifs) │
│                                 │
├─────────────────────────────────┤
│ ◄◄  |  ▶ Play  |  ►► (controls)│
└─────────────────────────────────┘
```

### Autoplay

Inchangé — avance `currentStep` toutes les 500ms (configurable). Le controller recalcule le bon index dans les turns à chaque step.

---

## 5. Tests (TDD)

### Backend
- `turn-recorder.service.test.ts` : vérifier que `recordGameState` après `recordAction` produit une alternance action/snapshot
- `game.handler.test.ts` : vérifier qu'un roll génère un snapshot avec le bon gameState

### Frontend — composants read-only (Red → Green → Blue)
- `replay-grid.test` : reçoit grille avec owners → affiche cellules colorées
- `replay-dice.test` : reçoit tableau de dés → affiche dots + locked
- `replay-scores.test` : reçoit scores/jetons → affiche les valeurs
- `replay-action-info.test` : reçoit action type → affiche le bon label et nom joueur
- `replay-board.test` : reçoit GameState → rend les 4 sous-composants

### Frontend — controller
- Mise à jour des tests existants pour parser les paires action/snapshot
- Vérifier que le board visuel s'affiche au lieu des anciens composants

---

## 6. Bug potentiel — compteur de steps

Bug signalé : le compteur afficherait un décalage (ex: 4/3 au lieu de 3/3, ou 1/3 au lieu de 0/3). À investiguer pendant l'implémentation avec un screenshot du cas concret. Le nouveau système de paires action/snapshot modifiera la logique d'indexation, ce qui devrait résoudre ou révéler ce bug.

---

## Hors scope

- Mode spectateur live (socket en temps réel)
- Optimisation de la taille des snapshots
- Timeline slider (remplacer les boutons par un slider)
- Annotations/commentaires sur les actions
