// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/api';
import { Bell, Info } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            if (!audioRef.current) {
                audioRef.current = new Audio('/notification.wav');
            }

            socketRef.current = io('/');

            const joinGroupRooms = async () => {
                try {
                    const response = await api.get('/groups');
                    const groups = response.data;
                    groups.forEach(group => {
                        socketRef.current.emit('joinGroup', group.group_id);
                    });
                } catch (error) {
                    console.error("Could not join group rooms:", error);
                }
            };

            joinGroupRooms();

            socketRef.current.on('notification', ({ title, message }) => {
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));

                toast(title, {
                    description: message,
                    icon: <Bell className="h-4 w-4 text-primary" />,
                    duration: 7000,
                });
            });

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isAuthenticated]);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    );
};