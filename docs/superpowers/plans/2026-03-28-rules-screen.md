# Écran Règles du Jeu — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un écran Règles du jeu avec accordéon, accessible via une bottom tab bar et en modal pendant les parties.

**Architecture:** Bottom tab navigator (`@react-navigation/bottom-tabs`) remplaçant le stack actuel dans App.tsx. Feature `rules/` avec composants RulesSection (accordéon), RulesContent (contenu partagé), RulesModal (overlay en partie). AuthScreen reste hors tab.

**Tech Stack:** React Native, Expo, TypeScript, @react-navigation/bottom-tabs, Jest + Testing Library

---

## File Map

### Fichiers créés

- `frontend/src/features/rules/screens/rules.screen.tsx` — Écran principal (tab)
- `frontend/src/features/rules/screens/rules.screen.test.tsx` — Tests écran
- `frontend/src/features/rules/components/rules-section/rules-section.component.tsx` — Composant accordéon réutilisable
- `frontend/src/features/rules/components/rules-section/rules-section.component.test.tsx` — Tests accordéon
- `frontend/src/features/rules/components/rules-content/rules-content.component.tsx` — Contenu partagé (intro + sections)
- `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx` — Tests contenu
- `frontend/src/features/rules/components/rules-modal/rules-modal.component.tsx` — Modal overlay
- `frontend/src/features/rules/components/rules-modal/rules-modal.component.test.tsx` — Tests modal

### Fichiers modifiés

- `frontend/App.tsx` — Restructurer navigation : Auth stack racine → Bottom tab (Home stack + Rules)
- `frontend/src/features/game/components/board/board.component.tsx` — Ajouter bouton Rules dans le footer
- `frontend/package.json` — Ajouter `@react-navigation/bottom-tabs`

---

## Task 1 : Gitflow — Créer la branche feature

**Files:** Aucun

- [ ] **Step 1: Créer la branche depuis develop**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster
git checkout develop
git pull origin develop
git checkout -b feature/rules-screen
```

---

## Task 2 : Installer @react-navigation/bottom-tabs

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Installer la dépendance**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm install @react-navigation/bottom-tabs
```

- [ ] **Step 2: Vérifier l'installation**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
cat package.json | grep bottom-tabs
```

Expected: `"@react-navigation/bottom-tabs": "^7.x.x"`

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: ajoute @react-navigation/bottom-tabs"
```

---

## Task 3 : RulesSection — Composant accordéon (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/rules-section/rules-section.component.test.tsx`
- Create: `frontend/src/features/rules/components/rules-section/rules-section.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/rules-section/rules-section.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesSection from './rules-section.component';

describe('RulesSection', () => {
    const mockToggle = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre et l\'icône quand fermé', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(getByText('🎲')).toBeTruthy();
        expect(getByText('Les Dés')).toBeTruthy();
    });

    test('n\'affiche pas le contenu enfant quand fermé', () => {
        const { queryByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(queryByText('Contenu dés')).toBeNull();
    });

    test('affiche le contenu enfant quand ouvert', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={true} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        expect(getByText('Contenu dés')).toBeTruthy();
    });

    test('appelle onToggle au clic sur le header', () => {
        const { getByText } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu dés</span>
            </RulesSection>
        );

        fireEvent.press(getByText('Les Dés'));
        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    test('affiche le chevron ▶ quand fermé et ▼ quand ouvert', () => {
        const { getByText, rerender } = render(
            <RulesSection icon="🎲" title="Les Dés" isOpen={false} onToggle={mockToggle}>
                <span>Contenu</span>
            </RulesSection>
        );

        expect(getByText('▶')).toBeTruthy();

        rerender(
            <RulesSection icon="🎲" title="Les Dés" isOpen={true} onToggle={mockToggle}>
                <span>Contenu</span>
            </RulesSection>
        );

        expect(getByText('▼')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-section/rules-section.component.test.tsx --no-coverage
```

Expected: FAIL — Cannot find module `./rules-section.component`

