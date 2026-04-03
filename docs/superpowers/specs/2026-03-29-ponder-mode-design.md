# Mode Ponder — Spec de design

## Objectif

Ajouter un mode "Ponder" (inspiré de Minecraft Create Mod) aux règles du jeu : des animations step-by-step visuelles montrant le fonctionnement du jeu. Chaque section accordéon a un bouton "Voir en action" qui ouvre une modal plein écran avec une scène animée.

## Approche technique

**State-driven avec setTimeout** : chaque étape est un état React. Un timer avance l'étape courante. Les composants se rendent conditionnellement selon l'étape. Les "animations" sont des transitions de style (opacité, couleur, apparition de composants). Pas de dépendance externe (pas de Animated API, pas de Lottie).

**Contrôles hybrides** : autoplay par défaut (timer qui avance selon la durée de chaque step), avec navigation manuelle (Prev/Next, timeline dots cliquables, Play/Pause).

## Architecture

### Modèle de données

```typescript
interface PonderStep {
    label: string;        // "Lancer les dés"
    description: string;  // Texte explicatif affiché sous la scène
    duration: number;     // ms avant auto-advance (ex: 2000)
}

interface PonderSceneConfig {
    id: string;           // "dice", "combinations", etc.
    title: string;        // "Les Dés"
    icon: string;         // "🎲"
    steps: PonderStep[];
}
```

### Structure Feature-Sliced

```
frontend/src/features/rules/components/
└── ponder/
    ├── ponder-modal/
    │   └── ponder-modal.component.tsx        # Modal plein écran
    │   └── ponder-modal.component.test.tsx
    ├── ponder-controls/
    │   └── ponder-controls.component.tsx     # Play/Pause, timeline, Prev/Next
    │   └── ponder-controls.component.test.tsx
    ├── ponder-scene/
    │   └── ponder-scene.component.tsx        # Router vers la bonne scène
    │   └── ponder-scene.component.test.tsx
    └── scenes/
        ├── dice-scene.component.tsx          # 🎲 Un tour de jeu
        ├── dice-scene.component.test.tsx
        ├── combinations-scene.component.tsx  # 🃏 Les combinaisons
        ├── combinations-scene.component.test.tsx
        ├── special-scene.component.tsx       # ⚡ Actions spéciales
        ├── special-scene.component.test.tsx
        ├── grid-scene.component.tsx          # 📐 La grille & pions
        ├── grid-scene.component.test.tsx
        ├── scoring-scene.component.tsx       # 🏆 Scoring & victoire
        └── scoring-scene.component.test.tsx
```

### Fichiers modifiés

- `frontend/src/features/rules/components/rules-content/rules-content.component.tsx` — Ajouter bouton "Voir en action" dans chaque section + state pour ouvrir le PonderModal
- `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx` — Tests pour le bouton Ponder

## Composants

### PonderModal

Modal React Native plein écran. Reçoit :
- `visible: boolean`
- `onClose: () => void`
- `sceneId: string` — quelle scène afficher ("dice", "combinations", etc.)

Contenu :
- Header avec titre de la scène (icon + title) et bouton fermer (✕)
- Zone scène (PonderScene)
- Zone contrôles (PonderControls)
- Fond `colors.background`

Gère l'état interne :
- `currentStep: number` (0-indexed)
- `isPlaying: boolean` (true par défaut)
- Timer via `useEffect` + `setTimeout` qui avance `currentStep` de 1 quand `isPlaying` est true, avec la durée du step courant
- Quand `currentStep` atteint le dernier step, l'autoplay s'arrête (isPlaying = false)
- Fonctions : `goToStep(n)`, `nextStep()`, `prevStep()`, `togglePlay()`

### PonderControls

Contrôles de navigation. Reçoit :
- `currentStep: number`
- `totalSteps: number`
- `isPlaying: boolean`
- `onTogglePlay: () => void`
- `onNext: () => void`
- `onPrev: () => void`
- `onGoToStep: (step: number) => void`

Affiche :
- Timeline dots : un dot par step. Le step actif est un pill allongé en `colors.primary`. Les steps passés sont des dots `colors.primary` à 30% opacité. Les steps futurs sont des dots gris. Chaque dot est cliquable.
- Boutons : ◀ Prev | ▶⏸ Play/Pause (plus gros, centré) | ▶ Next
- Compteur : "Étape X / Y" en petit sous les boutons

Style : Prev/Next sont des cercles gris (`colors.glass`), Play/Pause est un cercle plus grand avec bordure coral.

### PonderScene

Router qui rend la bonne scène selon `sceneId`. Reçoit :
- `sceneId: string`
- `currentStep: number`

Mappe vers le bon composant scène : dice → DiceScene, combinations → CombinationsScene, etc.

### Scènes individuelles

Chaque scène reçoit `currentStep: number` en prop et rend le visuel correspondant à cette étape. Le visuel change par conditions sur `currentStep`.

#### DiceScene — 🎲 "Un tour de jeu" (5 steps, ~2s chacun)

