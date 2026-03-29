import React from 'react';
import { render } from '@testing-library/react';
import GridScene from './grid-scene.component';

describe('GridScene', () => {
    test('step 0 — affiche "La grille"', () => {
        const { getByText } = render(<GridScene currentStep={0} />);
        expect(getByText('La grille')).toBeTruthy();
        expect(getByText(/5×5/)).toBeTruthy();
    });
    test('step 1 — affiche "Combinaison réussie"', () => {
        const { getByText } = render(<GridScene currentStep={1} />);
        expect(getByText('Combinaison réussie')).toBeTruthy();
    });
    test('step 2 — affiche "Poser un pion"', () => {
        const { getByText } = render(<GridScene currentStep={2} />);
        expect(getByText('Poser un pion')).toBeTruthy();
    });
    test('step 3 — affiche info adversaire', () => {
        const { getByText } = render(<GridScene currentStep={3} />);
        expect(getByText(/adversaire/i)).toBeTruthy();
    });
});
