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

    test('affiche le bouton "Voir en action" dans une section ouverte', () => {
        const { getByText, getAllByText } = render(<RulesContent />);
        fireEvent.click(getByText('Les Dés'));
        expect(getAllByText(/Voir en action/).length).toBeGreaterThanOrEqual(1);
    });

    test('cliquer "Voir en action" ouvre le PonderModal', () => {
        const { getByText, getAllByText } = render(<RulesContent />);
        fireEvent.click(getByText('Les Dés'));
        fireEvent.click(getAllByText(/Voir en action/)[0]);
        expect(getByText(/Les Dés/)).toBeTruthy();
    });

    test('affiche le contenu de la section Actions Spéciales', () => {
        const { getByText } = render(<RulesContent />);
        fireEvent.click(getByText('Actions Spéciales'));
        expect(getByText(/Sec/)).toBeTruthy();
        expect(getByText(/Défi/)).toBeTruthy();
        expect(getByText(/Yam Predator/)).toBeTruthy();
    });

    test('affiche le contenu de la section La Grille & les Pions', () => {
        const { getByText } = render(<RulesContent />);
        fireEvent.click(getByText('La Grille & les Pions'));
        expect(getByText(/grille de jeu est de 5×5/)).toBeTruthy();
    });

    test('affiche le contenu de la section Scoring & Victoire', () => {
        const { getByText } = render(<RulesContent />);
        fireEvent.click(getByText('Scoring & Victoire'));
        expect(getByText(/3 pions alignés/)).toBeTruthy();
        expect(getByText(/Victoire immédiate/)).toBeTruthy();
    });

    test('refermer une section ouverte en cliquant dessus', () => {
        const { getByText, queryByText } = render(<RulesContent />);
        fireEvent.click(getByText('Les Dés'));
        expect(getByText(/jusqu'à 3 lancers/i)).toBeTruthy();
        fireEvent.click(getByText('Les Dés'));
        expect(queryByText(/jusqu'à 3 lancers/i)).toBeNull();
    });
});
