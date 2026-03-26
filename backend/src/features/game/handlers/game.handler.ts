// backend/src/features/game/handlers/game.handler.ts

import GameService from '../services/game.service';
import { Game, PlayerKey, VictoryResult } from '../../../shared/types';
import { logger } from '../../../shared/logger';
import HistoryService from '../../history/services/history.service';

const EMIT_DELAY_MS = 200;
const TIMER_INTERVAL_MS = 1000;

type TurnType = 'roll' | 'lock' | 'choice' | 'grid' | 'defi' | 'predator' | 'snapshot';

const recordTurn = (game: Game, type: TurnType, data: Record<string, unknown>): void => {
    if (!game.turnRecorder) return;
    const playerNumber = game.gameState.currentTurn === 'player:1' ? 1 : 2;
    game.turnRecorder.recordAction({ type, playerNumber, data });
};
const TIMER_ZERO = 0;

// ================================================================
// EMITTERS — Envoient les view-states aux deux joueurs
// ================================================================

const emitToBothPlayers = (game: Game, event: string, dataFn: (player: PlayerKey) => unknown): void => {
    game.player1Socket.emit(event, dataFn('player:1'));
    game.player2Socket.emit(event, dataFn('player:2'));
};

const emitDelayedToBothPlayers = (game: Game, event: string, dataFn: (player: PlayerKey) => unknown): void => {
    setTimeout(() => emitToBothPlayers(game, event, dataFn), EMIT_DELAY_MS);
};

export const updateClientsViewTimers = (game: Game): void => {
    emitToBothPlayers(game, 'game.timer', (player) =>
        GameService.send.forPlayer.gameTimer(player, game.gameState));
};

export const updateClientsViewDecks = (game: Game): void => {
    emitDelayedToBothPlayers(game, 'game.deck.view-state', (player) =>
        GameService.send.forPlayer.deckViewState(player, game.gameState));
};

export const updateClientsViewChoices = (game: Game): void => {
    emitDelayedToBothPlayers(game, 'game.choices.view-state', (player) =>
        GameService.send.forPlayer.choicesViewState(player, game.gameState));
};

export const updateClientsViewGrid = (game: Game): void => {
    emitDelayedToBothPlayers(game, 'game.grid.view-state', (player) =>
        GameService.send.forPlayer.gridViewState(player, game.gameState));
};

export const updateClientsViewScores = (game: Game): void => {
    emitToBothPlayers(game, 'game.score', (player) =>
        GameService.send.forPlayer.scoreViewState(player, game.gameState));
};

const broadcastAllViewStates = (game: Game): void => {
    updateClientsViewTimers(game);
    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
};

const updateScores = (game: Game): void => {
    const scores = GameService.grid.calculateScores(game.gameState.grid);
    game.gameState.player1Score = scores.player1Score;
    game.gameState.player2Score = scores.player2Score;
    updateClientsViewScores(game);
};

const getOpponentKey = (currentTurn: PlayerKey): PlayerKey => {
    return currentTurn === 'player:1' ? 'player:2' : 'player:1';
};

const removeGameFromList = (game: Game, games: Game[]): void => {
    const gameIndex = games.indexOf(game);
    if (gameIndex !== -1) games.splice(gameIndex, 1);
};

const decrementTokens = (game: Game, player: PlayerKey): void => {
    if (player === 'player:1') game.gameState.player1Tokens--;
    else game.gameState.player2Tokens--;
};

const incrementTokens = (game: Game, player: PlayerKey): void => {
    if (player === 'player:1') game.gameState.player1Tokens++;
    else game.gameState.player2Tokens++;
};

// ================================================================
// TURN MANAGEMENT
// ================================================================

export const switchTurn = (game: Game): void => {
    const previousTurn = game.gameState.currentTurn;
    game.gameState.currentTurn = getOpponentKey(previousTurn);
    game.gameState.timer = GameService.timer.getTurnDuration();
    game.gameState.deck = GameService.init.deck();
    game.gameState.choices = GameService.init.choices();

    logger.info('Changement de tour', {
        gameId: game.idGame,
        player: game.gameState.currentTurn,
    });
};

// ================================================================
// DICE HANDLERS
// ================================================================

