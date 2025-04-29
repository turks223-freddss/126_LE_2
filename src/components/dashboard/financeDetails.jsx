import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../ui/Card';
import List from '../ui/List';
import FinanceItem from '../ui/FinanceItem';
import FinanceForm from '../ui/FinanceForm';

const FinanceDetails = ({ userId }) => {
  const [financeData, setFinanceData] = useState(null);
  const [error, setError] = useState(null);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

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

  const handleAddIncome = async (formData) => {
    try {
      await axios.post('/api/finances/add-income/', {
        user_id: userId,
        income: formData.amount,
        category: formData.category,
        date: formData.date
      }, {
        withCredentials: true
      });
      setIsAddingIncome(false);
      // Refresh the data
      const response = await axios.get(`/api/finances/user/${userId}/finance-details/`, {
        withCredentials: true,
      });
      setFinanceData(response.data);
    } catch (err) {
      setError('Failed to add income.');
      console.error(err);
    }
  };

  const handleAddExpense = async (formData) => {
    try {
      await axios.post('/api/finances/add-expense/', {
        user_id: userId,
        expense: formData.amount,
        category: formData.category,
        date: formData.date
      }, {
        withCredentials: true
      });
      setIsAddingExpense(false);
      // Refresh the data
      const response = await axios.get(`/api/finances/user/${userId}/finance-details/`, {
        withCredentials: true,
      });
      setFinanceData(response.data);
    } catch (err) {
      setError('Failed to add expense.');
      console.error(err);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!financeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Finance Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddingIncome(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Add Income
            </button>
            <button
              onClick={() => setIsAddingExpense(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Add Expense
            </button>
          </div>
        </div>

        {isAddingIncome && (
          <Card className="mb-4">
            <FinanceForm
              type="income"
              onSubmit={handleAddIncome}
              onCancel={() => setIsAddingIncome(false)}
            />
          </Card>
        )}

        {isAddingExpense && (
          <Card className="mb-4">
            <FinanceForm
              type="expense"
              onSubmit={handleAddExpense}
              onCancel={() => setIsAddingExpense(false)}
            />
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Incomes</h3>
            <List
              items={financeData.incomes}
              renderItem={(income) => (
                <FinanceItem
                  type="income"
                  amount={income.fields.income}
                  category={income.fields.category}
                  date={income.fields.date}
                />
              )}
              emptyMessage="No income data available"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Expenses</h3>
            <List
              items={financeData.expenses}
              renderItem={(expense) => (
                <FinanceItem
                  type="expense"
                  amount={expense.fields.expense}
                  category={expense.fields.category}
                  date={expense.fields.date}
                />
              )}
              emptyMessage="No expense data available"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinanceDetails;
