// frontend/src/shared/contexts/socket.context.test.tsx
// Tests du SocketContext et SocketProvider

import React from 'react';
import { render } from '@testing-library/react';
import { SocketContext, SocketProvider } from './socket.context';
import { AuthContext } from './auth.context';

// Mock socket.io-client
const mockOn = jest.fn();
const mockDisconnect = jest.fn();
const mockSocket = { id: 'test-id', on: mockOn, disconnect: mockDisconnect, connected: true };

jest.mock('socket.io-client', () => ({
    __esModule: true,
    default: jest.fn(() => mockSocket),
}));

const TestConsumer: React.FC = () => {
    const socket = React.useContext(SocketContext);
    return <span data-testid="has-socket">{socket ? 'yes' : 'no'}</span>;
};

describe('SocketContext', () => {

    test('SocketContext est un React context avec Provider', () => {
        expect(SocketContext).toBeDefined();
        expect(SocketContext.Provider).toBeDefined();
    });

    test('SocketProvider fournit null quand pas authentifié', () => {
        const { getByTestId } = render(
            <AuthContext.Provider value={{
                user: null, isAuthenticated: false, login: jest.fn(), logout: jest.fn(),
            }}>
                <SocketProvider><TestConsumer /></SocketProvider>
            </AuthContext.Provider>
        );
        expect(getByTestId('has-socket').textContent).toBe('no');
    });

    test('SocketProvider fournit un socket quand authentifié', () => {
        const { getByTestId } = render(
            <AuthContext.Provider value={{
                user: { id: 'u1', username: 'alice', createdAt: '2026-01-01' },
                isAuthenticated: true, login: jest.fn(), logout: jest.fn(),
            }}>
                <SocketProvider><TestConsumer /></SocketProvider>
            </AuthContext.Provider>
        );
        expect(getByTestId('has-socket').textContent).toBe('yes');
    });
});
