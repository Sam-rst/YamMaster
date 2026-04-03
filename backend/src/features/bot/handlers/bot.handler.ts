// backend/src/features/bot/handlers/bot.handler.ts

import { EventEmitter } from 'node:events';
import uniqid from 'uniqid';
import GameService from '../../game/services/game.service';
import BotService, { BotDifficulty } from '../services/bot.service';
import { Game, SocketLike } from '../../../shared/types';
import { logger } from '../../../shared/logger';
import {
    handleDiceRoll,
    handleDiceLock,
    handleChoiceSelected,
    handleGridSelected,
} from '../../game/handlers/game.handler';

const BOT_PLAYER = 'player:2' as const;
const DELAY_BEFORE_FIRST_ROLL_MS = 1000;
const DELAY_ANALYSIS_MS = 600;
const DELAY_BETWEEN_ROLLS_MS = 800;
const DELAY_PLACE_ON_GRID_MS = 500;
const DELAY_GAME_START_MS = 1500;
const MINIMUM_ROLLS_TO_PLACE = 2;
const MAXIMUM_ROLLS = 3;

const BOT_NAMES: Record<string, string> = {
    EASY: 'Bot Debutant',
    MEDIUM: 'Bot Tactique',
    HARD: 'Bot Maitre IA',
};

export const createBotSocket = (difficulty: string = 'MEDIUM'): SocketLike => {
    const emitter = new EventEmitter();
    return {
        id: 'bot-' + uniqid(),
        username: BOT_NAMES[difficulty] ?? 'Bot',
        avatar: '🤖',
        emit: (event: string, ...args: unknown[]) => emitter.emit(event, ...args),
        on: (event: string, listener: (...args: unknown[]) => void) => { emitter.on(event, listener); },
    };
};

const isGameActive = (game: Game, games: Game[]): boolean => {
    return games.includes(game) && game.gameState.currentTurn === BOT_PLAYER;
};

const selectAndPlaceCombination = (game: Game, games: Game[], choiceId: string, difficulty: BotDifficulty): void => {
    handleChoiceSelected(game, choiceId);

    setTimeout(() => {
        if (!isGameActive(game, games)) return;
        const cell = BotService.chooseBestCell(choiceId, game.gameState.grid, difficulty);
        if (cell) {
            handleGridSelected(game, games, cell);
            logger.info('Bot a posé un pion', { gameId: game.idGame, action: choiceId });
        }
    }, DELAY_PLACE_ON_GRID_MS);
};

const lockDicesForNextRoll = (game: Game, difficulty: BotDifficulty): void => {
    const diceIdsToLock = BotService.chooseDicesToLock(game.gameState.deck.dices, difficulty);

    for (const dice of game.gameState.deck.dices) {
        const shouldBeLocked = diceIdsToLock.includes(dice.id);
        const isCurrentlyLocked = dice.locked;
        const hasValue = dice.value !== '';

        if (shouldBeLocked && !isCurrentlyLocked) handleDiceLock(game, dice.id);
        if (!shouldBeLocked && isCurrentlyLocked && hasValue) handleDiceLock(game, dice.id);
    }
};

export const setupBotListeners = (botSocket: SocketLike, game: Game, games: Game[], difficulty: BotDifficulty = 'MEDIUM'): void => {
    const playTurn = (rollNumber: number): void => {
        if (!isGameActive(game, games)) return;

        try {
            handleDiceRoll(game);

            setTimeout(() => {
                if (!isGameActive(game, games)) return;

                const bestChoice = BotService.chooseBestCombination(
                    game.gameState.choices.availableChoices,
                    game.gameState.grid,
                    difficulty,
                );

                const canPlaceNow = bestChoice && rollNumber >= MINIMUM_ROLLS_TO_PLACE;
                const hasMoreRolls = rollNumber < MAXIMUM_ROLLS;
                const isLastRoll = rollNumber >= MAXIMUM_ROLLS;

                if (canPlaceNow) {
                    selectAndPlaceCombination(game, games, bestChoice, difficulty);
                } else if (hasMoreRolls) {
                    lockDicesForNextRoll(game, difficulty);
                    setTimeout(() => playTurn(rollNumber + 1), DELAY_BETWEEN_ROLLS_MS);
                } else if (isLastRoll && bestChoice) {
                    selectAndPlaceCombination(game, games, bestChoice, difficulty);
                }
            }, DELAY_ANALYSIS_MS);
        } catch (error) {
            logger.error('Erreur pendant le tour du bot', {
                gameId: game.idGame,
                error: error as Error,
            });
        }
    };

    const startBotTurn = (): void => {
        if (!isGameActive(game, games)) return;
        logger.info('Le bot commence son tour', { gameId: game.idGame });
        setTimeout(() => playTurn(1), DELAY_BEFORE_FIRST_ROLL_MS);
    };

    botSocket.on('game.timer', (...args: unknown[]) => {
        const data = args[0] as { playerTimer: number };
        const isTurnStart = data.playerTimer > 0
            && data.playerTimer === GameService.timer.getTurnDuration();

        if (isTurnStart) startBotTurn();
    });

    botSocket.on('game.start', () => {
        setTimeout(() => {
            if (isGameActive(game, games)) startBotTurn();
        }, DELAY_GAME_START_MS);
    });
};