| Step | Label | Visuel |
|------|-------|--------|
| 0 | Premier lancer | 5 dés apparaissent avec des valeurs (3, 5, 5, 2, 6) |
| 1 | Verrouiller les dés | Les dés 5 et 5 reçoivent une bordure dorée + icône lock |
| 2 | Deuxième lancer | Les 3 dés non-verrouillés changent de valeur (4, 5, 5, 5, 1) |
| 3 | Verrouiller encore | Le dé 5 supplémentaire reçoit la bordure dorée |
| 4 | Dernier lancer | Les 2 non-verrouillés changent → résultat final (5, 5, 5, 5, 3) → badge "Carré !" |

Réutilise le composant `Dice` existant (`features/game/components/board/dice/die.component.tsx`) en mode lecture seule (pas de onPress).

#### CombinationsScene — 🃏 "Les combinaisons" (6 steps, ~2s chacun)

| Step | Label | Visuel |
|------|-------|--------|
| 0 | Brelan | 5 dés dont 3 identiques (3,3,3,1,5) — les 3 identiques sont mis en évidence |
| 1 | Full | 5 dés (2,2,2,4,4) — brelan + paire mis en évidence |
| 2 | Carré | 5 dés (6,6,6,6,2) — 4 identiques en évidence |
| 3 | Yam | 5 dés (1,1,1,1,1) — tous identiques, effet spécial (bordure dorée sur tous) |
| 4 | Suite | 5 dés (1,2,3,4,5) — tous en évidence, ordonnés |
| 5 | ≤8 | 5 dés (1,1,2,2,1) — somme affichée "= 7 ≤ 8" |

Les dés "mis en évidence" ont une bordure `colors.primary`. Les autres sont atténués (opacité réduite). Le nom de la combinaison s'affiche en gros sous les dés.

#### SpecialScene — ⚡ "Actions spéciales" (3 steps, ~3s chacun)

| Step | Label | Visuel |
|------|-------|--------|
| 0 | Sec | 5 dés (2,2,2,4,4) apparaissent d'un coup → badge "SEC !" doré → texte "Full réussi au 1er lancer !" |
| 1 | Défi | 5 dés + badge "DÉFI" coral → texte "Le joueur annonce un défi. Il doit réussir une combinaison en 2 lancers restants." |
| 2 | Yam Predator | 5 dés identiques (4,4,4,4,4) → badge "YAM PREDATOR" rouge → mini-grille avec un pion cyan qui disparaît |

#### GridScene — 📐 "La grille & pions" (4 steps, ~2.5s chacun)

| Step | Label | Visuel |
|------|-------|--------|
| 0 | La grille | Mini-grille 5×5 vide apparaît avec les labels de combinaisons |
| 1 | Combinaison réussie | 2-3 cases de la grille s'illuminent (bordure brillante) — texte "Cases disponibles pour votre combinaison" |
| 2 | Poser un pion | Une case illuminée reçoit un pion coral — les autres s'éteignent |
| 3 | Tour de l'adversaire | Une autre case reçoit un pion cyan — texte "Chaque joueur joue à tour de rôle" |

La mini-grille est un composant simplifié (pas le composant Grid du jeu, trop connecté). Juste un tableau 5×5 avec des cases colorées.

#### ScoringScene — 🏆 "Scoring & victoire" (3 steps, ~3s chacun)

| Step | Label | Visuel |
|------|-------|--------|
| 0 | 3 pions alignés | Mini-grille avec 3 pions coral alignés horizontalement → la ligne s'illumine → "+1 point" |
| 1 | 4 pions alignés | 4 pions alignés en diagonale → "+2 points" |
| 2 | Victoire ! | 5 pions alignés verticalement → effet spécial → "VICTOIRE INSTANTANÉE" en gros |

## Modifications sur RulesContent

Ajouter dans chaque section accordéon un bouton "Voir en action" en bas du contenu :

```
[▶ Voir en action]
```

Style : pill avec bordure `colors.blue`, texte cyan, fond transparent. Au clic, ouvre le PonderModal avec le `sceneId` correspondant.

State ajouté dans RulesContent :
- `ponderSceneId: string | null` — null quand fermé, "dice"/"combinations"/etc. quand ouvert

## Style

Cohérent avec le thème Neon Nocturne :
- Fond modal : `colors.background`
- Zone scène : glass card (`colors.glass` + `colors.border`)
- Badges/labels : fond teinté + bordure de la couleur d'accent
- Dés : réutilisation du composant Dice existant
- Contrôles : cercles glass pour Prev/Next, cercle coral pour Play/Pause
- Timeline : dots `colors.primary` (actif), gris (futur)

## Tests

Chaque composant a son fichier de test :
- PonderModal : s'ouvre/se ferme, affiche le titre de la scène, avance automatiquement
- PonderControls : Play/Pause toggle, Next/Prev callbacks, dots cliquables, compteur affiché
- PonderScene : rend la bonne scène selon sceneId
- Chaque scène : rend le visuel correct pour chaque step (vérifier les textes/labels)
- RulesContent : le bouton "Voir en action" ouvre le PonderModal
