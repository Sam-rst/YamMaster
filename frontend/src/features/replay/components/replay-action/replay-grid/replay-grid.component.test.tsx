// RED — Test du composant ReplayGrid
import React from 'react';
import { render } from '@testing-library/react';
import ReplayGrid from './replay-grid.component';

describe('ReplayGrid', () => {
    it('affiche les coordonnées de la case', () => {
        const { getByText } = render(
            <ReplayGrid data={{ rowIndex: 2, cellIndex: 3 }} />
        );
        expect(getByText(/ligne 3/i)).toBeTruthy();
        expect(getByText(/colonne 4/i)).toBeTruthy();
    });
});
