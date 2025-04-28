import { useState, useEffect } from 'react';
import axios from 'axios';

const FinanceDetails = ({ userId }) => {
  const [financeData, setFinanceData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch finance details for the given user
  useEffect(() => {
    const fetchFinanceData = async () => {
        try {
            const response = await axios.get(`/api/finances/user/${userId}/finance-details/`, {
              withCredentials: true,
            });
            setFinanceData(response.data);
          } catch (err) {
            setError('Failed to fetch finance details.');
            console.error(err);
          }
    };

    if (userId) {
      fetchFinanceData();
    }
  }, [userId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!financeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Finance Details for {financeData.user}</h2>

      {/* Incomes List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Incomes:</h3>
        {financeData.incomes.length === 0 ? (
          <p>No income data available.</p>
        ) : (
          <ul className="list-disc pl-6">
            {financeData.incomes.map((income) => (
              <li key={income.pk} className="mb-2">
                <p>
                  <strong>Category:</strong> {income.fields.category}
                </p>
                <p>
                  <strong>Income:</strong> ₱{income.fields.income}
                </p>
                <p>
                  <strong>Date:</strong> {income.fields.date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Expenses List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Expenses:</h3>
        {financeData.expenses.length === 0 ? (
          <p>No expense data available.</p>
        ) : (
          <ul className="list-disc pl-6">
            {financeData.expenses.map((expense) => (
              <li key={expense.pk} className="mb-2">
                <p>
                  <strong>Category:</strong> {expense.fields.category}
                </p>
                <p>
                  <strong>Expense:</strong> ₱{expense.fields.expense}
                </p>
                <p>
                  <strong>Date:</strong> {expense.fields.date}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FinanceDetails;
