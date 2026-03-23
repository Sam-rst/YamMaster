import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Dice from './dice.component';

describe('Dice', () => {

    it('affiche la valeur du dé', () => {
        const { getByText } = render(
            <Dice index={0} value="5" locked={false} onPress={jest.fn()} />
        );
        expect(getByText('5')).toBeTruthy();
    });

    it('appelle onPress avec l\'index au clic (joueur)', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <Dice index={2} value="3" locked={false} onPress={onPress} />
        );
        fireEvent.click(getByText('3'));
        expect(onPress).toHaveBeenCalledWith(2);
    });

    it('n\'appelle pas onPress si opponent est true', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <Dice index={0} value="4" locked={false} onPress={onPress} opponent={true} />
        );
        // Le bouton est disabled, le clic ne devrait pas déclencher onPress
        // Note: dans notre mock, disabled empêche onClick
        fireEvent.click(getByText('4'));
        expect(onPress).not.toHaveBeenCalled();
    });
});
