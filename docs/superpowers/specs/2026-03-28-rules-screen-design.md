# Écran Règles du Jeu — Spec de design

## Objectif

Créer un écran "Règles du jeu" complet et extensible pour YamMaster, accessible via une bottom tab bar et en modal pendant les parties. L'écran sert de référence complète pour les nouveaux joueurs : chaque règle, exception et cas particulier est documenté.

## Architecture

### Navigation — Bottom Tab Bar

Remplacer le `StackNavigator` principal par un `BottomTabNavigator` (`@react-navigation/bottom-tabs`) contenant les onglets principaux. Les écrans de jeu, replay, etc. restent dans un stack imbriqué.

| Icône Feather | Label | Écran |
|---------------|-------|-------|
| `home` | Accueil | HomeScreen |
| `book-open` | Règles | RulesScreen |

**Style Neon Nocturne** : fond `colors.background`, icône/label active en `colors.primary` (coral), inactive en `colors.textSecondary` (gris), bordure top `colors.border`.

**Extensibilité** : ajouter un onglet = ajouter une entrée dans le tab navigator (Leaderboard, Profil, etc.).

Les écrans non-tab (OnlineGameScreen, VsBotGameScreen, HistoryScreen, ReplayScreen) sont dans un stack imbriqué sous l'onglet Home, avec `tabBarStyle: { display: 'none' }` sur ces écrans pour masquer la tab bar.

### Accès modal en partie

Un bouton icône `book-open` (Feather) dans le header/footer du Board ouvre une `Modal` React Native overlay avec le même contenu que RulesScreen. Le composant de contenu des règles est partagé entre l'écran et la modal (composant `RulesContent`).

## Feature : rules

Structure Feature-Sliced :

```
frontend/src/features/rules/
├── screens/
│   └── rules.screen.tsx          # Écran principal (tab)
├── components/
│   └── rules-content/
│       └── rules-content.component.tsx   # Contenu partagé (écran + modal)
│   └── rules-section/
│       └── rules-section.component.tsx   # Accordéon item réutilisable
│   └── rules-modal/
│       └── rules-modal.component.tsx     # Modal overlay pour en partie
```

## Composants

### RulesContent

Composant principal contenant l'intro + les sections accordéon. Utilisé par RulesScreen (plein écran) et RulesModal (overlay).

**Intro fixe** (toujours visible en haut) :
- Icône 🎲
- Titre "YAM MASTER" en uppercase, font Outfit
- Description : "Jeu de dés pour 2 joueurs. Lancez les dés, formez des combinaisons et posez vos pions sur la grille 5×5. Gagnez par alignement de 5 pions ou par accumulation de points."

**Sections accordéon** : liste de `RulesSection` repliables. Une seule section ouverte à la fois (les autres se ferment automatiquement).

### RulesSection

Composant accordéon réutilisable. Props :
- `icon: string` — emoji de la section
- `title: string` — titre affiché
- `isOpen: boolean` — état ouvert/fermé
- `onToggle: () => void` — callback pour ouvrir/fermer
- `children: ReactNode` — contenu de la section

**Style** : glass card (`colors.glass`), bordure `colors.border` quand fermé, bordure `colors.primary` avec fond teinté quand ouvert. Chevron ▶/▼ à droite.

### RulesModal

Modal React Native en overlay. Fond semi-transparent, contenu scrollable avec `RulesContent`, bouton fermer (icône `x`) en haut à droite.

## Sections de contenu

### 1. Objectif du jeu (intro fixe, pas dans l'accordéon)

Texte court expliquant le concept : 2 joueurs, tour par tour, 5 dés, grille 5×5. Deux conditions de victoire : alignement de 5 pions (victoire instantanée) ou plus de points quand les pions sont épuisés.

### 2. 🎲 Les Dés

- 5 dés par joueur
- Jusqu'à 3 lancers par tour
- Entre chaque lancer, possibilité de verrouiller/déverrouiller des dés individuellement
- Un dé verrouillé peut être déverrouillé aux lancers suivants
- Note : chaque joueur dispose de 12 pions en début de partie

