import React from 'react';

// Mock socket.io-client avant l'import du module
const mockSocket = {
    id: 'test-socket-id',
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
};

jest.mock('socket.io-client', () => {
    return jest.fn(() => mockSocket);
});

jest.mock('@/shared/services/config', () => ({
    SERVER_URL: 'http://localhost:3000',
}));

describe('socket.context', () => {

    let socketModule;

    beforeEach(() => {
        jest.clearAllMocks();
        // Réinitialiser le cache du module pour chaque test
        jest.resetModules();

        // Re-mock après resetModules
        jest.doMock('socket.io-client', () => jest.fn(() => mockSocket));
        jest.doMock('@/shared/services/config', () => ({
            SERVER_URL: 'http://localhost:3000',
        }));

        socketModule = require('./socket.context');
    });

    it('socketEndpoint est défini et est une chaîne', () => {
        expect(socketModule.socketEndpoint).toBeDefined();
        expect(typeof socketModule.socketEndpoint).toBe('string');
    });

    it('socket est exporté et possède les méthodes emit, on et off', () => {
        expect(socketModule.socket).toBeDefined();
        expect(typeof socketModule.socket.emit).toBe('function');
        expect(typeof socketModule.socket.on).toBe('function');
        expect(typeof socketModule.socket.off).toBe('function');
    });

    it('SocketContext est un React context', () => {
        expect(socketModule.SocketContext).toBeDefined();
        // Un React context a un Provider et un Consumer
        expect(socketModule.SocketContext.Provider).toBeDefined();
        expect(socketModule.SocketContext.Consumer).toBeDefined();
    });

    it('hasConnection commence à false', () => {
        expect(socketModule.hasConnection).toBe(false);
    });
});
