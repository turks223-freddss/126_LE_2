import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setLoading(true);
      const response = await axios.get(`/api/finances/${userId}/finance-details/`);
      
      // Set the finance data directly from the response
      if (response.data.finance) {
        // Sort by date, most recent first
        const sortedData = response.data.finance.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setFinanceData(sortedData);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching finance details:', error);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {financeData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                financeData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.type === 'income' ? (
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-red-500/20">
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        <span>{item.type === 'income' ? 'Income' : 'Expense'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.category || (item.type === 'income' ? 'Income' : 'Expense')}</td>
                    <td className={`px-4 py-3 font-medium ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {`${item.type === 'income' ? '+' : '-'}$${Math.abs(item.amount)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}   
