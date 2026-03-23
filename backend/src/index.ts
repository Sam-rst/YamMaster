// backend/src/index.ts

import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import uniqid from 'uniqid';
import { EventEmitter } from 'events';
import GameService from './services/game.service';
import BotService from './services/bot.service';
import { Game, PlayerKey, SocketLike } from './types';

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
const DEV_MODE = process.env.DEV_MODE === 'true';
const PORT = process.env.PORT || 3000;
const games: Game[] = [];
const queue: Socket[] = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game: Game): void => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

const updateClientsViewDecks = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewChoices = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewGrid = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200);
};

const updateClientsViewScores = (game: Game): void => {
    game.player1Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:1', game.gameState));
    game.player2Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:2', game.gameState));
};

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const switchTurn = (game: Game): void => {
    game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    game.gameState.timer = GameService.timer.getTurnDuration();
    game.gameState.deck = GameService.init.deck();
    game.gameState.choices = GameService.init.choices();
};

const handleDiceRoll = (game: Game): void => {
    const gs = game.gameState;
    if (gs.deck.rollsCounter < gs.deck.rollsMaximum) {
        gs.deck.dices = GameService.dices.roll(gs.deck.dices);
        gs.deck.rollsCounter++;
        const isDefi = gs.choices.isDefi;
        const isSec = gs.deck.rollsCounter === 2;
        gs.choices.availableChoices = GameService.choices.findCombinations(gs.deck.dices, isDefi, isSec);
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
    } else {
        gs.deck.dices = GameService.dices.roll(gs.deck.dices);
        gs.deck.rollsCounter++;
        gs.deck.dices = GameService.dices.lockEveryDice(gs.deck.dices);
        const isDefi = gs.choices.isDefi;
        const isSec = gs.deck.rollsCounter === 2;
        gs.choices.availableChoices = GameService.choices.findCombinations(gs.deck.dices, isDefi, isSec);
        if (!GameService.grid.isAnyCombinationAvailableOnGridForPlayer(gs)) {
            gs.timer = GameService.timer.getEndTurnDuration();
        }
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
    }
};

const handleDiceLock = (game: Game, idDice: number): void => {
    const indexDice = GameService.utils.findDiceIndexByDiceId(game.gameState.deck.dices, idDice);
    if (indexDice !== -1) {
        game.gameState.deck.dices[indexDice].locked = !game.gameState.deck.dices[indexDice].locked;
        updateClientsViewDecks(game);
    }
};

const handleChoiceSelected = (game: Game, choiceId: string): void => {
    game.gameState.choices.idSelectedChoice = choiceId;
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(choiceId, game.gameState.grid);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
};

const handleGridSelected = (game: Game, data: { cellId: string; rowIndex: number; cellIndex: number }): boolean => {
    const gs = game.gameState;
    gs.grid = GameService.grid.resetcanBeCheckedCells(gs.grid);
    gs.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, gs.currentTurn, gs.grid);

    if (gs.currentTurn === 'player:1') gs.player1Tokens--;
    else gs.player2Tokens--;

    const scores = GameService.grid.calculateScores(gs.grid);
    gs.player1Score = scores.player1Score;
    gs.player2Score = scores.player2Score;
    updateClientsViewScores(game);

    const victory = GameService.game.checkVictory(gs);
    if (victory) {
        clearInterval(game.gameInterval);
        game.player1Socket.emit('game.end', victory);
        game.player2Socket.emit('game.end', victory);
        const gi = games.indexOf(game);
        if (gi !== -1) games.splice(gi, 1);
        return true;
    }

    switchTurn(game);
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', gs));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', gs));
    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
    return false;
};

const startGameTimer = (game: Game): void => {
    game.gameInterval = setInterval(() => {
        if (!games.includes(game)) {
            clearInterval(game.gameInterval);
            return;
        }
        game.gameState.timer--;
        updateClientsViewTimers(game);

        if (game.gameState.timer === 0) {
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            game.gameState.timer = GameService.timer.getTurnDuration();
            game.gameState.deck = GameService.init.deck();
            game.gameState.choices = GameService.init.choices();
            game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
            updateClientsViewTimers(game);
            updateClientsViewDecks(game);
            updateClientsViewChoices(game);
        }
    }, 1000);
};

