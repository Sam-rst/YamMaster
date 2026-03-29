import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface PonderControlsProps {
    currentStep: number;
    totalSteps: number;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    onGoToStep: (step: number) => void;
}

const PonderControls: React.FC<PonderControlsProps> = ({
    currentStep, totalSteps, isPlaying, onTogglePlay, onNext, onPrev, onGoToStep,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.timeline}>
                {Array.from({ length: totalSteps }, (_, i) => (
                    <TouchableOpacity
                        key={i}
                        testID={`timeline-dot-${i}`}
                        onPress={() => onGoToStep(i)}
                        style={[
                            styles.dot,
                            i === currentStep && styles.dotActive,
                            i < currentStep && styles.dotPast,
                        ]}
                    />
                ))}
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={styles.navButton} onPress={onPrev}>
                    <Feather name="chevron-left" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playButton} onPress={onTogglePlay}>
                    <Feather name={isPlaying ? 'pause' : 'play'} size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={onNext}>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <Text style={styles.counter}>{`Étape ${currentStep + 1} / ${totalSteps}`}</Text>
        </View>
    );
};

export default PonderControls;

const styles = StyleSheet.create({
    container: { alignItems: 'center', gap: 12, paddingVertical: 16 },
    timeline: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
    dotActive: { width: 24, borderRadius: 4, backgroundColor: colors.primary },
    dotPast: { backgroundColor: colors.primary, opacity: 0.3 },
    buttons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    navButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' },
    playButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(233,69,96,0.2)', borderWidth: 1, borderColor: 'rgba(233,69,96,0.4)', justifyContent: 'center', alignItems: 'center' },
    counter: { fontFamily: fontSans, fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
});