export const handleDiceRoll = (game: Game): void => {
    const gameState = game.gameState;
    const isLastRoll = gameState.deck.rollsCounter >= gameState.deck.rollsMaximum;

    try {
        gameState.deck.dices = GameService.dices.roll(gameState.deck.dices);
        gameState.deck.rollsCounter++;

        if (isLastRoll) {
            gameState.deck.dices = GameService.dices.lockEveryDice(gameState.deck.dices);
        }

        const isDefi = gameState.choices.isDefi;
        const isSecondRoll = gameState.deck.rollsCounter === 2;
        gameState.choices.availableChoices = GameService.choices.findCombinations(
            gameState.deck.dices, isDefi, isSecondRoll,
        );

        if (isLastRoll && !GameService.grid.isAnyCombinationAvailableOnGridForPlayer(gameState)) {
            gameState.timer = GameService.timer.getEndTurnDuration();
            logger.info('Aucune combinaison disponible, timer réduit', { gameId: game.idGame });
        }

        recordTurn(game, 'roll', {
            dices: gameState.deck.dices.map(d => ({ id: d.id, value: d.value })),
            rollNumber: gameState.deck.rollsCounter,
        });

        updateClientsViewDecks(game);
        updateClientsViewChoices(game);

        logger.info('Lancer de dés', {
            gameId: game.idGame,
            player: gameState.currentTurn,
            action: `roll ${gameState.deck.rollsCounter}/${gameState.deck.rollsMaximum}`,
        });
    } catch (error) {
        logger.error('Erreur lors du lancer de dés', {
            gameId: game.idGame,
            error: error as Error,
        });
    }
};

export const handleDiceLock = (game: Game, diceId: number): void => {
    const diceIndex = GameService.utils.findDiceIndexByDiceId(game.gameState.deck.dices, diceId);

    if (diceIndex === -1) {
        logger.warn('Tentative de verrouillage d\'un dé inexistant', {
            gameId: game.idGame,
            action: `lock dice #${diceId}`,
        });
        return;
    }

    game.gameState.deck.dices[diceIndex].locked = !game.gameState.deck.dices[diceIndex].locked;
    recordTurn(game, 'lock', { diceId, locked: game.gameState.deck.dices[diceIndex].locked });
    updateClientsViewDecks(game);
};

// ================================================================
// CHOICE & GRID HANDLERS
// ================================================================

export const handleChoiceSelected = (game: Game, choiceId: string): void => {
    game.gameState.choices.idSelectedChoice = choiceId;
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(choiceId, game.gameState.grid);
    recordTurn(game, 'choice', { choiceId });

    updateClientsViewChoices(game);
    updateClientsViewGrid(game);

    logger.info('Combinaison sélectionnée', {
        gameId: game.idGame,
        player: game.gameState.currentTurn,
        action: choiceId,
    });
};

export const handleGridSelected = (
    game: Game,
    games: Game[],
    data: { cellId: string; rowIndex: number; cellIndex: number },
): boolean => {
    const gameState = game.gameState;

    try {
        gameState.grid = GameService.grid.resetcanBeCheckedCells(gameState.grid);
        gameState.grid = GameService.grid.selectCell(
            data.cellId, data.rowIndex, data.cellIndex, gameState.currentTurn, gameState.grid,
        );

        decrementTokens(game, gameState.currentTurn);
        updateScores(game);
        recordTurn(game, 'grid', { rowIndex: data.rowIndex, cellIndex: data.cellIndex });

        logger.info('Pion posé sur la grille', {
            gameId: game.idGame,
            player: gameState.currentTurn,
            action: `grid [${data.rowIndex},${data.cellIndex}]`,
        });

        const victory = GameService.game.checkVictory(gameState);
        if (victory) {
            return endGame(game, games, victory);
        }

        switchTurn(game);
        updateClientsViewTimers(game);
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
        updateClientsViewGrid(game);
        return false;
    } catch (error) {
        logger.error('Erreur lors de la sélection sur la grille', {
            gameId: game.idGame,
            error: error as Error,
        });
        return false;
    }
};

// ================================================================
// GAME LIFECYCLE
// ================================================================

const getPlayerResult = (winner: PlayerKey | null, playerKey: PlayerKey): 'WIN' | 'LOSE' | 'DRAW' => {
    if (!winner) return 'DRAW';
    return winner === playerKey ? 'WIN' : 'LOSE';
};

