import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BotDifficultyScreen from './bot-difficulty.screen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const navigation = { navigate: mockNavigate, goBack: mockGoBack };

describe('BotDifficultyScreen', () => {
    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre "Mode Entraînement"', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText('Mode Entraînement')).toBeTruthy();
    });

    test('affiche les 3 cartes de difficulté', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText('Débutant')).toBeTruthy();
        expect(getByText('Tactique')).toBeTruthy();
        expect(getByText('Maître IA')).toBeTruthy();
    });

    test('affiche les descriptions', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText(/se chauffer/)).toBeTruthy();
        expect(getByText(/défi équilibré/)).toBeTruthy();
        expect(getByText(/droit à l'erreur/)).toBeTruthy();
    });

    test('naviguer vers VsBotGameScreen avec EASY au clic sur Débutant', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Débutant'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'EASY' });
    });

    test('naviguer vers VsBotGameScreen avec MEDIUM au clic sur Tactique', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Tactique'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'MEDIUM' });
    });

    test('naviguer vers VsBotGameScreen avec HARD au clic sur Maître IA', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Maître IA'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'HARD' });
    });

    test('bouton retour appelle goBack', () => {
        const { getByTestId } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByTestId('icon-arrow-left'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});
