// RED — Test du controller Replay

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ReplayController from './replay.controller';

const mockGetGameWithTurns = jest.fn();
jest.mock('../services/replay.service', () => ({
    __esModule: true,
    default: {
        getGameWithTurns: (...args: unknown[]) => mockGetGameWithTurns(...args),
    },
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const mockGameData = {
    id: 'game-1',
    mode: 'VS_BOT',
    reason: 'noTokens',
    turns: [
        { type: 'roll', playerNumber: 1, timestamp: 1000, data: { dices: [{ id: 1, value: '3' }], rollNumber: 1 } },
        { type: 'lock', playerNumber: 1, timestamp: 2000, data: { diceId: 1, locked: true } },
        { type: 'choice', playerNumber: 1, timestamp: 3000, data: { choiceId: 'brelan3' } },
    ],
    players: [
        { playerNumber: 1, user: { id: 'u1', username: 'alice' }, isBot: false, score: 3, result: 'WIN' },
        { playerNumber: 2, user: null, isBot: true, score: 1, result: 'LOSE' },
    ],
};

describe('ReplayController', () => {

    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre Replay', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );
        await waitFor(() => {
            expect(getByText(/replay/i)).toBeTruthy();
        });
    });

    test('affiche les contrôles Suivant et Précédent', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );
        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
            expect(getByText(/précédent/i)).toBeTruthy();
        });
    });

    test('affiche le composant graphique au lieu du JSON brut après clic Suivant', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText, queryByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
        });

        act(() => {
            fireEvent.click(getByText(/suivant/i));
        });

        // Doit afficher "Lancer de dés" (label de l'orchestrateur) et "Lancer 1/3" (sous-composant roll)
        expect(getByText(/lancer de dés/i)).toBeTruthy();
        expect(getByText(/lancer 1/i)).toBeTruthy();
        // Ne doit PAS afficher de JSON brut
        expect(queryByText(/\{.*dices.*\}/)).toBeFalsy();
    });

    test('affiche une erreur si la partie est introuvable', async () => {
        mockGetGameWithTurns.mockResolvedValue(null);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="inexistant" />
        );

        await waitFor(() => {
            expect(getByText(/introuvable/i)).toBeTruthy();
        });
    });
});
