import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Dice from './die.component';

describe('Dice', () => {

    it('affiche les dots du dé (5 dots pour valeur 5)', () => {
        const { container } = render(
            <Dice index={0} value="5" locked={false} onPress={jest.fn()} />
        );
        expect(container.firstChild).toBeTruthy();
    });

    it('appelle onPress avec l\'index au clic (joueur)', () => {
        const onPress = jest.fn();
        const { container } = render(
            <Dice index={2} value="3" locked={false} onPress={onPress} />
        );
        fireEvent.click(container.firstChild as Element);
        expect(onPress).toHaveBeenCalledWith(2);
    });

    it('n\'appelle pas onPress si opponent est true', () => {
        const onPress = jest.fn();
        const { container } = render(
            <Dice index={0} value="4" locked={false} onPress={onPress} opponent={true} />
        );
        fireEvent.click(container.firstChild as Element);
        expect(onPress).not.toHaveBeenCalled();
    });

    it('affiche le badge cadenas quand locked', () => {
        const { getByTestId } = render(
            <Dice index={0} value="3" locked={true} onPress={jest.fn()} />
        );
        expect(getByTestId('icon-lock')).toBeTruthy();
    });
});
