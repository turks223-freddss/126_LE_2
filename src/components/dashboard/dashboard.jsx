import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Plus, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import BudgetSummary from './BudgetSummary';
import TransactionForm from './TransactionForm';
import MonthlyBudgetForm from './AddBudgetForm';
import TransactionHistory from './TransactionHistory';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchData(storedUserId);
    }
  }, []);

  const getCurrentMonthDates = () => {
    const now = new Date(); 
    const currentMonth = now.getMonth(); // this month
    const currentYear = now.getFullYear();

    // First day of the current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    firstDay.setHours(0, 0, 0, 0);  // explicitly set to start of the day
    
    // Last day of the current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);  // 0th day of next month = last day of current month
    lastDay.setHours(23, 59, 59, 999);  // explicitly set to the last moment of the day
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const handleBudgetSubmit = async (formData) => {
    try {
      const [year, month] = formData.date.split('-');

      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        month: parseInt(month),  
        year: parseInt(year),
        description: formData.description || '',  
      };
  
      console.log('Payload:', payload); 
  
      const response = await axios.post('/api/finances/set-monthly-budget/', payload);
      console.log('Budget set successfully:', response.data);
      setShowForm(null);
    } catch (error) {
      console.error('Error submitting budget:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        setMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
      } else {
        setMessage('Unknown error occurred.');
      }
    }
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
      console.log(userId)
      console.log(start)
      console.log(end)
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
      const isIncome = showForm === 'income';
      const endpoint = isIncome
        ? '/api/finances/add-income/'
        : '/api/finances/add-expense/';
  
      // Build payload conditionally
      const payload = {
        user_id: userId,
        title: formData.title,
        date: formData.date,
        description: formData.description || '',
        amount: parseFloat(formData.amount),
      };
  
      // Only include category if it's an expense
      if (!isIncome) {
        payload.category = formData.category || 'Expense';
      }
  
      console.log('Payload:', payload);
  
      const response = await axios.post(endpoint, payload);
  
      setMessage(response.data.message || `${showForm} added successfully!`);
      setMessageType('success');
      setShowForm(null);
  
      // Refresh and update
      await fetchData(userId);
      triggerUpdate();
  
      // Clear success message
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setMessage(`Failed to add ${showForm}`);
      setMessageType('error');
    }
  };
  

  // Chart data
  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [
        budgetData.totalIncome,
        budgetData.totalExpense,
      ],
      backgroundColor: [
        '#36A2EB',  // Income - Blue
        '#ef4444 ',  // Expenses - Red 
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
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setShowForm('income')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            isDark
              ? 'bg-white hover:bg-gray-600 text-black'
              : 'bg-gray-900 hover:bg-orange-600 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          Add Income
        </button>
        <button
          onClick={() => setShowForm('expense')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            isDark
              ? 'bg-white hover:bg-gray-600 text-black'
              : 'bg-gray-900 hover:bg-orange-600 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
        <button
          onClick={() => setShowForm('monthlyBudget')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            isDark
              ? 'bg-white hover:bg-gray-600 text-black'
              : 'bg-gray-900 hover:bg-orange-600 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          Add Monthly Budget
        </button>
        
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <>
          {/* Handle different forms based on the showForm value */}
          {showForm === 'income' || showForm === 'expense' ? (
            <TransactionForm
              type={showForm} // Set the type (income or expense)
              onSubmit={handleTransaction} // Handle the transaction submission
              onCancel={() => setShowForm(null)} // Close modal
            />
          ) : showForm === 'monthlyBudget' ? (
            <MonthlyBudgetForm
              onSubmit={handleBudgetSubmit} // Monthly Budget submission handler
              onCancel={() => setShowForm(null)} // Close modal
            />
          ) : null}
        </>
      )}



      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link
              to="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                isDark
                  ? 'bg-white hover:bg-gray-600 text-black'
                  : 'bg-gray-900 hover:bg-orange-600 text-white'
              }`}
            >
              <History className="h-5 w-5" />
              View History
            </Link>
          </div>
          <div className="overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...transactions]
                  .map((t, index) => ({ ...t, originalIndex: index })) // preserve order
                  .sort((a, b) => {
                    const [dayA, monthA] = a.date.split('-').map(Number);
                    const [dayB, monthB] = b.date.split('-').map(Number);

                    const dateA = new Date(2025, monthA - 1, dayA);
                    const dateB = new Date(2025, monthB - 1, dayB);

                    if (dateA > dateB) return -1;
                    if (dateA < dateB) return 1;

                    // same date — newer entry first based on insertion order
                    return b.originalIndex - a.originalIndex;
                  })
                  .slice(0, 5)
                  .map((item, index) => (
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
                      <td className="px-4 py-3 text-gray-600">{item.title}</td> {/* Display Title */}
                      <td className="px-4 py-3 text-gray-600">{item.category}</td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          item.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {`${item.type === 'income' ? '+' : '-'}₱${Math.abs(item.amount)}`}
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
              <p className="text-lg font-semibold text-green-600">₱{budgetData.totalIncome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-lg font-semibold text-red-600">₱{budgetData.totalExpense}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-lg font-semibold text-blue-600">₱{budgetData.remainingBudget}</p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
