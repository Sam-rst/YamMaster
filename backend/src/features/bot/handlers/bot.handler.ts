// backend/src/features/bot/handlers/bot.handler.ts

import { EventEmitter } from 'events';
import uniqid from 'uniqid';
import GameService from '../../game/services/game.service';
import BotService from '../services/bot.service';
import { Game, SocketLike } from '../../../shared/types';
import {
    handleDiceRoll,
    handleDiceLock,
    handleChoiceSelected,
    handleGridSelected,
} from '../../game/handlers/game.handler';

export const createBotSocket = (): SocketLike => {
    const emitter = new EventEmitter();
    const botSocket: SocketLike = {
        id: 'bot-' + uniqid(),
        emit: (event: string, ...args: unknown[]) => emitter.emit(event, ...args),
        on: (event: string, listener: (...args: unknown[]) => void) => { emitter.on(event, listener); },
    };
    return botSocket;
};

export const setupBotListeners = (botSocket: SocketLike, game: Game, games: Game[]): void => {
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
                        if (cell) handleGridSelected(game, games, cell);
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
                            if (cell) handleGridSelected(game, games, cell);
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
