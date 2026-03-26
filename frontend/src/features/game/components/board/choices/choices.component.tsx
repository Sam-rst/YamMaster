// app/components/board/choices/choices.component.tsx
// Zéro logique métier — affiche les données envoyées par le backend

import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";
import type { Socket } from "socket.io-client";
import type { Combination } from "@shared/types/game.types";

interface ChoicesViewStateData {
    displayChoices: boolean;
    canMakeChoice: boolean;
    idSelectedChoice: string | null;
    availableChoices: Combination[];
    isDefi: boolean;
    canDefi: boolean;
    canYamPredator: boolean;
}

const Choices: React.FC = () => {

    const socket = useContext(SocketContext) as Socket;

    const [displayChoices, setDisplayChoices] = useState<boolean>(false);
    const [canMakeChoice, setCanMakeChoice] = useState<boolean>(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState<string | null>(null);
    const [availableChoices, setAvailableChoices] = useState<Combination[]>([]);
    const [isDefi, setIsDefi] = useState<boolean>(false);
    const [canDefi, setCanDefi] = useState<boolean>(false);
    const [canYamPredator, setCanYamPredator] = useState<boolean>(false);
    const [yamPredatorMode, setYamPredatorMode] = useState<boolean>(false);

    useEffect(() => {
        const onChoicesViewState = (data: ChoicesViewStateData): void => {
            setDisplayChoices(data.displayChoices);
            setCanMakeChoice(data.canMakeChoice);
            setIdSelectedChoice(data.idSelectedChoice);
            setAvailableChoices(data.availableChoices);
            setIsDefi(data.isDefi);
            setCanDefi(data.canDefi);
            setCanYamPredator(data.canYamPredator);
            if (!data.canYamPredator) setYamPredatorMode(false);
        };
        socket.on("game.choices.view-state", onChoicesViewState);
        return () => { socket.off("game.choices.view-state", onChoicesViewState); };
    }, []);

    const handleSelectChoice = (choiceId: string): void => {
        setYamPredatorMode(false);
        socket.emit("game.choices.selected", { choiceId });
    };

    const handleDefi = (): void => {
        socket.emit("game.defi");
    };

    const handleYamPredator = (): void => {
        setYamPredatorMode(true);
        socket.emit("game.yamPredator.activate");
    };

    return (
        <View style={styles.choicesContainer}>
            {displayChoices && (
                <>
                    {canDefi && (
                        <TouchableOpacity style={styles.defiButton} onPress={handleDefi}>
                            <Text style={styles.defiText}>Défi !</Text>
                        </TouchableOpacity>
                    )}

                    {isDefi && (
                        <View style={styles.defiActiveTag}>
                            <Text style={styles.defiActiveText}>Défi actif</Text>
                        </View>
                    )}

                    {canYamPredator && (
                        <TouchableOpacity
                            style={[styles.predatorButton, yamPredatorMode && styles.predatorActive]}
                            onPress={handleYamPredator}
                        >
                            <Text style={styles.predatorText}>Yam Predator</Text>
                        </TouchableOpacity>
                    )}

                    {availableChoices.map((choice: Combination) => (
                        <TouchableOpacity
                            key={choice.id}
                            style={[
                                styles.choiceButton,
                                idSelectedChoice === choice.id && styles.selectedChoice,
                                !canMakeChoice && styles.disabledChoice
                            ]}
                            onPress={() => handleSelectChoice(choice.id)}
                            disabled={!canMakeChoice}
                        >
                            <Text style={styles.choiceText}>{choice.value}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    choicesContainer: {
        flex: 1, flexDirection: "row", flexWrap: "wrap",
        justifyContent: "space-between", paddingHorizontal: 10,
        borderBottomWidth: 1, borderColor: "black", backgroundColor: "lightgrey"
    },
    choiceButton: {
        backgroundColor: "white", borderRadius: 5, marginVertical: 5,
        alignItems: "center", justifyContent: "center", width: "100%", height: "10%"
    },
    selectedChoice: { backgroundColor: "lightgreen" },
    choiceText: { fontSize: 13, fontWeight: "bold" },
    disabledChoice: { opacity: 0.5 },
    defiButton: {
        backgroundColor: "#ff8c00", borderRadius: 5, marginVertical: 5,
        alignItems: "center", justifyContent: "center", width: "100%", height: "10%",
    },
    defiText: { fontSize: 14, fontWeight: "bold", color: "white" },
    defiActiveTag: {
        backgroundColor: "#ff8c00", borderRadius: 5, marginVertical: 2,
        alignItems: "center", justifyContent: "center", width: "100%", height: "8%", opacity: 0.7,
    },
    defiActiveText: { fontSize: 11, fontWeight: "bold", color: "white" },
    predatorButton: {
        backgroundColor: "#8b0000", borderRadius: 5, marginVertical: 5,
        alignItems: "center", justifyContent: "center", width: "100%", height: "10%",
    },
    predatorActive: { backgroundColor: "#ff0000", borderWidth: 2, borderColor: "white" },
    predatorText: { fontSize: 14, fontWeight: "bold", color: "white" },
});

export default Choices;
