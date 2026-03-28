// backend/src/features/game/handlers/game.handler.test.ts
// Tests d'intégration : vérifie que les handlers émettent les bons events

import { createMockGame } from '../../../__tests__/helpers/game.helper';
import {
    updateClientsViewTimers,
    updateClientsViewDecks,
    updateClientsViewChoices,
    updateClientsViewGrid,
    updateClientsViewScores,
    switchTurn,
    handleDiceRoll,
    handleDiceLock,
    handleChoiceSelected,
    handleGridSelected,
    handleDefi,
    handleYamPredator,
    handleDevPlace,
    startGameTimer,
} from './game.handler';

// ================================================================
// EMITTERS
// ================================================================

describe('Game Handler - Emitters', () => {
    test('updateClientsViewTimers émet game.timer aux deux joueurs', () => {
        const { game } = createMockGame();
        updateClientsViewTimers(game);

        expect(game.player1Socket.countEmitted('game.timer')).toBe(1);
        expect(game.player2Socket.countEmitted('game.timer')).toBe(1);
    });

    test('updateClientsViewDecks émet game.deck.view-state aux deux joueurs', (done) => {
        const { game } = createMockGame();
        updateClientsViewDecks(game);

        setTimeout(() => {
            expect(game.player1Socket.countEmitted('game.deck.view-state')).toBe(1);
            expect(game.player2Socket.countEmitted('game.deck.view-state')).toBe(1);
            done();
        }, 300);
    });

    test('updateClientsViewChoices émet game.choices.view-state aux deux joueurs', (done) => {
        const { game } = createMockGame();
        updateClientsViewChoices(game);

        setTimeout(() => {
            expect(game.player1Socket.countEmitted('game.choices.view-state')).toBe(1);
            expect(game.player2Socket.countEmitted('game.choices.view-state')).toBe(1);
            done();
        }, 300);
    });

    test('updateClientsViewGrid émet game.grid.view-state aux deux joueurs', (done) => {
        const { game } = createMockGame();
        updateClientsViewGrid(game);

        setTimeout(() => {
            expect(game.player1Socket.countEmitted('game.grid.view-state')).toBe(1);
            expect(game.player2Socket.countEmitted('game.grid.view-state')).toBe(1);
            done();
        }, 300);
    });

    test('updateClientsViewScores émet game.score aux deux joueurs', () => {
        const { game } = createMockGame();
        updateClientsViewScores(game);

        expect(game.player1Socket.countEmitted('game.score')).toBe(1);
        expect(game.player2Socket.countEmitted('game.score')).toBe(1);
    });
});

// ================================================================
// SWITCH TURN
// ================================================================

describe('Game Handler - switchTurn', () => {
    test('passe de player:1 à player:2', () => {
        const { game } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        switchTurn(game);
        expect(game.gameState.currentTurn).toBe('player:2');
    });

    test('passe de player:2 à player:1', () => {
        const { game } = createMockGame();
        game.gameState.currentTurn = 'player:2';
        switchTurn(game);
        expect(game.gameState.currentTurn).toBe('player:1');
    });

    test('réinitialise le timer, le deck et les choices', () => {
        const { game } = createMockGame();
        game.gameState.timer = 5;
        game.gameState.deck.rollsCounter = 3;
        switchTurn(game);
        expect(game.gameState.timer).toBe(30);
        expect(game.gameState.deck.rollsCounter).toBe(1); // DECK_INIT commence à 1 (lancer initial auto)
        expect(game.gameState.choices.idSelectedChoice).toBeNull();
    });
});

// ================================================================
// DICE ROLL
// ================================================================

describe('Game Handler - handleDiceRoll', () => {
    test('incrémente le rollsCounter', () => {
        const { game } = createMockGame();
        expect(game.gameState.deck.rollsCounter).toBe(1); // DECK_INIT commence à 1
        handleDiceRoll(game);
        expect(game.gameState.deck.rollsCounter).toBe(2);
    });

    test('lance les dés (les valeurs ne sont plus vides)', () => {
        const { game } = createMockGame();
        handleDiceRoll(game);
        const hasValues = game.gameState.deck.dices.some(d => d.value !== '');
        expect(hasValues).toBe(true);
    });

    test('émet les events deck et choices après un lancer', (done) => {
        const { game } = createMockGame();
        handleDiceRoll(game);

        setTimeout(() => {
            expect(game.player1Socket.countEmitted('game.deck.view-state')).toBeGreaterThanOrEqual(1);
            expect(game.player1Socket.countEmitted('game.choices.view-state')).toBeGreaterThanOrEqual(1);
            done();
        }, 300);
    });

    test('au dernier lancer, verrouille tous les dés', () => {
        const { game } = createMockGame();
        game.gameState.deck.rollsCounter = 3; // >= rollsMaximum → dernier lancer
        game.gameState.deck.rollsMaximum = 3;
        handleDiceRoll(game);
        const allLocked = game.gameState.deck.dices.every(d => d.locked);
        expect(allLocked).toBe(true);
    });

    test('au dernier lancer sans combinaison possible, réduit le timer à 5s', () => {
        const { game } = createMockGame();
        game.gameState.deck.rollsCounter = 3; // >= rollsMaximum
        game.gameState.deck.rollsMaximum = 3;
        // Remplir toute la grille pour qu'aucune case ne soit disponible
        for (const row of game.gameState.grid) {
            for (const cell of row) {
                cell.owner = 'player:1';
            }
        }
        handleDiceRoll(game);
        expect(game.gameState.timer).toBe(5);
    });
});

