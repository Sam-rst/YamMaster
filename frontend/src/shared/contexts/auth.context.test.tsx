// frontend/src/shared/contexts/auth.context.test.tsx
// Tests du contexte d'authentification

import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from './auth.context';

// Composant test qui consomme le contexte
const TestConsumer: React.FC = () => {
    const { user, isAuthenticated, login, logout, updateUser } = useAuth();
    return (
        <div>
            <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
            <span data-testid="username">{user?.username || 'none'}</span>
            <span data-testid="avatar">{user?.avatar || 'none'}</span>
            <button onClick={() => login({ id: 'u1', username: 'alice', createdAt: '2026-01-01' })}>
                login
            </button>
            <button onClick={logout}>logout</button>
            <button onClick={() => updateUser({ avatar: '🎯' })}>update-avatar</button>
        </div>
    );
};

describe('AuthContext', () => {

    test('isAuthenticated est false par défaut', () => {
        const { getByTestId } = render(
            <AuthProvider><TestConsumer /></AuthProvider>
        );
        expect(getByTestId('authenticated').textContent).toBe('no');
        expect(getByTestId('username').textContent).toBe('none');
    });

    test('login met à jour le user et isAuthenticated', () => {
        const { getByTestId, getByText } = render(
            <AuthProvider><TestConsumer /></AuthProvider>
        );

        act(() => {
            getByText('login').click();
        });

        expect(getByTestId('authenticated').textContent).toBe('yes');
        expect(getByTestId('username').textContent).toBe('alice');
    });

    test('logout réinitialise le contexte', () => {
        const { getByTestId, getByText } = render(
            <AuthProvider><TestConsumer /></AuthProvider>
        );

        act(() => { getByText('login').click(); });
        expect(getByTestId('authenticated').textContent).toBe('yes');

        act(() => { getByText('logout').click(); });
        expect(getByTestId('authenticated').textContent).toBe('no');
        expect(getByTestId('username').textContent).toBe('none');
    });

    test('updateUser met à jour les champs du user connecté', () => {
        const { getByTestId, getByText } = render(
            <AuthProvider><TestConsumer /></AuthProvider>
        );

        act(() => { getByText('login').click(); });
        expect(getByTestId('avatar').textContent).toBe('none');

        act(() => { getByText('update-avatar').click(); });
        expect(getByTestId('avatar').textContent).toBe('🎯');
    });

    test('updateUser ne fait rien si aucun user connecté', () => {
        const { getByTestId, getByText } = render(
            <AuthProvider><TestConsumer /></AuthProvider>
        );

        act(() => { getByText('update-avatar').click(); });
        expect(getByTestId('username').textContent).toBe('none');
    });

    test('AuthContext est un React.Context', () => {
        expect(AuthContext).toBeDefined();
        expect(AuthContext.Provider).toBeDefined();
    });
});
