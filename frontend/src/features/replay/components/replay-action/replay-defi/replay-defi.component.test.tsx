// RED — Test du composant ReplayDefi
import React from 'react';
import { render } from '@testing-library/react';
import ReplayDefi from './replay-defi.component';

describe('ReplayDefi', () => {
    it('affiche le badge Défi Royal', () => {
        const { getByText } = render(<ReplayDefi />);
        expect(getByText(/défi/i)).toBeTruthy();
    });
});
