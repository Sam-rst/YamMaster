import React from 'react';
import { View, StyleSheet } from 'react-native';
import DiceScene from '../scenes/dice-scene.component';
import CombinationsScene from '../scenes/combinations-scene.component';
import SpecialScene from '../scenes/special-scene.component';
import GridScene from '../scenes/grid-scene.component';
import ScoringScene from '../scenes/scoring-scene.component';
import { colors } from '@/shared/theme/colors';

interface PonderSceneProps { sceneId: string; currentStep: number; }

const SCENE_MAP: Record<string, React.FC<{ currentStep: number }>> = {
    dice: DiceScene, combinations: CombinationsScene, special: SpecialScene,
    grid: GridScene, scoring: ScoringScene,
};

const PonderScene: React.FC<PonderSceneProps> = ({ sceneId, currentStep }) => {
    const SceneComponent = SCENE_MAP[sceneId] ?? DiceScene;
    return <View style={styles.container}><SceneComponent currentStep={currentStep} /></View>;
};

export default PonderScene;

const styles = StyleSheet.create({
    container: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, minHeight: 250, justifyContent: 'center' },
});
