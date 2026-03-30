// frontend/src/features/profile/components/stats-grid/stats-grid.component.test.tsx
// Tests du composant StatsGrid — affichage des statistiques joueur

import React from 'react';
import { render } from '@testing-library/react';
import StatsGrid from './stats-grid.component';

const mockStats = {
    totalGames: 42,
    wins: 25,
    losses: 15,
    draws: 2,
    winRate: 59.5,
    onlineGames: 30,
    botGames: 12,
    bestWinStreak: 7,
    averageScore: 4.2,
    favoriteBotDifficulty: 'MEDIUM' as const,
};

describe('StatsGrid', () => {

    describe('Statistiques principales', () => {
        test('affiche le nombre total de parties', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('42')).toBeTruthy();
            expect(getByText('Parties')).toBeTruthy();
        });

        test('affiche le ratio victoires/défaites en pourcentage', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('59.5%')).toBeTruthy();
            expect(getByText('Ratio V/D')).toBeTruthy();
        });

        test('affiche le nombre de victoires', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('25')).toBeTruthy();
            expect(getByText('Victoires')).toBeTruthy();
        });

        test('affiche le nombre de défaites', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('15')).toBeTruthy();
            expect(getByText('Défaites')).toBeTruthy();
        });
    });

    describe('Statistiques par mode', () => {
        test('affiche la section "Par mode"', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('Par mode')).toBeTruthy();
        });

        test('affiche le nombre de parties en ligne', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('30')).toBeTruthy();
            expect(getByText('En ligne')).toBeTruthy();
        });

        test('affiche le nombre de parties vs bot', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('12')).toBeTruthy();
            expect(getByText('Vs Bot')).toBeTruthy();
        });

        test('affiche la meilleure série de victoires', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('7')).toBeTruthy();
            expect(getByText('Win streak')).toBeTruthy();
        });
    });

    describe('Statistiques avancées', () => {
        test('affiche la section "Avancé"', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('Avancé')).toBeTruthy();
        });

        test('affiche le score moyen', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('Score moyen')).toBeTruthy();
            expect(getByText('4.2')).toBeTruthy();
        });

        test('affiche le nombre de nuls', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('Nuls')).toBeTruthy();
            expect(getByText('2')).toBeTruthy();
        });

        test('affiche MEDIUM comme "Tactique"', () => {
            const { getByText } = render(<StatsGrid stats={mockStats} />);
            expect(getByText('Bot préféré')).toBeTruthy();
            expect(getByText('Tactique')).toBeTruthy();
        });

        test('affiche EASY comme "Débutant"', () => {
            const easyStats = { ...mockStats, favoriteBotDifficulty: 'EASY' as const };
            const { getByText } = render(<StatsGrid stats={easyStats} />);
            expect(getByText('Débutant')).toBeTruthy();
        });

        test('affiche HARD comme "Maître IA"', () => {
            const hardStats = { ...mockStats, favoriteBotDifficulty: 'HARD' as const };
            const { getByText } = render(<StatsGrid stats={hardStats} />);
            expect(getByText('Maître IA')).toBeTruthy();
        });

        test('affiche "—" si aucun bot préféré', () => {
            const noFavoriteStats = { ...mockStats, favoriteBotDifficulty: null };
            const { getByText } = render(<StatsGrid stats={noFavoriteStats} />);
            expect(getByText('—')).toBeTruthy();
        });
    });
});