const createGame = (player1Socket: SocketLike, player2Socket: SocketLike): void => {
    const newGame = GameService.init.gameState() as unknown as Game;
    newGame.idGame = uniqid();
    newGame.player1Socket = player1Socket;
    newGame.player2Socket = player2Socket;
    games.push(newGame);

    player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', newGame));
    player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', newGame));
    updateClientsViewTimers(newGame);
    updateClientsViewDecks(newGame);
    updateClientsViewGrid(newGame);
    updateClientsViewScores(newGame);
    startGameTimer(newGame);

    player1Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });
    player2Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });
};

// -----------------------------------------
// -------- BOT SOCKET & GAME VSBOT --------
// -----------------------------------------

const createBotSocket = (): SocketLike => {
    const emitter = new EventEmitter();
    const botSocket: SocketLike = {
        id: 'bot-' + uniqid(),
        emit: (event: string, ...args: unknown[]) => emitter.emit(event, ...args),
        on: (event: string, listener: (...args: unknown[]) => void) => { emitter.on(event, listener); },
    };
    return botSocket;
};

const setupBotListeners = (botSocket: SocketLike, game: Game): void => {
    const botPlay = (): void => {
        if (!games.includes(game)) return;
        const gs = game.gameState;
        if (gs.currentTurn !== 'player:2') return;

        const playTurn = (rollNumber: number): void => {
            if (!games.includes(game) || gs.currentTurn !== 'player:2') return;
            handleDiceRoll(game);

            setTimeout(() => {
                if (!games.includes(game) || gs.currentTurn !== 'player:2') return;
                const bestChoice = BotService.chooseBestCombination(gs.choices.availableChoices, gs.grid);

                if (bestChoice && rollNumber >= 2) {
                    handleChoiceSelected(game, bestChoice);
                    setTimeout(() => {
                        if (!games.includes(game) || gs.currentTurn !== 'player:2') return;
                        const cell = BotService.chooseBestCell(bestChoice, gs.grid);
                        if (cell) handleGridSelected(game, cell);
                    }, 500);
                } else if (rollNumber < 3) {
                    const diceIdsToLock = BotService.chooseDicesToLock(gs.deck.dices);
                    for (const dice of gs.deck.dices) {
                        const shouldLock = diceIdsToLock.includes(dice.id);
                        if (shouldLock && !dice.locked) handleDiceLock(game, dice.id);
                        if (!shouldLock && dice.locked && dice.value !== '') handleDiceLock(game, dice.id);
                    }
                    setTimeout(() => playTurn(rollNumber + 1), 800);
                } else {
                    if (bestChoice) {
                        handleChoiceSelected(game, bestChoice);
                        setTimeout(() => {
                            if (!games.includes(game) || gs.currentTurn !== 'player:2') return;
                            const cell = BotService.chooseBestCell(bestChoice, gs.grid);
                            if (cell) handleGridSelected(game, cell);
                        }, 500);
                    }
                }
            }, 600);
        };

        setTimeout(() => playTurn(1), 1000);
    };

    botSocket.on('game.timer', (...args: unknown[]) => {
        const data = args[0] as { playerTimer: number };
        if (data.playerTimer > 0 && data.playerTimer === GameService.timer.getTurnDuration()) {
            botPlay();
        }
    });

    botSocket.on('game.start', () => {
        setTimeout(() => {
            if (games.includes(game) && game.gameState.currentTurn === 'player:2') {
                botPlay();
            }
        }, 1500);
    });
};

const createGameVsBot = (playerSocket: SocketLike): void => {
    const botSocket = createBotSocket();
    const newGame = GameService.init.gameState() as unknown as Game;
    newGame.idGame = uniqid();
    newGame.player1Socket = playerSocket;
    newGame.player2Socket = botSocket;
    games.push(newGame);

    setupBotListeners(botSocket, newGame);

    playerSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', newGame));
    botSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', newGame));
    updateClientsViewTimers(newGame);
    updateClientsViewDecks(newGame);
    updateClientsViewGrid(newGame);
    updateClientsViewScores(newGame);
    startGameTimer(newGame);

    playerSocket.on('disconnect', () => {
        const gi = games.indexOf(newGame);
        if (gi !== -1) {
            clearInterval(games[gi].gameInterval);
            games.splice(gi, 1);
        }
    });
};

