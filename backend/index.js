// backend/index.js

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const EventEmitter = require('events');
const GameService = require('./services/game.service');
const BotService = require('./services/bot.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
  game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
  }, 200);
}

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
    game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
  }, 200)
}

const updateClientsViewScores = (game) => {
  game.player1Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:1', game.gameState));
  game.player2Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:2', game.gameState));
};

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const createGame = (player1Socket, player2Socket) => {

  // init objet (game) with this first level of structure:
  // - gameState : { .. evolutive object .. }
  // - idGame : just in case ;)
  // - player1Socket: socket instance key "joueur:1"
  // - player2Socket: socket instance key "joueur:2"
  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;

  // push game into 'games' global array
  games.push(newGame);

  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  // just notifying screens that game is starting
  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewScores(games[gameIndex]);

  // timer every second
  games[gameIndex].gameInterval = setInterval(() => {

    // timer variable decreased
    games[gameIndex].gameState.timer--;

    // emit timer to both clients every seconds
    updateClientsViewTimers(games[gameIndex]);

    // if timer is down to 0, we end turn
    if (games[gameIndex].gameState.timer === 0) {

      // switch currentTurn variable
      games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
      // reset timer
      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

      // reset deck state
      games[gameIndex].gameState.deck = GameService.init.deck();

      // reset choices state
      games[gameIndex].gameState.choices = GameService.init.choices();

      // reset canBeChecked flags on grid (but preserve owners/pions)
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

      // reset views also
      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }

  }, 1000);

  // remove intervals at deconnection
  player1Socket.on('disconnect', () => {
    clearInterval(games[gameIndex] && games[gameIndex].gameInterval);
  });

  player2Socket.on('disconnect', () => {
    clearInterval(games[gameIndex] && games[gameIndex].gameInterval);
  });

};

// -----------------------------------------
// -------- BOT SOCKET & GAME VSBOT --------
// -----------------------------------------

const createBotSocket = () => {
  const botSocket = new EventEmitter();
  botSocket.id = 'bot-' + uniqid();
  // Compatibilité avec le code existant qui utilise socket.emit
  // EventEmitter.emit est synchrone, ce qui convient parfaitement
  return botSocket;
};

const setupBotListeners = (botSocket, gameIndex) => {

  const botPlay = () => {
    if (!games[gameIndex]) return;
    const gs = games[gameIndex].gameState;
    if (gs.currentTurn !== 'player:2') return;

    // Étape 1 : Lancer les dés (jusqu'à 3 fois)
    const playTurn = (rollNumber) => {
      if (!games[gameIndex] || gs.currentTurn !== 'player:2') return;

      // Émettre le roll comme un vrai client
      botSocket.emit('game.dices.roll');

      // Après le roll, décider quoi faire
      setTimeout(() => {
        if (!games[gameIndex] || gs.currentTurn !== 'player:2') return;

        const dices = gs.deck.dices;
        const availableChoices = gs.choices.availableChoices;

        // Vérifier si on a une combinaison jouable sur la grille
        const bestChoice = BotService.chooseBestCombination(availableChoices, gs.grid);

        if (bestChoice && rollNumber >= 2) {
          // On a une bonne combinaison, on la sélectionne
          botSocket.emit('game.choices.selected', { choiceId: bestChoice });

          // Puis on pose le pion
          setTimeout(() => {
            if (!games[gameIndex] || gs.currentTurn !== 'player:2') return;
            const cell = BotService.chooseBestCell(bestChoice, gs.grid);
            if (cell) {
              botSocket.emit('game.grid.selected', cell);
            }
          }, 500);

        } else if (rollNumber < 3) {
          // Verrouiller les dés intéressants et relancer
          const diceIdsToLock = BotService.chooseDicesToLock(dices);
          diceIdsToLock.forEach(id => {
            const dice = dices.find(d => d.id === id);
            if (dice && !dice.locked) {
              botSocket.emit('game.dices.lock', id);
            }
          });
          // Déverrouiller les dés qui ne sont pas dans la liste
          dices.forEach(d => {
            if (d.locked && !diceIdsToLock.includes(d.id) && d.value !== '') {
              botSocket.emit('game.dices.lock', d.id);
            }
          });

          setTimeout(() => playTurn(rollNumber + 1), 800);
        } else {
          // 3e lancer, prendre ce qu'on peut
          if (bestChoice) {
            botSocket.emit('game.choices.selected', { choiceId: bestChoice });
            setTimeout(() => {
              if (!games[gameIndex] || gs.currentTurn !== 'player:2') return;
              const cell = BotService.chooseBestCell(bestChoice, gs.grid);
              if (cell) {
                botSocket.emit('game.grid.selected', cell);
              }
            }, 500);
          }
          // Sinon pas de combinaison → le timer fera passer le tour
        }
      }, 600);
    };

    // Démarrer le premier lancer avec un délai pour simuler la réflexion
    setTimeout(() => playTurn(1), 1000);
  };

  // Le bot réagit quand le timer change (= nouveau tour)
  botSocket.on('game.timer', (data) => {
    if (data.playerTimer > 0 && data.playerTimer === GameService.timer.getTurnDuration()) {
      // C'est le tour du bot, il joue
      botPlay();
    }
  });

  // Le bot joue aussi au démarrage si c'est son tour
  botSocket.on('game.start', () => {
    setTimeout(() => {
      if (games[gameIndex] && games[gameIndex].gameState.currentTurn === 'player:2') {
        botPlay();
      }
    }, 1500);
  });
};

