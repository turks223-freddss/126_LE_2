import React, { useEffect, useState } from 'react';

const ExpenseList = () => {
  const [userID, setUserID] = useState(null);
  const [expenseList, setExpenseList] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedExpense, setEditedExpense] = useState({ category: '', expense: '', date: '' });

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserID(storedUserId);
    }
  }, []);

  const handleFetchExpenses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/finances/list-expense/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
        setExpenseList([]);
        setUsername('');
        return;
      }

      setUsername(data.user);
      setExpenseList(data.expenses);
      setError('');
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Server error.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/finances/expense/${id}/`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        setExpenseList(expenseList.filter((e) => e.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete expense.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Server error.');
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

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/finances/expense/${editingId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedExpense),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update expense.');
        return;
      }

      const updatedList = expenseList.map((item) =>
        item.id === editingId ? { ...item, ...editedExpense } : item
      );
      setExpenseList(updatedList);
      setEditingId(null);
      setEditedExpense({ category: '', expense: '', date: '' });
      setError('');
    } catch (err) {
      console.error('Update error:', err);
      setError('Server error.');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View User Expenses</h1>

      <div className="mb-4">
        <button
          onClick={handleFetchExpenses}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Fetch Expenses
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {username && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Expenses for {username}</h2>
          <ul className="space-y-2">
            {expenseList.map((item) => (
              <li key={item.id} className="border p-2 rounded">
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editedExpense.category}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, category: e.target.value })
                      }
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <input
                      type="number"
                      value={editedExpense.expense}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, expense: parseFloat(e.target.value) })
                      }
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <input
                      type="date"
                      value={editedExpense.date}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, date: e.target.value })
                      }
                      className="border rounded px-2 py-1 mr-2"
                    />
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Id:</strong> {item.id}
                    </p>
                    <p>
                      <strong>Category:</strong> {item.category}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₱{Number(item.expense).toFixed(2)}
                    </p>
                    <p>
                      <strong>Date:</strong> {item.date}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
