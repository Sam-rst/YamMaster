// frontend/src/features/profile/components/avatar-picker/avatar-picker.component.tsx
// Sélecteur d'avatar — modale avec 8 emojis en grille 4x2

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const AVAILABLE_AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

interface AvatarPickerProps {
    visible: boolean;
    currentAvatar: string;
    onSelect: (avatar: string) => void;
    onClose: () => void;
}

export default function AvatarPicker({ visible, currentAvatar, onSelect, onClose }: Readonly<AvatarPickerProps>) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Choisir un avatar</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {AVAILABLE_AVATARS.map((avatar) => (
                            <TouchableOpacity
                                key={avatar}
                                style={[
                                    styles.avatarButton,
                                    avatar === currentAvatar && styles.selectedAvatar,
                                ]}
                                onPress={() => onSelect(avatar)}
                            >
                                <Text style={styles.avatarEmoji}>{avatar}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    closeButton: {
        padding: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    avatarButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(22,33,62,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedAvatar: {
        borderColor: '#e94560',
    },
    avatarEmoji: {
        fontSize: 28,
    },
});
