// frontend/src/features/game/components/board/choices/choices.component.tsx
// Zéro logique métier — affiche les données envoyées par le backend

import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SocketContext } from '@/shared/contexts/socket.context';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { Combination } from '@shared/types/game.types';

interface ChoicesViewStateData {
    displayChoices: boolean;
    canMakeChoice: boolean;
    idSelectedChoice: string | null;
    availableChoices: Combination[];
    isDefi: boolean;
    canDefi: boolean;
    canYamPredator: boolean;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

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
        socket.on('game.choices.view-state', onChoicesViewState);
        return () => { socket.off('game.choices.view-state', onChoicesViewState); };
    }, []);

    const handleSelectChoice = (choiceId: string): void => {
        setYamPredatorMode(false);
        socket.emit('game.choices.selected', { choiceId });
    };

    const handleDefi = (): void => {
        socket.emit('game.defi');
    };

    const handleYamPredator = (): void => {
        setYamPredatorMode(true);
        socket.emit('game.yamPredator.activate');
    };

    return (
        <View style={styles.choicesContainer}>
            {displayChoices && (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {availableChoices.map((choice: Combination) => (
                            <TouchableOpacity
                                key={choice.id}
                                style={[
                                    styles.chip,
                                    idSelectedChoice === choice.id && styles.chipSelected,
                                    !canMakeChoice && styles.chipDisabled,
                                ]}
                                onPress={() => handleSelectChoice(choice.id)}
                                disabled={!canMakeChoice}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.chipText,
                                    idSelectedChoice === choice.id && styles.chipTextSelected,
                                ]}>
                                    {choice.value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {isDefi && (
                        <View style={styles.defiActiveTag}>
                            <Text style={styles.defiActiveText}>Défi actif</Text>
                        </View>
                    )}

                    <View style={styles.actionRow}>
                        {canDefi && (
                            <TouchableOpacity
                                style={styles.defiButton}
                                onPress={handleDefi}
                                activeOpacity={0.85}
                            >
                                <Feather name="shield" size={14} color={colors.gold} />
                                <Text style={styles.defiText}>Défi Royal</Text>
                            </TouchableOpacity>
                        )}

                        {canYamPredator && (
                            <TouchableOpacity
                                style={[styles.predatorButton, yamPredatorMode && styles.predatorActive]}
                                onPress={handleYamPredator}
                                activeOpacity={0.85}
                            >
                                <Feather name="zap" size={14} color={colors.primary} />
                                <Text style={styles.predatorText}>Yam Predator</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    choicesContainer: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 8,
        gap: 8,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 6,
        paddingBottom: 4,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.glass,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chipSelected: {
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
        borderColor: 'rgba(233, 69, 96, 0.4)',
    },
    chipDisabled: {
        opacity: 0.4,
    },
    chipText: {
        fontFamily: fontSans,
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chipTextSelected: {
        color: colors.primary,
    },
    actionRow: {
        flexDirection: 'column',
        gap: 6,
    },
    defiButton: {
        backgroundColor: 'rgba(244, 211, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(244, 211, 94, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    defiText: {
        fontFamily: fontDisplay,
        fontSize: 9,
        fontWeight: '700',
        color: colors.gold,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    defiActiveTag: {
        backgroundColor: 'rgba(244, 211, 94, 0.15)',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'center',
    },
    defiActiveText: {
        fontFamily: fontSans,
        fontSize: 8,
        fontWeight: '700',
        color: colors.gold,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    predatorButton: {
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    predatorActive: {
        backgroundColor: 'rgba(233, 69, 96, 0.25)',
        borderColor: colors.primary,
        borderWidth: 2,
    },
    predatorText: {
        fontFamily: fontDisplay,
        fontSize: 9,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

export default Choices;
