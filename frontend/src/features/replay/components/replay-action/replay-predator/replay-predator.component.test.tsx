// RED — Test du composant ReplayPredator
import React from 'react';
import { render } from '@testing-library/react';
import ReplayPredator from './replay-predator.component';

describe('ReplayPredator', () => {
    it('affiche le badge Yam Predator', () => {
        const { getByText } = render(<ReplayPredator />);
        expect(getByText(/predator/i)).toBeTruthy();
    });
});
