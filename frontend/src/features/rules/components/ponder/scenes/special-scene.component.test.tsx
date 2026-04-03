import React from 'react';
import { render } from '@testing-library/react';
import SpecialScene from './special-scene.component';

describe('SpecialScene', () => {
    test('step 0 — affiche "SEC !"', () => {
        const { getByText } = render(<SpecialScene currentStep={0} />);
        expect(getByText('SEC !')).toBeTruthy();
        expect(getByText(/1er lancer/)).toBeTruthy();
    });
    test('step 1 — affiche "DÉFI"', () => {
        const { getByText } = render(<SpecialScene currentStep={1} />);
        expect(getByText('DÉFI')).toBeTruthy();
    });
    test('step 2 — affiche "YAM PREDATOR"', () => {
        const { getByText } = render(<SpecialScene currentStep={2} />);
        expect(getByText('YAM PREDATOR')).toBeTruthy();
    });
});
