import React from 'react';
import { render } from '@testing-library/react';
import OpponentInfos from './opponent-infos.component';

describe('OpponentInfos', () => {
    it('affiche "Opponent infos"', () => {
        const { getByText } = render(<OpponentInfos />);
        expect(getByText('Opponent infos')).toBeTruthy();
    });
});
