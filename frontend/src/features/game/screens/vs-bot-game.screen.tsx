// app/screens/vs-bot-game.screen.tsx

import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SocketContext } from '@/shared/contexts/socket.context';
import VsBotGameController from "../controllers/vs-bot-game.controller";

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
                <>
                    <Text style={styles.paragraph}>
                        No connection with server...
                    </Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </>
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
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    paragraph: {
        fontSize: 16,
    },
    footnote: {
        fontSize: 12,
    },
});
