import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetResult, setBudgetResult] = useState(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    // Set user ID
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Set start and end date to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (userId && startDate && endDate) {
      fetchBudget();
    }
  }, [userId, startDate, endDate]);

  const fetchBudget = async () => {
    try {
      const response = await axios.post('/api/finances/budget/', {
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
      });
      setBudgetResult(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch budget.');
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!income || !date) {
      setMessage('Please fill in income and date.');
      return;
    }

    try {
      const response = await axios.post('/api/finances/add-income/', {
        user_id: userId,
        income: income,
        date: date,
      });
      setMessage(response.data.message || 'Income added successfully!');
      setIncome('');
      setDate('');
      setShowIncomeForm(false);
      fetchBudget();
    } catch (error) {
      console.error(error);
      setMessage('Failed to add income.');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expense || !date) {
      setMessage('Please fill in expense, category, and date.');
      return;
    }

    try {
      const response = await axios.post('/api/finances/add-expense/', {
        user_id: userId,
        expense: expense,
        category: category || 'expenses',
        date: date,
      });
      setMessage(response.data.message || 'Expense added successfully!');
      setExpense('');
      setCategory('');
      setDate('');
      setShowExpenseForm(false);
      fetchBudget();
    } catch (error) {
      console.error(error);
      setMessage('Failed to add expense.');
    }
  };

  const toggleIncomeForm = () => {
    setShowIncomeForm(true);
    setShowExpenseForm(false);
    setDate('');
  };

  const toggleExpenseForm = () => {
    setShowExpenseForm(true);
    setShowIncomeForm(false);
    setDate('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-black p-10 rounded-xl shadow-lg text-white w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {userId ? (
          <>
            {budgetResult && (
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Budget Summary (This Month):</h3>
                <p>Total Income: ₱{budgetResult.total_income}</p>
                <p>Total Expense: ₱{budgetResult.total_expense}</p>
                <p>Remaining Budget: ₱{budgetResult.budget}</p>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <button 
                onClick={toggleIncomeForm} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Add Income
              </button>
              <button 
                onClick={toggleExpenseForm} 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Add Expense
              </button>
            </div>

            {showIncomeForm && (
              <form onSubmit={handleAddIncome} className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm mb-1">Income Amount:</label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded">
                  Submit Income
                </button>
              </form>
            )}

            {showExpenseForm && (
              <form onSubmit={handleAddExpense} className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm mb-1">Expense Amount:</label>
                  <input
                    type="number"
                    value={expense}
                    onChange={(e) => setExpense(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Category:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category (e.g., food, bills)"
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded">
                  Submit Expense
                </button>
              </form>
            )}

            {message && <p className="mt-4 text-center">{message}</p>}
          </>
        ) : (
          <p className="text-lg text-red-500">User not logged in.</p>
        )}
      </div>
    </div>
  );
}
