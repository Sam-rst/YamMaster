// backend/src/features/game/services/turn-recorder.service.test.ts
// Tests unitaires du service d'enregistrement des tours

import TurnRecorderService from './turn-recorder.service';

describe('TurnRecorderService', () => {

    describe('createRecorder', () => {
        test('crée un enregistreur vide', () => {
            const recorder = TurnRecorderService.createRecorder();
            expect(recorder.getTurns()).toHaveLength(0);
        });
    });

    describe('recordAction', () => {
        test('enregistre une action de lancer de dés', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({
                type: 'roll',
                playerNumber: 1,
                data: { dices: [1, 3, 4, 2, 6], rollNumber: 1 },
            });

            const turns = recorder.getTurns();
            expect(turns).toHaveLength(1);
            expect(turns[0].type).toBe('roll');
            expect(turns[0].playerNumber).toBe(1);
            expect(turns[0].timestamp).toBeDefined();
        });

        test('enregistre une action de verrouillage de dé', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({
                type: 'lock',
                playerNumber: 1,
                data: { diceId: 3 },
            });

            expect(recorder.getTurns()).toHaveLength(1);
            expect(recorder.getTurns()[0].type).toBe('lock');
        });

        test('enregistre une action de choix de combinaison', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({
                type: 'choice',
                playerNumber: 1,
                data: { choiceId: 'brelan1' },
            });

            expect(recorder.getTurns()[0].data).toEqual({ choiceId: 'brelan1' });
        });

        test('enregistre une action de placement sur la grille', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({
                type: 'grid',
                playerNumber: 2,
                data: { rowIndex: 1, cellIndex: 3 },
            });

            expect(recorder.getTurns()[0].playerNumber).toBe(2);
        });

        test('enregistre plusieurs actions dans l\'ordre', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({ type: 'roll', playerNumber: 1, data: { rollNumber: 1 } });
            recorder.recordAction({ type: 'lock', playerNumber: 1, data: { diceId: 2 } });
            recorder.recordAction({ type: 'roll', playerNumber: 1, data: { rollNumber: 2 } });
            recorder.recordAction({ type: 'choice', playerNumber: 1, data: { choiceId: 'full' } });
            recorder.recordAction({ type: 'grid', playerNumber: 1, data: { rowIndex: 0, cellIndex: 0 } });

            const turns = recorder.getTurns();
            expect(turns).toHaveLength(5);
            expect(turns[0].type).toBe('roll');
            expect(turns[4].type).toBe('grid');
        });
    });

    describe('recordGameState', () => {
        test('enregistre un snapshot de l\'état du jeu', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordGameState({
                grid: [[{ owner: 'player:1' }]],
                player1Score: 3,
                player2Score: 1,
                player1Tokens: 9,
                player2Tokens: 11,
            });

            const turns = recorder.getTurns();
            expect(turns).toHaveLength(1);
            expect(turns[0].type).toBe('snapshot');
        });
    });

    describe('toJSON', () => {
        test('retourne les tours sérialisables pour la BDD', () => {
            const recorder = TurnRecorderService.createRecorder();

            recorder.recordAction({ type: 'roll', playerNumber: 1, data: { rollNumber: 1 } });

            const json = recorder.toJSON();
            expect(Array.isArray(json)).toBe(true);
            expect(json[0].type).toBe('roll');
        });
    });
});
