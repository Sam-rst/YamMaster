// frontend/src/shared/contexts/socket.context.tsx

import React, { createContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { SERVER_URL } from '../services/config';
import { useAuth } from './auth.context';

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        const newSocket = io(SERVER_URL, {
            transports: ['websocket'],
            query: { userId: user.id, username: user.username },
        });

        newSocket.on('connect', () => {
            console.log('Socket connecté:', newSocket.id, 'userId:', user.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket déconnecté');
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
