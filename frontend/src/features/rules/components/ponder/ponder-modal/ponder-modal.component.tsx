import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import PonderScene from '../ponder-scene/ponder-scene.component';
import PonderControls from '../ponder-controls/ponder-controls.component';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface SceneConfig {
    title: string;
    totalSteps: number;
    stepDuration: number;
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
    dice:         { title: 'Les Dés',            totalSteps: 5, stepDuration: 2000 },
    combinations: { title: 'Les Combinaisons',   totalSteps: 6, stepDuration: 2000 },
    special:      { title: 'Actions Spéciales',  totalSteps: 3, stepDuration: 3000 },
    grid:         { title: 'La Grille',          totalSteps: 4, stepDuration: 2500 },
    scoring:      { title: 'Scoring & Victoire', totalSteps: 3, stepDuration: 3000 },
};

interface PonderModalProps {
    visible: boolean;
    onClose: () => void;
    sceneId: string;
}

const PonderModal: React.FC<PonderModalProps> = ({ visible, onClose, sceneId }) => {
    const config = SCENE_CONFIGS[sceneId] ?? SCENE_CONFIGS['dice'];
    const { title, totalSteps, stepDuration } = config;

    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const handleNext = useCallback(() => {
        setCurrentStep((step) => {
            if (step >= totalSteps - 1) return step;
            return step + 1;
        });
    }, [totalSteps]);

    const handlePrev = useCallback(() => {
        setCurrentStep((step) => Math.max(0, step - 1));
    }, []);

    const handleTogglePlay = useCallback(() => {
        setIsPlaying((playing) => {
            if (!playing && currentStep >= totalSteps - 1) {
                setCurrentStep(0);
                return true;
            }
            return !playing;
        });
    }, [currentStep, totalSteps]);

    const handleGoToStep = useCallback((step: number) => {
        setCurrentStep(step);
    }, []);

    useEffect(() => {
        if (!isPlaying || !visible) return;
        if (currentStep >= totalSteps - 1) {
            setIsPlaying(false);
            return;
        }
        const timer = setTimeout(() => {
            setCurrentStep((step) => step + 1);
        }, stepDuration);
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, totalSteps, stepDuration, visible]);

    useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            setIsPlaying(true);
        }
    }, [visible, sceneId]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <PonderScene sceneId={sceneId} currentStep={currentStep} />
                    <PonderControls
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        isPlaying={isPlaying}
                        onTogglePlay={handleTogglePlay}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onGoToStep={handleGoToStep}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default PonderModal;

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontFamily: fontDisplay, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' },
    counter: { fontFamily: fontSans, fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
});
