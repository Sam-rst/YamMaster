import React from 'react';
import { render } from '@testing-library/react';
import ReplayScores from './replay-scores.component';

describe('ReplayScores', () => {
    it('affiche les scores des deux joueurs', () => {
        const { getByText } = render(
            <ReplayScores
                player1Score={3}
                player2Score={1}
                player1Tokens={8}
                player2Tokens={10}
                currentTurn="player:1"
            />
        );
        expect(getByText('3')).toBeTruthy();
        expect(getByText('1')).toBeTruthy();
    });

    it('affiche les jetons', () => {
        const { getByText } = render(
            <ReplayScores
                player1Score={0}
                player2Score={0}
                player1Tokens={8}
                player2Tokens={10}
                currentTurn="player:1"
            />
        );
        expect(getByText(/8/)).toBeTruthy();
        expect(getByText(/10/)).toBeTruthy();
    });
});
