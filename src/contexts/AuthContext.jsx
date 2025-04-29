import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/csrf/');
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        if (token && userId) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            // Set user with minimal data if we have token and user_id
            setUser({ id: userId });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/users/register/', userData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post('/api/users/login/', credentials);
            const { token, user_id } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user_id', user_id);
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            // Set user with the data we have
            setUser({ id: user_id });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/users/logout/');
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        } catch (error) {
            throw error.response.data;
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const response = await axios.post('/api/users/password-reset/', { email });
            return response.data;
        } catch (error) {
            throw error.response.data;
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
            throw error.response.data;
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