import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { account, login as apiLogin, register as apiRegister, logout as apiLogout, getUser, googleLogin as apiGoogleLogin } from '../services/appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const userData = await getUser();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        await apiLogin(email, password);
        await checkUser();
    };

    const register = async (email, password, name) => {
        await apiRegister(email, password, name);
        await checkUser();
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    const googleLogin = async () => {
        await apiGoogleLogin();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
