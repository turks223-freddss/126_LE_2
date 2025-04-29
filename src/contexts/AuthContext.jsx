import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            await axios.get('/api/csrf/');
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                const response = await axios.get('/api/users/me/');
                setUser(response.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/users/register/', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/users/login/', credentials);
            const { token } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            await checkAuth(); // Fetch user details after login
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                await axios.post('/api/users/logout/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const response = await axios.post('/api/users/password-reset/', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Password reset request failed' };
        }
    };

    const resetPassword = async (uid, token, newPassword) => {
        try {
            const response = await axios.post(`/api/users/password-reset-confirm/${uid}/${token}/`, {
                password: newPassword,
                password2: newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Password reset failed' };
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        requestPasswordReset,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 