// ================================================================
// DICE LOCK
// ================================================================

describe('Game Handler - handleDiceLock', () => {
    test('verrouille un dé non verrouillé', () => {
        const { game } = createMockGame();
        handleDiceRoll(game);
        const diceId = game.gameState.deck.dices[0].id;
        expect(game.gameState.deck.dices[0].locked).toBe(false);
        handleDiceLock(game, diceId);
        expect(game.gameState.deck.dices[0].locked).toBe(true);
    });

    test('déverrouille un dé déjà verrouillé', () => {
        const { game } = createMockGame();
        handleDiceRoll(game);
        const diceId = game.gameState.deck.dices[0].id;
        handleDiceLock(game, diceId); // lock
        handleDiceLock(game, diceId); // unlock
        expect(game.gameState.deck.dices[0].locked).toBe(false);
    });

    test('ne fait rien si le dé n\'existe pas', () => {
        const { game } = createMockGame();
        handleDiceLock(game, 999);
        // pas d'erreur
    });
});

// ================================================================
// CHOICE SELECTED
// ================================================================

describe('Game Handler - handleChoiceSelected', () => {
    test('enregistre le choix sélectionné', () => {
        const { game } = createMockGame();
        handleChoiceSelected(game, 'brelan1');
        expect(game.gameState.choices.idSelectedChoice).toBe('brelan1');
    });

    test('émet les events choices et grid', (done) => {
        const { game } = createMockGame();
        handleChoiceSelected(game, 'brelan1');

        setTimeout(() => {
            expect(game.player1Socket.countEmitted('game.choices.view-state')).toBeGreaterThanOrEqual(1);
            expect(game.player1Socket.countEmitted('game.grid.view-state')).toBeGreaterThanOrEqual(1);
            done();
        }, 300);
    });
});

// ================================================================
// GRID SELECTED
// ================================================================

describe('Game Handler - handleGridSelected', () => {
    test('place un pion et décrémente les tokens du joueur courant', () => {
        const { game, games } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        const tokensBefore = game.gameState.player1Tokens;

        // Trouver une cellule libre
        const row = 0;
        const col = 0;
        const cell = game.gameState.grid[row][col];

        handleGridSelected(game, games, { cellId: cell.id, rowIndex: row, cellIndex: col });
        expect(game.gameState.player1Tokens).toBe(tokensBefore - 1);
    });

    test('décrémente les tokens de player:2 quand c\'est son tour', () => {
        const { game, games } = createMockGame();
        game.gameState.currentTurn = 'player:2';
        const tokensBefore = game.gameState.player2Tokens;

        const cell = game.gameState.grid[0][0];
        handleGridSelected(game, games, { cellId: cell.id, rowIndex: 0, cellIndex: 0 });
        expect(game.gameState.player2Tokens).toBe(tokensBefore - 1);
    });

    test('change de tour après avoir placé un pion (sans victoire)', () => {
        const { game, games } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        const cell = game.gameState.grid[0][0];

        const victory = handleGridSelected(game, games, { cellId: cell.id, rowIndex: 0, cellIndex: 0 });
        expect(victory).toBe(false);
        expect(game.gameState.currentTurn).toBe('player:2');
    });

    test('détecte une victoire par alignement de 5', () => {
        const { game, games } = createMockGame();
        game.gameState.currentTurn = 'player:1';

        // Placer 4 pions en ligne horizontale
        for (let col = 0; col < 4; col++) {
            game.gameState.grid[0][col].owner = 'player:1';
        }

        // Le 5e pion complète l'alignement
        const cell = game.gameState.grid[0][4];
        const victory = handleGridSelected(game, games, { cellId: cell.id, rowIndex: 0, cellIndex: 4 });
        expect(victory).toBe(true);
        expect(game.player1Socket.countEmitted('game.end')).toBe(1);
        expect(game.player2Socket.countEmitted('game.end')).toBe(1);
    });

    test('supprime la partie du tableau games après victoire', () => {
        const { game, games } = createMockGame();
        game.gameState.currentTurn = 'player:1';

        for (let col = 0; col < 4; col++) {
            game.gameState.grid[0][col].owner = 'player:1';
        }

        expect(games.length).toBe(1);
        const cell = game.gameState.grid[0][4];
        handleGridSelected(game, games, { cellId: cell.id, rowIndex: 0, cellIndex: 4 });
        expect(games.length).toBe(0);
    });
});

