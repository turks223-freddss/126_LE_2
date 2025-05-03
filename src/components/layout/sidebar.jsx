import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    History,
    BarChart,
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

    // Set colors based on theme
    const navBgColor = isDark ? 'bg-blue-900' : 'bg-blue-600';
    const iconColor = isDark ? 'text-white' : 'text-white';

    return (
        <>
            {/* Sidebar for large screens */}
            <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0`}>
                <div className={`flex flex-col flex-grow ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center h-16 px-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                        <span className="text-white font-semibold text-lg">Budget Tracker</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-2 py-4">
                            <Link to="/dashboard" className={linkClass('dashboard')}>
                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                <span className="hidden lg:inline ml-3">Dashboard</span>
                            </Link>

                            <Link to="/history" className={linkClass('history')}>
                                <History className="mr-3 h-5 w-5" />
                                <span className="hidden lg:inline ml-3">Transactions</span>
                            </Link>

                            <Link to="/reports" className={linkClass('reports')}>
                                <BarChart className="mr-3 h-5 w-5" />
                                <span className="hidden lg:inline ml-3">Reports</span>
                            </Link>

                            <Link to="/budget" className={linkClass('budget')}>
                                <Wallet className="mr-3 h-5 w-5" />
                                <span className="hidden lg:inline ml-3">Budget</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Bottom navigation for smaller screens */}
            <div className={`lg:hidden fixed bottom-0 left-0 right-0 flex justify-around p-3 z-10 ${navBgColor}`}>
                <Link to="/dashboard" className="flex items-center p-2">
                    <LayoutDashboard className={`${iconColor} h-6 w-6`} />
                </Link>
                <Link to="/history" className="flex items-center p-2">
                    <History className={`${iconColor} h-6 w-6`} />
                </Link>
                <Link to="/reports" className="flex items-center p-2">
                    <BarChart className={`${iconColor} h-6 w-6`} />
                </Link>
                <Link to="/budget" className="flex items-center p-2">
                    <Wallet className={`${iconColor} h-6 w-6`} />
                </Link>
            </div>
        </>
    );
}
