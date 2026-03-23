import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import HomeScreen from './home.screen';

describe('HomeScreen', () => {

    const mockNavigation = {
        navigate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('affiche les deux boutons de jeu', () => {
        const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
        expect(getByText('Jouer en ligne')).toBeTruthy();
        expect(getByText('Jouer contre le bot')).toBeTruthy();
    });

    it('navigue vers OnlineGameScreen au clic sur "Jouer en ligne"', () => {
        const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
        fireEvent.click(getByText('Jouer en ligne'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('OnlineGameScreen');
    });

    it('navigue vers VsBotGameScreen au clic sur "Jouer contre le bot"', () => {
        const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
        fireEvent.click(getByText('Jouer contre le bot'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('VsBotGameScreen');
    });
});
