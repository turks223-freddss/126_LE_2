import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Plus } from 'lucide-react';
import BudgetSummary from './BudgetSummary';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';

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
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={showForm}
          onSubmit={handleTransaction}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Transaction History */}
      <TransactionHistory transactions={transactions} />
    </div>
  );
}
