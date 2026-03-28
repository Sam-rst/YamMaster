// backend/src/shared/logger.test.ts
// Tests unitaires du service de logging

import { logger, LogContext } from './logger';

describe('Logger Service', () => {
    test('logger existe et possède les 4 niveaux', () => {
        expect(logger.info).toBeDefined();
        expect(logger.warn).toBeDefined();
        expect(logger.error).toBeDefined();
        expect(logger.fatal).toBeDefined();
    });

    test('logger.info ne lève pas d\'erreur', () => {
        expect(() => logger.info('test info message')).not.toThrow();
    });

    test('logger.warn ne lève pas d\'erreur', () => {
        expect(() => logger.warn('test warn message')).not.toThrow();
    });

    test('logger.error ne lève pas d\'erreur', () => {
        expect(() => logger.error('test error message')).not.toThrow();
    });

    test('logger.fatal ne lève pas d\'erreur', () => {
        expect(() => logger.fatal('test fatal message')).not.toThrow();
    });

    test('logger accepte un contexte structuré', () => {
        const context: LogContext = {
            gameId: 'game-123',
            socketId: 'socket-abc',
            action: 'dice.roll',
        };
        expect(() => logger.info('action effectuée', context)).not.toThrow();
    });

    test('logger.error accepte une Error en contexte', () => {
        const error = new Error('test error');
        expect(() => logger.error('erreur attrapée', { error })).not.toThrow();
    });
});
