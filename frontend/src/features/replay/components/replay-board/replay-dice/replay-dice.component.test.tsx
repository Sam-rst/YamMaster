import React from 'react';
import { render } from '@testing-library/react';
import ReplayDice from './replay-dice.component';

describe('ReplayDice', () => {
    const mockDices = [
        { id: 1, value: '3', locked: false },
        { id: 2, value: '5', locked: true },
        { id: 3, value: '1', locked: false },
        { id: 4, value: '6', locked: false },
        { id: 5, value: '2', locked: true },
    ];

    it('rend les dés sans erreur', () => {
        const { container } = render(<ReplayDice dices={mockDices} />);
        expect(container.firstChild).toBeTruthy();
    });

    it('affiche le compteur de lancers', () => {
        const { getByText } = render(<ReplayDice dices={mockDices} rollsCounter={2} rollsMaximum={3} />);
        expect(getByText(/2/)).toBeTruthy();
    });
});
