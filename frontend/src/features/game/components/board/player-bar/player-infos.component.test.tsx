import React from 'react';
import { render } from '@testing-library/react';
import PlayerInfos from './player-infos.component';
import { AuthContext } from '@/shared/contexts/auth.context';

const mockAuthContext = {
    user: { id: '1', username: 'TestUser', createdAt: '2024-01-01' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
};

describe('PlayerInfos', () => {
    it('affiche "Vous"', () => {
        const { getByText } = render(
            <AuthContext.Provider value={mockAuthContext}>
                <PlayerInfos />
            </AuthContext.Provider>
        );
        expect(getByText('Vous')).toBeTruthy();
    });
});
