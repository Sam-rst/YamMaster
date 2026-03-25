// backend/src/__tests__/helpers/socket.helper.ts
// Factory pour créer des mock sockets utilisables dans les tests d'intégration

import { SocketLike } from '../../shared/types';

export interface MockSocket extends SocketLike {
    emittedEvents: Array<{ event: string; args: unknown[] }>;
    registeredListeners: Map<string, Array<(...args: unknown[]) => void>>;
    getEmitted: (event: string) => unknown[];
    getLastEmitted: (event: string) => unknown | undefined;
    countEmitted: (event: string) => number;
    triggerEvent: (event: string, ...args: unknown[]) => void;
    reset: () => void;
}

export const createMockSocket = (id = 'test-socket-1'): MockSocket => {
    const emittedEvents: Array<{ event: string; args: unknown[] }> = [];
    const registeredListeners = new Map<string, Array<(...args: unknown[]) => void>>();

    const mockSocket: MockSocket = {
        id,
        emittedEvents,
        registeredListeners,

        emit: (event: string, ...args: unknown[]) => {
            emittedEvents.push({ event, args });
        },

        on: (event: string, listener: (...args: unknown[]) => void) => {
            if (!registeredListeners.has(event)) {
                registeredListeners.set(event, []);
            }
            registeredListeners.get(event)!.push(listener);
        },

        getEmitted: (event: string) => {
            return emittedEvents
                .filter(e => e.event === event)
                .map(e => e.args[0]);
        },

        getLastEmitted: (event: string) => {
            const events = emittedEvents.filter(e => e.event === event);
            return events.length > 0 ? events[events.length - 1].args[0] : undefined;
        },

        countEmitted: (event: string) => {
            return emittedEvents.filter(e => e.event === event).length;
        },

        triggerEvent: (event: string, ...args: unknown[]) => {
            const listeners = registeredListeners.get(event) || [];
            for (const listener of listeners) {
                listener(...args);
            }
        },

        reset: () => {
            emittedEvents.length = 0;
            registeredListeners.clear();
        },
    };

    return mockSocket;
};
