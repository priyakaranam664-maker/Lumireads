import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) { setLoading(false); return; }
            const { data } = await authAPI.getMe();
            setUser(data.data);
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    const login = async (credentials) => {
        const { data } = await authAPI.login(credentials);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser(data.data.user);
        toast.success('Welcome back!');
        return data.data.user;
    };

    const socialSignIn = async (socialData) => {
        const { data } = await authAPI.socialLogin(socialData);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser(data.data.user);
        toast.success('Signed in with ' + socialData.provider);
        return data.data.user;
    };

    const register = async (userData) => {
        const { data } = await authAPI.register(userData);
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setUser(data.data.user);
        toast.success('Account created successfully!');
        return data.data.user;
    };

    const logout = async () => {
        try { await authAPI.logout(); } catch { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        toast.success('Logged out');
    };

    const updateUser = (updatedData) => {
        setUser((prev) => ({ ...prev, ...updatedData }));
    };

    const value = {
        user, loading, login, socialSignIn, register, logout, updateUser, loadUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
