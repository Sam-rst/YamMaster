import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PonderControls from './ponder-controls.component';

describe('PonderControls', () => {
    const defaultProps = {
        currentStep: 1,
        totalSteps: 5,
        isPlaying: true,
        onTogglePlay: jest.fn(),
        onNext: jest.fn(),
        onPrev: jest.fn(),
        onGoToStep: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test('affiche le compteur d\'étapes', () => {
        const { getByText } = render(<PonderControls {...defaultProps} />);
        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });

    test('affiche le bouton pause quand isPlaying est true', () => {
        const { getByTestId } = render(<PonderControls {...defaultProps} isPlaying={true} />);
        expect(getByTestId('icon-pause')).toBeTruthy();
    });

    test('affiche le bouton play quand isPlaying est false', () => {
        const { getByTestId } = render(<PonderControls {...defaultProps} isPlaying={false} />);
        expect(getByTestId('icon-play')).toBeTruthy();
    });

    test('appelle onTogglePlay au clic sur play/pause', () => {
        const onTogglePlay = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onTogglePlay={onTogglePlay} />);
        fireEvent.click(getByTestId('icon-pause'));
        expect(onTogglePlay).toHaveBeenCalledTimes(1);
    });

    test('appelle onNext au clic sur suivant', () => {
        const onNext = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onNext={onNext} />);
        fireEvent.click(getByTestId('icon-chevron-right'));
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    test('appelle onPrev au clic sur précédent', () => {
        const onPrev = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onPrev={onPrev} />);
        fireEvent.click(getByTestId('icon-chevron-left'));
        expect(onPrev).toHaveBeenCalledTimes(1);
    });

    test('affiche le bon nombre de dots dans la timeline', () => {
        const { getAllByTestId } = render(<PonderControls {...defaultProps} totalSteps={5} />);
        expect(getAllByTestId(/^timeline-dot-/)).toHaveLength(5);
    });

    test('appelle onGoToStep au clic sur un dot', () => {
        const onGoToStep = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onGoToStep={onGoToStep} />);
        fireEvent.click(getByTestId('timeline-dot-3'));
        expect(onGoToStep).toHaveBeenCalledWith(3);
    });
});