const saveGameResult = (game: Game, victory: VictoryResult): void => {
    if (!game.dbGameId) return;

    HistoryService.finishGame(game.dbGameId, {
        reason: victory.reason,
        playerResults: [
            {
                playerNumber: 1,
                score: victory.player1Score,
                tokensLeft: game.gameState.player1Tokens,
                result: getPlayerResult(victory.winner, 'player:1'),
            },
            {
                playerNumber: 2,
                score: victory.player2Score,
                tokensLeft: game.gameState.player2Tokens,
                result: getPlayerResult(victory.winner, 'player:2'),
            },
        ],
    }).then(() => {
        if (game.dbGameId && game.turnRecorder) {
            return HistoryService.saveTurns(
                game.dbGameId,
                game.turnRecorder.toJSON() as Record<string, unknown>[],
            );
        }
    }).catch((error: Error) => {
        logger.error('Échec sauvegarde résultat/tours en BDD (non bloquant)', {
            gameId: game.idGame,
            error,
        });
    });
};

const endGame = (game: Game, games: Game[], victory: unknown): true => {
    clearInterval(game.gameInterval);
    emitToBothPlayers(game, 'game.end', () => victory);
    removeGameFromList(game, games);
    saveGameResult(game, victory as VictoryResult);

    logger.info('Partie terminée', { gameId: game.idGame });
    return true;
};

export const startGameTimer = (game: Game, games: Game[]): void => {
    game.gameInterval = setInterval(() => {
        if (!games.includes(game)) {
            clearInterval(game.gameInterval);
            return;
        }

        game.gameState.timer--;
        updateClientsViewTimers(game);

        if (game.gameState.timer === TIMER_ZERO) {
            switchTurn(game);
            game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
            broadcastAllViewStates(game);
        }
    }, TIMER_INTERVAL_MS);
};

// ================================================================
// SPECIAL ACTIONS
// ================================================================

export const handleDefi = (game: Game): void => {
    const gameState = game.gameState;
    const MINIMUM_ROLLS_FOR_DEFI = 2;

    if (gameState.deck.rollsCounter < MINIMUM_ROLLS_FOR_DEFI) {
        logger.warn('Défi impossible avant le 2e lancer', { gameId: game.idGame });
        return;
    }

    if (gameState.choices.isDefi) {
        logger.warn('Défi déjà activé', { gameId: game.idGame });
        return;
    }

    gameState.choices.isDefi = true;
    const isSecondRoll = gameState.deck.rollsCounter === 2;
    gameState.choices.availableChoices = GameService.choices.findCombinations(
        gameState.deck.dices, true, isSecondRoll,
    );
    updateClientsViewChoices(game);

    logger.info('Défi activé', {
        gameId: game.idGame,
        player: gameState.currentTurn,
    });
};

export const handleYamPredator = (
    game: Game,
    data: { rowIndex: number; cellIndex: number },
): void => {
    const gameState = game.gameState;
    const cell = gameState.grid[data.rowIndex][data.cellIndex];
    const opponentKey = getOpponentKey(gameState.currentTurn);

    if (cell.owner !== opponentKey) {
        logger.warn('Yam Predator : la case ne contient pas de pion adverse', {
            gameId: game.idGame,
            action: `predator [${data.rowIndex},${data.cellIndex}]`,
        });
        return;
    }

    try {
        gameState.grid = GameService.grid.yamPredator(data.rowIndex, data.cellIndex, gameState.grid);
        incrementTokens(game, opponentKey);
        updateScores(game);
        updateClientsViewGrid(game);

        logger.info('Yam Predator : pion adverse retiré', {
            gameId: game.idGame,
            player: gameState.currentTurn,
            action: `predator [${data.rowIndex},${data.cellIndex}]`,
        });

        switchTurn(game);
        updateClientsViewTimers(game);
        updateClientsViewDecks(game);
        updateClientsViewChoices(game);
        updateClientsViewGrid(game);
    } catch (error) {
        logger.error('Erreur lors du Yam Predator', {
            gameId: game.idGame,
            error: error as Error,
        });
    }
};

export const handleDevPlace = (
    game: Game,
    games: Game[],
    data: { rowIndex: number; cellIndex: number; owner: PlayerKey },
): void => {
    const gameState = game.gameState;
    const cell = gameState.grid[data.rowIndex][data.cellIndex];
    const isToggleOff = cell.owner === data.owner;

    cell.owner = isToggleOff ? null : data.owner;

    if (isToggleOff) {
        incrementTokens(game, data.owner);
    } else {
        decrementTokens(game, data.owner);
    }

    updateScores(game);
    updateClientsViewGrid(game);

    const victory = GameService.game.checkVictory(gameState);
    if (victory) {
        endGame(game, games, victory);
    }
};
