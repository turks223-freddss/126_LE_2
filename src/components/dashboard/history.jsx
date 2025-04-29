import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './sidebar';

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
    <Sidebar active="history" />


    {/* Main Content */}
    <div className="h-full w-full flex justify-center items-center">
    <div className="flex-1 ml-22 md:ml-80 p-6 bg-black justify-center items-center p-10 rounded-xl shadow-lg text-white w-full max-w-6xl">
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
