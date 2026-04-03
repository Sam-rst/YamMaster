// frontend/src/features/game/components/board/board.component.tsx

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import RulesModal from '@/features/rules/components/rules-modal/rules-modal.component';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlayerTimer from './player-bar/player-timer.component';
import OpponentTimer from './player-bar/opponent-timer.component';
import OpponentDeck from './dice/opponent-deck.component';
import PlayerDeck from './dice/player-deck.component';
import Choices from './choices/choices.component';
import Grid from './grid/grid.component';
import OpponentScore from './player-bar/opponent-score.component';
import PlayerScore from './player-bar/player-score.component';
import PlayerInfos from './player-bar/player-infos.component';
import OpponentInfos from './player-bar/opponent-infos.component';
import PlayerTokens from './player-bar/player-tokens.component';
import OpponentTokens from './player-bar/opponent-tokens.component';
import DevPanel from './dev/dev-panel.component';
import { DEV_MODE } from '@/shared/services/config';
import { colors } from '@/shared/theme/colors';
import type { OpponentInfo } from '@shared/types/socket-events.types';

interface BoardProps {
    _gameViewState?: Record<string, unknown>;
    opponentInfo?: OpponentInfo | null;
}

const Board: React.FC<BoardProps> = ({ _gameViewState, opponentInfo }) => {
    const [rulesVisible, setRulesVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {DEV_MODE && <DevPanel />}

            <View style={styles.opponentHeader}>
                <View style={styles.opponentBarRow}>
                    <OpponentInfos username={opponentInfo?.username} avatar={opponentInfo?.avatar} rank={opponentInfo?.rank} />
                    <View style={styles.opponentStats}>
                        <View style={styles.scoreTokenGroup}>
                            <OpponentScore />
                            <OpponentTokens />
                        </View>
                        <OpponentTimer />
                    </View>
                </View>
                <OpponentDeck />
            </View>

            <ScrollView
                style={styles.mainScroll}
                contentContainerStyle={styles.mainContent}
                showsVerticalScrollIndicator={false}
            >
                <Grid />
                <Choices />
            </ScrollView>

            <View style={styles.playerFooter}>
                <PlayerDeck />
                <View style={styles.playerBarRow}>
                    <PlayerInfos />
                    <View style={styles.playerStats}>
                        <View style={styles.scoreTokenGroup}>
                            <PlayerScore />
                            <PlayerTokens />
                        </View>
                        <PlayerTimer />
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.rulesButton}
                onPress={() => setRulesVisible(true)}
            >
                <Feather name="book-open" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <RulesModal visible={rulesVisible} onClose={() => setRulesVisible(false)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.background,
    },

    opponentHeader: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
    },
    opponentBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    opponentStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    mainScroll: {
        flex: 1,
    },
    mainContent: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 12,
    },

    playerFooter: {
        backgroundColor: colors.glass,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 16,
    },
    playerBarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    playerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scoreTokenGroup: {
        alignItems: 'flex-end',
        gap: 2,
    },
    rulesButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Board;
