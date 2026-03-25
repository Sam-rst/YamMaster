// frontend/src/__tests__/e2e/app-navigation.e2e.test.js
// Tests E2E : Navigation de l'App entre les écrans

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';
import HomeScreen from '@/features/home/screens/home.screen';
import OnlineGameController from '@/features/game/controllers/online-game.controller';
import VsBotGameController from '@/features/game/controllers/vs-bot-game.controller';

// Mock les composants Board lourds
jest.mock('@/features/game/components/board/grid/grid.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'grid' });
});
jest.mock('@/features/game/components/board/choices/choices.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'choices' });
});
jest.mock('@/features/game/components/board/dice/player-deck.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'player-deck' });
});
jest.mock('@/features/game/components/board/dice/opponent-deck.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'opponent-deck' });
});
jest.mock('@/features/game/components/board/dev/dev-panel.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'dev-panel' });
});

/**
 * Simule une mini-app avec navigation manuelle entre écrans.
 * Remplace @react-navigation qui ne fonctionne pas dans jsdom.
 */
const MiniApp = () => {
    const [screen, setScreen] = React.useState('HomeScreen');
    const navigation = { navigate: (s) => setScreen(s) };
    switch (screen) {
        case 'HomeScreen':
            return <HomeScreen navigation={navigation} />;
        case 'OnlineGameScreen':
            return <OnlineGameController navigation={navigation} />;
        case 'VsBotGameScreen':
            return <VsBotGameController navigation={navigation} />;
        default:
            return null;
    }
};

const renderApp = () => {
    const mockSocket = createMockSocket();
    const result = render(
        <SocketContext.Provider value={mockSocket}>
            <MiniApp />
        </SocketContext.Provider>
    );
    return { ...result, mockSocket };
};

describe('E2E — App Navigation', () => {

    it('affiche le menu principal au démarrage', () => {
        const { getByText } = renderApp();
        expect(getByText(/Jouer en ligne/)).toBeTruthy();
    });

    it('navigue vers la partie en ligne et émet queue.join', () => {
        const { getByText, mockSocket } = renderApp();

        act(() => {
            fireEvent.click(getByText(/Jouer en ligne/));
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('queue.join');
        expect(getByText('Waiting for server datas...')).toBeTruthy();
    });

    it('navigue vers VsBot et émet game.vsbot', () => {
        const { getByText, mockSocket } = renderApp();

        act(() => {
            fireEvent.click(getByText(/Jouer contre le bot/));
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot');
        expect(getByText(/Lancement/)).toBeTruthy();
    });

    it('flow E2E : menu → partie en ligne → fin → retour menu', () => {
        const { getByText, mockSocket } = renderApp();

        // 1. Menu → Partie en ligne
        act(() => {
            fireEvent.click(getByText(/Jouer en ligne/));
        });

        // 2. Game start
        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'opp',
            });
        });

        // 3. Game end
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1',
                reason: 'alignment5',
                player1Score: 5,
                player2Score: 2,
            });
        });
        expect(getByText('Fin de la partie')).toBeTruthy();

        // 4. Retour au menu
        act(() => {
            fireEvent.click(getByText('Retour au menu'));
        });
        expect(getByText(/Jouer en ligne/)).toBeTruthy();
    });

    it('flow E2E : menu → VsBot → fin → retour menu', () => {
        const { getByText, mockSocket } = renderApp();

        // 1. Menu → VsBot
        act(() => {
            fireEvent.click(getByText(/Jouer contre le bot/));
        });

        // 2. Game start
        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
            });
        });

        // 3. Game end
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:2',
                reason: 'noTokens',
                player1Score: 3,
                player2Score: 5,
            });
        });
        expect(getByText(/Vainqueur : Bot/)).toBeTruthy();

        // 4. Retour au menu
        act(() => {
            fireEvent.click(getByText('Retour au menu'));
        });
        expect(getByText(/Jouer en ligne/)).toBeTruthy();
    });
});