const createGameVsBot = (playerSocket) => {
  const botSocket = createBotSocket();

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = playerSocket;
  newGame['player2Socket'] = botSocket;

  games.push(newGame);
  const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  // Enregistrer les handlers du bot pour les événements de jeu
  // Le bot écoute comme un vrai client, et ses émissions sont traitées comme celles d'un joueur
  const registerBotHandlers = () => {
    botSocket.on('game.dices.roll', () => {
      const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
      if (gi === -1) return;
      // Réutiliser la même logique que le handler socket
      if (games[gi].gameState.deck.rollsCounter < games[gi].gameState.deck.rollsMaximum) {
        games[gi].gameState.deck.dices = GameService.dices.roll(games[gi].gameState.deck.dices);
        games[gi].gameState.deck.rollsCounter++;
        const dices = games[gi].gameState.deck.dices;
        const isSec = games[gi].gameState.deck.rollsCounter === 2;
        games[gi].gameState.choices.availableChoices = GameService.choices.findCombinations(dices, false, isSec);
        updateClientsViewDecks(games[gi]);
        updateClientsViewChoices(games[gi]);
      } else {
        games[gi].gameState.deck.dices = GameService.dices.roll(games[gi].gameState.deck.dices);
        games[gi].gameState.deck.rollsCounter++;
        games[gi].gameState.deck.dices = GameService.dices.lockEveryDice(games[gi].gameState.deck.dices);
        const dices = games[gi].gameState.deck.dices;
        const isSec = games[gi].gameState.deck.rollsCounter === 2;
        games[gi].gameState.choices.availableChoices = GameService.choices.findCombinations(dices, false, isSec);
        games[gi].gameState.timer = GameService.timer.getEndTurnDuration();
        updateClientsViewDecks(games[gi]);
        updateClientsViewChoices(games[gi]);
      }
    });

    botSocket.on('game.dices.lock', (idDice) => {
      const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
      if (gi === -1) return;
      const indexDice = GameService.utils.findDiceIndexByDiceId(games[gi].gameState.deck.dices, idDice);
      if (indexDice !== -1) {
        games[gi].gameState.deck.dices[indexDice].locked = !games[gi].gameState.deck.dices[indexDice].locked;
        updateClientsViewDecks(games[gi]);
      }
    });

    botSocket.on('game.choices.selected', (data) => {
      const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
      if (gi === -1) return;
      games[gi].gameState.choices.idSelectedChoice = data.choiceId;
      games[gi].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gi].gameState.grid);
      games[gi].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gi].gameState.grid);
      updateClientsViewChoices(games[gi]);
      updateClientsViewGrid(games[gi]);
    });

    botSocket.on('game.grid.selected', (data) => {
      const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
      if (gi === -1) return;
      games[gi].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gi].gameState.grid);
      games[gi].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, games[gi].gameState.currentTurn, games[gi].gameState.grid);

      const currentPlayer = games[gi].gameState.currentTurn;
      if (currentPlayer === 'player:1') {
        games[gi].gameState.player1Tokens--;
      } else {
        games[gi].gameState.player2Tokens--;
      }

      const scores = GameService.grid.calculateScores(games[gi].gameState.grid);
      games[gi].gameState.player1Score = scores.player1Score;
      games[gi].gameState.player2Score = scores.player2Score;
      updateClientsViewScores(games[gi]);

      const victory = GameService.game.checkVictory(games[gi].gameState);
      if (victory) {
        clearInterval(games[gi].gameInterval);
        games[gi].player1Socket.emit('game.end', victory);
        games[gi].player2Socket.emit('game.end', victory);
        games.splice(gi, 1);
        return;
      }

      games[gi].gameState.currentTurn = games[gi].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
      games[gi].gameState.timer = GameService.timer.getTurnDuration();
      games[gi].gameState.deck = GameService.init.deck();
      games[gi].gameState.choices = GameService.init.choices();

      games[gi].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gi].gameState));
      games[gi].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gi].gameState));
      updateClientsViewDecks(games[gi]);
      updateClientsViewChoices(games[gi]);
      updateClientsViewGrid(games[gi]);
    });
  };

  registerBotHandlers();
  setupBotListeners(botSocket, gameIndex);

  // Notifier le joueur humain
  playerSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  botSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewScores(games[gameIndex]);

  // Timer
  games[gameIndex].gameInterval = setInterval(() => {
    const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
    if (gi === -1) return clearInterval(games[gameIndex] && games[gameIndex].gameInterval);

    games[gi].gameState.timer--;
    updateClientsViewTimers(games[gi]);

    if (games[gi].gameState.timer === 0) {
      games[gi].gameState.currentTurn = games[gi].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
      games[gi].gameState.timer = GameService.timer.getTurnDuration();
      games[gi].gameState.deck = GameService.init.deck();
      games[gi].gameState.choices = GameService.init.choices();
      games[gi].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gi].gameState.grid);
      updateClientsViewTimers(games[gi]);
      updateClientsViewDecks(games[gi]);
      updateClientsViewChoices(games[gi]);
    }
  }, 1000);

  playerSocket.on('disconnect', () => {
    const gi = GameService.utils.findGameIndexById(games, newGame.idGame);
    if (gi !== -1) {
      clearInterval(games[gi].gameInterval);
      games.splice(gi, 1);
    }
  });
};

