// frontend/src/features/game/screens/vs-bot-game.screen.tsx

import React, { useContext } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { SocketContext } from '@/shared/contexts/socket.context';
import VsBotGameController from '../controllers/vs-bot-game.controller';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface VsBotGameScreenProps {
    navigation?: {
        navigate: (screen: string) => void;
    };
}

const VsBotGameScreen: React.FC<VsBotGameScreenProps> = ({ navigation }) => {
    const socket = useContext(SocketContext);

    return (
        <View style={styles.container}>
            {!socket && (
                <View style={styles.errorContainer}>
                    <Text style={styles.paragraph}>No connection with server...</Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </View>
            )}

            {socket && (
                <VsBotGameController navigation={navigation} />
            )}
        </View>
    );
};

export default VsBotGameScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paragraph: {
        fontFamily: fontSans,
        fontSize: 14,
        color: colors.textPrimary,
    },
    footnote: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
    },
});
