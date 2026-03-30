// frontend/src/features/home/screens/home.screen.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import HomeScreen from './home.screen';
import { AuthProvider } from '@/shared/contexts/auth.context';

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
        <div data-testid="linear-gradient" {...props}>{children}</div>,
}));

jest.mock('@expo/vector-icons', () => ({
    Feather: ({ name, ...props }: { name: string } & Record<string, unknown>) =>
        <span data-testid={`icon-${name}`} {...props} />,
}));

const mockNavigation = { navigate: jest.fn() };

const renderHomeScreen = () => {
    return render(
        <AuthProvider>
            <HomeScreen navigation={mockNavigation} />
        </AuthProvider>
    );
};

describe('HomeScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('affiche le message de bienvenue', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('Bonjour,')).toBeTruthy();
    });

    it('affiche les trois actions de jeu', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('Partie en ligne')).toBeTruthy();
        expect(getByText('Vs Bot')).toBeTruthy();
        expect(getByText('Historique')).toBeTruthy();
    });

    it('affiche les descriptions des actions', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('Affrontez le monde entier')).toBeTruthy();
        expect(getByText('Entraînement tactique')).toBeTruthy();
        expect(getByText('Mes derniers résultats')).toBeTruthy();
    });

    it('affiche la section statistiques', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('Rang Actuel')).toBeTruthy();
        expect(getByText('Bronze IV')).toBeTruthy();
        expect(getByText('750 MMR')).toBeTruthy();
        expect(getByText('Ratio V/D')).toBeTruthy();
    });

    it('affiche la section "Prêt à jouer ?"', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('Prêt à jouer ?')).toBeTruthy();
    });

    it('navigue vers OnlineGameScreen au clic sur "Partie en ligne"', () => {
        const { getByText } = renderHomeScreen();
        fireEvent.click(getByText('Partie en ligne'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('OnlineGameScreen');
    });

    it('navigue vers BotDifficultyScreen au clic sur "Vs Bot"', () => {
        const { getByText } = renderHomeScreen();
        fireEvent.click(getByText('Vs Bot'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('BotDifficultyScreen');
    });

    it('navigue vers HistoryScreen au clic sur "Historique"', () => {
        const { getByText } = renderHomeScreen();
        fireEvent.click(getByText('Historique'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('HistoryScreen');
    });

    it('affiche le badge "En ligne"', () => {
        const { getByText } = renderHomeScreen();
        expect(getByText('En ligne')).toBeTruthy();
    });
});
