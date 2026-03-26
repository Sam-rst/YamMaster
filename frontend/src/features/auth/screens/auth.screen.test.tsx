// frontend/src/features/auth/screens/auth.screen.test.tsx
// Tests d'intégration de l'écran d'authentification Smart Login

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import AuthScreen from './auth.screen';
import { AuthProvider } from '@/shared/contexts/auth.context';

// Mock AuthService
const mockLogin = jest.fn();
const mockCheckUsername = jest.fn();
jest.mock('../services/auth.service', () => ({
    __esModule: true,
    default: {
        login: (...args: unknown[]) => mockLogin(...args),
        checkUsername: (...args: unknown[]) => mockCheckUsername(...args),
    },
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const renderAuthScreen = () => {
    return render(
        <AuthProvider>
            <AuthScreen navigation={navigation} />
        </AuthProvider>
    );
};

describe('AuthScreen — Smart Login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockCheckUsername.mockResolvedValue({ exists: false });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('affiche le titre et les champs', () => {
        const { getByText, getByPlaceholderText } = renderAuthScreen();

        expect(getByText('Yam Master')).toBeTruthy();
        expect(getByPlaceholderText(/nom d'utilisateur/i)).toBeTruthy();
    });

    test('affiche le bouton de connexion après vérification du username', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });
        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });
        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        await waitFor(() => {
            expect(getByText(/connecter|Créer mon compte/i)).toBeTruthy();
        });
    });

    test('appelle checkUsername avec debounce quand on tape un username', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });

        const { getByPlaceholderText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });

        // Avancer le debounce
        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        expect(mockCheckUsername).toHaveBeenCalledWith('alice');
    });

    test('affiche "Bon retour" pour un utilisateur existant', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });

        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        await waitFor(() => {
            expect(getByText(/Bon retour/)).toBeTruthy();
        });
    });

    test('affiche "Nouveau joueur" pour un username inexistant', async () => {
        mockCheckUsername.mockResolvedValue({ exists: false });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'newplayer' } });
        });

        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        await waitFor(() => {
            expect(getByText(/Nouveau joueur/)).toBeTruthy();
        });
    });

    test('le bouton change de texte selon le type d\'utilisateur', async () => {
        mockCheckUsername.mockResolvedValue({ exists: false });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'newplayer' } });
        });

        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        await waitFor(() => {
            expect(getByText(/Créer mon compte/)).toBeTruthy();
        });
    });

    test('appelle AuthService.login au submit', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });
        mockLogin.mockResolvedValue({
            success: true,
            user: { id: 'u1', username: 'alice', createdAt: '2026-01-01' },
            isNewUser: false,
        });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        // Étape 1 : saisir le username et attendre le check
        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });
        await act(async () => { jest.advanceTimersByTime(600); });

        // Étape 2 : saisir le password et soumettre
        await waitFor(() => {
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'secret' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connecter|Créer mon compte/i));
        });

        expect(mockLogin).toHaveBeenCalledWith('alice', 'secret');
    });

    test('affiche un message de succès puis redirige', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });
        mockLogin.mockResolvedValue({
            success: true,
            user: { id: 'u1', username: 'alice', createdAt: '2026-01-01' },
            isNewUser: false,
        });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });
        await act(async () => { jest.advanceTimersByTime(600); });

        await waitFor(() => {
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'secret' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connecter|Créer mon compte/i));
        });

        await waitFor(() => {
            expect(getByText(/Bon retour, alice/)).toBeTruthy();
            expect(getByText(/Redirection/)).toBeTruthy();
        });

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
    });

    test('affiche une erreur pour un mauvais mot de passe', async () => {
        mockCheckUsername.mockResolvedValue({ exists: true });
        mockLogin.mockResolvedValue({
            success: false,
            error: 'Mot de passe incorrect',
        });

        const { getByPlaceholderText, getByText } = renderAuthScreen();

        await act(async () => {
            fireEvent.change(getByPlaceholderText(/nom d'utilisateur/i), { target: { value: 'alice' } });
        });
        await act(async () => { jest.advanceTimersByTime(600); });

        await waitFor(() => {
            fireEvent.change(getByPlaceholderText(/mot de passe/i), { target: { value: 'wrong' } });
        });

        await act(async () => {
            fireEvent.click(getByText(/connecter|Créer mon compte/i));
        });

        await waitFor(() => {
            expect(getByText(/Mot de passe incorrect/)).toBeTruthy();
        });
    });
});
