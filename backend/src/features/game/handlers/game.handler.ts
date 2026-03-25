// backend/src/features/game/handlers/game.handler.ts

import GameService from '../services/game.service';
import { Game, PlayerKey } from '../../../shared/types';

// ---------------------------------------------------
// -------- EMITTER METHODS -----------
// ---------------------------------------------------

export const updateClientsViewTimers = (game: Game): void => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
};

export const updateClientsViewDecks = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
};

export const updateClientsViewChoices = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
};

export const updateClientsViewGrid = (game: Game): void => {
    setTimeout(() => {
        game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200);
};

export const updateClientsViewScores = (game: Game): void => {
    game.player1Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:1', game.gameState));
    game.player2Socket.emit('game.score', GameService.send.forPlayer.scoreViewState('player:2', game.gameState));
};

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

export const switchTurn = (game: Game): void => {
    game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    game.gameState.timer = GameService.timer.getTurnDuration();
    game.gameState.deck = GameService.init.deck();
    game.gameState.choices = GameService.init.choices();
};

export const handleDiceRoll = (game: Game): void => {
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

export const handleDiceLock = (game: Game, idDice: number): void => {
    const indexDice = GameService.utils.findDiceIndexByDiceId(game.gameState.deck.dices, idDice);
    if (indexDice !== -1) {
        game.gameState.deck.dices[indexDice].locked = !game.gameState.deck.dices[indexDice].locked;
        updateClientsViewDecks(game);
    }
};

export const handleChoiceSelected = (game: Game, choiceId: string): void => {
    game.gameState.choices.idSelectedChoice = choiceId;
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(choiceId, game.gameState.grid);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
};

export const handleGridSelected = (game: Game, games: Game[], data: { cellId: string; rowIndex: number; cellIndex: number }): boolean => {
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

export const startGameTimer = (game: Game, games: Game[]): void => {
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

export const handleDefi = (game: Game): void => {
    const gs = game.gameState;
    if (gs.deck.rollsCounter >= 2 && !gs.choices.isDefi) {
        gs.choices.isDefi = true;
        const isSec = gs.deck.rollsCounter === 2;
        gs.choices.availableChoices = GameService.choices.findCombinations(gs.deck.dices, true, isSec);
        updateClientsViewChoices(game);
    }
};

export const handleYamPredator = (game: Game, games: Game[], data: { rowIndex: number; cellIndex: number }): void => {
    const gs = game.gameState;
    const cell = gs.grid[data.rowIndex][data.cellIndex];
    const opponentKey: PlayerKey = gs.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    if (cell.owner !== opponentKey) return;

    gs.grid = GameService.grid.yamPredator(data.rowIndex, data.cellIndex, gs.grid);
    if (opponentKey === 'player:1') gs.player1Tokens++;
    else gs.player2Tokens++;

    const scores = GameService.grid.calculateScores(gs.grid);
    gs.player1Score = scores.player1Score;
    gs.player2Score = scores.player2Score;
    updateClientsViewGrid(game);
    updateClientsViewScores(game);

    switchTurn(game);
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', gs));
    game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', gs));
    updateClientsViewDecks(game);
    updateClientsViewChoices(game);
    updateClientsViewGrid(game);
};

export const handleDevPlace = (game: Game, games: Game[], data: { rowIndex: number; cellIndex: number; owner: PlayerKey }): void => {
    const gs = game.gameState;
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
    updateClientsViewGrid(game);
    updateClientsViewScores(game);

    const victory = GameService.game.checkVictory(gs);
    if (victory) {
        clearInterval(game.gameInterval);
        game.player1Socket.emit('game.end', victory);
        game.player2Socket.emit('game.end', victory);
        const gi = games.indexOf(game);
        if (gi !== -1) games.splice(gi, 1);
    }
};