- [ ] **Step 3: GREEN — Implémenter le composant minimal**

Créer `frontend/src/features/rules/components/rules-section/rules-section.component.tsx` :

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface RulesSectionProps {
    icon: string;
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const RulesSection: React.FC<RulesSectionProps> = ({ icon, title, isOpen, onToggle, children }) => {
    return (
        <View style={[styles.container, isOpen && styles.containerOpen]}>
            <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
                <View style={styles.headerLeft}>
                    <Text style={styles.icon}>{icon}</Text>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
                    {isOpen ? '▼' : '▶'}
                </Text>
            </TouchableOpacity>
            {isOpen && <View style={styles.content}>{children}</View>}
        </View>
    );
};

export default RulesSection;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: 'hidden',
    },
    containerOpen: {
        borderColor: 'rgba(233, 69, 96, 0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    icon: {
        fontSize: 18,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    chevron: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    chevronOpen: {
        color: colors.primary,
    },
    content: {
        paddingHorizontal: 14,
        paddingBottom: 14,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-section/rules-section.component.test.tsx --no-coverage
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/rules-section/
git commit -m "feat: composant RulesSection — accordéon réutilisable (TDD)"
```

---

## Task 4 : RulesContent — Contenu partagé intro + sections (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx`
- Create: `frontend/src/features/rules/components/rules-content/rules-content.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/rules-content/rules-content.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesContent from './rules-content.component';

describe('RulesContent', () => {
    test('affiche le titre YAM MASTER et la description d\'intro', () => {
        const { getByText } = render(<RulesContent />);

        expect(getByText('YAM MASTER')).toBeTruthy();
        expect(getByText(/grille 5×5/i)).toBeTruthy();
    });

    test('affiche les 6 sections accordéon', () => {
        const { getByText } = render(<RulesContent />);

        expect(getByText('Les Dés')).toBeTruthy();
        expect(getByText('Les Combinaisons')).toBeTruthy();
        expect(getByText('Actions Spéciales')).toBeTruthy();
        expect(getByText('La Grille & les Pions')).toBeTruthy();
        expect(getByText('Scoring & Victoire')).toBeTruthy();
    });

    test('toutes les sections sont fermées par défaut', () => {
        const { queryByText } = render(<RulesContent />);

        expect(queryByText(/jusqu'à 3 lancers/i)).toBeNull();
        expect(queryByText(/Brelan/i)).toBeNull();
    });

    test('ouvrir une section affiche son contenu', () => {
        const { getByText } = render(<RulesContent />);

        fireEvent.press(getByText('Les Dés'));

        expect(getByText(/jusqu'à 3 lancers/i)).toBeTruthy();
    });

    test('ouvrir une section ferme la précédente', () => {
        const { getByText, queryByText } = render(<RulesContent />);

        fireEvent.press(getByText('Les Dés'));
        expect(getByText(/jusqu'à 3 lancers/i)).toBeTruthy();

        fireEvent.press(getByText('Les Combinaisons'));
        expect(queryByText(/jusqu'à 3 lancers/i)).toBeNull();
        expect(getByText(/Brelan/i)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-content/rules-content.component.test.tsx --no-coverage
```

Expected: FAIL — Cannot find module `./rules-content.component`

- [ ] **Step 3: GREEN — Implémenter le composant**

Créer `frontend/src/features/rules/components/rules-content/rules-content.component.tsx` :

```tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import RulesSection from '../rules-section/rules-section.component';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const SECTIONS = [
    {
        id: 'dice',
        icon: '🎲',
        title: 'Les Dés',
    },
    {
        id: 'combinations',
        icon: '🃏',
        title: 'Les Combinaisons',
    },
    {
        id: 'special',
        icon: '⚡',
        title: 'Actions Spéciales',
    },
    {
        id: 'grid',
        icon: '📐',
        title: 'La Grille & les Pions',
    },
    {
        id: 'scoring',
        icon: '🏆',
        title: 'Scoring & Victoire',
    },
];

const RulesContent: React.FC = () => {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setOpenSection(prev => (prev === id ? null : id));
    };

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.intro}>
                <Text style={styles.introEmoji}>🎲</Text>
                <Text style={styles.introTitle}>YAM MASTER</Text>
                <Text style={styles.introDescription}>
                    Jeu de dés pour 2 joueurs. Lancez les dés, formez des combinaisons
                    et posez vos pions sur la grille 5×5. Gagnez par{' '}
                    <Text style={styles.highlightGold}>alignement de 5 pions</Text> ou par{' '}
                    <Text style={styles.highlightCyan}>accumulation de points</Text>.
                </Text>
            </View>

            <View style={styles.sections}>
                {SECTIONS.map(section => (
                    <RulesSection
                        key={section.id}
                        icon={section.icon}
                        title={section.title}
                        isOpen={openSection === section.id}
                        onToggle={() => handleToggle(section.id)}
                    >
                        {renderSectionContent(section.id)}
                    </RulesSection>
                ))}
            </View>
        </ScrollView>
    );
};

const renderSectionContent = (sectionId: string): React.ReactNode => {
    switch (sectionId) {
        case 'dice':
            return <DiceContent />;
        case 'combinations':
            return <CombinationsContent />;
        case 'special':
            return <SpecialContent />;
        case 'grid':
            return <GridContent />;
        case 'scoring':
            return <ScoringContent />;
        default:
            return null;
    }
};

const DiceContent: React.FC = () => (
    <View>
        <Text style={sectionStyles.paragraph}>
            Chaque joueur dispose de <Text style={sectionStyles.bold}>5 dés</Text> et
            peut lancer jusqu'à <Text style={sectionStyles.highlightCyan}>3 lancers</Text> par
            tour.
        </Text>
        <Text style={sectionStyles.paragraph}>
            Entre chaque lancer, vous pouvez verrouiller ou déverrouiller des dés
            individuellement pour construire votre combinaison.
        </Text>
        <View style={sectionStyles.noteBox}>
            <Text style={sectionStyles.noteText}>
                <Text style={sectionStyles.noteLabel}>Note : </Text>
                Un dé verrouillé peut être déverrouillé aux lancers suivants.
                Chaque joueur dispose de 12 pions en début de partie.
            </Text>
        </View>
    </View>
);

const CombinationsContent: React.FC = () => (
    <View>
        <View style={sectionStyles.table}>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightCoral]}>Brelan</Text>
                <Text style={sectionStyles.tableCell}>3 dés identiques</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightCyan]}>Full</Text>
                <Text style={sectionStyles.tableCell}>1 brelan + 1 paire</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightGold]}>Carré</Text>
                <Text style={sectionStyles.tableCell}>4 dés identiques</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightCoral]}>Yam</Text>
                <Text style={sectionStyles.tableCell}>5 dés identiques</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightCyan]}>Suite</Text>
                <Text style={sectionStyles.tableCell}>1-2-3-4-5 ou 2-3-4-5-6</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName, sectionStyles.highlightGold]}>≤8</Text>
                <Text style={sectionStyles.tableCell}>Somme des 5 dés ≤ 8</Text>
            </View>
        </View>
        <View style={sectionStyles.noteBox}>
            <Text style={sectionStyles.noteText}>
                <Text style={sectionStyles.noteLabel}>Important : </Text>
                Un même lancer peut correspondre à plusieurs combinaisons. Un Yam est
                aussi un Brelan, un Carré et un Full. Le joueur choisit laquelle utiliser.
            </Text>
        </View>
    </View>
);

const SpecialContent: React.FC = () => (
    <View>
        <Text style={sectionStyles.subTitle}>Sec</Text>
        <Text style={sectionStyles.paragraph}>
            Réaliser une combinaison (sauf Brelan) dès le 1er lancer, sans relancer.
            Donne accès à des cases bonus sur la grille.
        </Text>
        <Text style={sectionStyles.subTitle}>Défi</Text>
        <Text style={sectionStyles.paragraph}>
            Avant le 2e lancer, le joueur annonce un défi. Il doit réaliser une
            combinaison (sauf Brelan) dans les 2 lancers restants. Il ne s'engage pas
            sur une figure précise. Si réussi, donne accès à des cases bonus.
        </Text>
        <Text style={sectionStyles.subTitle}>Yam Predator</Text>
        <Text style={sectionStyles.paragraph}>
            Réaliser un Yam permet de retirer un pion adverse de la grille au lieu de
            poser un des siens. Action offensive puissante.
        </Text>
    </View>
);

const GridContent: React.FC = () => (
    <View>
        <Text style={sectionStyles.paragraph}>
            Le plateau est une <Text style={sectionStyles.bold}>grille 5×5</Text> dont
            chaque case correspond à une combinaison spécifique.
        </Text>
        <Text style={sectionStyles.paragraph}>
            Quand un joueur réussit une combinaison, il peut poser un pion sur une case
            libre correspondante. On ne peut poser que sur une case libre correspondant
            à la combinaison réalisée.
        </Text>
        <View style={sectionStyles.noteBox}>
            <Text style={sectionStyles.noteText}>
                <Text style={sectionStyles.noteLabel}>Note : </Text>
                Chaque joueur a 12 pions en début de partie. Les lignes correspondent
                aux valeurs de dé (1-6) pour le Brelan, les colonnes aux types de combinaison.
            </Text>
        </View>
    </View>
);

const ScoringContent: React.FC = () => (
    <View>
        <Text style={sectionStyles.subTitle}>Points par alignement</Text>
        <View style={sectionStyles.table}>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName]}>3 pions alignés</Text>
                <Text style={[sectionStyles.tableCell, sectionStyles.highlightCyan]}>1 point</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName]}>4 pions alignés</Text>
                <Text style={[sectionStyles.tableCell, sectionStyles.highlightGold]}>2 points</Text>
            </View>
            <View style={sectionStyles.tableRow}>
                <Text style={[sectionStyles.tableCell, sectionStyles.tableCellName]}>5 pions alignés</Text>
                <Text style={[sectionStyles.tableCell, sectionStyles.highlightCoral]}>Victoire !</Text>
            </View>
        </View>
        <Text style={sectionStyles.subTitle}>Fin de partie</Text>
        <Text style={sectionStyles.paragraph}>
            La partie se termine quand un joueur aligne 5 pions (victoire instantanée)
            ou quand un joueur n'a plus de pions. Dans ce cas, le joueur avec le plus
            de points gagne. En cas d'égalité → match nul.
        </Text>
    </View>
);

export default RulesContent;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    intro: {
        alignItems: 'center',
        marginBottom: 28,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    introEmoji: {
        fontSize: 36,
        marginBottom: 8,
    },
    introTitle: {
        fontFamily: fontDisplay,
        fontSize: 20,
        fontWeight: '900',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 10,
    },
    introDescription: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    highlightGold: {
        color: colors.gold,
        fontWeight: '700',
    },
    highlightCyan: {
        color: colors.blue,
        fontWeight: '700',
    },
    sections: {
        gap: 10,
    },
});

const sectionStyles = StyleSheet.create({
    paragraph: {
        fontFamily: fontSans,
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 20,
        marginBottom: 10,
    },
    bold: {
        color: colors.textPrimary,
        fontWeight: '700',
    },
    highlightCoral: {
        color: colors.primary,
        fontWeight: '700',
    },
    highlightCyan: {
        color: colors.blue,
        fontWeight: '700',
    },
    highlightGold: {
        color: colors.gold,
        fontWeight: '700',
    },
    subTitle: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 6,
        marginTop: 6,
    },
    noteBox: {
        backgroundColor: 'rgba(244, 211, 94, 0.05)',
        borderLeftWidth: 2,
        borderLeftColor: colors.gold,
        borderRadius: 6,
        padding: 10,
        marginTop: 6,
    },
    noteText: {
        fontFamily: fontSans,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 18,
    },
    noteLabel: {
        color: colors.gold,
        fontWeight: '700',
    },
    table: {
        gap: 4,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    tableCell: {
        fontFamily: fontSans,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        flex: 1,
    },
    tableCellName: {
        fontWeight: '700',
        flex: 0,
        width: 80,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-content/rules-content.component.test.tsx --no-coverage
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/rules-content/
git commit -m "feat: composant RulesContent — intro + 6 sections accordéon (TDD)"
```

---

## Task 5 : RulesScreen — Écran principal (TDD)

**Files:**
- Create: `frontend/src/features/rules/screens/rules.screen.test.tsx`
- Create: `frontend/src/features/rules/screens/rules.screen.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/screens/rules.screen.test.tsx` :

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import RulesScreen from './rules.screen';

describe('RulesScreen', () => {
    test('rend le contenu des règles', () => {
        const { getByText } = render(<RulesScreen />);

        expect(getByText('YAM MASTER')).toBeTruthy();
        expect(getByText('Les Dés')).toBeTruthy();
        expect(getByText('Les Combinaisons')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/screens/rules.screen.test.tsx --no-coverage
```

Expected: FAIL — Cannot find module `./rules.screen`

- [ ] **Step 3: GREEN — Implémenter l'écran**

Créer `frontend/src/features/rules/screens/rules.screen.tsx` :

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import RulesContent from '../components/rules-content/rules-content.component';
import { colors } from '@/shared/theme/colors';

const RulesScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <RulesContent />
        </View>
    );
};

export default RulesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/screens/rules.screen.test.tsx --no-coverage
```

Expected: 1 test PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/screens/
git commit -m "feat: écran RulesScreen — wrapper pour RulesContent (TDD)"
```

---

## Task 6 : RulesModal — Modal overlay (TDD)

**Files:**
- Create: `frontend/src/features/rules/components/rules-modal/rules-modal.component.test.tsx`
- Create: `frontend/src/features/rules/components/rules-modal/rules-modal.component.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/rules/components/rules-modal/rules-modal.component.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RulesModal from './rules-modal.component';

describe('RulesModal', () => {
    const mockClose = jest.fn();

    beforeEach(() => jest.clearAllMocks());

    test('affiche le contenu des règles quand visible', () => {
        const { getByText } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );

        expect(getByText('YAM MASTER')).toBeTruthy();
    });

    test('affiche le bouton fermer', () => {
        const { getByTestId } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );

        expect(getByTestId('icon-x')).toBeTruthy();
    });

    test('appelle onClose au clic sur le bouton fermer', () => {
        const { getByTestId } = render(
            <RulesModal visible={true} onClose={mockClose} />
        );

        fireEvent.press(getByTestId('icon-x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-modal/rules-modal.component.test.tsx --no-coverage
```

Expected: FAIL — Cannot find module `./rules-modal.component`

- [ ] **Step 3: GREEN — Implémenter la modal**

Créer `frontend/src/features/rules/components/rules-modal/rules-modal.component.tsx` :

```tsx
import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import RulesContent from '../rules-content/rules-content.component';
import { colors } from '@/shared/theme/colors';

interface RulesModalProps {
    visible: boolean;
    onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <RulesContent />
            </View>
        </Modal>
    );
};

export default RulesModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 8,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/rules/components/rules-modal/rules-modal.component.test.tsx --no-coverage
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/rules/components/rules-modal/
git commit -m "feat: composant RulesModal — overlay plein écran avec fermeture (TDD)"
```

---

## Task 7 : App.tsx — Bottom Tab Navigator

**Files:**
- Modify: `frontend/App.tsx`

- [ ] **Step 1: Restructurer App.tsx avec bottom tabs**

Remplacer le contenu de `frontend/App.tsx` par :

```tsx
// ./App.tsx

import React from 'react';
import { LogBox, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Feather } from '@expo/vector-icons';
import HomeScreen from '@/features/home/screens/home.screen';
import AuthScreen from '@/features/auth/screens/auth.screen';
import RulesScreen from '@/features/rules/screens/rules.screen';
import { SocketProvider } from '@/shared/contexts/socket.context';
import { AuthProvider } from '@/shared/contexts/auth.context';
import OnlineGameScreen from '@/features/game/screens/online-game.screen';
import VsBotGameScreen from '@/features/game/screens/vs-bot-game.screen';
import HistoryScreen from '@/features/history/screens/history.screen';
import ReplayScreen from '@/features/replay/screens/replay.screen';
import { colors } from '@/shared/theme/colors';

type HomeStackParamList = {
    HomeScreen: undefined;
    OnlineGameScreen: undefined;
    VsBotGameScreen: undefined;
    HistoryScreen: undefined;
    ReplayScreen: { gameId: string };
};

type RootStackParamList = {
    AuthScreen: undefined;
    MainTabs: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();

LogBox.ignoreAllLogs(true);

const HomeStackNavigator: React.FC = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
        <HomeStack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
        <HomeStack.Screen name="VsBotGameScreen" component={VsBotGameScreen} />
        <HomeStack.Screen name="HistoryScreen" component={HistoryScreen} />
        <HomeStack.Screen name="ReplayScreen" component={ReplayScreen} />
    </HomeStack.Navigator>
);

const MainTabs: React.FC = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '700',
            },
        }}
    >
        <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
            options={{
                tabBarLabel: 'Accueil',
                tabBarIcon: ({ color, size }) => (
                    <Feather name="home" size={size} color={color} />
                ),
            }}
        />
        <Tab.Screen
            name="RulesTab"
            component={RulesScreen}
            options={{
                tabBarLabel: 'Règles',
                tabBarIcon: ({ color, size }) => (
                    <Feather name="book-open" size={size} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);

const App: React.FC = () => {
    const [fontsLoaded] = useFonts({
        Inter: Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        Outfit_700Bold,
        Outfit: Outfit_900Black,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <AuthProvider>
            <SocketProvider>
                <NavigationContainer>
                    <RootStack.Navigator screenOptions={{ headerShown: false }}>
                        <RootStack.Screen name="AuthScreen" component={AuthScreen} />
                        <RootStack.Screen name="MainTabs" component={MainTabs} />
                    </RootStack.Navigator>
                </NavigationContainer>
            </SocketProvider>
        </AuthProvider>
    );
};

export default App;
```

- [ ] **Step 2: Mettre à jour la navigation dans AuthScreen**

Dans `frontend/src/features/auth/screens/auth.screen.tsx`, la navigation après login pointe vers `'HomeScreen'`. Il faut changer vers `'MainTabs'` :

Chercher toutes les occurrences de `navigation.navigate('HomeScreen')` dans `auth.screen.tsx` et les remplacer par `navigation.navigate('MainTabs')`.

- [ ] **Step 3: Masquer la tab bar sur les écrans de jeu**

Dans `frontend/App.tsx`, les écrans de jeu (OnlineGameScreen, VsBotGameScreen) doivent masquer la tab bar. Ajouter dans le `HomeStackNavigator`, sur chaque écran concerné :

```tsx
<HomeStack.Screen
    name="OnlineGameScreen"
    component={OnlineGameScreen}
    options={{ tabBarStyle: { display: 'none' } }}
/>
```

**Note :** Avec React Navigation v7 et un stack imbriqué, il faut utiliser `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })` dans les écrans de jeu, ou utiliser `tabBarHideOnKeyboard` + les options du Tab.Navigator. L'approche la plus simple : dans chaque écran de jeu (online-game.screen, vs-bot-game.screen), ajouter un `useFocusEffect` qui masque la tab bar via le parent navigator :

Dans `frontend/App.tsx`, ajouter la prop `screenOptions` dans HomeStack pour passer la navigation parent :

En fait, l'approche la plus propre : utiliser `getFocusedRouteNameFromRoute` pour masquer la tab bar conditionnellement. Modifier `MainTabs` :

```tsx
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const HIDDEN_TAB_SCREENS = ['OnlineGameScreen', 'VsBotGameScreen', 'ReplayScreen'];

const MainTabs: React.FC = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '700',
            },
        }}
    >
        <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
            options={({ route }) => {
                const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';
                return {
                    tabBarLabel: 'Accueil',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                    tabBarStyle: HIDDEN_TAB_SCREENS.includes(routeName)
                        ? { display: 'none' }
                        : {
                            backgroundColor: colors.background,
                            borderTopColor: colors.border,
                            borderTopWidth: 1,
                        },
                };
            }}
        />
        <Tab.Screen
            name="RulesTab"
            component={RulesScreen}
            options={{
                tabBarLabel: 'Règles',
                tabBarIcon: ({ color, size }) => (
                    <Feather name="book-open" size={size} color={color} />
                ),
            }}
        />
    </Tab.Navigator>
);
```

- [ ] **Step 4: Vérifier manuellement**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest --no-coverage
```

Expected: Tous les tests passent (les tests existants qui naviguent vers HomeScreen devront être mis à jour vers MainTabs si nécessaire).

- [ ] **Step 5: Commit**

```bash
git add frontend/App.tsx frontend/src/features/auth/screens/auth.screen.tsx
git commit -m "feat: bottom tab bar Accueil/Règles — restructuration navigation"
```

---

## Task 8 : Bouton Rules dans le Board (modal en partie)

**Files:**
- Modify: `frontend/src/features/game/components/board/board.component.tsx`

- [ ] **Step 1: Ajouter le bouton et la modal dans Board**

Dans `frontend/src/features/game/components/board/board.component.tsx`, ajouter :

1. Import du composant modal :
```tsx
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import RulesModal from '@/features/rules/components/rules-modal/rules-modal.component';
```

2. État dans le composant Board :
```tsx
const [rulesVisible, setRulesVisible] = useState(false);
```

3. Bouton dans le footer (avant la fermeture du SafeAreaView) :
```tsx
<TouchableOpacity
    style={styles.rulesButton}
    onPress={() => setRulesVisible(true)}
>
    <Feather name="book-open" size={18} color={colors.textSecondary} />
</TouchableOpacity>
<RulesModal visible={rulesVisible} onClose={() => setRulesVisible(false)} />
```

4. Style :
```tsx
rulesButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
},
```

- [ ] **Step 2: Vérifier que les tests existants passent toujours**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest --no-coverage
```

Expected: Tous les tests PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/game/components/board/board.component.tsx
git commit -m "feat: bouton règles dans le board — ouvre la modal RulesModal"
```

---

## Task 9 : Tests globaux + lint + suppression carte Home

**Files:**
- Modify: `frontend/src/features/home/screens/home.screen.tsx` (supprimer le lien Rules de ACTIONS s'il en reste, vérifier)

- [ ] **Step 1: Lancer tous les tests**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm test -- --no-coverage
```

Expected: Tous les tests PASS. Si certains tests référencent `HomeScreen` au lieu de `MainTabs` dans la navigation, les corriger.

- [ ] **Step 2: Lint**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm run lint
```

Expected: 0 erreur, 0 warning. Corriger si nécessaire.

- [ ] **Step 3: Coverage**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm run test:coverage
```

Expected: ≥ 90% de couverture. Si en dessous, ajouter des tests manquants.

- [ ] **Step 4: Commit final si corrections**

```bash
git add -A
git commit -m "fix: corrections tests et lint après intégration rules screen"
```

---

## Task 10 : Merge dans develop

**Files:** Aucun

- [ ] **Step 1: Merge la feature dans develop**

```bash
git checkout develop
git merge feature/rules-screen --no-ff -m "merge: Intègre feature/rules-screen dans develop"
git push origin develop
```
