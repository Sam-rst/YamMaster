# Mode Ponder — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter des animations step-by-step "Ponder" dans chaque section des règles du jeu, avec autoplay hybride et contrôles manuels.

**Architecture:** Chaque scène est un composant React pur qui reçoit `currentStep` et rend le visuel correspondant. PonderModal gère le timer autoplay et l'état. PonderControls fournit Play/Pause, Prev/Next et timeline dots cliquables. Les animations sont state-driven (pas d'Animated API).

**Tech Stack:** React Native, TypeScript, Jest + Testing Library

---

## File Map

### Fichiers créés

- `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.tsx`
- `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.test.tsx`
- `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.test.tsx`
- `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.tsx`
- `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.test.tsx`
- `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.test.tsx`
- `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.test.tsx`
- `frontend/src/features/rules/components/ponder/scenes/special-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/scenes/special-scene.component.test.tsx`
- `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.test.tsx`
- `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.tsx`
- `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.test.tsx`

### Fichiers modifiés

- `frontend/src/features/rules/components/rules-content/rules-content.component.tsx` — Ajouter bouton "Voir en action" + state PonderModal
- `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx` — Tests pour bouton Ponder

---

## Task 1 : Gitflow — Créer la branche feature

**Files:** Aucun

- [ ] **Step 1: Créer la branche depuis develop**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster
git checkout develop
git pull origin develop
git checkout -b feature/ponder-mode
```

---

## Task 2 : PonderControls — Contrôles de navigation (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PonderControls from './ponder-controls.component';

describe('PonderControls', () => {
    const defaultProps = {
        currentStep: 1,
        totalSteps: 5,
        isPlaying: true,
        onTogglePlay: jest.fn(),
        onNext: jest.fn(),
        onPrev: jest.fn(),
        onGoToStep: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    test('affiche le compteur d\'étapes', () => {
        const { getByText } = render(<PonderControls {...defaultProps} />);
        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });

    test('affiche le bouton pause quand isPlaying est true', () => {
        const { getByTestId } = render(<PonderControls {...defaultProps} isPlaying={true} />);
        expect(getByTestId('icon-pause')).toBeTruthy();
    });

    test('affiche le bouton play quand isPlaying est false', () => {
        const { getByTestId } = render(<PonderControls {...defaultProps} isPlaying={false} />);
        expect(getByTestId('icon-play')).toBeTruthy();
    });

    test('appelle onTogglePlay au clic sur play/pause', () => {
        const onTogglePlay = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onTogglePlay={onTogglePlay} />);
        fireEvent.click(getByTestId('icon-pause'));
        expect(onTogglePlay).toHaveBeenCalledTimes(1);
    });

    test('appelle onNext au clic sur suivant', () => {
        const onNext = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onNext={onNext} />);
        fireEvent.click(getByTestId('icon-chevron-right'));
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    test('appelle onPrev au clic sur précédent', () => {
        const onPrev = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onPrev={onPrev} />);
        fireEvent.click(getByTestId('icon-chevron-left'));
        expect(onPrev).toHaveBeenCalledTimes(1);
    });

    test('affiche le bon nombre de dots dans la timeline', () => {
        const { getAllByTestId } = render(<PonderControls {...defaultProps} totalSteps={5} />);
        expect(getAllByTestId(/^timeline-dot-/)).toHaveLength(5);
    });

    test('appelle onGoToStep au clic sur un dot', () => {
        const onGoToStep = jest.fn();
        const { getByTestId } = render(<PonderControls {...defaultProps} onGoToStep={onGoToStep} />);
        fireEvent.click(getByTestId('timeline-dot-3'));
        expect(onGoToStep).toHaveBeenCalledWith(3);
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-controls/ponder-controls.component.test.tsx --no-coverage
```

Expected: FAIL — Cannot find module

- [ ] **Step 3: GREEN — Implémenter le composant**

Créer `frontend/src/features/rules/components/ponder/ponder-controls/ponder-controls.component.tsx` :

```tsx
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
    currentStep,
    totalSteps,
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    onGoToStep,
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
                    <Feather
                        name={isPlaying ? 'pause' : 'play'}
                        size={22}
                        color={colors.primary}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={onNext}>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <Text style={styles.counter}>
                Étape {currentStep + 1} / {totalSteps}
            </Text>
        </View>
    );
};

export default PonderControls;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    timeline: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    dotActive: {
        width: 24,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    dotPast: {
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    navButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(233, 69, 96, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counter: {
        fontFamily: fontSans,
        fontSize: 10,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-controls/ponder-controls.component.test.tsx --no-coverage
```

