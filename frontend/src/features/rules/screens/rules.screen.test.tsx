import React from 'react';
import { render } from '@testing-library/react';
import RulesScreen from './rules.screen';

describe('RulesScreen', () => {
    test('rend le contenu des règles', () => {
        const { getByText } = render(<RulesScreen />);
        expect(getByText('YAM MASTER')).toBeTruthy();
        expect(getByText('Les Dés')).toBeTruthy();
        expect(getByText('Les Combinaisons')).toBeTruthy();
    });
});
