// frontend/src/__tests__/e2e/app-navigation.e2e.test.tsx
// Tests E2E : Navigation de l'App entre les écrans

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { SocketContext } from '@/shared/contexts/socket.context';
import { AuthProvider } from '@/shared/contexts/auth.context';
import { createMockSocket } from '@/__mocks__/socket.mock';
import HomeScreen from '@/features/home/screens/home.screen';
import BotDifficultyScreen from '@/features/game/screens/bot-difficulty.screen';
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
const MiniApp: React.FC = () => {
    const [screen, setScreen] = React.useState<string>('HomeScreen');
    const [screenParams, setScreenParams] = React.useState<Record<string, string>>({});
    const navigation = {
        navigate: (s: string, params?: Record<string, string>) => {
            setScreen(s);
            setScreenParams(params ?? {});
        },
        goBack: () => setScreen('HomeScreen'),
    };
    switch (screen) {
        case 'HomeScreen':
            return <HomeScreen navigation={navigation} />;
        case 'BotDifficultyScreen':
            return <BotDifficultyScreen navigation={navigation} />;
        case 'OnlineGameScreen':
            return <OnlineGameController navigation={navigation} />;
        case 'VsBotGameScreen':
            return <VsBotGameController navigation={navigation} difficulty={screenParams.difficulty ?? 'MEDIUM'} />;
        default:
            return null;
    }
};

const renderApp = () => {
    const mockSocket = createMockSocket();
    const result = render(
        <AuthProvider>
            <SocketContext.Provider value={mockSocket}>
                <MiniApp />
            </SocketContext.Provider>
        </AuthProvider>
    );
    return { ...result, mockSocket };
};

describe('E2E — App Navigation', () => {

    it('affiche le menu principal au démarrage', () => {
        const { getByText } = renderApp();
        expect(getByText(/Partie en ligne/)).toBeTruthy();
    });

    it('navigue vers la partie en ligne et émet queue.join', () => {
        const { getByText, mockSocket } = renderApp();

        act(() => {
            fireEvent.click(getByText(/Partie en ligne/));
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('queue.join');
        expect(getByText('Waiting for server datas...')).toBeTruthy();
    });

    it('navigue vers VsBot et émet game.vsbot', () => {
        const { getByText, mockSocket } = renderApp();

        act(() => {
            fireEvent.click(getByText(/Vs Bot/));
        });

        // On est sur BotDifficultyScreen — cliquer sur une difficulté
        act(() => {
            fireEvent.click(getByText('Tactique'));
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot', { difficulty: 'MEDIUM' });
        expect(getByText(/Lancement/)).toBeTruthy();
    });

    it('flow E2E : menu → partie en ligne → fin → retour menu', () => {
        const { getByText, mockSocket } = renderApp();

        // 1. Menu → Partie en ligne
        act(() => {
            fireEvent.click(getByText(/Partie en ligne/));
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
        expect(getByText(/Victoire/i)).toBeTruthy();

        // 4. Retour au menu
        act(() => {
            fireEvent.click(getByText('Menu Principal'));
        });
        expect(getByText(/Partie en ligne/)).toBeTruthy();
    });

    it('flow E2E : menu → VsBot → fin → retour menu', () => {
        const { getByText, mockSocket } = renderApp();

        // 1. Menu → BotDifficultyScreen → VsBot
        act(() => {
            fireEvent.click(getByText(/Vs Bot/));
        });
        act(() => {
            fireEvent.click(getByText('Tactique'));
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
        expect(getByText(/Défaite/i)).toBeTruthy();

        // 4. Retour au menu
        act(() => {
            fireEvent.click(getByText('Menu Principal'));
        });
        expect(getByText(/Partie en ligne/)).toBeTruthy();
    });
});
