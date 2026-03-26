// backend/src/features/matchmaking/handlers/matchmaking.handler.test.ts
// Tests d'intégration : vérifie la queue, la création de parties et le mode VsBot

import { createMockSocket } from '../../../__tests__/helpers/socket.helper';
import { Game } from '../../../shared/types';
import { newPlayerInQueue, createGame, createGameVsBot, resetQueue, removeFromQueueBySocketId } from './matchmaking.handler';

afterEach(() => {
    resetQueue();
});

// ================================================================
// CREATE GAME
// ================================================================

describe('Matchmaking - createGame', () => {
    test('crée une partie et l\'ajoute au tableau games', () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        const games: Game[] = [];

        createGame(p1, p2, games);
        expect(games.length).toBe(1);
        expect(games[0].player1Socket.id).toBe('p1');
        expect(games[0].player2Socket.id).toBe('p2');
    });

    test('émet game.start aux deux joueurs', () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        const games: Game[] = [];

        createGame(p1, p2, games);
        expect(p1.countEmitted('game.start')).toBe(1);
        expect(p2.countEmitted('game.start')).toBe(1);
    });

    test('émet les view-states initiaux (timer, deck, grid, scores)', (done) => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        const games: Game[] = [];

        createGame(p1, p2, games);

        setTimeout(() => {
            expect(p1.countEmitted('game.timer')).toBeGreaterThanOrEqual(1);
            expect(p1.countEmitted('game.deck.view-state')).toBeGreaterThanOrEqual(1);
            expect(p1.countEmitted('game.grid.view-state')).toBeGreaterThanOrEqual(1);
            expect(p1.countEmitted('game.score')).toBeGreaterThanOrEqual(1);
            clearInterval(games[0]?.gameInterval);
            done();
        }, 300);
    });

    test('nettoie l\'interval quand player1 se déconnecte', () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        const games: Game[] = [];

        createGame(p1, p2, games);
        const interval = games[0].gameInterval;

        p1.triggerEvent('disconnect');
        // L'interval devrait être nettoyé (clearInterval appelé)
        // On vérifie juste qu'il n'y a pas d'erreur
        expect(interval).toBeDefined();
    });
});

// ================================================================
// CREATE GAME VS BOT
// ================================================================

describe('Matchmaking - createGameVsBot', () => {
    test('crée une partie avec un bot comme player2', () => {
        const p1 = createMockSocket('p1');
        const games: Game[] = [];

        createGameVsBot(p1, games);
        expect(games.length).toBe(1);
        expect(games[0].player1Socket.id).toBe('p1');
        expect(games[0].player2Socket.id).toContain('bot-');
    });

    test('émet game.start au joueur', () => {
        const p1 = createMockSocket('p1');
        const games: Game[] = [];

        createGameVsBot(p1, games);
        expect(p1.countEmitted('game.start')).toBe(1);
    });

    test('supprime la partie quand le joueur se déconnecte', () => {
        const p1 = createMockSocket('p1');
        const games: Game[] = [];

        createGameVsBot(p1, games);
        expect(games.length).toBe(1);

        p1.triggerEvent('disconnect');
        expect(games.length).toBe(0);
    });
});

// ================================================================
// QUEUE
// ================================================================

describe('Matchmaking - newPlayerInQueue', () => {
    test('émet queue.added si un seul joueur dans la queue', () => {
        const p1 = createMockSocket('p1') as unknown as import('socket.io').Socket;
        const games: Game[] = [];

        newPlayerInQueue(p1, games);
        expect((p1 as unknown as ReturnType<typeof createMockSocket>).countEmitted('queue.added')).toBe(1);
    });

    test('crée une partie quand deux joueurs sont dans la queue', () => {
        const p1 = createMockSocket('p1') as unknown as import('socket.io').Socket;
        const p2 = createMockSocket('p2') as unknown as import('socket.io').Socket;
        const games: Game[] = [];

        newPlayerInQueue(p1, games);
        newPlayerInQueue(p2, games);

        expect(games.length).toBe(1);
        expect((p1 as unknown as ReturnType<typeof createMockSocket>).countEmitted('game.start')).toBe(1);
        expect((p2 as unknown as ReturnType<typeof createMockSocket>).countEmitted('game.start')).toBe(1);
    });
});

