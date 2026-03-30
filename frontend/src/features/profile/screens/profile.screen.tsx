// frontend/src/features/profile/screens/profile.screen.tsx
// Écran de profil joueur — affichage des stats, avatar, rang et membre depuis

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { useAuth } from '@/shared/contexts/auth.context';
import ProfileService, { ProfileStats } from '../services/profile.service';
import StatsGrid from '../components/stats-grid/stats-grid.component';
import AvatarPicker from '../components/avatar-picker/avatar-picker.component';
import { colors } from '@/shared/theme/colors';

const FRENCH_MONTHS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function formatMemberSince(isoDate: string): string {
    const date = new Date(isoDate);
    const month = FRENCH_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `Membre depuis ${month} ${year}`;
}

const fontDisplay = Platform.select({
    web: '"Outfit", sans-serif',
    default: 'Outfit',
});

const fontSans = Platform.select({
    web: '"Inter", sans-serif',
    default: 'Inter',
});

export default function ProfileScreen() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState('🎲');

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        ProfileService.getProfile(user.id).then((result) => {
            setProfile(result);
            if (result?.avatar) {
                setCurrentAvatar(result.avatar);
            }
            setLoading(false);
        });
    }, [user?.id]);

    const handleAvatarSelect = async (avatar: string): Promise<void> => {
        if (!user?.id) return;

        await ProfileService.updateAvatar(user.id, avatar);
        setCurrentAvatar(avatar);
        setAvatarPickerVisible(false);
    };

    if (loading) {
        return (
            <View style={styles.centered} testID="profile-loader">
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Profil introuvable</Text>
            </View>
        );
    }

    const memberSince = formatMemberSince(profile.createdAt);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Carte de profil */}
            <View style={styles.profileCard}>
                <TouchableOpacity
                    testID="avatar-button"
                    style={styles.avatarCircle}
                    onPress={() => setAvatarPickerVisible(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.avatarEmoji}>{currentAvatar}</Text>
                </TouchableOpacity>

                <Text style={[styles.username, { fontFamily: fontDisplay }]}>
                    {profile.username.toUpperCase()}
                </Text>

                <Text style={[styles.memberSince, { fontFamily: fontSans }]}>
                    {memberSince}
                </Text>

                <View style={[styles.rankBadge, { backgroundColor: profile.rank.color + '33', borderColor: profile.rank.color }]}>
                    <Text style={[styles.rankText, { color: profile.rank.color, fontFamily: fontSans }]}>
                        {profile.rank.name}
                    </Text>
                </View>
            </View>

            {/* Grille de statistiques */}
            <StatsGrid stats={profile.stats} />

            {/* Bouton changer d'avatar */}
            <TouchableOpacity
                style={styles.changeAvatarButton}
                onPress={() => setAvatarPickerVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={[styles.changeAvatarText, { fontFamily: fontSans }]}>
                    Changer d&apos;avatar
                </Text>
            </TouchableOpacity>

            {/* Modal AvatarPicker */}
            <AvatarPicker
                visible={avatarPickerVisible}
                currentAvatar={currentAvatar}
                onSelect={handleAvatarSelect}
                onClose={() => setAvatarPickerVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 20,
        gap: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 24,
        gap: 8,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
    },
    avatarEmoji: {
        fontSize: 36,
    },
    username: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 3,
        marginTop: 4,
    },
    memberSince: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    rankBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 4,
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    changeAvatarButton: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    changeAvatarText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
