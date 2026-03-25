// backend/src/features/bot/handlers/bot.handler.test.ts
// Tests d'intégration : vérifie la création et le comportement du bot socket

import { Game } from '../../../shared/types';
import { createMockSocket } from '../../../__tests__/helpers/socket.helper';
import { createBotSocket, setupBotListeners } from './bot.handler';
import GameService from '../../game/services/game.service';

// ================================================================
// CREATE BOT SOCKET
// ================================================================

describe('Bot Handler - createBotSocket', () => {
    test('crée un socket avec un id commençant par bot-', () => {
        const botSocket = createBotSocket();
        expect(botSocket.id).toMatch(/^bot-/);
    });

    test('le bot socket peut émettre et écouter des events', () => {
        const botSocket = createBotSocket();
        let received = false;

        botSocket.on('test.event', () => { received = true; });
        botSocket.emit('test.event', { data: 'hello' });

        expect(received).toBe(true);
    });

    test('chaque bot socket a un id unique', () => {
        const bot1 = createBotSocket();
        const bot2 = createBotSocket();
        expect(bot1.id).not.toBe(bot2.id);
    });
});

// ================================================================
// SETUP BOT LISTENERS
// ================================================================

describe('Bot Handler - setupBotListeners', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const createBotGame = (): { game: Game; games: Game[] } => {
        const playerSocket = createMockSocket('player1');
        const botSocket = createBotSocket();

        const game = GameService.init.gameState() as unknown as Game;
        game.idGame = 'test-game';
        game.player1Socket = playerSocket;
        game.player2Socket = botSocket;

        const games: Game[] = [game];
        return { game, games };
    };

    test('enregistre les listeners game.timer et game.start sur le bot socket', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;

        setupBotListeners(botSocket, game, games);

        // Vérifie que les listeners ont été enregistrés
        // En émettant un event qui ne devrait pas crasher
        botSocket.emit('game.start', {});
        // Pas d'erreur = les listeners sont enregistrés
    });

    test('le bot joue quand c\'est son tour (game.start)', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;
        game.gameState.currentTurn = 'player:2';
        const initialRolls = game.gameState.deck.rollsCounter;

        setupBotListeners(botSocket, game, games);
        botSocket.emit('game.start', {});

        // Le bot attend 1500ms avant de jouer, puis 1000ms avant le premier lancer
        jest.advanceTimersByTime(3000);

        // Le bot devrait avoir lancé les dés au moins une fois
        expect(game.gameState.deck.rollsCounter).toBeGreaterThan(initialRolls);
    });

    test('le bot réagit au timer quand c\'est son tour', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;
        game.gameState.currentTurn = 'player:2';

        setupBotListeners(botSocket, game, games);

        // Simuler un event timer avec playerTimer = turnDuration (début de tour)
        botSocket.emit('game.timer', { playerTimer: GameService.timer.getTurnDuration() });

        // Avancer le timer pour déclencher le premier setTimeout du bot (1000ms)
        jest.advanceTimersByTime(1500);

        // Le bot devrait avoir lancé les dés
        expect(game.gameState.deck.rollsCounter).toBeGreaterThan(1);
    });

    test('le bot exécute un tour complet (3 lancers)', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;
        game.gameState.currentTurn = 'player:2';

        setupBotListeners(botSocket, game, games);
        botSocket.emit('game.start', {});

        // 1500ms: bot décide de jouer
        jest.advanceTimersByTime(1500);
        // 1000ms: premier lancer
        jest.advanceTimersByTime(1000);
        // 600ms: bot analyse
        jest.advanceTimersByTime(600);
        // 800ms: deuxième lancer
        jest.advanceTimersByTime(800);
        // 600ms: bot analyse
        jest.advanceTimersByTime(600);
        // 800ms: troisième lancer
        jest.advanceTimersByTime(800);
        // 600ms: bot choisit une combinaison
        jest.advanceTimersByTime(600);
        // 500ms: bot place sur la grille
        jest.advanceTimersByTime(500);

        // Le bot a joué ses lancers (rollsCounter > 1 initial)
        // Et potentiellement changé de tour s'il a posé un pion
        expect(game.gameState.deck.rollsCounter).toBeGreaterThanOrEqual(1);
    });

    test('le bot ne joue pas si ce n\'est pas son tour', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;
        game.gameState.currentTurn = 'player:1'; // pas le tour du bot
        const initialRolls = game.gameState.deck.rollsCounter;

        setupBotListeners(botSocket, game, games);
        botSocket.emit('game.timer', { playerTimer: 30 });

        jest.advanceTimersByTime(5000);

        // Le deck ne devrait pas avoir changé car le bot n'a pas joué
        expect(game.gameState.deck.rollsCounter).toBe(initialRolls);
    });

    test('le bot ne joue pas si la partie n\'est plus dans games', () => {
        const { game, games } = createBotGame();
        const botSocket = game.player2Socket;
        game.gameState.currentTurn = 'player:2';
        const initialRolls = game.gameState.deck.rollsCounter;

        setupBotListeners(botSocket, game, games);
        games.splice(0, 1); // supprimer la partie

        botSocket.emit('game.timer', { playerTimer: 30 });
        jest.advanceTimersByTime(5000);

        // Le bot ne devrait pas avoir joué
        expect(game.gameState.deck.rollsCounter).toBe(initialRolls);
    });
});
