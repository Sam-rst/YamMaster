// frontend/src/shared/contexts/auth.context.tsx

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface AuthUser {
    id: string;
    username: string;
    avatar?: string;
    createdAt: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (user: AuthUser) => void;
    logout: () => void;
    updateUser: (fields: Partial<AuthUser>) => void;
}

const defaultContext: AuthContextType = {
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = (): AuthContextType => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const login = useCallback((authUser: AuthUser) => {
        setUser(authUser);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const updateUser = useCallback((fields: Partial<AuthUser>) => {
        setUser((prev) => prev ? { ...prev, ...fields } : prev);
    }, []);

    const value: AuthContextType = useMemo(() => ({
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        updateUser,
    }), [user, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
