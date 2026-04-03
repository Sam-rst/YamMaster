// frontend/src/shared/contexts/socket-provider.test.tsx
// Tests du SocketProvider — connexion socket liée à l'auth

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SocketContext, SocketProvider } from './socket.context';
import { AuthContext } from './auth.context';

// Mock socket.io-client
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockSocket = {
    id: 'test-socket-id',
    on: mockOn,
    disconnect: mockDisconnect,
    connected: true,
};

jest.mock('socket.io-client', () => ({
    __esModule: true,
    default: (...args: unknown[]) => {
        mockConnect(...args);
        return mockSocket;
    },
}));

const TestConsumer: React.FC = () => {
    const socket = React.useContext(SocketContext);
    return <span data-testid="socket-id">{socket ? socket.id : 'null'}</span>;
};

const renderWithAuth = (user: { id: string; username: string; avatar?: string; createdAt: string } | null) => {
    return render(
        <AuthContext.Provider value={{
            user,
            isAuthenticated: user !== null,
            login: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
        }}>
            <SocketProvider>
                <TestConsumer />
            </SocketProvider>
        </AuthContext.Provider>
    );
};

describe('SocketProvider', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('ne se connecte pas quand l\'utilisateur n\'est pas authentifié', () => {
        const { getByTestId } = renderWithAuth(null);

        expect(getByTestId('socket-id').textContent).toBe('null');
        expect(mockConnect).not.toHaveBeenCalled();
    });

    test('se connecte quand l\'utilisateur est authentifié', async () => {
        const user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' };
        const { getByTestId } = renderWithAuth(user);

        await waitFor(() => {
            expect(mockConnect).toHaveBeenCalled();
            expect(getByTestId('socket-id').textContent).toBe('test-socket-id');
        });
    });

    test('passe le userId et username dans la query de connexion', async () => {
        const user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' };
        renderWithAuth(user);

        await waitFor(() => {
            expect(mockConnect).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    query: { userId: 'user-1', username: 'alice' },
                }),
            );
        });
    });

    test('déconnecte le socket au démontage', async () => {
        const user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' };
        const { unmount } = renderWithAuth(user);

        await waitFor(() => {
            expect(mockConnect).toHaveBeenCalled();
        });

        unmount();
        expect(mockDisconnect).toHaveBeenCalled();
    });

    test('déconnecte le socket quand l\'utilisateur se déconnecte', async () => {
        const user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' };
        const { rerender } = renderWithAuth(user);

        await waitFor(() => {
            expect(mockConnect).toHaveBeenCalled();
        });

        rerender(
            <AuthContext.Provider value={{
                user: null,
                isAuthenticated: false,
                login: jest.fn(),
                logout: jest.fn(),
                updateUser: jest.fn(),
            }}>
                <SocketProvider>
                    <TestConsumer />
                </SocketProvider>
            </AuthContext.Provider>
        );

        expect(mockDisconnect).toHaveBeenCalled();
    });

    test('enregistre les handlers connect et disconnect', async () => {
        const user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' };
        renderWithAuth(user);

        await waitFor(() => {
            expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
        });
    });

    test('passe l\'avatar dans la query de connexion', async () => {
        const user = { id: 'user-1', username: 'alice', avatar: '🎯', createdAt: '2026-01-01' };
        renderWithAuth(user);

        await waitFor(() => {
            expect(mockConnect).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    query: expect.objectContaining({ avatar: '🎯' }),
                }),
            );
        });
    });
});
