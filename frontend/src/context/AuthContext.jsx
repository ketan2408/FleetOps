import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/profile');
                    setUser({ ...data, token });
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        console.log(`AuthContext: Attempting login for ${email}`);
        const { data } = await api.post('/auth/login', { email, password });
        console.log('AuthContext: Login API Success', data);
        localStorage.setItem('token', data.token);
        
        try {
            console.log('AuthContext: Fetching profile...');
            const profileRes = await api.get('/auth/profile');
            console.log('AuthContext: Profile fetched', profileRes.data);
            setUser({ ...profileRes.data, token: data.token });
            return profileRes.data;
        } catch (e) {
            console.warn('AuthContext: Profile fetch failed, falling back to token data', e);
            const decoded = jwtDecode(data.token);
            setUser({ ...data, ...decoded });
            return data;
        }
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        // Fetch full profile (includes vendor details) after register
        try {
            const profileRes = await api.get('/auth/profile');
            setUser({ ...profileRes.data, token: data.token });
            return profileRes.data;
        } catch (e) {
            const decoded = jwtDecode(data.token);
            setUser({ ...data, ...decoded });
            return data;
        }
    };

    const resetPassword = async (email, newPassword) => {
        const { data } = await api.post('/auth/forgot-password', { email, newPassword });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
