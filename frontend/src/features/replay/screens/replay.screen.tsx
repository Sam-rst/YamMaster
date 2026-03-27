// frontend/src/features/replay/screens/replay.screen.tsx
// Thin wrapper — délègue la logique au controller

import React from 'react';
import ReplayController from '../controllers/replay.controller';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface Props {
    navigation: NavigationProp;
    route: { params: { gameId: string } };
}

const ReplayScreen: React.FC<Props> = ({ navigation, route }) => {
    return (
        <ReplayController
            navigation={navigation}
            gameId={route.params.gameId}
        />
    );
};

export default ReplayScreen;
