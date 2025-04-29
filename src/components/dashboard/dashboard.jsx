import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FinanceDetails from './financeDetails';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetResult, setBudgetResult] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [title, setTitle] = useState('');  // Title state
  const [description, setDescription] = useState(''); 

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
    // Set today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];  // Getting the date part
    setDate(today);  // Set the date state to today's date
  }, []);

  useEffect(() => {
    if (userId && startDate && endDate) {
      fetchBudget();
      fetchFinanceDetails();
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

  const fetchFinanceDetails = async () => {
    try {
      const response = await axios.get(`/api/finances/${userId}/finance-details/`);
      setFinanceData(response.data.finance || []);
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch finance details.');
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!income || !date) {
      setMessage('Please fill in income and date.');
      return;
    }

    const incomeTitle = title || 'Untitled';
    const incomeDescription = description || null;
    

    try {
      const response = await axios.post('/api/finances/add-income/', {
        user_id: userId,
        income: income,
        date: date,
        title: title,
        description: description,
      });
      setMessage(response.data.message || 'Income added successfully!');
      setMessageType('income')
      setTimeout(() => setMessage(''), 3000);
      setIncome('');
      setDate('');
      setTitle('');  // Reset title input
      setDescription('');  // Reset description input
      setShowIncomeForm(false);
      fetchBudget();
      fetchFinanceDetails();
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

    const incomeTitle = title || 'Untitled';
    const incomeDescription = description || null;

    try {
      const response = await axios.post('/api/finances/add-expense/', {
        user_id: userId,
        expense: expense,
        category: category || 'expenses',
        title: title,
        description: description,
        date: date,
      });
      setMessage(response.data.message || 'Expense added successfully!');
      setMessageType('expense')
      setTimeout(() => setMessage(''), 3000);
      setExpense('');
      setCategory('');
      setDate('');
      setTitle('');  // Reset title input
      setDescription('');  // Reset description input
      setShowExpenseForm(false);
      fetchBudget();
      fetchFinanceDetails();
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

  const InviIncomeForm = () => {
    setShowIncomeForm(false)
  }

  const InviExpenseForm = () => {
    setShowExpenseForm(false)
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    
    <div className="flex flex-row items-center  min-h-screen bg-gray-100">
      <div className=" h-screen flex flex-col w-64 bg-gray-800 text-white p-6">
        {/* Title */}
        <div className="text-2xl font-bold mb-10 tracking-wide">
          Budget Tracker
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="block w-full px-4 py-2 rounded-md bg-orange-700 font-semibold "
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Budget
              </a>
            </li>
            <li>
              <Link
                to="/history"
                className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Transaction History
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="block w-full px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Reports
              </a>
            </li>
          </ul>
        </nav>

        {/* Log Out Button */}
        <div className="pt-6">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-500 transition-colors text-white py-2 rounded-md font-semibold"
          >
            Log Out
          </button>
        </div>
      </div>
    <div className="h-full w-full flex justify-center items-center">
    <div className="bg-black justify-center p-10 rounded-xl shadow-lg text-white w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section - Budget Summary (Narrower) */}
        <div className="flex flex-col h-[500px] w-full md:w-1/3 justify-between border border-black p-4">
          {/* Top Section: Budget Summary */}
          <div>
            {budgetResult && (
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Budget Summary (This Month):</h3>
                <p>Total Income: ₱{budgetResult.total_income}</p>
                <p>Total Expense: ₱{budgetResult.total_expense}</p>
                <p>Remaining Budget: ₱{budgetResult.budget}</p>
              </div>
            )}
          </div>
          
          {/* Bottom Section: Add Buttons */}
          <div className="flex flex-col space-y-3">
            {message && (
              <div className="mt-4 flex justify-center">
                  <p
                    className={`${
                      messageType === 'expense'
                        ? 'bg-red-500 border-red-700'
                        : 'bg-green-500 border-green-700'
                    } text-white font-semibold py-2 px-6 rounded-lg shadow-lg border animate-fade-in-out`}
                  >
                  {message}
                </p>
              </div>
            )}
            <div className="flex flex-row md:flex-row gap-4 items-center justify-center mt-auto">
              
              <button 
                onClick={() => {
                  toggleIncomeForm();
                  if (showExpenseForm) InviExpenseForm(); 
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-transform duration-200 transform hover:scale-105 w-48"
              >
                Add Income
              </button>
              
              <button 
                onClick={() => {
                  toggleExpenseForm();
                  if (showIncomeForm) InviIncomeForm(); 
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-transform duration-200 transform hover:scale-105 w-48"
              >
                Add Expense
              </button>
            </div>
          </div>

          
        </div>

        {/* Right Section - Transaction History*/}
        <div className="w-full md:w-2/3">
          {showIncomeForm && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Add Income</h3>
              
              <form 
                onSubmit={(e) => {
                  handleAddIncome(e);
                  toggleIncomeForm(); 
                }}
                className="flex flex-col gap-4"
              >
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
                  <label className="block text-sm mb-1">Title:</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Description:</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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

                <div className="flex justify-between mt-4">
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => InviIncomeForm()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showExpenseForm && (
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Add Expense</h3>
              <form 
                onSubmit={(e) => {
                  handleAddExpense(e);
                  toggleExpenseForm(); 
                }} 
                className="flex flex-col gap-4"
              >
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
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    >
                        <option value="">Select category</option>
                        <option value="food">Food</option>
                        <option value="bills">Bills</option>
                        <option value="transport">Transport</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="savings">Savings</option>
                        <option value="others">Others</option>
                    </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Title:</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Description:</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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

                <div className="flex justify-between mt-4">
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => InviExpenseForm()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showIncomeForm && !showExpenseForm && financeData.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg h-[500px] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Finance History: </h3>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Category</th>
                    <th className="px-2 py-1">Title</th>
                    <th className="px-2 py-1">Amount</th>
                    <th className="px-2 py-1">Description</th>
                    <th className="px-2 py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1">{item.category}</td>
                      <td className="px-2 py-1">{item.title}</td>
                      <td className="px-2 py-1">{item.amount}</td>
                      <td className="px-2 py-1">{item.description}</td>
                      <td className="px-2 py-1">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
    </div>    
    </div>
  );
}
