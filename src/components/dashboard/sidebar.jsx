// components/common/Sidebar.js
import { Link } from 'react-router-dom';

export default function Sidebar({ active }) {
const linkClass = (name) =>
`block w-full px-4 py-2 rounded-md transition-colors ${
    active === name ? 'bg-orange-700 font-semibold' : 'hover:bg-gray-700'
}`;

return (
<div className="h-screen flex flex-col w-64 bg-gray-800 text-white p-6">
    <div className="text-2xl font-bold mb-10 tracking-wide">Budget Tracker</div>
    <nav className="flex-1">
    <ul className="space-y-3">
        <li>
        <Link to="/dashboard" className={linkClass('dashboard')}>
            Dashboard
        </Link>
        </li>
        <li>
        <Link to="/budget" className={linkClass('budget')}>
            Budget
        </Link>
        </li>
        <li>
        <Link to="/history" className={linkClass('history')}>
            Transaction History
        </Link>
        </li>
        <li>
        <Link to="/reports" className={linkClass('reports')}>
            Reports
        </Link>
        </li>
    </ul>
    </nav>
    <div className="pt-6">
    <button className="w-full bg-red-600 hover:bg-red-500 transition-colors text-white py-2 rounded-md font-semibold">
        Log Out
    </button>
    </div>
</div>
);
}
