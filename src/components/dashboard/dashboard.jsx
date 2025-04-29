import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Plus, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import BudgetSummary from './BudgetSummary';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const { triggerUpdate } = useFinance();
  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [budgetData, setBudgetData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    remainingBudget: 0
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchData(storedUserId);
    }
  }, []);

  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const fetchData = async (userId) => {
    try {
      const { start, end } = getCurrentMonthDates();
      
      // Fetch budget summary for current month
      const budgetResponse = await axios.post('/api/finances/budget/', {
        user_id: userId,
        start_date: start,
        end_date: end
      });
      
      setBudgetData({
        totalIncome: budgetResponse.data.total_income || 0,
        totalExpense: budgetResponse.data.total_expense || 0,
        remainingBudget: budgetResponse.data.budget || 0
      });

      // Fetch transactions
      const financeResponse = await axios.get(`/api/finances/${userId}/finance-details/`);
      
      if (financeResponse.data.finance) {
        // Sort by date, most recent first
        const sortedTransactions = financeResponse.data.finance.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to fetch data');
      setMessageType('error');
    }
  };

  const handleTransaction = async (formData) => {
    try {
      const endpoint = showForm === 'income' ? '/api/finances/add-income/' : '/api/finances/add-expense/';
      const payload = {
        user_id: userId,
        category: formData.category || (showForm === 'income' ? 'Income' : 'Expense'),
        date: formData.date
      };

      if (showForm === 'income') {
        payload.income = parseFloat(formData.amount);
      } else {
        payload.expense = parseFloat(formData.amount);
      }

      const response = await axios.post(endpoint, payload);

      setMessage(response.data.message || `${showForm} added successfully!`);
      setMessageType('success');
      setShowForm(null);
      
      // Refresh data
      await fetchData(userId);
      // Trigger update for other components
      triggerUpdate();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setMessage(`Failed to add ${showForm}`);
      setMessageType('error');
    }
  };

  // Chart data
  const doughnutData = {
    labels: ['Income', 'Expenses', 'Remaining'],
    datasets: [{
      data: [
        budgetData.totalIncome,
        budgetData.totalExpense,
        budgetData.remainingBudget
      ],
      backgroundColor: [
        '#4BC0C0',  // Income - Teal
        '#FF6384',  // Expenses - Red
        '#36A2EB',  // Remaining - Blue
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="space-y-8 p-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white animate-fade-in-out z-50`}>
          {message}
        </div>
      )}

      {/* Budget Summary */}
      <BudgetSummary
        totalIncome={budgetData.totalIncome}
        totalExpense={budgetData.totalExpense}
        remainingBudget={budgetData.remainingBudget}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowForm('income')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Income
        </button>
        <button
          onClick={() => setShowForm('expense')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
        <Link
          to="/history"
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors ml-auto"
        >
          <History className="h-5 w-5" />
          View History
        </Link>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={showForm}
          onSubmit={handleTransaction}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.slice(0, 5).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.type === 'income' ? (
                          <div className="p-1.5 rounded-lg bg-green-100">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-red-100">
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.category}</td>
                    <td className={`px-4 py-3 font-medium ${
                      item.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {`${item.type === 'income' ? '+' : '-'}$${Math.abs(item.amount)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary Charts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-lg font-semibold text-green-600">${budgetData.totalIncome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-lg font-semibold text-red-600">${budgetData.totalExpense}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-lg font-semibold text-blue-600">${budgetData.remainingBudget}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
