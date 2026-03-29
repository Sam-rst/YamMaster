import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import PonderModal from './ponder-modal.component';

describe('PonderModal', () => {
    const mockClose = jest.fn();

    beforeEach(() => { jest.clearAllMocks(); jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    test('affiche le titre de la scène', () => {
        const { getByText } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        expect(getByText(/Les Dés/)).toBeTruthy();
    });

    test('affiche le bouton fermer', () => {
        const { getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        expect(getByTestId('icon-x')).toBeTruthy();
    });

    test('appelle onClose au clic sur fermer', () => {
        const { getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test('affiche le compteur d\'étapes', () => {
        const { getByText } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('avance automatiquement après le timeout', () => {
        const { getByText } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        expect(getByText('Étape 1 / 5')).toBeTruthy();
        act(() => { jest.advanceTimersByTime(2000); });
        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });

    test('pause arrête l\'autoplay', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-pause'));
        act(() => { jest.advanceTimersByTime(5000); });
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('next avance manuellement', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-chevron-right'));
        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });
});
