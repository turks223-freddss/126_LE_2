import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login({ email, password });
            if (response.user_id) {
                localStorage.setItem('user_id', response.user_id);
                navigate('/dashboard', { replace: true });
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        showPasswordToggle
                        autoComplete="current-password"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <Link
                            to="/password-reset"
                            className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full py-3 text-base font-semibold"
                >
                    Sign in
                </Button>

                <div className="text-center text-sm">
                    <span className="text-gray-400">Don't have an account?</span>{' '}
                    <Link
                        to="/register"
                        className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;