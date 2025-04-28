import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                password2: formData.password2
            });
            navigate('/login');
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                err.message ||
                'Failed to register'
            );
            console.error(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="text-center mb-6">
                <h1 className="text-4xl text-gray-900 font-extrabold">Budget Tracker</h1>
                <hr className="border-t-2 border-black  mx-auto w-full" />
            </div>
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl text-center font-semibold text-gray-900 mb-4">
                        Create your account
                    </h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password2" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"                                placeholder="Confirm Password"
                                value={formData.password2}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-1/2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:ring-offset-2 disabled:bg-indigo-300 transition-transform duration-200 ease-in-out"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/" className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                Sign in
                            </a>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Register; 