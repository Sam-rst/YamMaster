// frontend/src/features/auth/screens/auth.screen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AuthService from '../services/auth.service';
import { useAuth } from '@/shared/contexts/auth.context';

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

    // Debounce check username
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
        : 'Mot de passe';

    if (successMessage) {
        return (
            <View style={styles.container}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successMessage}>{successMessage}</Text>
                <Text style={styles.redirectText}>Redirection...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yam Master</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                {checking && <Text style={styles.statusIcon}>...</Text>}
                {isExistingUser && <Text style={styles.statusIconExists}>✓</Text>}
                {isNewUser && <Text style={styles.statusIconNew}>★</Text>}
            </View>

            {isExistingUser && (
                <Text style={styles.hint}>Bon retour, {username} !</Text>
            )}
            {isNewUser && (
                <Text style={styles.hintNew}>Nouveau joueur ? Bienvenue !</Text>
            )}

            {userExists !== null && (
                <TextInput
                    style={styles.passwordInput}
                    placeholder={passwordPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            {userExists !== null && (
                <TouchableOpacity
                    style={[styles.button, !isFormValid && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!isFormValid || loading}
                >
                    <Text style={styles.buttonText}>{buttonLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: 300,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
        fontSize: 16,
    },
    passwordInput: {
        width: '100%',
        maxWidth: 300,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
        fontSize: 16,
    },
    statusIcon: {
        marginLeft: 8,
        fontSize: 16,
        color: '#999',
    },
    statusIconExists: {
        marginLeft: 8,
        fontSize: 18,
        color: '#4CAF50',
    },
    statusIconNew: {
        marginLeft: 8,
        fontSize: 18,
        color: '#FF9800',
    },
    hint: {
        color: '#4CAF50',
        marginBottom: 16,
        fontSize: 14,
    },
    hintNew: {
        color: '#FF9800',
        marginBottom: 16,
        fontSize: 14,
    },
    error: {
        color: 'red',
        marginBottom: 16,
        fontSize: 14,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successIcon: {
        fontSize: 48,
        color: '#4CAF50',
        marginBottom: 16,
    },
    successMessage: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    redirectText: {
        fontSize: 14,
        color: '#999',
    },
});

export default AuthScreen;
