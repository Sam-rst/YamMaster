# Roadmap — Yam Master

Priorisation basée sur la grille d'évaluation (14pts obligatoires + 6pts au choix).

---

## Phase 1 — Finition du moteur de jeu (6 pts) `TERMINÉE`

### 1.1 Correction des bugs existants `FAIT`
- [x] Fix shallow copy dans `GameService.init.gameState()` (objets partagés entre parties)
- [x] Fix réinitialisation de la grille au timeout (les pions posés disparaissent)
- [x] Remplacer timer hardcodé `5` par `END_TURN_DURATION`
- [x] Fix crash serveur en fin de partie (interval non nettoyé après splice)
- [ ] Ajouter validation côté serveur (vérifier que c'est le tour du joueur qui émet)

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

## Phase 3 — Feature au choix (6 pts) `PRIORITÉ HAUTE`

> Au moins **une** des options suivantes à implémenter.

### Option A — Auth + BDD + Sauvegarde
- [ ] Choisir et mettre en place la BDD (SQLite local ou MongoDB Docker)
- [ ] Implémenter Login/Logout (création auto si user inexistant)
- [ ] Créer `<AuthScreen>` côté frontend
- [ ] Ajouter contexte utilisateur authentifié dans `<App>`
- [ ] Sauvegarder les résultats de parties en BDD
- [ ] Écran historique de parties pour l'utilisateur connecté

### Option B — UI Premium
- [ ] Refonte graphique complète (thème cohérent, palette de couleurs, typographie)
- [ ] Animations de dés (rotation, rebond)
- [ ] Animations de pose de pions
- [ ] Effets visuels sur les alignements (glow, pulse)
- [ ] Écran d'attente stylisé
- [ ] Responsive et soigné sur mobile

### Option C — Replay de parties
- [ ] Enregistrer chaque action (tour par tour) dans un historique
- [ ] Interface de replay avec contrôles (suivant, précédent, play/pause)
- [ ] Afficher la grille et les dés à chaque étape

---

## Phase 4 — Bonus créatifs `PRIORITÉ BASSE`

> Points bonus et différenciation. À traiter uniquement si les phases 1–3 sont solides.

- [ ] Mode classé MMR (score Elo, classement des joueurs)
- [ ] Données interactives (joueurs en ligne, ratio victoires/défaites)
- [ ] Bouton modal "Règles du jeu" accessible pendant la partie
- [ ] Notifications mobiles natives (tour adverse terminé)
- [ ] Interface Shi/Fu/Mi pour déterminer qui commence
- [ ] Grille étendue / mode 4 joueurs

---

## Progression

```
Phase 1.1  Corrections bugs       ██████████  FAIT
Phase 1.2  Scores                 ██████████  FAIT
Phase 1.3  12 pions               ██████████  FAIT
Phase 1.4  Victoire               ██████████  FAIT
Phase 1.5  Écran fin              ██████████  FAIT
Phase 2.1  Factorisation moteur   ██████████  FAIT
Phase 2.2  Bot basique            ██████████  FAIT
Phase 2.3  Frontend VsBot         ██████████  FAIT
Phase 3    Feature au choix       ░░░░░░░░░░  À FAIRE
Phase 4    Bonus                  ░░░░░░░░░░  À FAIRE
```

Approche **TDD** : chaque tâche commence par l'écriture de tests avant l'implémentation.
