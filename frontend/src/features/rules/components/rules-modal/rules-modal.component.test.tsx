import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesModal from './rules-modal.component';

describe('RulesModal', () => {
    const mockClose = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('affiche le contenu des règles quand visible', () => {
        const { getByText } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );
        expect(getByText('YAM MASTER')).toBeTruthy();
    });

    test('affiche le bouton fermer', () => {
        const { getByTestId } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );
        expect(getByTestId('icon-x')).toBeTruthy();
    });

    test('appelle onClose au clic sur le bouton fermer', () => {
        const { getByTestId } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );
        fireEvent.click(getByTestId('icon-x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
