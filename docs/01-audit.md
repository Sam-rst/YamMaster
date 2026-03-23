# Audit de l'existant

État des lieux initial au commit `6e37c00`, mis à jour au commit `7437217`.

## Résumé

Le moteur de jeu est désormais **fonctionnel** : combinaisons, scores par alignements, gestion des 12 pions, détection de victoire et écran de fin de partie sont implémentés. Le mode en ligne fonctionne de bout en bout. Les bugs critiques du socle initial ont été corrigés. Il reste le mode VS Bot, l'authentification, la persistance et les features au choix.

---

## Matrice de couverture

| Feature | Statut | Fichiers concernés | Détails |
|---------|--------|--------------------|---------|
| Lancer de dés (jusqu'à 3 lancers) | FAIT | `game.service.js` (dices.roll) | Fonctionne correctement |
| Verrouillage/déverrouillage des dés | FAIT | `game.service.js` (dices.lock) | OK |
| Détection des combinaisons | FAIT | `game.service.js` (choices.findCombinations) | Brelan, Full, Carré, Yam, Suite, ≤8, Sec détectés |
| Combinaison "Défi" | PARTIEL | `game.service.js` | Le flag `isDefi` existe mais n'est jamais activé côté client |
| Combinaison "Sec" | FAIT | `game.service.js` | Détecté au 1er lancer uniquement |
| Pose de pions sur la grille | FAIT | `game.service.js` (grid.selectCell) | Case marquée avec `owner` |
| Calcul des scores (alignements) | FAIT | `game.service.js` (grid.calculateScores) | Alignements H/V/D : 3→1pt, 4→2pts, 5→Infinity |
| Gestion des 12 pions | FAIT | `game.service.js` + `index.js` | Décrément à chaque pose, affiché côté client |
| Détection de victoire | FAIT | `game.service.js` (game.checkVictory) | 5 alignés ou 0 pions |
| Émission `game.end` | FAIT | `index.js` | Émet aux deux joueurs + cleanup interval + splice |
| Écran résumé fin de partie | FAIT | `online-game.controller.js` | Vainqueur, scores, raison, boutons Retour/Rejouer |
| Affichage scores et jetons | FAIT | `player-score`, `opponent-score`, `player-tokens`, `opponent-tokens` | Via événement `game.score` |
| Yam Predator | NON | — | Aucune logique pour retirer un pion adverse |
| **Mode VS Bot** | **NON** | `vs-bot-game.screen.js` | Écran stub uniquement |
| **Authentification** | **NON** | — | Pas de `<AuthScreen>`, pas de contexte utilisateur |
| **Base de données** | **NON** | — | Tout en mémoire |
| **Sauvegarde de parties** | **NON** | — | Aucune persistance |
| **Reprise de partie** | **NON** | — | Pas de reconnexion |
| **Replay de parties** | **NON** | — | |
| **UI avancée** | **NON** | — | Styles basiques |

---

## Bugs corrigés depuis le socle initial

| Bug | Commit | Détails |
|-----|--------|---------|
| Shallow copy `gameState` | `1c449dd` | `GAME_INIT` remplacé par deep copy dans `init.gameState()` |
| Grille réinitialisée au timeout | `1c449dd` | `init.grid()` remplacé par `resetcanBeCheckedCells()` |
| Timer hardcodé à 5 | `1c449dd` | Remplacé par `END_TURN_DURATION` |
| Crash serveur en fin de partie | `7437217` | `setInterval` stocké dans `game.gameInterval`, nettoyé avant `splice` |

## Dette technique restante

1. **Pas de validation côté serveur** — Le serveur ne vérifie pas que c'est bien le tour du joueur qui émet.
2. **Pas de cleanup des listeners Socket.IO** — Les `useEffect` frontend n'ont pas de fonction de nettoyage.
3. **Déconnexion adverse** — `game.opponent.leave` n'est pas émis, la partie reste en mémoire.

---

## Couverture de tests

| Cible | Tests | Couverture Stmts |
|-------|-------|-----------------|
| Backend (`game.service.js`) | 89 | 100% |
| Frontend (composants + screens + controllers) | 46 | 96.15% |
| **Total** | **135** | **> 90%** |
