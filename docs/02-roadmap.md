# Roadmap — Yam Master

Priorisation basée sur la grille d'évaluation (14pts obligatoires + 6pts au choix).

---

## Phase 1 — Finition du moteur de jeu (6 pts) `TERMINÉE`

### 1.1 Correction des bugs existants `FAIT`
- [x] Fix shallow copy dans `GameService.init.gameState()` (objets partagés entre parties)
- [x] Fix réinitialisation de la grille au timeout (les pions posés disparaissent)
- [x] Remplacer timer hardcodé `5` par `END_TURN_DURATION`
- [x] Fix crash serveur en fin de partie (interval non nettoyé après splice)
- [x] Ajouter validation côté serveur (vérifier que c'est le tour du joueur qui émet)

### 1.2 Calcul des scores `FAIT`
- [x] Implémenter `GameService.grid.calculateScores(grid)` — détection des alignements 3, 4 et 5 pions (horizontal, vertical, diagonal)
- [x] Mettre à jour `player1Score` / `player2Score` dans le gameState après chaque pose
- [x] Émettre les scores aux clients via `game.score` + composants `<PlayerScore>` / `<OpponentScore>`

### 1.3 Gestion des 12 pions `FAIT`
- [x] Ajouter `player1Tokens: 12` et `player2Tokens: 12` dans gameState
- [x] Décrémenter le compteur à chaque pose de pion
- [x] Afficher le nombre de pions restants côté client via `<PlayerTokens>` / `<OpponentTokens>`

### 1.4 Détection de victoire `FAIT`
- [x] Vérifier après chaque pose : alignement de 5 → victoire instantanée
- [x] Vérifier après chaque pose : un joueur à 0 pions → fin de partie, comparaison des scores
- [x] Émettre `game.end` avec les données de résultat (vainqueur, scores, raison)

### 1.5 Écran de fin de partie `FAIT`
- [x] Écran "Résumé de la partie" dans `OnlineGameController` (vainqueur, perdant, scores, raison)
- [x] Workflow post-partie : bouton "Retour au menu" + bouton "Rejouer"
- [x] Affichage personnalisé victoire/défaite/nul par joueur (isWinner, isDraw, opponentName)

### 1.6 Défi et Yam Predator `FAIT`
- [x] Bouton "Défi" au 2e lancer → active le flag `isDefi`, recalcule les combinaisons
- [x] Yam Predator : bouton dans Choices quand Yam détecté → mode predator sur la Grid pour retirer un pion adverse

---

## Phase 2 — Mode VS Bot (8 pts) `TERMINÉE`

### 2.1 Factorisation du moteur `FAIT`
- [x] `createGameVsBot(playerSocket)` réutilise le même moteur que `createGame`
- [x] Bot implémenté comme un `EventEmitter` (faux socket) avec la même API WebSocket

### 2.2 Bot basique `FAIT`
- [x] `backend/services/bot.service.js` — logique externalisée (chooseBestCombination, chooseBestCell, chooseDicesToLock)
- [x] Le bot joue automatiquement à son tour via les mêmes événements que le client
- [x] Stratégie : priorise yam > carré > full > suite, verrouille les paires+

### 2.3 Frontend VsBot `FAIT`
- [x] `VsBotGameController` avec gestion game.start / game.end
- [x] Réutilise le composant `<Board>` existant
- [x] `VsBotGameScreen` branché sur le controller (plus de stub)
- [x] Écran de fin : "Vous" / "Bot", boutons Retour/Rejouer

### 2.4 (Optionnel) Niveaux de difficulté
- [ ] Facile : choix aléatoire
- [ ] Intermédiaire : privilégie les alignements
- [ ] Pro : stratégie optimale (maximise score + bloque adversaire)

---

## Phase 3 — Features au choix (6 pts) `TERMINÉE`

> Les **trois** options ont été implémentées.

### Option A — Auth + BDD + Sauvegarde `FAIT`
- [x] PostgreSQL + Prisma ORM
- [x] Login/Logout avec création auto si user inexistant
- [x] `<AuthScreen>` avec mode invité (guest)
- [x] Contexte utilisateur authentifié dans `<App>`
- [x] Sauvegarde des résultats de parties en BDD
- [x] Écran historique de parties avec navigation vers replay

### Option B — UI Premium (Neon Nocturne) `FAIT`
- [x] Refonte graphique complète — thème "Neon Nocturne" (dark bg, coral/cyan/gold)
- [x] Fonts Outfit (display) + Inter (body) via expo-font
- [x] Dés visuels avec dots et anneau doré de verrouillage
- [x] Glass morphism, LinearGradient buttons
- [x] Splash screen stylisé (mesh gradient, branding)
- [x] Bottom tab bar (Accueil / Règles)
- [x] Écrans redesignés : Auth, Home, Game Board, History, Replay, End Screen

### Option C — Replay de parties `FAIT`
- [x] Enregistrement des actions + snapshots GameState tour par tour (backend)
- [x] Controller replay avec navigation step-by-step
- [x] Autoplay (500ms) avec Play/Pause
- [x] Plateau visuel complet : grille avec pions, dés, scores, jetons
- [x] Compatibilité avec les anciennes parties (sans snapshots)

---

## Phase 4 — Bonus créatifs `EN COURS`

> Points bonus et différenciation.

### Réalisé
- [x] Page Règles du jeu — accordéon avec 6 sections, accessible via tab bar + modal en partie
- [x] Mode Ponder — animations step-by-step pour chaque section des règles (5 scènes : Dés, Combinaisons, Actions Spéciales, Grille, Scoring) avec autoplay hybride
- [x] Niveaux de difficulté bot — 3 stratégies (Débutant/Tactique/Maître IA) avec écran de sélection, stockage BDD et scoring intelligent (alignements + blocage)
- [x] Splash screen Neon Nocturne (mesh gradient, branding)
- [x] Bottom tab bar extensible (Accueil / Règles)
- [x] Versioning SemVer (frontend + backend v1.2.0)
- [x] README professionnel + licence GPL v3
- [x] CI/CD GitHub Actions par environnement (develop, recette, main)

### À faire
- [ ] Leaderboard (classement global)
- [ ] Profil joueur (stats, avatar)
- [ ] Mode classé MMR (score Elo, classement des joueurs)
- [ ] Notifications mobiles natives (tour adverse terminé)
- [ ] Interface Shi/Fu/Mi pour déterminer qui commence

---

## Progression

```
Phase 1    Moteur de jeu           ██████████  FAIT
Phase 2    Mode VS Bot             ██████████  FAIT
Phase 3A   Auth + BDD              ██████████  FAIT
Phase 3B   UI Neon Nocturne        ██████████  FAIT
Phase 3C   Replay de parties       ██████████  FAIT
Phase 4    Bonus créatifs          ████████░░  EN COURS
```

Approche **TDD** (Red → Green → Blue) et **gitflow** strict sur toutes les phases.
