// RED — Test du composant ReplayChoice
import React from 'react';
import { render } from '@testing-library/react';
import ReplayChoice from './replay-choice.component';

describe('ReplayChoice', () => {
    it('affiche le nom de la combinaison choisie', () => {
        const { getByText } = render(
            <ReplayChoice data={{ choiceId: 'brelan3' }} />
        );
        expect(getByText(/brelan3/i)).toBeTruthy();
    });
});
