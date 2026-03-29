import React from 'react';
import { render } from '@testing-library/react';
import PonderScene from './ponder-scene.component';

describe('PonderScene', () => {
    test('rend DiceScene quand sceneId est "dice"', () => {
        const { getByText } = render(<PonderScene sceneId="dice" currentStep={0} />);
        expect(getByText('Premier lancer')).toBeTruthy();
    });
    test('rend CombinationsScene quand sceneId est "combinations"', () => {
        const { getByText } = render(<PonderScene sceneId="combinations" currentStep={0} />);
        expect(getByText('Brelan')).toBeTruthy();
    });
    test('rend SpecialScene quand sceneId est "special"', () => {
        const { getByText } = render(<PonderScene sceneId="special" currentStep={0} />);
        expect(getByText('SEC !')).toBeTruthy();
    });
    test('rend GridScene quand sceneId est "grid"', () => {
        const { getByText } = render(<PonderScene sceneId="grid" currentStep={0} />);
        expect(getByText('La grille')).toBeTruthy();
    });
    test('rend ScoringScene quand sceneId est "scoring"', () => {
        const { getByText } = render(<PonderScene sceneId="scoring" currentStep={0} />);
        expect(getByText('3 pions alignés')).toBeTruthy();
    });
});
