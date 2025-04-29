import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Reports() {
  const [userId, setUserId] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReportsData();
    }
  }, [userId]);

  const fetchReportsData = async () => {
    try {
      const response = await axios.get(`/api/finances/${userId}/reports/`);
      setExpensesByCategory(response.data.expenses_by_category);
      setMonthlyData(response.data.monthly_data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      setLoading(false);
    }
  };

  const pieChartData = {
    labels: expensesByCategory.map(item => item.category),
    datasets: [
      {
        data: expensesByCategory.map(item => item.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const barChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(item => item.income),
        backgroundColor: '#4BC0C0',
      },
      {
        label: 'Expenses',
        data: monthlyData.map(item => item.expenses),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
      },
    },
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-black p-10 rounded-xl shadow-lg text-white w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
          <div className="h-64">
            <Pie data={pieChartData} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Monthly Comparison</h2>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
} 