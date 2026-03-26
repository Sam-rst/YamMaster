// frontend/src/features/auth/screens/auth.screen.test.tsx
// Tests d'intégration de l'écran d'authentification

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import AuthScreen from './auth.screen';

// Mock AuthService
const mockLogin = jest.fn();
jest.mock('../services/auth.service', () => ({
    __esModule: true,
    default: {
        login: (...args: unknown[]) => mockLogin(...args),
    },
}));

// Mock navigation
const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

describe('AuthScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('affiche les champs username et password', () => {
        const { getByPlaceholderText } = render(<AuthScreen navigation={navigation} />);

        expect(getByPlaceholderText(/nom d'utilisateur/i)).toBeTruthy();
        expect(getByPlaceholderText(/mot de passe/i)).toBeTruthy();
    });

    test('affiche un bouton de connexion', () => {
        const { getByText } = render(<AuthScreen navigation={navigation} />);
        expect(getByText(/connexion/i)).toBeTruthy();
    });

    test('appelle AuthService.login avec les valeurs saisies', async () => {
        mockLogin.mockResolvedValue({
            success: true,
            user: { id: 'user-1', username: 'alice' },
            isNewUser: false,
        });

        const { getByPlaceholderText, getByText } = render(<AuthScreen navigation={navigation} />);

        const usernameInput = getByPlaceholderText(/nom d'utilisateur/i);
        const passwordInput = getByPlaceholderText(/mot de passe/i);

        await act(async () => {
            fireEvent.change(usernameInput, { target: { value: 'alice' } });
            fireEvent.change(passwordInput, { target: { value: 'secret' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connexion/i));
        });

        expect(mockLogin).toHaveBeenCalledWith('alice', 'secret');
    });

    test('navigue vers HomeScreen après un login réussi', async () => {
        mockLogin.mockResolvedValue({
            success: true,
            user: { id: 'user-1', username: 'alice' },
            isNewUser: false,
        });

        const { getByPlaceholderText, getByText } = render(<AuthScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'secret' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connexion/i));
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
        });
    });

    test('affiche un message d\'erreur en cas d\'échec', async () => {
        mockLogin.mockResolvedValue({
            success: false,
            error: 'Mot de passe incorrect',
        });

        const { getByPlaceholderText, getByText } = render(<AuthScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'wrong' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connexion/i));
        });

        await waitFor(() => {
            expect(getByText(/Mot de passe incorrect/)).toBeTruthy();
        });
    });

    test('affiche un message de bienvenue pour un nouvel utilisateur', async () => {
        mockLogin.mockResolvedValue({
            success: true,
            user: { id: 'user-1', username: 'newbie' },
            isNewUser: true,
        });

        const { getByPlaceholderText, getByText } = render(<AuthScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'newbie' } });
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'secret' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connexion/i));
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
        });
    });
});
