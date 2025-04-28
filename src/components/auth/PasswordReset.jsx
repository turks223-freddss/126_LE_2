import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset, resetPassword } = useAuth();
    const navigate = useNavigate();
    const { uid, token } = useParams();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await requestPasswordReset(email);
            setSuccess('If an account exists with this email, you will receive a password reset link.');
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await resetPassword(uid, token, newPassword);
            setSuccess('Password has been reset successfully. You can now login with your new password.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (uid && token) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-4xl text-gray-900 font-extrabold">Budget Tracker</h1>
                    <hr className="border-t-2 border-black  mx-auto w-full" />
                </div>
                <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                        <h2 className="text-2xl text-center font-semibold text-gray-900 mb-4">
                            Reset your password
                        </h2>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{success}</span>
                            </div>
                        )}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
    
                        <div className="flex justify-center mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-1/2 h-1/2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:ring-offset-2 disabled:bg-indigo-300 transition-transform duration-200 ease-in-out"
                            >
                                {loading ? 'Resetting password...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
        
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-6">
            <div className="text-center mb-6">
                <h1 className="text-4xl text-gray-900 font-extrabold">Budget Tracker</h1>
                <hr className="border-t-2 border-black  mx-auto w-full" />
            </div>
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                <div>
                    <h2 className="text-2xl text-center font-semibold text-gray-900 mb-4">
                        Reset your password
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-1/2 h-1/2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:ring-offset-2 disabled:bg-indigo-300 transition-transform duration-200 ease-in-out"
                        >
                            {loading ? 'Sending reset link...' : 'Send Reset Link'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Know your password?{' '}
                            <a href="/" className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                Sign in.
                            </a>
                        </p>
                    </div>

                </form>
            </div>
        </div>
    );
    
};

export default PasswordReset; 