const newPlayerInQueue = (socket) => {

  queue.push(socket);

  // 'queue' management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {
  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `)
    newPlayerInQueue(socket);
  });

  socket.on('game.vsbot', () => {
    console.log(`[${socket.id}] starting game vs bot`);
    createGameVsBot(socket);
  });

  socket.on('game.dices.roll', () => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    // if not last throw
    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {

      // dices management
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;

      // combinations management
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = false;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // emit to views new state
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }
    // if last throw
    else {

      // dices management 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

      // combinations management
      const dices = games[gameIndex].gameState.deck.dices;
      const isDefi = false;
      const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

      const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
      games[gameIndex].gameState.choices.availableChoices = combinations;

      // reduce timer for end of turn after last roll
      games[gameIndex].gameState.timer = GameService.timer.getEndTurnDuration();

      // emit to views new state
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
    }
  });

  socket.on('game.dices.lock', (idDice) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on('game.choices.selected', (data) => {

    // gestion des choix
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    // Mise à jour de la grille
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  socket.on('game.grid.selected', (data) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, games[gameIndex].gameState.currentTurn, games[gameIndex].gameState.grid);

    // Décrémenter les pions du joueur qui vient de poser
    const currentPlayer = games[gameIndex].gameState.currentTurn;
    if (currentPlayer === 'player:1') {
      games[gameIndex].gameState.player1Tokens--;
    } else {
      games[gameIndex].gameState.player2Tokens--;
    }

    // Calcul des scores après pose de pion
    const scores = GameService.grid.calculateScores(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.player1Score = scores.player1Score;
    games[gameIndex].gameState.player2Score = scores.player2Score;

    // Émettre les scores mis à jour
    updateClientsViewScores(games[gameIndex]);

    // Vérification de victoire
    const victory = GameService.game.checkVictory(games[gameIndex].gameState);
    if (victory) {
      // Fin de partie — arrêter le timer avant de supprimer
      clearInterval(games[gameIndex].gameInterval);
      games[gameIndex].player1Socket.emit('game.end', victory);
      games[gameIndex].player2Socket.emit('game.end', victory);
      games.splice(gameIndex, 1);
      return;
    }

    // end turn
    games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();

    games[gameIndex].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', games[gameIndex].gameState));
    games[gameIndex].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', games[gameIndex].gameState));

    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
  });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});
