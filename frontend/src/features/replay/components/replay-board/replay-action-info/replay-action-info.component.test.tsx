import React from 'react';
import { render } from '@testing-library/react';
import ReplayActionInfo from './replay-action-info.component';

describe('ReplayActionInfo', () => {
    it('affiche le nom du joueur et le type d\'action pour un roll', () => {
        const { getByText } = render(
            <ReplayActionInfo
                action={{ type: 'roll', playerNumber: 1, timestamp: 1000, data: {} }}
                playerName="alice"
            />
        );
        expect(getByText(/alice/i)).toBeTruthy();
        expect(getByText(/lancer/i)).toBeTruthy();
    });

    it('affiche "Début de la partie" quand action est null', () => {
        const { getByText } = render(
            <ReplayActionInfo action={null} playerName="" />
        );
        expect(getByText(/début/i)).toBeTruthy();
    });
});
