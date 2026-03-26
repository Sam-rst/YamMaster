// app/screens/online-game.screen.tsx

import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SocketContext } from '@/shared/contexts/socket.context';

import OnlineGameController from "../controllers/online-game.controller";

interface OnlineGameScreenProps {
    _navigation?: {
        navigate: (screen: string) => void;
    };
}

const OnlineGameScreen: React.FC<OnlineGameScreenProps> = ({ _navigation }) => {

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
                <OnlineGameController />
            )}
        </View>
    );
};

export default OnlineGameScreen;

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
