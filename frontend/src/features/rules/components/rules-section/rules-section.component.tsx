import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

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
