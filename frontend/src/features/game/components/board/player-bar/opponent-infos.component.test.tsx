import React from 'react';
import { render } from '@testing-library/react';
import OpponentInfos from './opponent-infos.component';

describe('OpponentInfos', () => {
    it('affiche le username par défaut "Adversaire" sans props', () => {
        const { getByText } = render(<OpponentInfos />);
        expect(getByText('Adversaire')).toBeTruthy();
    });

    it('affiche le username passé en prop', () => {
        const { getByText } = render(<OpponentInfos username="Alice" />);
        expect(getByText('Alice')).toBeTruthy();
    });

    it('affiche le label ADVERSAIRE', () => {
        const { getByText } = render(<OpponentInfos />);
        expect(getByText('ADVERSAIRE')).toBeTruthy();
    });

    it('affiche l\'emoji avatar quand fourni', () => {
        const { getByText } = render(<OpponentInfos avatar="🎲" />);
        expect(getByText('🎲')).toBeTruthy();
    });

    it('affiche le rang quand fourni', () => {
        const rank = { name: 'Or', tier: 'gold', color: '#FFD700' };
        const { getByTestId } = render(<OpponentInfos rank={rank} />);
        const rankElement = getByTestId('opponent-rank');
        expect(rankElement).toBeTruthy();
        expect(rankElement.textContent || rankElement.props?.children).toContain('Or');
    });

    it('n\'affiche pas le rang quand non fourni', () => {
        const { queryByTestId } = render(<OpponentInfos />);
        expect(queryByTestId('opponent-rank')).toBeNull();
    });

    it('n\'affiche pas le rang quand null', () => {
        const { queryByTestId } = render(<OpponentInfos rank={null} />);
        expect(queryByTestId('opponent-rank')).toBeNull();
    });
});