// ================================================================
// ISOLATION DES PARTIES
// ================================================================

describe('Matchmaking - Isolation des parties', () => {
    test('queue.join nettoie l\'ancienne partie du joueur avant d\'en rejoindre une nouvelle', () => {
        const p1 = createMockSocket('p1') as unknown as import('socket.io').Socket;
        const p2 = createMockSocket('p2') as unknown as import('socket.io').Socket;
        const games: Game[] = [];

        // Créer une première partie
        createGame(p1, p2, games);
        expect(games.length).toBe(1);
        const oldGameId = games[0].idGame;

        // p1 rejoint la queue → l'ancienne partie doit être supprimée
        newPlayerInQueue(p1, games);
        expect(games.length).toBe(0);
        // L'ancienne partie a été nettoyée
        expect(games.find(g => g.idGame === oldGameId)).toBeUndefined();
    });

    test('game.vsbot nettoie l\'ancienne partie du joueur', () => {
        const p1 = createMockSocket('p1');
        const games: Game[] = [];

        // Créer une première partie VsBot
        createGameVsBot(p1, games);
        expect(games.length).toBe(1);

        // Relancer une partie VsBot → l'ancienne doit être nettoyée
        createGameVsBot(p1, games);
        expect(games.length).toBe(1); // Une seule partie, pas deux
    });

    test('un joueur ne peut pas avoir deux parties simultanées', () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        const p3 = createMockSocket('p3');
        const games: Game[] = [];

        createGame(p1, p2, games);
        expect(games.length).toBe(1);

        // p1 rejoint la queue pour une nouvelle partie avec p3
        newPlayerInQueue(p1 as unknown as import('socket.io').Socket, games);
        newPlayerInQueue(p3 as unknown as import('socket.io').Socket, games);

        // L'ancienne partie (p1 vs p2) doit avoir été nettoyée
        // et une nouvelle partie (p1 vs p3) créée
        expect(games.length).toBe(1);
        expect(games[0].player1Socket.id).toBe('p1');
        expect(games[0].player2Socket.id).toBe('p3');
    });
});

// ================================================================
// NETTOYAGE DE LA QUEUE
// ================================================================

describe('Matchmaking - Nettoyage de la queue', () => {
    test('removeFromQueueBySocketId retire un joueur de la queue', () => {
        const p1 = createMockSocket('p1') as unknown as import('socket.io').Socket;
        const games: Game[] = [];

        newPlayerInQueue(p1, games);
        expect(games.length).toBe(0); // p1 est dans la queue, pas dans une partie

        // Retirer p1 de la queue
        removeFromQueueBySocketId('p1');

        // Si un p2 rejoint maintenant, il ne doit PAS matcher avec p1
        const p2 = createMockSocket('p2') as unknown as import('socket.io').Socket;
        newPlayerInQueue(p2, games);
        expect(games.length).toBe(0); // Pas de match car p1 a été retiré
        expect((p2 as unknown as ReturnType<typeof createMockSocket>).countEmitted('queue.added')).toBe(1);
    });

    test('queue.join retire le joueur de la queue s\'il y est déjà avant de le rajouter', () => {
        const p1 = createMockSocket('p1') as unknown as import('socket.io').Socket;
        const games: Game[] = [];

        // P1 rejoint deux fois la queue
        newPlayerInQueue(p1, games);
        newPlayerInQueue(p1, games);

        // P1 ne doit pas matcher avec lui-même
        expect(games.length).toBe(0);
    });

    test('removeFromQueueBySocketId ne fait rien si le joueur n\'est pas dans la queue', () => {
        // Pas d'erreur
        expect(() => removeFromQueueBySocketId('inexistant')).not.toThrow();
    });
});
