import React from 'react';
import { render } from '@testing-library/react';
import ReplayGrid from './replay-grid.component';

describe('ReplayGrid', () => {
    const mockGrid = [
        [
            { id: '0-0', viewContent: '1', owner: 'player:1', canBeChecked: false },
            { id: '0-1', viewContent: '3', owner: null, canBeChecked: false },
        ],
        [
            { id: '1-0', viewContent: 'Carré', owner: 'player:2', canBeChecked: false },
            { id: '1-1', viewContent: 'Sec', owner: null, canBeChecked: false },
        ],
    ];

    it('affiche le contenu des cellules', () => {
        const { getByText } = render(<ReplayGrid grid={mockGrid} />);
        expect(getByText('1')).toBeTruthy();
        expect(getByText('Sec')).toBeTruthy();
    });

    it('rend le composant sans erreur', () => {
        const { container } = render(<ReplayGrid grid={mockGrid} />);
        expect(container.firstChild).toBeTruthy();
    });
});