Expected: 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/ponder-controls/
git commit -m "feat: composant PonderControls — play/pause, timeline, navigation (TDD)"
```

---

## Task 3 : DiceScene — Scène "Un tour de jeu" (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import DiceScene from './dice-scene.component';

describe('DiceScene', () => {
    test('step 0 — affiche "Premier lancer"', () => {
        const { getByText } = render(<DiceScene currentStep={0} />);
        expect(getByText('Premier lancer')).toBeTruthy();
    });

    test('step 1 — affiche "Verrouiller les dés"', () => {
        const { getByText } = render(<DiceScene currentStep={1} />);
        expect(getByText('Verrouiller les dés')).toBeTruthy();
    });

    test('step 2 — affiche "Deuxième lancer"', () => {
        const { getByText } = render(<DiceScene currentStep={2} />);
        expect(getByText('Deuxième lancer')).toBeTruthy();
    });

    test('step 3 — affiche "Verrouiller encore"', () => {
        const { getByText } = render(<DiceScene currentStep={3} />);
        expect(getByText('Verrouiller encore')).toBeTruthy();
    });

    test('step 4 — affiche "Dernier lancer" et "Carré"', () => {
        const { getByText } = render(<DiceScene currentStep={4} />);
        expect(getByText('Dernier lancer')).toBeTruthy();
        expect(getByText(/Carré/)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/dice-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la scène**

Créer `frontend/src/features/rules/components/ponder/scenes/dice-scene.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface DiceSceneProps {
    currentStep: number;
}

interface DiceState {
    value: string;
    locked: boolean;
    highlighted: boolean;
}

const STEPS: { label: string; description: string; dices: DiceState[] }[] = [
    {
        label: 'Premier lancer',
        description: '5 dés lancés — le joueur observe le résultat',
        dices: [
            { value: '3', locked: false, highlighted: false },
            { value: '5', locked: false, highlighted: false },
            { value: '5', locked: false, highlighted: false },
            { value: '2', locked: false, highlighted: false },
            { value: '6', locked: false, highlighted: false },
        ],
    },
    {
        label: 'Verrouiller les dés',
        description: 'Les dés verrouillés (bordure dorée) ne seront pas relancés',
        dices: [
            { value: '3', locked: false, highlighted: false },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '2', locked: false, highlighted: false },
            { value: '6', locked: false, highlighted: false },
        ],
    },
    {
        label: 'Deuxième lancer',
        description: 'Les dés non-verrouillés sont relancés',
        dices: [
            { value: '4', locked: false, highlighted: false },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: false, highlighted: true },
            { value: '1', locked: false, highlighted: false },
        ],
    },
    {
        label: 'Verrouiller encore',
        description: 'Le nouveau 5 est aussi verrouillé',
        dices: [
            { value: '4', locked: false, highlighted: false },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '1', locked: false, highlighted: false },
        ],
    },
    {
        label: 'Dernier lancer',
        description: 'Résultat final — Carré de 5 !',
        dices: [
            { value: '5', locked: false, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '5', locked: true, highlighted: true },
            { value: '3', locked: false, highlighted: false },
        ],
    },
];

const DOT_POSITIONS: boolean[][] = [
    [false, false, false, false, true, false, false, false, false],
    [true, false, false, false, false, false, false, false, true],
    [true, false, false, false, true, false, false, false, true],
    [true, false, true, false, false, false, true, false, true],
    [true, false, true, false, true, false, true, false, true],
    [true, false, true, true, false, true, true, false, true],
];

