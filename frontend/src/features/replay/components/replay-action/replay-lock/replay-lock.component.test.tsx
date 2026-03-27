// RED — Test du composant ReplayLock
import React from 'react';
import { render } from '@testing-library/react';
import ReplayLock from './replay-lock.component';

describe('ReplayLock', () => {
    it('affiche le dé verrouillé', () => {
        const { getByText } = render(
            <ReplayLock data={{ diceId: 1, locked: true }} />
        );
        expect(getByText(/verrouillé/i)).toBeTruthy();
    });

    it('affiche le dé déverrouillé', () => {
        const { getByText } = render(
            <ReplayLock data={{ diceId: 3, locked: false }} />
        );
        expect(getByText(/déverrouillé/i)).toBeTruthy();
    });
});
