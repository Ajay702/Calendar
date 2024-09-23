import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        const storedTokens = localStorage.getItem('authTokens');
        return storedTokens ? JSON.parse(storedTokens) : null;
    });

    const [user, setUser] = useState(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            const tokens = JSON.parse(storedTokens);
            return tokens.access_token ? jwtDecode(tokens.access_token) : null;
        }
        return null;
    });

    const loginUser = useCallback(async (username, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok && data.access_token) {
                setAuthTokens(data);
                const decodedUser = jwtDecode(data.access_token);
                setUser(decodedUser);
                localStorage.setItem('authTokens', JSON.stringify(data));
                return { success: true };
            } else {
                console.error('Login failed:', data.message);
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    }, []);

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }, []);

    const updateToken = useCallback(async () => {
        console.log('Updating token...');
        try {
            const response = await fetch('http://localhost:5000/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.refresh_token}`,
                },
            });
            const data = await response.json();
            if (response.ok && data.access_token) {
                setAuthTokens(data);
                const decodedUser = jwtDecode(data.access_token);
                setUser(decodedUser);
                localStorage.setItem('authTokens', JSON.stringify(data));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            logoutUser();
        }
    }, [authTokens, logoutUser]);

    useEffect(() => {
        if (authTokens) {
            const fifteenMinutes = 1000 * 60 * 15;
            const interval = setInterval(() => {
                updateToken();
            }, fifteenMinutes);
            return () => clearInterval(interval);
        }
    }, [authTokens, updateToken]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};