const DiceScene: React.FC<DiceSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <View style={styles.diceRow}>
                {step.dices.map((dice, i) => {
                    const numValue = parseInt(dice.value, 10);
                    const dots = (numValue >= 1 && numValue <= 6) ? DOT_POSITIONS[numValue - 1] : [];
                    return (
                        <View
                            key={i}
                            style={[
                                styles.dice,
                                dice.locked && styles.diceLocked,
                                !dice.highlighted && currentStep > 0 && styles.diceDimmed,
                            ]}
                        >
                            <View style={styles.dotsGrid}>
                                {dots.map((hasDot, j) => (
                                    <View key={j} style={styles.dotSlot}>
                                        {hasDot && <View style={styles.dot} />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </View>

            <Text style={styles.label}>{step.label}</Text>
            <Text style={styles.description}>{step.description}</Text>

            {currentStep === 4 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Carré !</Text>
                </View>
            )}
        </View>
    );
};

export default DiceScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    dice: {
        width: 48,
        height: 48,
        backgroundColor: colors.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    diceLocked: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
    diceDimmed: {
        opacity: 0.4,
    },
    dotsGrid: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dotSlot: {
        width: '33.33%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.background,
    },
    label: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
    badge: {
        backgroundColor: 'rgba(244, 211, 94, 0.15)',
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    badgeText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.gold,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/dice-scene.component.test.tsx --no-coverage
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/scenes/dice-scene*
git commit -m "feat: DiceScene — scène Ponder un tour de jeu (TDD)"
```

---

## Task 4 : CombinationsScene — Scène combinaisons (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import CombinationsScene from './combinations-scene.component';

describe('CombinationsScene', () => {
    test('step 0 — affiche "Brelan"', () => {
        const { getByText } = render(<CombinationsScene currentStep={0} />);
        expect(getByText('Brelan')).toBeTruthy();
        expect(getByText(/3 dés identiques/)).toBeTruthy();
    });

    test('step 1 — affiche "Full"', () => {
        const { getByText } = render(<CombinationsScene currentStep={1} />);
        expect(getByText('Full')).toBeTruthy();
    });

    test('step 2 — affiche "Carré"', () => {
        const { getByText } = render(<CombinationsScene currentStep={2} />);
        expect(getByText('Carré')).toBeTruthy();
    });

    test('step 3 — affiche "Yam"', () => {
        const { getByText } = render(<CombinationsScene currentStep={3} />);
        expect(getByText('Yam')).toBeTruthy();
    });

    test('step 4 — affiche "Suite"', () => {
        const { getByText } = render(<CombinationsScene currentStep={4} />);
        expect(getByText('Suite')).toBeTruthy();
    });

    test('step 5 — affiche "≤8"', () => {
        const { getByText } = render(<CombinationsScene currentStep={5} />);
        expect(getByText('≤8')).toBeTruthy();
        expect(getByText(/= 7/)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/combinations-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la scène**

Créer `frontend/src/features/rules/components/ponder/scenes/combinations-scene.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface CombinationsSceneProps {
    currentStep: number;
}

interface CombinationStep {
    name: string;
    description: string;
    diceValues: string[];
    highlighted: boolean[];
    sumLabel?: string;
}

const STEPS: CombinationStep[] = [
    {
        name: 'Brelan',
        description: '3 dés identiques',
        diceValues: ['3', '3', '3', '1', '5'],
        highlighted: [true, true, true, false, false],
    },
    {
        name: 'Full',
        description: '3 identiques + 2 identiques',
        diceValues: ['2', '2', '2', '4', '4'],
        highlighted: [true, true, true, true, true],
    },
    {
        name: 'Carré',
        description: '4 dés identiques',
        diceValues: ['6', '6', '6', '6', '2'],
        highlighted: [true, true, true, true, false],
    },
    {
        name: 'Yam',
        description: '5 dés identiques — la combinaison ultime !',
        diceValues: ['1', '1', '1', '1', '1'],
        highlighted: [true, true, true, true, true],
    },
    {
        name: 'Suite',
        description: '5 dés consécutifs',
        diceValues: ['1', '2', '3', '4', '5'],
        highlighted: [true, true, true, true, true],
    },
    {
        name: '≤8',
        description: 'Somme des dés inférieure ou égale à 8',
        diceValues: ['1', '1', '2', '2', '1'],
        highlighted: [true, true, true, true, true],
        sumLabel: '= 7 ≤ 8',
    },
];

const DOT_POSITIONS: boolean[][] = [
    [false, false, false, false, true, false, false, false, false],
    [true, false, false, false, false, false, false, false, true],
    [true, false, false, false, true, false, false, false, true],
    [true, false, true, false, false, false, true, false, true],
    [true, false, true, false, true, false, true, false, true],
    [true, false, true, true, false, true, true, false, true],
];

const CombinationsScene: React.FC<CombinationsSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <View style={styles.diceRow}>
                {step.diceValues.map((val, i) => {
                    const numValue = parseInt(val, 10);
                    const dots = (numValue >= 1 && numValue <= 6) ? DOT_POSITIONS[numValue - 1] : [];
                    const isHighlighted = step.highlighted[i];
                    return (
                        <View
                            key={i}
                            style={[
                                styles.dice,
                                isHighlighted && styles.diceHighlighted,
                                !isHighlighted && styles.diceDimmed,
                                step.name === 'Yam' && styles.diceYam,
                            ]}
                        >
                            <View style={styles.dotsGrid}>
                                {dots.map((hasDot, j) => (
                                    <View key={j} style={styles.dotSlot}>
                                        {hasDot && <View style={styles.dot} />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={styles.nameContainer}>
                <Text style={styles.name}>{step.name}</Text>
            </View>
            <Text style={styles.description}>{step.description}</Text>

            {step.sumLabel && (
                <View style={styles.sumBadge}>
                    <Text style={styles.sumText}>{step.sumLabel}</Text>
                </View>
            )}
        </View>
    );
};

export default CombinationsScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    dice: {
        width: 48,
        height: 48,
        backgroundColor: colors.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    diceHighlighted: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    diceDimmed: {
        opacity: 0.3,
    },
    diceYam: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
    dotsGrid: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dotSlot: {
        width: '33.33%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.background,
    },
    nameContainer: {
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    name: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    sumBadge: {
        backgroundColor: 'rgba(0, 210, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 210, 255, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    sumText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.blue,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/combinations-scene.component.test.tsx --no-coverage
```

Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/scenes/combinations-scene*
git commit -m "feat: CombinationsScene — scène Ponder combinaisons (TDD)"
```

---

## Task 5 : SpecialScene — Scène actions spéciales (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/scenes/special-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/scenes/special-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/scenes/special-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import SpecialScene from './special-scene.component';

describe('SpecialScene', () => {
    test('step 0 — affiche "Sec"', () => {
        const { getByText } = render(<SpecialScene currentStep={0} />);
        expect(getByText('SEC !')).toBeTruthy();
        expect(getByText(/1er lancer/)).toBeTruthy();
    });

    test('step 1 — affiche "Défi"', () => {
        const { getByText } = render(<SpecialScene currentStep={1} />);
        expect(getByText('DÉFI')).toBeTruthy();
    });

    test('step 2 — affiche "Yam Predator"', () => {
        const { getByText } = render(<SpecialScene currentStep={2} />);
        expect(getByText('YAM PREDATOR')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/special-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la scène**

Créer `frontend/src/features/rules/components/ponder/scenes/special-scene.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface SpecialSceneProps {
    currentStep: number;
}

const DOT_POSITIONS: boolean[][] = [
    [false, false, false, false, true, false, false, false, false],
    [true, false, false, false, false, false, false, false, true],
    [true, false, false, false, true, false, false, false, true],
    [true, false, true, false, false, false, true, false, true],
    [true, false, true, false, true, false, true, false, true],
    [true, false, true, true, false, true, true, false, true],
];

const renderDice = (values: string[]) => (
    <View style={styles.diceRow}>
        {values.map((val, i) => {
            const numValue = parseInt(val, 10);
            const dots = (numValue >= 1 && numValue <= 6) ? DOT_POSITIONS[numValue - 1] : [];
            return (
                <View key={i} style={styles.dice}>
                    <View style={styles.dotsGrid}>
                        {dots.map((hasDot, j) => (
                            <View key={j} style={styles.dotSlot}>
                                {hasDot && <View style={styles.dot} />}
                            </View>
                        ))}
                    </View>
                </View>
            );
        })}
    </View>
);

const SecStep: React.FC = () => (
    <View style={styles.stepContainer}>
        {renderDice(['2', '2', '2', '4', '4'])}
        <View style={[styles.badge, styles.badgeGold]}>
            <Text style={[styles.badgeText, { color: colors.gold }]}>SEC !</Text>
        </View>
        <Text style={styles.description}>Full réussi au 1er lancer — sans relancer !</Text>
    </View>
);

const DefiStep: React.FC = () => (
    <View style={styles.stepContainer}>
        {renderDice(['3', '3', '3', '5', '5'])}
        <View style={[styles.badge, styles.badgeCoral]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>DÉFI</Text>
        </View>
        <Text style={styles.description}>
            Le joueur annonce un défi. Il doit réussir une combinaison en 2 lancers restants.
        </Text>
    </View>
);

const PredatorStep: React.FC = () => (
    <View style={styles.stepContainer}>
        {renderDice(['4', '4', '4', '4', '4'])}
        <View style={[styles.badge, styles.badgeRed]}>
            <Text style={[styles.badgeText, { color: '#ff4444' }]}>YAM PREDATOR</Text>
        </View>
        <Text style={styles.description}>
            Yam réussi — un pion adverse est retiré de la grille !
        </Text>
        <View style={styles.miniGrid}>
            <View style={[styles.miniCell, styles.miniCellCyan]}>
                <Text style={styles.miniCellX}>✕</Text>
            </View>
        </View>
    </View>
);

const STEP_COMPONENTS = [SecStep, DefiStep, PredatorStep];

const SpecialScene: React.FC<SpecialSceneProps> = ({ currentStep }) => {
    const StepComponent = STEP_COMPONENTS[currentStep] ?? STEP_COMPONENTS[0];
    return <StepComponent />;
};

export default SpecialScene;

const styles = StyleSheet.create({
    stepContainer: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    dice: {
        width: 48,
        height: 48,
        backgroundColor: colors.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    dotsGrid: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dotSlot: {
        width: '33.33%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.background,
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderWidth: 1,
    },
    badgeGold: {
        backgroundColor: 'rgba(244, 211, 94, 0.15)',
        borderColor: colors.gold,
    },
    badgeCoral: {
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
        borderColor: 'rgba(233, 69, 96, 0.3)',
    },
    badgeRed: {
        backgroundColor: 'rgba(255, 68, 68, 0.15)',
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    badgeText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
    },
    description: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
    miniGrid: {
        marginTop: 8,
    },
    miniCell: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniCellCyan: {
        backgroundColor: 'rgba(0, 210, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 210, 255, 0.3)',
    },
    miniCellX: {
        fontSize: 18,
        color: colors.blue,
        fontWeight: '700',
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/special-scene.component.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/scenes/special-scene*
git commit -m "feat: SpecialScene — scène Ponder actions spéciales (TDD)"
```

---

## Task 6 : GridScene — Scène grille & pions (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import GridScene from './grid-scene.component';

describe('GridScene', () => {
    test('step 0 — affiche "La grille"', () => {
        const { getByText } = render(<GridScene currentStep={0} />);
        expect(getByText('La grille')).toBeTruthy();
        expect(getByText(/5×5/)).toBeTruthy();
    });

    test('step 1 — affiche "Combinaison réussie"', () => {
        const { getByText } = render(<GridScene currentStep={1} />);
        expect(getByText('Combinaison réussie')).toBeTruthy();
    });

    test('step 2 — affiche "Poser un pion"', () => {
        const { getByText } = render(<GridScene currentStep={2} />);
        expect(getByText('Poser un pion')).toBeTruthy();
    });

    test('step 3 — affiche "Tour de l\'adversaire"', () => {
        const { getByText } = render(<GridScene currentStep={3} />);
        expect(getByText(/adversaire/i)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/grid-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la scène**

Créer `frontend/src/features/rules/components/ponder/scenes/grid-scene.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface GridSceneProps {
    currentStep: number;
}

type CellState = 'empty' | 'highlight' | 'player' | 'opponent';

interface GridStep {
    label: string;
    description: string;
    cells: CellState[][];
}

const emptyGrid = (): CellState[][] =>
    Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'empty' as CellState));

const STEPS: GridStep[] = [
    {
        label: 'La grille',
        description: 'Le plateau de jeu est une grille 5×5',
        cells: emptyGrid(),
    },
    {
        label: 'Combinaison réussie',
        description: 'Les cases disponibles pour votre combinaison s\'illuminent',
        cells: (() => {
            const g = emptyGrid();
            g[1][2] = 'highlight';
            g[3][2] = 'highlight';
            g[4][2] = 'highlight';
            return g;
        })(),
    },
    {
        label: 'Poser un pion',
        description: 'Vous placez votre pion sur une case disponible',
        cells: (() => {
            const g = emptyGrid();
            g[1][2] = 'player';
            return g;
        })(),
    },
    {
        label: 'Tour de l\'adversaire',
        description: 'Chaque joueur joue à tour de rôle',
        cells: (() => {
            const g = emptyGrid();
            g[1][2] = 'player';
            g[2][3] = 'opponent';
            return g;
        })(),
    },
];

const CELL_STYLES: Record<CellState, { bg: string; border: string }> = {
    empty: { bg: 'rgba(255, 255, 255, 0.03)', border: colors.border },
    highlight: { bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.3)' },
    player: { bg: 'rgba(233, 69, 96, 0.15)', border: 'rgba(233, 69, 96, 0.4)' },
    opponent: { bg: 'rgba(0, 210, 255, 0.15)', border: 'rgba(0, 210, 255, 0.4)' },
};

const GridScene: React.FC<GridSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {step.cells.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((cell, c) => {
                            const cellStyle = CELL_STYLES[cell];
                            return (
                                <View
                                    key={c}
                                    style={[
                                        styles.cell,
                                        { backgroundColor: cellStyle.bg, borderColor: cellStyle.border },
                                    ]}
                                >
                                    {cell === 'player' && <View style={[styles.token, styles.tokenPlayer]} />}
                                    {cell === 'opponent' && <View style={[styles.token, styles.tokenOpponent]} />}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>

            <Text style={styles.label}>{step.label}</Text>
            <Text style={styles.description}>{step.description}</Text>
        </View>
    );
};

export default GridScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    grid: {
        gap: 3,
    },
    row: {
        flexDirection: 'row',
        gap: 3,
    },
    cell: {
        width: 40,
        height: 40,
        borderRadius: 6,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    token: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    tokenPlayer: {
        backgroundColor: colors.primary,
    },
    tokenOpponent: {
        backgroundColor: colors.blue,
    },
    label: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/grid-scene.component.test.tsx --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/scenes/grid-scene*
git commit -m "feat: GridScene — scène Ponder grille et pions (TDD)"
```

---

## Task 7 : ScoringScene — Scène scoring & victoire (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import ScoringScene from './scoring-scene.component';

describe('ScoringScene', () => {
    test('step 0 — affiche "3 pions alignés" et "+1 point"', () => {
        const { getByText } = render(<ScoringScene currentStep={0} />);
        expect(getByText('3 pions alignés')).toBeTruthy();
        expect(getByText('+1 point')).toBeTruthy();
    });

    test('step 1 — affiche "4 pions alignés" et "+2 points"', () => {
        const { getByText } = render(<ScoringScene currentStep={1} />);
        expect(getByText('4 pions alignés')).toBeTruthy();
        expect(getByText('+2 points')).toBeTruthy();
    });

    test('step 2 — affiche "5 pions alignés" et "VICTOIRE"', () => {
        const { getByText } = render(<ScoringScene currentStep={2} />);
        expect(getByText('5 pions alignés')).toBeTruthy();
        expect(getByText(/VICTOIRE/)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/scoring-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la scène**

Créer `frontend/src/features/rules/components/ponder/scenes/scoring-scene.component.tsx` :

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface ScoringSceneProps {
    currentStep: number;
}

type CellState = 'empty' | 'player' | 'playerGlow';

interface ScoringStep {
    label: string;
    scoreLabel: string;
    description: string;
    cells: CellState[][];
    isVictory: boolean;
}

const emptyGrid = (): CellState[][] =>
    Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 'empty' as CellState));

const STEPS: ScoringStep[] = [
    {
        label: '3 pions alignés',
        scoreLabel: '+1 point',
        description: '3 pions alignés horizontalement = 1 point',
        isVictory: false,
        cells: (() => {
            const g = emptyGrid();
            g[1][0] = 'playerGlow';
            g[1][1] = 'playerGlow';
            g[1][2] = 'playerGlow';
            return g;
        })(),
    },
    {
        label: '4 pions alignés',
        scoreLabel: '+2 points',
        description: '4 pions alignés en diagonale = 2 points',
        isVictory: false,
        cells: (() => {
            const g = emptyGrid();
            g[0][0] = 'playerGlow';
            g[1][1] = 'playerGlow';
            g[2][2] = 'playerGlow';
            g[3][3] = 'playerGlow';
            return g;
        })(),
    },
    {
        label: '5 pions alignés',
        scoreLabel: 'VICTOIRE INSTANTANÉE',
        description: '5 pions alignés = victoire immédiate !',
        isVictory: true,
        cells: (() => {
            const g = emptyGrid();
            g[0][2] = 'playerGlow';
            g[1][2] = 'playerGlow';
            g[2][2] = 'playerGlow';
            g[3][2] = 'playerGlow';
            g[4][2] = 'playerGlow';
            return g;
        })(),
    },
];

const ScoringScene: React.FC<ScoringSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {step.cells.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((cell, c) => (
                            <View
                                key={c}
                                style={[
                                    styles.cell,
                                    cell === 'playerGlow' && styles.cellGlow,
                                ]}
                            >
                                {cell === 'playerGlow' && <View style={styles.token} />}
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            <Text style={styles.label}>{step.label}</Text>

            <View style={[styles.scoreBadge, step.isVictory && styles.scoreBadgeVictory]}>
                <Text style={[styles.scoreText, step.isVictory && styles.scoreTextVictory]}>
                    {step.scoreLabel}
                </Text>
            </View>

            <Text style={styles.description}>{step.description}</Text>
        </View>
    );
};

export default ScoringScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    grid: {
        gap: 3,
    },
    row: {
        flexDirection: 'row',
        gap: 3,
    },
    cell: {
        width: 40,
        height: 40,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellGlow: {
        backgroundColor: 'rgba(233, 69, 96, 0.2)',
        borderColor: 'rgba(233, 69, 96, 0.5)',
    },
    token: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
    },
    label: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    scoreBadge: {
        backgroundColor: 'rgba(0, 210, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 210, 255, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    scoreBadgeVictory: {
        backgroundColor: 'rgba(244, 211, 94, 0.15)',
        borderColor: colors.gold,
    },
    scoreText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.blue,
    },
    scoreTextVictory: {
        color: colors.gold,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 300,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/scenes/scoring-scene.component.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/scenes/scoring-scene*
git commit -m "feat: ScoringScene — scène Ponder scoring et victoire (TDD)"
```

---

## Task 8 : PonderScene — Router de scènes (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import PonderScene from './ponder-scene.component';

describe('PonderScene', () => {
    test('rend DiceScene quand sceneId est "dice"', () => {
        const { getByText } = render(<PonderScene sceneId="dice" currentStep={0} />);
        expect(getByText('Premier lancer')).toBeTruthy();
    });

    test('rend CombinationsScene quand sceneId est "combinations"', () => {
        const { getByText } = render(<PonderScene sceneId="combinations" currentStep={0} />);
        expect(getByText('Brelan')).toBeTruthy();
    });

    test('rend SpecialScene quand sceneId est "special"', () => {
        const { getByText } = render(<PonderScene sceneId="special" currentStep={0} />);
        expect(getByText('SEC !')).toBeTruthy();
    });

    test('rend GridScene quand sceneId est "grid"', () => {
        const { getByText } = render(<PonderScene sceneId="grid" currentStep={0} />);
        expect(getByText('La grille')).toBeTruthy();
    });

    test('rend ScoringScene quand sceneId est "scoring"', () => {
        const { getByText } = render(<PonderScene sceneId="scoring" currentStep={0} />);
        expect(getByText('3 pions alignés')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-scene/ponder-scene.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter le router**

Créer `frontend/src/features/rules/components/ponder/ponder-scene/ponder-scene.component.tsx` :

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DiceScene from '../scenes/dice-scene.component';
import CombinationsScene from '../scenes/combinations-scene.component';
import SpecialScene from '../scenes/special-scene.component';
import GridScene from '../scenes/grid-scene.component';
import ScoringScene from '../scenes/scoring-scene.component';
import { colors } from '@/shared/theme/colors';

interface PonderSceneProps {
    sceneId: string;
    currentStep: number;
}

const SCENE_MAP: Record<string, React.FC<{ currentStep: number }>> = {
    dice: DiceScene,
    combinations: CombinationsScene,
    special: SpecialScene,
    grid: GridScene,
    scoring: ScoringScene,
};

const PonderScene: React.FC<PonderSceneProps> = ({ sceneId, currentStep }) => {
    const SceneComponent = SCENE_MAP[sceneId] ?? DiceScene;

    return (
        <View style={styles.container}>
            <SceneComponent currentStep={currentStep} />
        </View>
    );
};

export default PonderScene;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        minHeight: 250,
        justifyContent: 'center',
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-scene/ponder-scene.component.test.tsx --no-coverage
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/ponder-scene/
git commit -m "feat: PonderScene — router vers les 5 scènes (TDD)"
```

---

## Task 9 : PonderModal — Modal plein écran avec autoplay (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.test.tsx`
- Create: `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import PonderModal from './ponder-modal.component';

describe('PonderModal', () => {
    const mockClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('affiche le titre de la scène', () => {
        const { getByText } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );
        expect(getByText(/Les Dés/)).toBeTruthy();
    });

    test('affiche le bouton fermer', () => {
        const { getByTestId } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );
        expect(getByTestId('icon-x')).toBeTruthy();
    });

    test('appelle onClose au clic sur fermer', () => {
        const { getByTestId } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );
        fireEvent.click(getByTestId('icon-x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test('affiche le compteur d\'étapes', () => {
        const { getByText } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );
        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('avance automatiquement après le timeout', () => {
        const { getByText } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );

        expect(getByText('Étape 1 / 5')).toBeTruthy();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });

    test('pause arrête l\'autoplay', () => {
        const { getByText, getByTestId } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );

        fireEvent.click(getByTestId('icon-pause'));

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(getByText('Étape 1 / 5')).toBeTruthy();
    });

    test('next avance manuellement', () => {
        const { getByText, getByTestId } = render(
            <PonderModal visible={true} onClose={mockClose} sceneId="dice" />
        );

        fireEvent.click(getByTestId('icon-chevron-right'));
        expect(getByText('Étape 2 / 5')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-modal/ponder-modal.component.test.tsx --no-coverage
```

Expected: FAIL

- [ ] **Step 3: GREEN — Implémenter la modal**

Créer `frontend/src/features/rules/components/ponder/ponder-modal/ponder-modal.component.tsx` :

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PonderScene from '../ponder-scene/ponder-scene.component';
import PonderControls from '../ponder-controls/ponder-controls.component';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

interface PonderModalProps {
    visible: boolean;
    onClose: () => void;
    sceneId: string;
}

interface SceneConfig {
    title: string;
    icon: string;
    totalSteps: number;
    stepDurations: number[];
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
    dice: {
        title: '🎲 Les Dés',
        icon: '🎲',
        totalSteps: 5,
        stepDurations: [2000, 2000, 2000, 2000, 2000],
    },
    combinations: {
        title: '🃏 Les Combinaisons',
        icon: '🃏',
        totalSteps: 6,
        stepDurations: [2000, 2000, 2000, 2000, 2000, 2000],
    },
    special: {
        title: '⚡ Actions Spéciales',
        icon: '⚡',
        totalSteps: 3,
        stepDurations: [3000, 3000, 3000],
    },
    grid: {
        title: '📐 La Grille & les Pions',
        icon: '📐',
        totalSteps: 4,
        stepDurations: [2500, 2500, 2500, 2500],
    },
    scoring: {
        title: '🏆 Scoring & Victoire',
        icon: '🏆',
        totalSteps: 3,
        stepDurations: [3000, 3000, 3000],
    },
};

const PonderModal: React.FC<PonderModalProps> = ({ visible, onClose, sceneId }) => {
    const config = SCENE_CONFIGS[sceneId] ?? SCENE_CONFIGS.dice;
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            setIsPlaying(true);
        }
    }, [visible, sceneId]);

    useEffect(() => {
        if (!isPlaying || !visible) return;
        if (currentStep >= config.totalSteps - 1) {
            setIsPlaying(false);
            return;
        }

        const duration = config.stepDurations[currentStep] ?? 2000;
        const timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, duration);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, visible, config]);

    const togglePlay = useCallback(() => {
        if (currentStep >= config.totalSteps - 1) {
            setCurrentStep(0);
            setIsPlaying(true);
        } else {
            setIsPlaying(prev => !prev);
        }
    }, [currentStep, config.totalSteps]);

    const nextStep = useCallback(() => {
        setIsPlaying(false);
        setCurrentStep(prev => Math.min(prev + 1, config.totalSteps - 1));
    }, [config.totalSteps]);

    const prevStep = useCallback(() => {
        setIsPlaying(false);
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, []);

    const goToStep = useCallback((step: number) => {
        setIsPlaying(false);
        setCurrentStep(step);
    }, []);

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{config.title}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sceneArea}>
                    <PonderScene sceneId={sceneId} currentStep={currentStep} />
                </View>

                <PonderControls
                    currentStep={currentStep}
                    totalSteps={config.totalSteps}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onGoToStep={goToStep}
                />
            </View>
        </Modal>
    );
};

export default PonderModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sceneArea: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/ponder/ponder-modal/ponder-modal.component.test.tsx --no-coverage
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/ponder/ponder-modal/
git commit -m "feat: PonderModal — modal plein écran avec autoplay hybride (TDD)"
```

---

## Task 10 : Intégration — Bouton "Voir en action" dans RulesContent

**Files:**
- Modify: `frontend/src/features/rules/components/rules-content/rules-content.component.tsx`
- Modify: `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx`

- [ ] **Step 1: RED — Ajouter le test pour le bouton Ponder**

Ajouter dans `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx` :

```tsx
test('affiche le bouton "Voir en action" dans une section ouverte', () => {
    const { getByText, getAllByText } = render(<RulesContent />);
    fireEvent.click(getByText('Les Dés'));
    expect(getAllByText(/Voir en action/).length).toBeGreaterThanOrEqual(1);
});

test('cliquer "Voir en action" ouvre le PonderModal', () => {
    const { getByText, getAllByText } = render(<RulesContent />);
    fireEvent.click(getByText('Les Dés'));
    fireEvent.click(getAllByText(/Voir en action/)[0]);
    expect(getByText(/Les Dés/)).toBeTruthy();
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-content/rules-content.component.test.tsx --no-coverage
```

Expected: FAIL pour les 2 nouveaux tests

- [ ] **Step 3: GREEN — Ajouter le bouton et le PonderModal dans RulesContent**

Modifier `frontend/src/features/rules/components/rules-content/rules-content.component.tsx` :

1. Ajouter import :
```tsx
import { TouchableOpacity } from 'react-native';
import PonderModal from '../ponder/ponder-modal/ponder-modal.component';
```

2. Ajouter state dans RulesContent :
```tsx
const [ponderSceneId, setPonderSceneId] = useState<string | null>(null);
```

3. Ajouter un bouton "Voir en action" à la fin de chaque section Content. Dans la boucle SECTIONS.map, après `<Content />` :
```tsx
<TouchableOpacity
    style={styles.ponderButton}
    onPress={() => setPonderSceneId(id)}
>
    <Text style={styles.ponderButtonText}>▶ Voir en action</Text>
</TouchableOpacity>
```

4. Ajouter le PonderModal après le ScrollView (ou en fin de contenu) :
```tsx
<PonderModal
    visible={ponderSceneId !== null}
    onClose={() => setPonderSceneId(null)}
    sceneId={ponderSceneId ?? 'dice'}
/>
```

5. Ajouter les styles :
```tsx
ponderButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
},
ponderButtonText: {
    fontFamily: fontBody,
    fontSize: 12,
    fontWeight: '700',
    color: colors.blue,
},
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-content/rules-content.component.test.tsx --no-coverage
```

Expected: 7 tests PASS (5 anciens + 2 nouveaux)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/rules-content/
git commit -m "feat: bouton 'Voir en action' dans chaque section — ouvre le PonderModal"
```

---

## Task 11 : Tests globaux + lint + coverage

**Files:** Aucun nouveau

- [ ] **Step 1: Tous les tests**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm test -- --no-coverage
```

Expected: Tous PASS

- [ ] **Step 2: Lint**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm run lint
```

Expected: 0 erreur, 0 warning

- [ ] **Step 3: Coverage**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm run test:coverage
```

Expected: ≥ 90%

- [ ] **Step 4: Commit si corrections**

```bash
git add -A
git commit -m "fix: corrections tests et lint après intégration Ponder"
```

---

## Task 12 : Merge dans develop

**Files:** Aucun

- [ ] **Step 1: Merge et push**

```bash
git checkout develop
git merge feature/ponder-mode --no-ff -m "merge: Intègre feature/ponder-mode dans develop"
git push origin develop
```
