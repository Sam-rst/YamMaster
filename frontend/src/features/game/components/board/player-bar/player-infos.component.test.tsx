import React from 'react';
import { render } from '@testing-library/react';
import PlayerInfos from './player-infos.component';

describe('PlayerInfos', () => {
    it('affiche "Player Infos"', () => {
        const { getByText } = render(<PlayerInfos />);
        expect(getByText('Player Infos')).toBeTruthy();
    });
});
