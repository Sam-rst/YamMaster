import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';
import RulesSection from '../rules-section/rules-section.component';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontBody = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const COMBINATIONS = [
    { name: 'Brelan', desc: '3 dés identiques' },
    { name: 'Full', desc: '3 dés identiques + 2 autres identiques' },
    { name: 'Carré', desc: '4 dés identiques' },
    { name: 'Yam', desc: '5 dés identiques' },
    { name: 'Suite', desc: '5 dés consécutifs (1-2-3-4-5 ou 2-3-4-5-6)' },
    { name: '≤8', desc: 'La somme des 5 dés est inférieure ou égale à 8' },
];

const SCORE_ROWS = [
    { align: '3 pions alignés', pts: '1 point' },
    { align: '4 pions alignés', pts: '2 points' },
    { align: '5 pions alignés', pts: 'Victoire immédiate !' },
];

const DiceContent: React.FC = () => (
    <View>
        <Text style={styles.bodyText}>
            Chaque tour, vous disposez de 5 dés et jusqu&apos;à 3 lancers pour obtenir la combinaison souhaitée.
        </Text>
        <Text style={styles.bodyText}>
            Entre chaque lancer, vous pouvez verrouiller ou déverrouiller librement n&apos;importe quel dé.
            Les dés verrouillés ne sont pas relancés.
        </Text>
        <Text style={styles.bodyText}>
            Après votre dernier lancer, vous devez choisir une case sur la grille pour placer votre pion.
        </Text>
    </View>
);

const CombinationsContent: React.FC = () => (
    <View>
        <Text style={styles.bodyText}>
            Chaque case de la grille correspond à une combinaison. Vous devez réaliser la combinaison requise
            pour pouvoir placer un pion sur la case.
        </Text>
        <View style={styles.table}>
            {COMBINATIONS.map((row) => (
                <View key={row.name} style={styles.tableRow}>
                    <Text style={styles.tableName}>{row.name}</Text>
                    <Text style={styles.tableDesc}>{row.desc}</Text>
                </View>
            ))}
        </View>
        <View style={styles.noteBox}>
            <Text style={styles.noteText}>
                Une même combinaison peut valider plusieurs types de cases. Par exemple, un Yam valide aussi
                les combinaisons inférieures (Carré, Full, etc.).
            </Text>
        </View>
    </View>
);

const SpecialContent: React.FC = () => (
    <View>
        <Text style={styles.sectionSubtitle}>Sec</Text>
        <Text style={styles.bodyText}>
            Réussir sa combinaison dès le premier lancer (sans relancer aucun dé). Vous gagnez des points bonus.
        </Text>
        <Text style={styles.sectionSubtitle}>Défi</Text>
        <Text style={styles.bodyText}>
            Lancer un défi à votre adversaire sur une case qu&apos;il occupe. S&apos;il échoue à reproduire votre
            combinaison, vous prenez sa place sur la grille.
        </Text>
        <Text style={styles.sectionSubtitle}>Yam Predator</Text>
        <Text style={styles.bodyText}>
            Réussir un Yam sur une case occupée par l&apos;adversaire vous permet de lui voler directement, sans défi.
        </Text>
    </View>
);

const GridContent: React.FC = () => (
    <View>
        <Text style={styles.bodyText}>
            La grille de jeu est de 5×5 cases. Chaque joueur dispose de 12 pions à placer.
        </Text>
        <Text style={styles.bodyText}>
            Pour poser un pion, la case doit être libre ou défié à l&apos;adversaire. Vous ne pouvez pas placer
            deux pions sur la même case.
        </Text>
        <Text style={styles.bodyText}>
            L&apos;objectif est d&apos;aligner 5 pions de votre couleur pour remporter la partie, ou d&apos;accumuler
            un maximum de points d&apos;alignement.
        </Text>
    </View>
);

const ScoringContent: React.FC = () => (
    <View>
        <Text style={styles.bodyText}>
            Les points sont attribués selon les alignements de vos pions sur la grille (lignes, colonnes, diagonales) :
        </Text>
        <View style={styles.table}>
            {SCORE_ROWS.map((row) => (
                <View key={row.align} style={styles.tableRow}>
                    <Text style={styles.tableName}>{row.align}</Text>
                    <Text style={styles.tableDesc}>{row.pts}</Text>
                </View>
            ))}
        </View>
        <View style={styles.noteBox}>
            <Text style={styles.noteText}>
                La partie se termine aussi quand tous les pions sont posés ou que la grille est complète.
                Le joueur avec le plus de points remporte la victoire.
            </Text>
        </View>
    </View>
);

const SECTIONS = [
    { id: 'dice', icon: '🎲', title: 'Les Dés', Content: DiceContent },
    { id: 'combinations', icon: '🃏', title: 'Les Combinaisons', Content: CombinationsContent },
    { id: 'special', icon: '⚡', title: 'Actions Spéciales', Content: SpecialContent },
    { id: 'grid', icon: '📐', title: 'La Grille & les Pions', Content: GridContent },
    { id: 'scoring', icon: '🏆', title: 'Scoring & Victoire', Content: ScoringContent },
];

const RulesContent: React.FC = () => {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const handleToggle = (sectionId: string): void => {
        setOpenSection((current) => (current === sectionId ? null : sectionId));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.intro}>
                <Text style={styles.introEmoji}>🎲</Text>
                <Text style={styles.title}>YAM MASTER</Text>
                <Text style={styles.introText}>
                    YamMaster est un jeu de dés pour 2 joueurs inspiré du Yahtzee. L&apos;objectif est de remplir
                    une grille 5×5 en réalisant des combinaisons avec 5 dés. Alignez 5 pions pour remporter
                    la victoire, ou accumulez le maximum de points d&apos;alignement.
                </Text>
            </View>

            <View style={styles.sections}>
                {SECTIONS.map(({ id, icon, title, Content }) => (
                    <RulesSection
                        key={id}
                        icon={icon}
                        title={title}
                        isOpen={openSection === id}
                        onToggle={() => handleToggle(id)}
                    >
                        <Content />
                    </RulesSection>
                ))}
            </View>
        </ScrollView>
    );
};

export default RulesContent;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 16,
    },
    intro: {
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    introEmoji: {
        fontSize: 48,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 28,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 3,
        textAlign: 'center',
    },
    introText: {
        fontFamily: fontBody,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 400,
    },
    sections: {
        gap: 10,
    },
    bodyText: {
        fontFamily: fontBody,
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontFamily: fontDisplay,
        fontSize: 13,
        fontWeight: '700',
        color: colors.blue,
        marginTop: 8,
        marginBottom: 4,
    },
    table: {
        marginVertical: 8,
        gap: 6,
    },
    tableRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableName: {
        fontFamily: fontDisplay,
        fontSize: 12,
        fontWeight: '700',
        color: colors.gold,
        minWidth: 80,
    },
    tableDesc: {
        fontFamily: fontBody,
        fontSize: 12,
        color: colors.textSecondary,
        flex: 1,
    },
    noteBox: {
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
        backgroundColor: 'rgba(244, 211, 94, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    noteText: {
        fontFamily: fontBody,
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
        fontStyle: 'italic',
    },
});
