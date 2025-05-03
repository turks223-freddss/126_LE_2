import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    History,
    BarChart,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Sidebar({ active }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { isDark } = useTheme();

    const linkClass = (name) =>
        `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            active === name
                ? 'bg-blue-50 text-blue-600'
                : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
        }`;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0`}>
            <div className={`flex flex-col flex-grow ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`flex items-center h-16 px-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                    <span className="text-white font-semibold text-lg">Budget Tracker</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="px-2 py-4">
                        <Link
                            to="/dashboard"
                            className={linkClass('dashboard')}
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5" />
                            Dashboard
                        </Link>

                        <Link
                            to="/history"
                            className={linkClass('history')}
                        >
                            <History className="mr-3 h-5 w-5" />
                            Transactions
                        </Link>

                        <Link
                            to="/reports"
                            className={linkClass('reports')}
                        >
                            <BarChart className="mr-3 h-5 w-5" />
                            Reports
                        </Link>
                        <Link
                            to="/budget"
                            className={linkClass('budget')}
                        >
                            <Wallet className="mr-3 h-5 w-5" />
                            Budget
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
