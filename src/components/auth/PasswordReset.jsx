import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { requestPasswordReset, resetPassword } = useAuth();
    const navigate = useNavigate();
    const { uid, token } = useParams();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await requestPasswordReset(email);
            setSuccess('If an account exists with this email, you will receive a password reset link.');
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await resetPassword(uid, token, newPassword);
            setSuccess('Password has been reset successfully. You can now login with your new password.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (uid && token) {
        return (
            <div className="w-full">
                <form onSubmit={handleResetPassword} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-6">
                            {success}
                        </div>
                    )}

                    <div className="space-y-5">
                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            showPasswordToggle
                            autoComplete="new-password"
                            className="py-3 px-4 block w-full rounded-lg text-base"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full py-3 text-base font-semibold"
                    >
                        {isLoading ? 'Resetting password...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full">
            <form onSubmit={handleRequestReset} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-6">
                        {success}
                    </div>
                )}

                <div className="space-y-5">
                    <Input
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full py-3 text-base font-semibold"
                >
                    {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
                </Button>

                <div className="text-center text-sm">
                    <span className="text-gray-400">Remember your password?</span>{' '}
                    <Link
                        to="/login"
                        className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default PasswordReset;
