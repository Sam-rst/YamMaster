# Cahier des charges — Yam Master

## 1. Règles du jeu

### 1.1 But du jeu

Marquer plus de points que son adversaire, **ou** réaliser un alignement de **5 pions** (horizontal, vertical ou diagonal) pour une victoire instantanée.

### 1.2 Déroulement d'un tour

- Jeu pour **2 joueurs**, **5 dés**, au **tour par tour**.
- À son tour, un joueur peut lancer les dés jusqu'à **3 fois**.
- Après chaque lancer, il peut **écarter** (verrouiller) des dés et relancer les autres. Un dé écarté peut être relancé aux lancers suivants.
- Chaque joueur dispose de **12 pions** en début de partie.

### 1.3 Combinaisons

| Combinaison | Description |
|-------------|-------------|
| **Brelan** | 3 dés identiques (case correspondant à la valeur : 1–6) |
| **Full** | 1 brelan + 1 paire |
| **Carré** | 4 dés identiques |
| **Yam** | 5 dés identiques |
| **Suite** | 1-2-3-4-5 ou 2-3-4-5-6 |
| **≤8** | Somme des dés ≤ 8 |
| **Sec** | Une combinaison (sauf brelan) réalisée dès le 1er lancer |
| **Défi** | Avant le 2e lancer, le joueur annonce un défi. Il doit réaliser une combinaison (sauf brelan) dans les 2 lancers restants, sans s'engager sur une figure précise. |

Un même lancer peut correspondre à plusieurs combinaisons (ex : un Yam est aussi un Brelan, un Carré et un Full). Le joueur choisit laquelle utiliser.

### 1.4 Pose de pions et grille

- Quand un joueur réussit une combinaison, il **peut** poser un pion sur une case libre correspondante de la grille 5×5.
- **Yam Predator** : réaliser un Yam permet de **retirer un pion adverse** au lieu de poser un des siens.

### 1.5 Décompte des points

| Alignement | Points |
|------------|--------|
| 3 pions alignés | 1 point |
| 4 pions alignés | 2 points |
| 5 pions alignés | **Victoire instantanée** |

### 1.6 Fin de partie

La partie se termine quand :
1. Un joueur réalise un **alignement de 5 pions** → victoire instantanée.
2. Un joueur n'a **plus de pions** → le joueur avec le plus de points gagne.

---

## 2. Spécifications techniques

### 2.1 Frontend

- **Stack** : Expo / React Native
- **Setup dev** : Web / Android Studio / QR Code vers mobile physique
- **Écrans** :
  - `<App>` — Conteneur principal + contexte utilisateur
  - `<MenuScreen>` — Boutons vers les modes de jeu et paramètres
  - `<OnlineGameScreen>` — Mode de jeu en ligne
  - `<VsBotGameScreen>` — Mode de jeu contre l'ordinateur
  - `<AuthScreen>` — Écran d'authentification
- **Architecture des écrans de jeu** : Chaque écran délègue à un `Controller` (ex: `OnlineGameController`) qui instancie un composant `<Board>`. Le `<Board>` orchestre les sous-composants graphiques interactifs.
- **Sous-composants de `<Board>`** :
  - `<OpponentInfos>`, `<OpponentTimer>`, `<OpponentScore>`, `<OpponentDeck>`
  - `<Grid>`, `<Choices>`
  - `<DeckPlayer>`, `<PlayerInfos>`, `<PlayerTimer>`, `<PlayerScore>`
- **Librairies** : `socket.io-client`, `@react-navigation`

### 2.2 Backend — 3 entités serveurs

#### WebSocket Server — Game Manager (stack imposée)
- Express / Node.js + `socket.io` + `uniqid`
- Gère la file d'attente, les parties, le timer, les tours.
- **Protocole WebSocket** :

| Direction | Événement | Description |
|-----------|-----------|-------------|
| Client → Server | `queue.join` | Rejoindre la file d'attente |
| Client → Server | `disconnect` | Déconnexion |
| Client → Server | `game.leave` | Quitter la partie |
| Client → Server | `game.end-turn` | Fin de tour |
| Client → Server | `game.dices.roll` | Lancer les dés |
| Client → Server | `game.dices.lock` | Verrouiller/déverrouiller un dé |
| Client → Server | `game.choices.selected` | Sélectionner une combinaison |
| Client → Server | `game.grid.selected` | Sélectionner une case de la grille |
| Server → Client | `queue.added` | Ajouté en file d'attente |
| Server → Client | `game.start` | Début de partie |
| Server → Client | `game.end` | Fin de partie |
| Server → Client | `game.timer` | Mise à jour du timer (chaque seconde) |
| Server → Client | `game.opponent.leave` | Adversaire déconnecté |

#### Database Server — Stockage Service (stack au choix)
- Peut être intégré au serveur Express ou externalisé en API REST.
- Minimum requis : sauvegarde des parties + authentification.

#### BOT Server — BOT Game Manager (stack au choix)
- Communique via WebSocket avec le Game Manager.
- Interagit via la **même API WebSocket** que le client (permet la participation au tournoi).
- Logique clairement externalisée du moteur de jeu.

### 2.3 Flux d'une partie en ligne

1. Client1 → `queue.join`
2. Client2 → `queue.join`
3. Server → `queue.added` (si un seul en file) ou `game.start` (si deux joueurs)
4. Server → `game.timer` chaque seconde pendant toute la partie
5. Clients écoutent et interagissent : `game.dices.roll`, `game.dices.lock`, `game.choices.selected`, `game.grid.selected`
6. Server met à jour le modèle de jeu, émet les mises à jour de vues aux deux clients
7. Server → `game.end` quand victoire/défaite détectée

---

## 3. Fonctionnalités demandées

### 3.1 Obligatoires

- Moteur de jeu complet et validation de toutes les combinaisons
- Finalisation du mode de jeu en ligne
- Reprise de la partie en cours si navigation dans l'application
- Sauvegarde des parties
- Login / Logout (création auto si utilisateur non trouvé)
- Contexte utilisateur authentifié côté Frontend + historique de parties
- Mode de jeu "Vs Bot"

### 3.2 Complexes (au moins 1 parmi 3)

1. 3 niveaux de difficulté VsBot (Facile / Intermédiaire / Pro)
2. Replay des parties tour par tour
3. Amélioration significative de l'interface graphique ("effet whouaaaaaa")

### 3.3 Créatives (non obligatoires)

- Mode classé MMR pour les parties en ligne
- Grille plus grande et mode 4 joueurs
- Animation graphique des dés
- Données interactives (joueurs en ligne, ratio victoires/défaites)
- Bouton modal pour afficher les règles en cours de partie
- Notifications mobiles natives (tour de l'adversaire terminé)
- Interface Shi/Fu/Mi pour déterminer qui commence

---

## 4. Contraintes

- **Tout le projet doit s'exécuter en local** (serveurs locaux ou accessibles en ligne).
- Projet GitHub public avec README professionnel (stack technique, lancement, architecture).
