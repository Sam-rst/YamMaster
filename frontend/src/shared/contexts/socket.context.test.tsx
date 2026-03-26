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

interface SocketModule {
    socketEndpoint: string;
    socket: {
        id: string;
        emit: jest.Mock;
        on: jest.Mock;
        off: jest.Mock;
    };
    SocketContext: React.Context<unknown>;
    hasConnection: boolean;
}

describe('socket.context', () => {

    let socketModule: SocketModule;

    beforeEach(() => {
        jest.clearAllMocks();
        // Reinitialiser le cache du module pour chaque test
        jest.resetModules();

        // Re-mock apres resetModules
        jest.doMock('socket.io-client', () => jest.fn(() => mockSocket));
        jest.doMock('@/shared/services/config', () => ({
            SERVER_URL: 'http://localhost:3000',
        }));

        socketModule = require('./socket.context');
    });

    it('socketEndpoint est defini et est une chaine', () => {
        expect(socketModule.socketEndpoint).toBeDefined();
        expect(typeof socketModule.socketEndpoint).toBe('string');
    });

    it('socket est exporte et possede les methodes emit, on et off', () => {
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

    it('hasConnection commence a false', () => {
        expect(socketModule.hasConnection).toBe(false);
    });
});
