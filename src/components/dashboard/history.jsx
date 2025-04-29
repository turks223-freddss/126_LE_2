import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionHistory() {
  const [userId, setUserId] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [activeTab, setActiveTab] = useState('history');
  const [expenseList, setExpenseList] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedExpense, setEditedExpense] = useState({ category: '', expense: '', date: '' });

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFinanceDetails();
      handleFetchExpenses();
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

  const handleFetchExpenses = async () => {
    try {
      const response = await axios.post('/api/finances/list-expense/', {
        userID: userId,
      });
  
      const data = response.data;
  
      setUsername(data.user);
      setExpenseList(data.expenses);
      setError('');
    } catch (error) {
      console.error('Error fetching expenses:', error);
      if (error.response) {
        setError(error.response.data.error || 'Something went wrong.');
        setExpenseList([]);
        setUsername('');
      } else {
        setError('Server error.');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditedExpense({
      category: expense.category,
      expense: expense.expense,
      date: expense.date,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/finances/expense/${id}/`);
      if (response.status === 204) {
        setExpenseList(expenseList.filter((e) => e.id !== id));
      } else {
        setError('Failed to delete expense.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Server error.');
    }
  };
  
  const handleUpdate = async () => {
    try {
      const response = await axios.patch(`/api/finances/expense/${editingId}/`, editedExpense);
      if (response.status === 200) {
        const updatedList = expenseList.map((item) =>
          item.id === editingId ? { ...item, ...editedExpense } : item
        );
        setExpenseList(updatedList);
        setEditingId(null);
        setEditedExpense({ category: '', expense: '', date: '' });
        setError('');
      } else {
        setError('Failed to update expense.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Server error.');
    }
  };



  const renderTabContent = () => {
    if (activeTab === 'history') {
      return (
        <div className="bg-gray-800 p-4 rounded-lg h-[500px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Finance History:</h3>
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
                  <td className="px-2 py-1">₱{item.amount}</td>
                  <td className="px-2 py-1">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'expense') {
        return (
            <div className="bg-gray-800 p-4 rounded-lg h-[500px] overflow-y-auto text-white">
              <h3 className="text-lg font-semibold mb-4">Expenses for {username || 'User'}</h3>
        
              {/* <button
                onClick={handleFetchExpenses}
                className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Fetch Expenses
              </button> */}
        
              {error && <p className="text-red-400 mb-2">{error}</p>}
        
              <table className="w-full text-sm text-left table-auto border border-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-2 py-1 border border-gray-600">ID</th>
                    <th className="px-2 py-1 border border-gray-600">Category</th>
                    <th className="px-2 py-1 border border-gray-600">Amount</th>
                    <th className="px-2 py-1 border border-gray-600">Date</th>
                    <th className="px-2 py-1 border border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseList.map((item) => (
                    <tr key={item.id} className="border border-gray-700">
                      {editingId === item.id ? (
                        <>
                          <td className="px-2 py-1 border border-gray-600">{item.id}</td>
                          <td className="px-2 py-1 border border-gray-600">
                            <input
                              type="text"
                              value={editedExpense.category}
                              onChange={(e) =>
                                setEditedExpense({ ...editedExpense, category: e.target.value })
                              }
                              className="w-full bg-gray-600 text-white px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-600">
                            <input
                              type="number"
                              value={editedExpense.expense}
                              onChange={(e) =>
                                setEditedExpense({
                                  ...editedExpense,
                                  expense: parseFloat(e.target.value),
                                })
                              }
                              className="w-full bg-gray-600 text-white px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-600">
                            <input
                              type="date"
                              value={editedExpense.date}
                              onChange={(e) =>
                                setEditedExpense({ ...editedExpense, date: e.target.value })
                              }
                              className="w-full bg-gray-600 text-white px-1 py-0.5 rounded"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-600 space-x-1">
                            <button
                              onClick={handleUpdate}
                              className="bg-green-500 px-2 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-500 px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-1 border border-gray-600">{item.id}</td>
                          <td className="px-2 py-1 border border-gray-600">{item.category}</td>
                          <td className="px-2 py-1 border border-gray-600">₱{Number(item.expense).toFixed(2)}</td>
                          <td className="px-2 py-1 border border-gray-600">{item.date}</td>
                          <td className="px-2 py-1 border border-gray-600 space-x-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }else if (activeTab === 'income') {
      return (
        <div className="bg-gray-800 p-4 rounded-lg h-[500px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Budget Overview:</h3>
          <p>Allocated vs. Spent budget metrics and visualization.</p>
        </div>
      );
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

          {/* Tabs */}
          <div className="flex mb-4 space-x-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'expense' ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('expense')}
            >
              Expense
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'income' ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('income')}
            >
              Income
            </button>
          </div>

          {/* Content Area */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
