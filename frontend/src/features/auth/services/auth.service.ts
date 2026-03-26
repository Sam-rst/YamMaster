// frontend/src/features/auth/services/auth.service.ts

import { SERVER_URL } from '@/shared/services/config';

interface AuthUser {
    id: string;
    username: string;
    createdAt: string;
}

interface AuthResult {
    success: boolean;
    user?: AuthUser;
    isNewUser?: boolean;
    error?: string;
}

const AUTH_API_URL = `${SERVER_URL}/api/auth`;

const AuthService = {
    login: async (username: string, password: string): Promise<AuthResult> => {
        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            return data;
        } catch {
            return { success: false, error: 'Erreur réseau — vérifiez votre connexion' };
        }
    },
};

export default AuthService;
