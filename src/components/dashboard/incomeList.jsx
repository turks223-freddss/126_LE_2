import React, { useState, useEffect } from 'react';

const IncomeList = () => {
  const [userID, setUserID] = useState(null);
  const [incomeList, setIncomeList] = useState([]);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editedData, setEditedData] = useState({ category: '', income: '', date: '' });

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserID(storedUserId);
    }
  }, []);

  const handleFetchIncome = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/finances/list-income/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
        setIncomeList([]);
        setUsername('');
        return;
      }

      setUsername(data.user);
      setIncomeList(data.incomes);
      setError('');
    } catch (err) {
      console.error('Error fetching income:', err);
      setError('Server error.');
    }
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditedData({ ...incomeList[index] });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (incomeID) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/finances/income/${incomeID}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update income.');
        return;
      }

      setEditIndex(null);
      handleFetchIncome(); // refresh
    } catch (err) {
      console.error('Error updating income:', err);
      setError('Server error.');
    }
  };

  const handleDelete = async (incomeID) => {
    const confirmed = window.confirm('Are you sure you want to delete this income entry?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/finances/income/${incomeID}/`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        handleFetchIncome(); // refresh
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete income.');
      }
    } catch (err) {
      console.error('Error deleting income:', err);
      setError('Server error.');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View User Income</h1>

      <div className="mb-4">
        <button
          onClick={handleFetchIncome}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Income
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {username && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Incomes for {username}</h2>
          <ul className="space-y-4">
            {incomeList.map((item, index) => (
              <li key={item.id} className="border p-4 rounded shadow-sm">
                {editIndex === index ? (
                  <>
                    <input
                      type="text"
                      name="category"
                      value={editedData.category}
                      onChange={handleEditChange}
                      className="border rounded p-1 w-full mb-2"
                    />
                    <input
                      type="number"
                      name="income"
                      value={editedData.income}
                      onChange={handleEditChange}
                      className="border rounded p-1 w-full mb-2"
                    />
                    <input
                      type="date"
                      name="date"
                      value={editedData.date}
                      onChange={handleEditChange}
                      className="border rounded p-1 w-full mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditIndex(null)}
                        className="bg-gray-500 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Id:</strong> {item.id}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Amount:</strong> ₱{Number(item.income).toFixed(2)}</p>
                    <p><strong>Date:</strong> {item.date}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditClick(index)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
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

export default IncomeList;
