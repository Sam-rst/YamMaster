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

    test('prev recule manuellement', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-chevron-right'));
        expect(getByText('Étape 2 / 5')).toBeTruthy();
        fireEvent.click(getByTestId('icon-chevron-left'));
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('prev ne descend pas en dessous de 0', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-chevron-left'));
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('play/pause relance l\'autoplay depuis le début si à la dernière étape', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        // Avance jusqu'à la dernière étape
        fireEvent.click(getByTestId('icon-pause'));
        for (let i = 0; i < 4; i++) {
            fireEvent.click(getByTestId('icon-chevron-right'));
        }
        expect(getByText('Étape 5 / 5')).toBeTruthy();
        // Relance la lecture → revient à l'étape 1
        fireEvent.click(getByTestId('icon-play'));
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('next ne dépasse pas la dernière étape', () => {
        const { getByText, getByTestId } = render(<PonderModal visible={true} onClose={mockClose} sceneId="dice" />);
        fireEvent.click(getByTestId('icon-pause'));
        for (let i = 0; i < 10; i++) {
            fireEvent.click(getByTestId('icon-chevron-right'));
        }
        expect(getByText('Étape 5 / 5')).toBeTruthy();
    });
});
