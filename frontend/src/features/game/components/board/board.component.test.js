import React from 'react';
import { render } from '@testing-library/react';
import Board from './board.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

jest.mock('../player-bar/player-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerTimer');
});
jest.mock('../player-bar/opponent-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentTimer');
});
jest.mock('../dice/opponent-deck.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentDeck');
});
jest.mock('../dice/player-deck.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerDeck');
});
jest.mock('../choices/choices.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'Choices');
});
jest.mock('../grid/grid.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'Grid');
});
jest.mock('../player-bar/opponent-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentScore');
});
jest.mock('../player-bar/player-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerScore');
});
jest.mock('../player-bar/player-infos.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerInfos');
});
jest.mock('../player-bar/opponent-infos.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentInfos');
});
jest.mock('../dev/dev-panel.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'DevPanel');
});
jest.mock('../player-bar/player-tokens.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerTokens');
});
jest.mock('../player-bar/opponent-tokens.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentTokens');
});

describe('Board', () => {

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
});
