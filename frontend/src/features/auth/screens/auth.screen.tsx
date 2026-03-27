// frontend/src/features/auth/screens/auth.screen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AuthService from '../services/auth.service';
import { useAuth } from '@/shared/contexts/auth.context';
import { colors } from '@/shared/theme/colors';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface Props {
    navigation: NavigationProp;
}

const DEBOUNCE_DELAY_MS = 500;
const REDIRECT_DELAY_MS = 1500;

const AuthScreen: React.FC<Props> = ({ navigation }) => {
    const { login: setAuthUser } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userExists, setUserExists] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setUserExists(null);
        setError(null);

        if (username.trim().length < 2) {
            setChecking(false);
            return;
        }

        setChecking(true);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            const result = await AuthService.checkUsername(username.trim());
            setUserExists(result.exists);
            setChecking(false);
        }, DEBOUNCE_DELAY_MS);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [username]);

    const handleSubmit = async (): Promise<void> => {
        setError(null);
        setLoading(true);

        const result = await AuthService.login(username.trim(), password);

        setLoading(false);

        if (result.success && result.user) {
            const welcomeMessage = result.isNewUser
                ? `Bienvenue, ${result.user.username} ! Compte créé.`
                : `Bon retour, ${result.user.username} !`;

            setSuccessMessage(welcomeMessage);
            setAuthUser(result.user);

            setTimeout(() => {
                navigation.navigate('HomeScreen');
            }, REDIRECT_DELAY_MS);
        } else {
            setError(result.error || 'Erreur inconnue');
        }
    };

    const handleGuestLogin = (): void => {
        setAuthUser({ id: '', username: 'Invité', createdAt: new Date().toISOString() });
        navigation.navigate('HomeScreen');
    };

    const isFormValid = username.trim().length >= 2 && password.length >= 1;
    const isNewUser = userExists === false;
    const isExistingUser = userExists === true;

    const buttonLabel = loading
        ? 'Chargement...'
        : isNewUser
            ? 'Créer mon compte'
            : 'Se connecter';

    const passwordPlaceholder = isNewUser
        ? 'Choisir un mot de passe'
        : '••••••••';

    if (successMessage) {
        return (
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <Feather name="check-circle" size={48} color={colors.success} />
                    <Text style={styles.successMessage}>{successMessage}</Text>
                    <Text style={styles.redirectText}>Redirection...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Yam Master</Text>
                <Text style={styles.subtitle}>L&apos;exp&#233;rience ultime du Yam</Text>
            </View>

            <View style={styles.glassCard}>
                <Text style={styles.welcomeTitle}>Bienvenue</Text>

                {checking && <Text style={styles.checkingText}>Vérification...</Text>}
                {isExistingUser && (
                    <Text style={styles.hintExisting}>Bon retour, {username} !</Text>
                )}
                {isNewUser && (
                    <Text style={styles.hintNew}>Nouveau joueur ? Bienvenue !</Text>
                )}

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Nom d&apos;utilisateur</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="user" size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="votre_pseudo"
                            placeholderTextColor={colors.textMuted}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {userExists !== null && (
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={passwordPlaceholder}
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>
                )}

                {error && <Text style={styles.error}>{error}</Text>}

                {userExists !== null && (
                    <View style={styles.buttonsGroup}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!isFormValid || loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={isFormValid && !loading
                                    ? [colors.primary, '#c23152']
                                    : ['#444', '#333']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.primaryButton}
                            >
                                <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleSubmit}
                            disabled={!isFormValid || loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>
                                {isNewUser ? 'Se connecter' : 'Créer un compte'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.noteText}>
                    Note : Compte créé automatiquement si non trouvé.
                </Text>
            </View>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestLogin}
                activeOpacity={0.7}
            >
                <Feather name="play" size={16} color={colors.primary} />
                <Text style={styles.guestButtonText}>Jouer en invité</Text>
            </TouchableOpacity>
        </View>
    );
};

const fontDisplay = Platform.select({
    web: '"Outfit", sans-serif',
    default: 'Outfit',
});

const fontSans = Platform.select({
    web: '"Inter", sans-serif',
    default: 'Inter',
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 36,
        fontWeight: '900',
        fontStyle: 'italic',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    subtitle: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginTop: 4,
    },
    glassCard: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 24,
    },
    welcomeTitle: {
        fontFamily: fontDisplay,
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    checkingText: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    hintExisting: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.success,
        marginBottom: 8,
    },
    hintNew: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.gold,
        marginBottom: 8,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(233, 69, 96, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 6,
        marginLeft: 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: 12,
        overflow: 'hidden',
    },
    inputIcon: {
        marginLeft: 14,
    },
    input: {
        flex: 1,
        fontFamily: fontSans,
        fontSize: 15,
        color: colors.textPrimary,
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    error: {
        fontFamily: fontSans,
        fontSize: 13,
        color: '#ffb4ab',
        marginBottom: 12,
    },
    buttonsGroup: {
        marginTop: 8,
        gap: 12,
    },
    primaryButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '700',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    noteText: {
        fontFamily: fontSans,
        fontSize: 10,
        color: colors.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: 380,
        marginVertical: 24,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    guestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    guestButtonText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 3,
        textDecorationLine: 'underline',
    },
    successContainer: {
        alignItems: 'center',
        gap: 12,
    },
    successMessage: {
        fontFamily: fontDisplay,
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    redirectText: {
        fontFamily: fontSans,
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default AuthScreen;
