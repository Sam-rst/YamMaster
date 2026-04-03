import React from 'react';
import { render } from '@testing-library/react';
import Board from './board.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

jest.mock('./player-bar/player-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerTimer');
});
jest.mock('./player-bar/opponent-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentTimer');
});
jest.mock('./dice/opponent-deck.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentDeck');
});
jest.mock('./dice/player-deck.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerDeck');
});
jest.mock('./choices/choices.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'Choices');
});
jest.mock('./grid/grid.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'Grid');
});
jest.mock('./player-bar/opponent-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentScore');
});
jest.mock('./player-bar/player-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerScore');
});
jest.mock('./player-bar/player-infos.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerInfos');
});
let lastOpponentInfosProps: Record<string, unknown> = {};
jest.mock('./player-bar/opponent-infos.component', () => {
    const React = require('react');
    return (props: Record<string, unknown>) => {
        lastOpponentInfosProps = props;
        return React.createElement('Text', {}, 'OpponentInfos');
    };
});
jest.mock('./dev/dev-panel.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'DevPanel');
});
jest.mock('./player-bar/player-tokens.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerTokens');
});
jest.mock('./player-bar/opponent-tokens.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentTokens');
});

describe('Board', () => {

    beforeEach(() => {
        lastOpponentInfosProps = {};
    });

    it('transmet opponentInfo à OpponentInfos', () => {
        const mockSocket = createMockSocket();
        const opponentInfo = { username: 'Alice', avatar: '🎲', rank: { name: 'Or', tier: 'gold', color: '#FFD700' } };
        render(
            <SocketContext.Provider value={mockSocket}>
                <Board opponentInfo={opponentInfo} />
            </SocketContext.Provider>
        );

        expect(lastOpponentInfosProps.username).toBe('Alice');
        expect(lastOpponentInfosProps.avatar).toBe('🎲');
        expect(lastOpponentInfosProps.rank).toEqual({ name: 'Or', tier: 'gold', color: '#FFD700' });
    });

    it('transmet undefined à OpponentInfos quand opponentInfo est null', () => {
        const mockSocket = createMockSocket();
        render(
            <SocketContext.Provider value={mockSocket}>
                <Board opponentInfo={null} />
            </SocketContext.Provider>
        );

        expect(lastOpponentInfosProps.username).toBeUndefined();
        expect(lastOpponentInfosProps.avatar).toBeUndefined();
        expect(lastOpponentInfosProps.rank).toBeUndefined();
    });

    it('rend tous les sous-composants', () => {
        const mockSocket = createMockSocket();
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Board gameViewState={{}} />
            </SocketContext.Provider>
        );

        expect(getByText('PlayerTimer')).toBeTruthy();
        expect(getByText('OpponentTimer')).toBeTruthy();
        expect(getByText('OpponentDeck')).toBeTruthy();
        expect(getByText('PlayerDeck')).toBeTruthy();
        expect(getByText('Choices')).toBeTruthy();
        expect(getByText('Grid')).toBeTruthy();
        expect(getByText('OpponentScore')).toBeTruthy();
        expect(getByText('PlayerScore')).toBeTruthy();
        expect(getByText('PlayerInfos')).toBeTruthy();
        expect(getByText('OpponentInfos')).toBeTruthy();
        expect(getByText('PlayerTokens')).toBeTruthy();
        expect(getByText('OpponentTokens')).toBeTruthy();
    });

    it('ouvre la modale de règles au clic sur le bouton', () => {
        const mockSocket = createMockSocket();
        const { getByTestId } = render(
            <SocketContext.Provider value={mockSocket}>
                <Board />
            </SocketContext.Provider>
        );

        const rulesButton = getByTestId('icon-book-open');
        expect(rulesButton).toBeTruthy();

        const { fireEvent } = require('@testing-library/react');
        fireEvent.click(rulesButton.closest('[role="button"]') || rulesButton.parentElement);
    });
});
