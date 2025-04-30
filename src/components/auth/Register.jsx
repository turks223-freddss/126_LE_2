import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
            await register(formData);
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
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        required
                        autoComplete="username"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                        showPasswordToggle
                        autoComplete="new-password"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        showPasswordToggle
                        autoComplete="new-password"
                        className="py-3 px-4 block w-full rounded-lg text-base"
                    />
                </div>

                {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                    {error}
                </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full py-3 text-base font-semibold"
                >
                    Create account
                </Button>

                <div className="text-center text-sm">
                    <span className="text-gray-400">Already have an account?</span>{' '}
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

export default Register;
