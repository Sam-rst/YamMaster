// RED — Test du composant ReplayRoll
// Affiche les dés résultant d'un lancer avec le numéro du lancer

import React from 'react';
import { render } from '@testing-library/react';
import ReplayRoll from './replay-roll.component';

describe('ReplayRoll', () => {

    const mockData = {
        dices: [
            { id: 1, value: '3' },
            { id: 2, value: '5' },
            { id: 3, value: '1' },
            { id: 4, value: '6' },
            { id: 5, value: '2' },
        ],
        rollNumber: 2,
    };

    it('affiche le numéro du lancer', () => {
        const { getByText } = render(<ReplayRoll data={mockData} />);
        expect(getByText(/lancer 2/i)).toBeTruthy();
    });

    it('rend le composant avec les dés', () => {
        const { container } = render(<ReplayRoll data={mockData} />);
        // Le composant doit rendre sans erreur avec 5 dés
        expect(container.firstChild).toBeTruthy();
    });
});
