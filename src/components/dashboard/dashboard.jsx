import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [category, setCategory] = useState(''); // New
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetResult, setBudgetResult] = useState(null);

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!income || !date) {
      setMessage('Please fill in both income and date.');
      return;
    }

    try {
      const response = await axios.post('/api/finances/add-income/', {
        user_id: userId,
        income: income,
        date: date
      });

      setMessage(response.data.message || 'Income added successfully!');
      setIncome('');
      setDate('');
    } catch (error) {
      console.error(error);
      setMessage('Failed to add income.');
    }
  };

  const handleSubmitE = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!expense || !date) {
      setMessage('Please fill in expense, category, and date.');
      return;
    }

    try {
      const response = await axios.post('/api/finances/add-expense/', {
        user_id: userId,
        expense: expense,
        category: category || 'expenses', // send default if empty
        date: date
      });

      setMessage(response.data.message || 'Expense added successfully!');
      setExpense('');
      setCategory('');
      setDate('');
    } catch (error) {
      console.error(error);
      setMessage('Failed to add expense.');
    }
  };

  const handleCalculateBudget = async (e) => {
    e.preventDefault();
    setMessage('');
    setBudgetResult(null);

    if (!startDate || !endDate) {
      setMessage('Please select both start and end dates.');
      return;
    }

    try {
      const response = await axios.post('/api/finances/budget/', {
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
      });

      setBudgetResult(response.data);
      setMessage('Budget calculated successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Failed to calculate budget.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-black p-10 rounded-xl shadow-lg text-white w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        {userId ? (
          <>
            <p className="text-lg mb-6">Welcome! Your User ID is: <span className="font-mono">{userId}</span></p>

            {/* INCOME FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
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
                Add Income
              </button>
            </form>

            {/* EXPENSE FORM */}
            <form onSubmit={handleSubmitE} className="flex flex-col gap-4">
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
                Add Expense
              </button>
            </form>

             {/* BUDGET CALCULATOR FORM */}
             <form onSubmit={handleCalculateBudget} className="flex flex-col gap-4 mb-8">
              <h2 className="text-xl font-semibold mb-2">Calculate Budget</h2>

              <div>
                <label className="block text-sm mb-1">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  required
                />
              </div>

              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded">
                Calculate Budget
              </button>
            </form>

            {budgetResult && (
              <div className="bg-gray-800 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2">Budget Summary:</h3>
                <p>Total Income: ₱{budgetResult.total_income}</p>
                <p>Total Expense: ₱{budgetResult.total_expense}</p>
                <p>Remaining Budget: ₱{budgetResult.budget}</p>
              </div>
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