import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    History,
    BarChart,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ active }) {
const navigate = useNavigate();
const { logout } = useAuth();

const linkClass = (name) =>
`block w-full py-2 rounded-md transition-colors ${
    active === name ? 'bg-orange-700 font-semibold' : 'hover:bg-gray-700'
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
<div className="fixed top-0 left-0 h-screen w-16 md:w-64 bg-gray-800 text-white flex flex-col p-4 transition-all duration-300 z-50">
    <div className="text-2xl font-bold mb-10 tracking-wide pl-0 md:pl-4 hidden md:block">
    Budget Tracker
    </div>

    <nav className="flex-1">
    <ul className="space-y-3">
        <li>
        <Link
            to="/dashboard"
            className={`${linkClass('dashboard')} flex items-center gap-3 justify-center md:justify-start pl-0 md:pl-4`}
        >
            <LayoutDashboard size={20} />
            <span className="hidden md:inline flex-1 text-left">Dashboard</span>
        </Link>
        </li>

        <li>
        <Link
            to="/budget"
            className={`${linkClass('budget')} flex items-center gap-3 justify-center md:justify-start pl-0 md:pl-4`}
        >
            <Wallet size={20} />
            <span className="hidden md:inline flex-1 text-left">Budget</span>
        </Link>
        </li>

        <li>
        <Link
            to="/history"
            className={`${linkClass('history')} flex items-center gap-3 justify-center md:justify-start pl-0 md:pl-4`}
        >
            <History size={20} />
            <span className="hidden md:inline flex-1 text-left">Transactions</span>
        </Link>
        </li>

        <li>
        <Link
            to="/reports"
            className={`${linkClass('reports')} flex items-center gap-3 justify-center md:justify-start pl-0 md:pl-4`}
        >
            <BarChart size={20} />
            <span className="hidden md:inline flex-1 text-left">Reports</span>
        </Link>
        </li>
    </ul>
    </nav>

    <div className="pt-6">
    <button
        onClick={handleLogout}
        className="relative w-full bg-red-600 hover:bg-red-500 transition-colors text-white py-2 rounded-md font-semibold flex items-center justify-center md:justify-start pl-0 md:pl-4"
    >
        <LogOut size={20} className="mr-0 md:mr-2" />
        <span className="hidden md:inline">Log Out</span>
    </button>
    </div>
</div>
);
}
