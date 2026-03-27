// RED — Test de l'orchestrateur ReplayAction
import React from 'react';
import { render } from '@testing-library/react';
import ReplayAction from './replay-action.component';

describe('ReplayAction', () => {
    it('affiche ReplayRoll pour un type roll', () => {
        const { getByText } = render(
            <ReplayAction
                type="roll"
                data={{ dices: [{ id: 1, value: '3' }], rollNumber: 1 }}
                playerName="alice"
            />
        );
        expect(getByText(/lancer 1/i)).toBeTruthy();
    });

    it('affiche ReplayDefi pour un type defi', () => {
        const { getAllByText } = render(
            <ReplayAction type="defi" data={{}} playerName="alice" />
        );
        expect(getAllByText(/défi/i).length).toBeGreaterThanOrEqual(1);
    });

    it('affiche ReplayPredator pour un type predator', () => {
        const { getAllByText } = render(
            <ReplayAction type="predator" data={{}} playerName="alice" />
        );
        expect(getAllByText(/predator/i).length).toBeGreaterThanOrEqual(1);
    });

    it('affiche le nom du joueur', () => {
        const { getByText } = render(
            <ReplayAction type="defi" data={{}} playerName="alice" />
        );
        expect(getByText(/alice/i)).toBeTruthy();
    });
});
