// frontend/src/features/profile/components/stats-grid/stats-grid.component.tsx
// Grille de statistiques joueur — affichage des stats globales, par mode et avancées

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BOT_DIFFICULTY_LABELS: Record<string, string> = {
    EASY: 'Débutant',
    MEDIUM: 'Tactique',
    HARD: 'Maître IA',
};

interface Stats {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    onlineGames: number;
    botGames: number;
    bestWinStreak: number;
    averageScore: number;
    favoriteBotDifficulty: string | null;
}

interface StatsGridProps {
    stats: Stats;
}

function StatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function ModeStatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
    return (
        <View style={styles.modeCard}>
            <Text style={[styles.modeValue, color ? { color } : {}]}>{value}</Text>
            <Text style={styles.modeLabel}>{label}</Text>
        </View>
    );
}

function AdvancedRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.advancedRow}>
            <Text style={styles.advancedLabel}>{label}</Text>
            <Text style={styles.advancedValue}>{value}</Text>
        </View>
    );
}

export default function StatsGrid({ stats }: StatsGridProps) {
    const botLabel = stats.favoriteBotDifficulty
        ? BOT_DIFFICULTY_LABELS[stats.favoriteBotDifficulty] ?? '—'
        : '—';

    return (
        <View style={styles.container}>
            {/* Grille principale 2x2 */}
            <View style={styles.mainGrid}>
                <StatCard value={stats.totalGames} label="Parties" />
                <StatCard value={`${stats.winRate}%`} label="Ratio V/D" />
                <StatCard value={stats.wins} label="Victoires" color="#e94560" />
                <StatCard value={stats.losses} label="Défaites" color="rgba(255,255,255,0.4)" />
            </View>

            {/* Section Par mode */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.accentBar} />
                    <Text style={styles.sectionTitle}>Par mode</Text>
                </View>
                <View style={styles.modeGrid}>
                    <ModeStatCard value={stats.onlineGames} label="En ligne" color="#00d2ff" />
                    <ModeStatCard value={stats.botGames} label="Vs Bot" color="#f4d35e" />
                    <ModeStatCard value={stats.bestWinStreak} label="Win streak" color="#e94560" />
                </View>
            </View>

            {/* Section Avancé */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={[styles.accentBar, { backgroundColor: '#00d2ff' }]} />
                    <Text style={styles.sectionTitle}>Avancé</Text>
                </View>
                <View style={styles.advancedList}>
                    <AdvancedRow label="Score moyen" value={String(stats.averageScore)} />
                    <AdvancedRow label="Nuls" value={String(stats.draws)} />
                    <AdvancedRow label="Bot préféré" value={botLabel} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    mainGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(22,33,62,0.4)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 4,
    },
    section: {
        backgroundColor: 'rgba(22,33,62,0.4)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    accentBar: {
        width: 4,
        height: 16,
        borderRadius: 2,
        backgroundColor: '#e94560',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    modeGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modeCard: {
        alignItems: 'center',
        flex: 1,
    },
    modeValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    modeLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 4,
    },
    advancedList: {
        gap: 8,
    },
    advancedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    advancedLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
    },
    advancedValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffffff',
    },
});
