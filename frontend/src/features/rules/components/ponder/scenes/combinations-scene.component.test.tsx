import React from 'react';
import { render } from '@testing-library/react';
import CombinationsScene from './combinations-scene.component';

describe('CombinationsScene', () => {
    test('step 0 — affiche "Brelan"', () => {
        const { getByText } = render(<CombinationsScene currentStep={0} />);
        expect(getByText('Brelan')).toBeTruthy();
        expect(getByText(/3 dés identiques/)).toBeTruthy();
    });
    test('step 1 — affiche "Full"', () => {
        const { getByText } = render(<CombinationsScene currentStep={1} />);
        expect(getByText('Full')).toBeTruthy();
    });
    test('step 2 — affiche "Carré"', () => {
        const { getByText } = render(<CombinationsScene currentStep={2} />);
        expect(getByText('Carré')).toBeTruthy();
    });
    test('step 3 — affiche "Yam"', () => {
        const { getByText } = render(<CombinationsScene currentStep={3} />);
        expect(getByText('Yam')).toBeTruthy();
    });
    test('step 4 — affiche "Suite"', () => {
        const { getByText } = render(<CombinationsScene currentStep={4} />);
        expect(getByText('Suite')).toBeTruthy();
    });
    test('step 5 — affiche "≤8"', () => {
        const { getByText } = render(<CombinationsScene currentStep={5} />);
        expect(getByText('≤8')).toBeTruthy();
        expect(getByText(/= 7/)).toBeTruthy();
    });
});
