import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionHistory() {
const [userId, setUserId] = useState(null);
const [financeData, setFinanceData] = useState([]);

useEffect(() => {
const storedUserId = localStorage.getItem('user_id');
if (storedUserId) {
    setUserId(storedUserId);
}
}, []);

useEffect(() => {
if (userId) {
    fetchFinanceDetails();
}
}, [userId]);

const fetchFinanceDetails = async () => {
try {
    const response = await axios.get(`/api/finances/${userId}/finance-details/`);
    setFinanceData(response.data.finance || []);
} catch (error) {
    console.error(error);
}
};

return (
<div className="flex flex-row items-center min-h-screen bg-gray-100">
    {/* Sidebar */}
    <div className="h-screen flex flex-col w-64 bg-gray-800 text-white p-6">
    <div className="text-2xl font-bold mb-10 tracking-wide">Budget Tracker</div>
    <nav className="flex-1">
        <ul className="space-y-3">
        <li>
            <a href="/dashboard" className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Dashboard
            </a>
        </li>
        <li>
            <a href="#" className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Budget
            </a>
        </li>
        <li>
            <a href="#" className="block w-full px-4 py-2 rounded-md bg-orange-700 font-semibold">
            Transaction History
            </a>
        </li>
        <li>
            <a href="#" className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Reports
            </a>
        </li>
        </ul>
    </nav>
    <div className="pt-6">
        <button className="w-full bg-red-600 hover:bg-red-500 transition-colors text-white py-2 rounded-md font-semibold">
        Log Out
        </button>
    </div>
    </div>

    {/* Main Content */}
    <div className="h-full w-full flex justify-center items-center">
    <div className="bg-black justify-center p-10 rounded-xl shadow-lg text-white w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Transaction History</h1>

        <div className="bg-gray-800 p-4 rounded-lg h-[500px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Finance History: </h3>
        <table className="w-full text-sm text-left">
            <thead>
            <tr>
                <th className="px-2 py-1">Category</th>
                <th className="px-2 py-1">Amount</th>
                <th className="px-2 py-1">Date</th>
            </tr>
            </thead>
            <tbody>
            {financeData.map((item, index) => (
                <tr key={index}>
                <td className="px-2 py-1">{item.category}</td>
                <td className="px-2 py-1">{item.amount}</td>
                <td className="px-2 py-1">{item.date}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    </div>
</div>
);
}   
