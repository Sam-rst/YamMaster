# Audit de l'existant

État des lieux du code au commit `6e37c00` (branche `main`).

## Résumé

Le socle fournit un mode en ligne fonctionnel mais **incomplet** : les dés, le verrouillage, la détection de combinaisons et la pose de pions sur la grille marchent. En revanche, aucune logique de score, de victoire, de persistance ou d'authentification n'existe.

---

## Matrice de couverture

| Feature | Statut | Fichiers concernés | Détails |
|---------|--------|--------------------|---------|
| Lancer de dés (jusqu'à 3 lancers) | FAIT | `game.service.js` (dices.roll) | Fonctionne correctement |
| Verrouillage/déverrouillage des dés | FAIT | `game.service.js` (dices.lock) | OK |
| Détection des combinaisons | FAIT | `game.service.js:253-323` | Brelan, Full, Carré, Yam, Suite, ≤8, Sec détectés |
| Combinaison "Défi" | PARTIEL | `game.service.js:309` | Le flag `isDefi` existe mais n'est jamais activé côté serveur/client |
| Combinaison "Sec" | FAIT | `game.service.js:316-319` | Détecté au 1er lancer uniquement |
| Pose de pions sur la grille | FAIT | `game.service.js` (grid.selectCell) | Case marquée avec `owner` |
| **Calcul des scores** (alignements) | **NON** | `index.js:226` | `// TODO: Here calcul score` |
| **Gestion des 12 pions** | **NON** | — | Aucun compteur de pions |
| **Détection de victoire** | **NON** | `index.js:227` | `// TODO: Then check if a player win` |
| **Yam Predator** | **NON** | — | Aucune logique pour retirer un pion adverse |
| **Écran résumé fin de partie** | **NON** | — | Pas d'événement `game.end` émis |
| **Mode VS Bot** | **NON** | `vs-bot-game.screen.js` | Écran stub (texte "VsBot Game Interface" uniquement) |
| **Authentification** | **NON** | — | Pas de `<AuthScreen>`, pas de contexte utilisateur |
| **Base de données** | **NON** | — | Tout en mémoire (arrays globaux `games[]`, `queue[]`) |
| **Sauvegarde de parties** | **NON** | — | Aucune persistance |
| **Reprise de partie** | **NON** | — | Pas de reconnexion, pas de restauration d'état |
| **Replay de parties** | **NON** | — | |
| **UI avancée** | **NON** | `player-score.component.js` | Composants score/infos en placeholder (texte brut) |

---

## Points de dette technique identifiés

### Backend

1. **`game.service.js:94-98`** — `GameService.init.gameState()` utilise le spread `{ ...GAME_INIT }` mais c'est un **shallow copy** : `gameState`, `deck`, `choices` sont partagés entre les parties. La grille est corrigée avec `map` mais les autres objets ne le sont pas.

2. **`index.js:98`** — Au changement de tour sur timeout, la grille est **réinitialisée** (`GameService.init.grid()`) au lieu de conserver les pions déjà posés. Bug critique : les pions posés disparaissent à chaque fin de tour par timeout.

3. **`index.js:186`** — Au dernier lancer, le timer est hardcodé à 5 secondes (`games[gameIndex].gameState.timer = 5`) au lieu d'utiliser `END_TURN_DURATION`.

4. **`index.js:109-116`** — La déconnexion d'un joueur clear l'interval mais ne notifie pas l'autre joueur (`game.opponent.leave` n'est pas émis) et ne nettoie pas l'entrée dans `games[]`.

5. **Pas de validation côté serveur** — Le serveur ne vérifie pas que c'est bien le tour du joueur qui émet un événement (un joueur pourrait tricher).

### Frontend

6. **`online-game.controller.js:20`** — `setInQueue(false)` est appelé immédiatement après `socket.emit("queue.join")`, ce qui devrait être `true` en attendant la réponse.

7. **Composants score** (`player-score.component.js`, `opponent-score.component.js`) — Sont des placeholders, n'affichent aucune donnée réelle.

8. **Pas de cleanup des listeners Socket.IO** — Les `useEffect` n'ont pas de fonction de nettoyage, ce qui peut causer des fuites mémoire et des listeners dupliqués.

---

## Conclusion

Le socle couvre environ **30%** des fonctionnalités demandées. Le moteur de jeu (combinaisons, dés, grille) est fonctionnel mais la boucle de jeu est incomplète (pas de score, pas de fin de partie). Tout le reste (auth, BDD, bot, sauvegarde) est à construire from scratch.