// ================================================================
// DEFI
// ================================================================

describe('Game Handler - handleDefi', () => {
    test('active le défi si rollsCounter >= 2', () => {
        const { game } = createMockGame();
        game.gameState.deck.rollsCounter = 2;
        handleDefi(game);
        expect(game.gameState.choices.isDefi).toBe(true);
    });

    test('ne fait rien si rollsCounter < 2', () => {
        const { game } = createMockGame();
        game.gameState.deck.rollsCounter = 1;
        handleDefi(game);
        expect(game.gameState.choices.isDefi).toBe(false);
    });

    test('ne fait rien si défi déjà actif', () => {
        const { game } = createMockGame();
        game.gameState.deck.rollsCounter = 2;
        game.gameState.choices.isDefi = true;
        const emitCountBefore = game.player1Socket.emittedEvents.length;
        handleDefi(game);
        expect(game.player1Socket.emittedEvents.length).toBe(emitCountBefore);
    });
});

// ================================================================
// YAM PREDATOR
// ================================================================

describe('Game Handler - handleYamPredator', () => {
    test('retire un pion adverse et rend le token', () => {
        const { game } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        game.gameState.grid[2][2].owner = 'player:2';
        game.gameState.player2Tokens = 10;

        handleYamPredator(game, { rowIndex: 2, cellIndex: 2 });
        expect(game.gameState.grid[2][2].owner).toBeNull();
        expect(game.gameState.player2Tokens).toBe(11);
    });

    test('ne fait rien si la case n\'appartient pas à l\'adversaire', () => {
        const { game } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        game.gameState.grid[2][2].owner = 'player:1'; // même joueur

        handleYamPredator(game, { rowIndex: 2, cellIndex: 2 });
        expect(game.gameState.grid[2][2].owner).toBe('player:1'); // pas changé
    });

    test('change de tour après le Yam Predator', () => {
        const { game } = createMockGame();
        game.gameState.currentTurn = 'player:1';
        game.gameState.grid[2][2].owner = 'player:2';

        handleYamPredator(game, { rowIndex: 2, cellIndex: 2 });
        expect(game.gameState.currentTurn).toBe('player:2');
    });
});

// ================================================================
// DEV PLACE
// ================================================================

describe('Game Handler - handleDevPlace', () => {
    test('place un pion en mode dev', () => {
        const { game, games } = createMockGame();
        handleDevPlace(game, games, { rowIndex: 0, cellIndex: 0, owner: 'player:1' });
        expect(game.gameState.grid[0][0].owner).toBe('player:1');
    });

    test('retire un pion si la case appartient déjà au même joueur', () => {
        const { game, games } = createMockGame();
        game.gameState.grid[0][0].owner = 'player:1';
        game.gameState.player1Tokens = 11;

        handleDevPlace(game, games, { rowIndex: 0, cellIndex: 0, owner: 'player:1' });
        expect(game.gameState.grid[0][0].owner).toBeNull();
    });

    test('déclenche la victoire si alignement de 5', () => {
        const { game, games } = createMockGame();
        for (let col = 0; col < 4; col++) {
            game.gameState.grid[0][col].owner = 'player:1';
        }

        handleDevPlace(game, games, { rowIndex: 0, cellIndex: 4, owner: 'player:1' });
        expect(game.player1Socket.countEmitted('game.end')).toBe(1);
        expect(games.length).toBe(0);
    });
});

// ================================================================
// GAME TIMER
// ================================================================

describe('Game Handler - startGameTimer', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test('décrémente le timer chaque seconde', () => {
        const { game, games } = createMockGame();
        game.gameState.timer = 30;

        startGameTimer(game, games);
        jest.advanceTimersByTime(3000);

        expect(game.gameState.timer).toBe(27);
        clearInterval(game.gameInterval);
    });

    test('change de tour quand le timer atteint 0', () => {
        const { game, games } = createMockGame();
        game.gameState.timer = 2;
        game.gameState.currentTurn = 'player:1';

        startGameTimer(game, games);
        jest.advanceTimersByTime(2000);

        expect(game.gameState.currentTurn).toBe('player:2');
        expect(game.gameState.timer).toBe(30);
        clearInterval(game.gameInterval);
    });

    test('s\'arrête si la partie n\'est plus dans le tableau games', () => {
        const { game, games } = createMockGame();
        game.gameState.timer = 30;

        startGameTimer(game, games);
        jest.advanceTimersByTime(1000); // 1 tick: timer = 29
        games.splice(0, 1); // supprimer la partie
        jest.advanceTimersByTime(3000); // 3 ticks de plus: ne devrait plus décrémenter

        // Le timer s'arrête au tick suivant la suppression (détecte games.includes = false)
        expect(game.gameState.timer).toBe(29);
        clearInterval(game.gameInterval);
    });
});
