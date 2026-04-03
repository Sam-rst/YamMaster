import React from 'react';
import { render } from '@testing-library/react';
import DiceScene from './dice-scene.component';

describe('DiceScene', () => {
    test('step 0 — affiche "Premier lancer"', () => {
        const { getByText } = render(<DiceScene currentStep={0} />);
        expect(getByText('Premier lancer')).toBeTruthy();
    });

    test('step 1 — affiche "Verrouiller les dés"', () => {
        const { getByText } = render(<DiceScene currentStep={1} />);
        expect(getByText('Verrouiller les dés')).toBeTruthy();
    });

    test('step 2 — affiche "Deuxième lancer"', () => {
        const { getByText } = render(<DiceScene currentStep={2} />);
        expect(getByText('Deuxième lancer')).toBeTruthy();
    });

    test('step 3 — affiche "Verrouiller encore"', () => {
        const { getByText } = render(<DiceScene currentStep={3} />);
        expect(getByText('Verrouiller encore')).toBeTruthy();
    });

    test('step 4 — affiche "Dernier lancer" et "Carré"', () => {
        const { getByText } = render(<DiceScene currentStep={4} />);
        expect(getByText('Dernier lancer')).toBeTruthy();
        expect(getByText(/Carré/)).toBeTruthy();
    });
});
