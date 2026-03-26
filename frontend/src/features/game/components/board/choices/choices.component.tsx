// app/components/board/choices/choices.component.tsx

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
    isDefi?: boolean;
    rollsCounter?: number;
    hasYam?: boolean;
}

const Choices: React.FC = () => {

    const socket = useContext(SocketContext) as Socket;

    const [displayChoices, setDisplayChoices] = useState<boolean>(false);
    const [canMakeChoice, setCanMakeChoice] = useState<boolean>(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState<string | null>(null);
    const [availableChoices, setAvailableChoices] = useState<Combination[]>([]);
    const [isDefi, setIsDefi] = useState<boolean>(false);
    const [rollsCounter, setRollsCounter] = useState<number>(0);
    const [hasYam, setHasYam] = useState<boolean>(false);
    const [yamPredatorMode, setYamPredatorMode] = useState<boolean>(false);

    useEffect(() => {
        const onChoicesViewState = (data: ChoicesViewStateData): void => {
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
            setIsDefi(data['isDefi'] || false);
            setRollsCounter(data['rollsCounter'] || 0);
            setHasYam(data['hasYam'] || false);
            // Reset yam predator mode quand les choix changent
            if (!data['hasYam']) setYamPredatorMode(false);
        };
        socket.on("game.choices.view-state", onChoicesViewState);
        return () => { socket.off("game.choices.view-state", onChoicesViewState); };
    }, []);

    const handleSelectChoice = (choiceId: string): void => {
        if (canMakeChoice) {
            setYamPredatorMode(false);
            setIdSelectedChoice(choiceId);
            socket.emit("game.choices.selected", { choiceId });
        }
    };

    const handleDefi = (): void => {
        socket.emit("game.defi");
    };

    const handleYamPredator = (): void => {
        setYamPredatorMode(true);
        setIdSelectedChoice(null);
        // Emettre un evenement pour que la grille sache qu'on est en mode predator
        socket.emit("game.yamPredator.activate");
    };

    // Le bouton Defi est visible apres le 1er lancer (rollsCounter >= 2) et si pas encore active
    const canDefi: boolean = canMakeChoice && rollsCounter >= 2 && !isDefi;

    // Le Yam Predator est disponible si le joueur a un Yam et c'est son tour
    const canYamPredator: boolean = canMakeChoice && hasYam;

    return (
        <View style={styles.choicesContainer}>
            {displayChoices && (
                <>
                    {canDefi && (
                        <TouchableOpacity
                            style={styles.defiButton}
                            onPress={handleDefi}
                        >
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
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: "black",
        backgroundColor: "lightgrey"
    },
    choiceButton: {
        backgroundColor: "white",
        borderRadius: 5,
        marginVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "10%"
    },
    selectedChoice: {
        backgroundColor: "lightgreen",
    },
    choiceText: {
        fontSize: 13,
        fontWeight: "bold",
    },
    disabledChoice: {
        opacity: 0.5,
    },
    defiButton: {
        backgroundColor: "#ff8c00",
        borderRadius: 5,
        marginVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "10%",
    },
    defiText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
    },
    defiActiveTag: {
        backgroundColor: "#ff8c00",
        borderRadius: 5,
        marginVertical: 2,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "8%",
        opacity: 0.7,
    },
    defiActiveText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "white",
    },
    predatorButton: {
        backgroundColor: "#8b0000",
        borderRadius: 5,
        marginVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "10%",
    },
    predatorActive: {
        backgroundColor: "#ff0000",
        borderWidth: 2,
        borderColor: "white",
    },
    predatorText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
    },
});

export default Choices;
