// RED — Test du composant ReplayBoard (orchestrateur)

import React from 'react';
import { render } from '@testing-library/react';
import ReplayBoard from './replay-board.component';

const mockGameState = {
    currentTurn: 'player:1',
    timer: 25,
    player1Score: 2,
    player2Score: 1,
    player1Tokens: 10,
    player2Tokens: 11,
    grid: [[{ id: '0-0', viewContent: '1', owner: null, canBeChecked: false }]],
    choices: { isDefi: false, isSec: false, idSelectedChoice: null, availableChoices: [] },
    deck: { dices: [{ id: 1, value: '3', locked: false }], rollsCounter: 1, rollsMaximum: 3 },
};

describe('ReplayBoard', () => {
    it('rend le plateau complet sans erreur', () => {
        const { container } = render(
            <ReplayBoard
                gameState={mockGameState}
                action={{ type: 'roll', playerNumber: 1, timestamp: 1000, data: {} }}
                playerName="alice"
            />
        );
        expect(container.firstChild).toBeTruthy();
    });

    it('affiche les scores', () => {
        const { getByText } = render(
            <ReplayBoard gameState={mockGameState} action={null} playerName="" />
        );
        expect(getByText('2')).toBeTruthy();
    });
});
