// backend/src/shared/exceptions.test.ts
// Tests unitaires des exceptions custom

import {
    AppError,
    GameNotFoundError,
    InvalidActionError,
    InvalidTurnError,
    SocketError,
} from './exceptions';

describe('Custom Exceptions', () => {
    describe('AppError (classe de base)', () => {
        test('est une instance de Error', () => {
            const error = new AppError('test');
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AppError);
        });

        test('contient un message et un code', () => {
            const error = new AppError('quelque chose a échoué', 'APP_ERROR');
            expect(error.message).toBe('quelque chose a échoué');
            expect(error.code).toBe('APP_ERROR');
        });

        test('a un code par défaut', () => {
            const error = new AppError('test');
            expect(error.code).toBe('APP_ERROR');
        });

        test('conserve le nom de la classe', () => {
            const error = new AppError('test');
            expect(error.name).toBe('AppError');
        });
    });

    describe('GameNotFoundError', () => {
        test('est une instance de AppError', () => {
            const error = new GameNotFoundError('socket-123');
            expect(error).toBeInstanceOf(AppError);
        });

        test('contient le socketId dans le message', () => {
            const error = new GameNotFoundError('socket-123');
            expect(error.message).toContain('socket-123');
        });

        test('a le code GAME_NOT_FOUND', () => {
            const error = new GameNotFoundError('socket-123');
            expect(error.code).toBe('GAME_NOT_FOUND');
        });

        test('conserve le nom de la classe', () => {
            const error = new GameNotFoundError('socket-123');
            expect(error.name).toBe('GameNotFoundError');
        });
    });

    describe('InvalidActionError', () => {
        test('contient l\'action et la raison', () => {
            const error = new InvalidActionError('dice.roll', 'pas le tour du joueur');
            expect(error.message).toContain('dice.roll');
            expect(error.message).toContain('pas le tour du joueur');
        });

        test('a le code INVALID_ACTION', () => {
            const error = new InvalidActionError('dice.roll', 'raison');
            expect(error.code).toBe('INVALID_ACTION');
        });
    });

    describe('InvalidTurnError', () => {
        test('contient le joueur concerné', () => {
            const error = new InvalidTurnError('player:1');
            expect(error.message).toContain('player:1');
        });

        test('a le code INVALID_TURN', () => {
            const error = new InvalidTurnError('player:1');
            expect(error.code).toBe('INVALID_TURN');
        });
    });

    describe('SocketError', () => {
        test('contient le socketId et le message', () => {
            const error = new SocketError('socket-abc', 'connexion perdue');
            expect(error.message).toContain('socket-abc');
            expect(error.message).toContain('connexion perdue');
        });

        test('a le code SOCKET_ERROR', () => {
            const error = new SocketError('socket-abc', 'test');
            expect(error.code).toBe('SOCKET_ERROR');
        });
    });
});