### 3. 🃏 Les Combinaisons

Tableau complet avec description et exemple de dés pour chaque combinaison :

| Combinaison | Description | Exemple |
|-------------|-------------|---------|
| Brelan | 3 dés identiques | ⚂⚂⚂⚄⚁ |
| Full | 1 brelan + 1 paire | ⚂⚂⚂⚄⚄ |
| Carré | 4 dés identiques | ⚂⚂⚂⚂⚄ |
| Yam | 5 dés identiques | ⚂⚂⚂⚂⚂ |
| Suite | 1-2-3-4-5 ou 2-3-4-5-6 | ⚀⚁⚂⚃⚄ |
| ≤8 | Somme des 5 dés ≤ 8 | ⚀⚀⚁⚁⚂ |

**Note importante** : un même lancer peut correspondre à plusieurs combinaisons. Un Yam est aussi un Brelan, un Carré et un Full. Le joueur choisit laquelle utiliser. Le Brelan s'associe à la valeur du dé (case 1 à 6 de la grille).

### 4. ⚡ Actions Spéciales

**Sec** : réaliser une combinaison (sauf Brelan) dès le 1er lancer, sans relancer. Donne accès à des cases bonus sur la grille.

**Défi** : avant le 2e lancer, le joueur annonce un défi. Il doit réaliser une combinaison (sauf Brelan) dans les 2 lancers restants. Il ne s'engage pas sur une figure précise. Si réussi, donne accès à des cases bonus.

**Yam Predator** : réaliser un Yam permet de retirer un pion adverse de la grille au lieu de poser un des siens. Action offensive puissante.

### 5. 📐 La Grille & les Pions

- Grille 5×5 avec des cases correspondant aux combinaisons
- Chaque joueur a 12 pions en début de partie
- Quand un joueur réussit une combinaison, il peut poser un pion sur une case libre correspondante
- Les cases sont associées à des combinaisons spécifiques (lignes = valeurs de dé pour Brelan, colonnes = types de combinaison)
- On ne peut poser que sur une case libre correspondant à la combinaison réalisée

### 6. 🏆 Scoring & Victoire

**Points par alignement** :
- 3 pions alignés (horizontal, vertical ou diagonal) = 1 point
- 4 pions alignés = 2 points
- 5 pions alignés = **victoire instantanée**

**Fin de partie** :
- Un joueur aligne 5 pions → victoire instantanée
- Un joueur n'a plus de pions → le joueur avec le plus de points gagne
- En cas d'égalité de points → match nul

## Intégration dans App.tsx

### Avant (Stack seul)
```
StackNavigator
├── AuthScreen
├── HomeScreen
├── OnlineGameScreen
├── VsBotGameScreen
├── HistoryScreen
└── ReplayScreen
```

### Après (Tab + Stack imbriqué)
```
AuthScreen (hors tab, écran racine)
└── BottomTabNavigator
    ├── Tab "Accueil" → HomeStack
    │   ├── HomeScreen
    │   ├── OnlineGameScreen (tab bar masquée)
    │   ├── VsBotGameScreen (tab bar masquée)
    │   ├── HistoryScreen (tab bar masquée)
    │   └── ReplayScreen (tab bar masquée)
    └── Tab "Règles" → RulesScreen
```

## Phase 2 (hors scope)

Mode Ponder : bouton "Voir en action" dans chaque section accordéon ouvrant une vue plein écran avec animations step-by-step. Chaque section aura sa mini-démo animée. Fera l'objet d'une spec séparée.

## Style

Thème Neon Nocturne cohérent avec le reste de l'app :
- Fond : `colors.background` (#1a1a2e)
- Cards : `colors.glass` avec `colors.border`
- Texte principal : `colors.textPrimary`
- Texte secondaire : `colors.textSecondary`
- Accents : `colors.primary` (coral), `colors.accent` (cyan), `colors.secondary` (gold)
- Fonts : Outfit (titres), Inter (corps)
- Notes/exceptions : bloc avec `border-left` gold + fond subtil
