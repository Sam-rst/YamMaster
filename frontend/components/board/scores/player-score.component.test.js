import React from 'react';
import { render } from '@testing-library/react';
import PlayerScore from './player-score.component';

describe('PlayerScore', () => {
    it('affiche "PlayerScore"', () => {
        const { getByText } = render(<PlayerScore />);
        expect(getByText('PlayerScore')).toBeTruthy();
    });
});
