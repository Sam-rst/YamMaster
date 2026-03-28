import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesContent from './rules-content.component';

describe('RulesContent', () => {
    test('affiche le titre YAM MASTER et la description d\'intro', () => {
        const { getByText } = render(<RulesContent />);
        expect(getByText('YAM MASTER')).toBeTruthy();
        expect(getByText(/grille 5×5/i)).toBeTruthy();
    });

    test('affiche les 5 sections accordéon', () => {
        const { getByText } = render(<RulesContent />);
        expect(getByText('Les Dés')).toBeTruthy();
        expect(getByText('Les Combinaisons')).toBeTruthy();
        expect(getByText('Actions Spéciales')).toBeTruthy();
        expect(getByText('La Grille & les Pions')).toBeTruthy();
        expect(getByText('Scoring & Victoire')).toBeTruthy();
    });

    test('toutes les sections sont fermées par défaut', () => {
        const { queryByText } = render(<RulesContent />);
        expect(queryByText(/jusqu'à 3 lancers/i)).toBeNull();
        expect(queryByText(/Brelan/i)).toBeNull();
    });

    test('ouvrir une section affiche son contenu', () => {
        const { getByText } = render(<RulesContent />);
        fireEvent.click(getByText('Les Dés'));
        expect(getByText(/jusqu'à 3 lancers/i)).toBeTruthy();
    });

    test('ouvrir une section ferme la précédente', () => {
        const { getByText, queryByText } = render(<RulesContent />);
        fireEvent.click(getByText('Les Dés'));
        expect(getByText(/jusqu'à 3 lancers/i)).toBeTruthy();
        fireEvent.click(getByText('Les Combinaisons'));
        expect(queryByText(/jusqu'à 3 lancers/i)).toBeNull();
        expect(getByText(/Brelan/i)).toBeTruthy();
    });
});
