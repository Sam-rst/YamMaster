import React from 'react';
import { render } from '@testing-library/react';
import OpponentScore from './opponent-score.component';

describe('OpponentScore', () => {
    it('affiche "Score: "', () => {
        const { getByText } = render(<OpponentScore />);
        expect(getByText('Score:')).toBeTruthy();
    });
});
