import React from 'react';
import { render } from '@testing-library/react';
import ScoringScene from './scoring-scene.component';

describe('ScoringScene', () => {
    test('step 0 — affiche "3 pions alignés" et "+1 point"', () => {
        const { getByText } = render(<ScoringScene currentStep={0} />);
        expect(getByText('3 pions alignés')).toBeTruthy();
        expect(getByText('+1 point')).toBeTruthy();
    });
    test('step 1 — affiche "4 pions alignés" et "+2 points"', () => {
        const { getByText } = render(<ScoringScene currentStep={1} />);
        expect(getByText('4 pions alignés')).toBeTruthy();
        expect(getByText('+2 points')).toBeTruthy();
    });
    test('step 2 — affiche "5 pions alignés" et "VICTOIRE"', () => {
        const { getByText } = render(<ScoringScene currentStep={2} />);
        expect(getByText('5 pions alignés')).toBeTruthy();
        expect(getByText(/VICTOIRE/)).toBeTruthy();
    });
});
