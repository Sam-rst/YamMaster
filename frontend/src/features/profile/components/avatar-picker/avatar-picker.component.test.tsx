// frontend/src/features/profile/components/avatar-picker/avatar-picker.component.test.tsx
// Tests du composant AvatarPicker — sélection parmi 8 emojis

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AvatarPicker from './avatar-picker.component';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Feather: ({ name, ...props }: { name: string } & Record<string, unknown>) =>
        <span data-testid={`icon-${name}`} {...props} />,
}));

const AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

describe('AvatarPicker', () => {
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('n\'affiche rien quand visible est false', () => {
        const { queryByTestId } = render(
            <AvatarPicker
                visible={false}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );
        expect(queryByTestId('modal')).toBeNull();
    });

    test('affiche la modale quand visible est true', () => {
        const { getByTestId } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );
        expect(getByTestId('modal')).toBeTruthy();
    });

    test('affiche les 8 emojis disponibles', () => {
        const { getByText } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        for (const avatar of AVATARS) {
            expect(getByText(avatar)).toBeTruthy();
        }
    });

    test('appelle onSelect avec l\'emoji cliqué', () => {
        const { getByText } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(getByText('👑'));

        expect(mockOnSelect).toHaveBeenCalledWith('👑');
    });

    test('appelle onSelect avec le bon emoji pour chaque avatar', () => {
        const { getByText } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(getByText('🐉'));
        expect(mockOnSelect).toHaveBeenCalledWith('🐉');
    });

    test('appelle onClose quand on clique sur le bouton fermer', () => {
        const { getByTestId } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(getByTestId('icon-x'));

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('ne recouvre pas onSelect si onClose est aussi déclenché', () => {
        const { getByText, getByTestId } = render(
            <AvatarPicker
                visible={true}
                currentAvatar="🎲"
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />
        );

        fireEvent.click(getByText('🔥'));
        fireEvent.click(getByTestId('icon-x'));

        expect(mockOnSelect).toHaveBeenCalledWith('🔥');
        expect(mockOnClose).toHaveBeenCalled();
    });
});
