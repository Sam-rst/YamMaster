// RED — Test du composant EndScreen
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EndScreen from './end-screen.component';

describe('EndScreen', () => {

    const mockOnReplay = jest.fn();
    const mockOnHome = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    it('affiche "Victoire" quand le joueur gagne', () => {
        const { getByText } = render(
            <EndScreen
                isWin={true}
                isDraw={false}
                playerScore={5}
                opponentScore={2}
                reason="alignment5"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        expect(getByText(/victoire/i)).toBeTruthy();
    });

    it('affiche "Défaite" quand le joueur perd', () => {
        const { getByText } = render(
            <EndScreen
                isWin={false}
                isDraw={false}
                playerScore={2}
                opponentScore={5}
                reason="noTokens"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        expect(getByText(/défaite/i)).toBeTruthy();
    });

    it('affiche "Égalité" en cas de match nul', () => {
        const { getByText } = render(
            <EndScreen
                isWin={false}
                isDraw={true}
                playerScore={3}
                opponentScore={3}
                reason="noTokens"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        expect(getByText(/égalité/i)).toBeTruthy();
    });

    it('affiche les scores', () => {
        const { getByText } = render(
            <EndScreen
                isWin={true}
                isDraw={false}
                playerScore={5}
                opponentScore={2}
                reason="noTokens"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        expect(getByText('5')).toBeTruthy();
        expect(getByText('2')).toBeTruthy();
    });

    it('affiche la raison de fin de partie', () => {
        const { getByText } = render(
            <EndScreen
                isWin={true}
                isDraw={false}
                playerScore={5}
                opponentScore={2}
                reason="alignment5"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        expect(getByText(/alignement/i)).toBeTruthy();
    });

    it('appelle onReplay au clic sur Rejouer', () => {
        const { getByText } = render(
            <EndScreen
                isWin={true}
                isDraw={false}
                playerScore={5}
                opponentScore={2}
                reason="alignment5"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        fireEvent.click(getByText(/rejouer/i));
        expect(mockOnReplay).toHaveBeenCalled();
    });

    it('appelle onHome au clic sur Menu Principal', () => {
        const { getByText } = render(
            <EndScreen
                isWin={true}
                isDraw={false}
                playerScore={5}
                opponentScore={2}
                reason="alignment5"
                onReplay={mockOnReplay}
                onHome={mockOnHome}
            />
        );
        fireEvent.click(getByText(/menu/i));
        expect(mockOnHome).toHaveBeenCalled();
    });
});
