import React from 'react';
import { render } from '@testing-library/react';
import Board from './board.component';
import { SocketContext } from '../../contexts/socket.context';
import { createMockSocket } from '../../__mocks__/socket.mock';

jest.mock('./timers/player-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerTimer');
});
jest.mock('./timers/oppenent-timer.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentTimer');
});
jest.mock('./decks/opponent-deck.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentDeck');
});
jest.mock('./decks/player-deck.component', () => {
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
jest.mock('./scores/opponent-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentScore');
});
jest.mock('./scores/player-score.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerScore');
});
jest.mock('./infos/player-infos.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'PlayerInfos');
});
jest.mock('./infos/opponent-infos.component', () => {
    const React = require('react');
    return () => React.createElement('Text', {}, 'OpponentInfos');
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
    });
});