const newPlayerInQueue = (socket: Socket): void => {
    queue.push(socket);
    if (queue.length >= 2) {
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;
        createGame(p1, p2);
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    }
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket: Socket) => {
    console.log(`[${socket.id}] socket connected`);

    socket.on('queue.join', () => {
        console.log(`[${socket.id}] new player in queue`);
        newPlayerInQueue(socket);
    });

    socket.on('game.vsbot', () => {
        console.log(`[${socket.id}] starting game vs bot`);
        createGameVsBot(socket);
    });

    socket.on('game.dices.roll', () => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        handleDiceRoll(games[gi]);
    });

    socket.on('game.dices.lock', (idDice: number) => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        handleDiceLock(games[gi], idDice);
    });

    socket.on('game.defi', () => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        const gs = games[gi].gameState;
        if (gs.deck.rollsCounter >= 2 && !gs.choices.isDefi) {
            gs.choices.isDefi = true;
            const isSec = gs.deck.rollsCounter === 2;
            gs.choices.availableChoices = GameService.choices.findCombinations(gs.deck.dices, true, isSec);
            updateClientsViewChoices(games[gi]);
        }
    });

    socket.on('game.grid.yamPredator', (data: { rowIndex: number; cellIndex: number }) => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        const gs = games[gi].gameState;
        const cell = gs.grid[data.rowIndex][data.cellIndex];
        const opponentKey: PlayerKey = gs.currentTurn === 'player:1' ? 'player:2' : 'player:1';
        if (cell.owner !== opponentKey) return;

        gs.grid = GameService.grid.yamPredator(data.rowIndex, data.cellIndex, gs.grid);
        if (opponentKey === 'player:1') gs.player1Tokens++;
        else gs.player2Tokens++;

        const scores = GameService.grid.calculateScores(gs.grid);
        gs.player1Score = scores.player1Score;
        gs.player2Score = scores.player2Score;
        updateClientsViewGrid(games[gi]);
        updateClientsViewScores(games[gi]);

        switchTurn(games[gi]);
        games[gi].player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', gs));
        games[gi].player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', gs));
        updateClientsViewDecks(games[gi]);
        updateClientsViewChoices(games[gi]);
        updateClientsViewGrid(games[gi]);
    });

    socket.on('game.choices.selected', (data: { choiceId: string }) => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        handleChoiceSelected(games[gi], data.choiceId);
    });

    socket.on('game.grid.selected', (data: { cellId: string; rowIndex: number; cellIndex: number }) => {
        const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
        if (gi === -1) return;
        handleGridSelected(games[gi], data);
    });

    if (DEV_MODE) {
        socket.on('game.dev.place', (data: { rowIndex: number; cellIndex: number; owner: PlayerKey }) => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            const gs = games[gi].gameState;
            const cell = gs.grid[data.rowIndex][data.cellIndex];
            cell.owner = cell.owner === data.owner ? null : data.owner;

            if (cell.owner === data.owner) {
                if (data.owner === 'player:1') gs.player1Tokens--;
                else gs.player2Tokens--;
            } else {
                if (data.owner === 'player:1') gs.player1Tokens++;
                else gs.player2Tokens++;
            }

            const scores = GameService.grid.calculateScores(gs.grid);
            gs.player1Score = scores.player1Score;
            gs.player2Score = scores.player2Score;
            updateClientsViewGrid(games[gi]);
            updateClientsViewScores(games[gi]);

            const victory = GameService.game.checkVictory(gs);
            if (victory) {
                clearInterval(games[gi].gameInterval);
                games[gi].player1Socket.emit('game.end', victory);
                games[gi].player2Socket.emit('game.end', victory);
                games.splice(gi, 1);
            }
        });
    }

    socket.on('disconnect', (reason: string) => {
        console.log(`[${socket.id}] socket disconnected - ${reason}`);
    });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (_req, res) => res.sendFile('index.html'));

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}` + (DEV_MODE ? ' [DEV MODE]' : ''));
});
