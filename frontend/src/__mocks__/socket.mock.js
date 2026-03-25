// Mock Socket.IO pour les tests
const createMockSocket = () => {
    const listeners = {};

    return {
        id: 'mock-socket-id',
        on: jest.fn((event, cb) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
        emit: jest.fn(),
        off: jest.fn(),
        removeAllListeners: jest.fn(),
        // Helper pour simuler la réception d'un événement dans les tests
        __simulateEvent: (event, data) => {
            if (listeners[event]) {
                listeners[event].forEach(cb => cb(data));
            }
        },
        __listeners: listeners,
    };
};

module.exports = { createMockSocket };
