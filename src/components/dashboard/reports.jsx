import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, PieChart } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Reports() {
  const [monthlyData, setMonthlyData] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await axios.get(`/api/finances/${userId}/reports/`);
        setMonthlyData(response.data.monthly_data);
        setExpenseCategories(response.data.expense_categories);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch report data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const pieChartData = {
    labels: expenseCategories?.map(item => item.category),
    datasets: [
      {
        data: expenseCategories?.map(item => item.total),
        backgroundColor: [
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
    labels: monthlyData?.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData?.map(item => item.income),
        backgroundColor: '#4BC0C0',
      },
      {
        label: 'Expenses',
        data: monthlyData?.map(item => item.expenses),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Financial Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Expense Categories Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <PieChart className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Expense Categories</h2>
            </div>
            <div className="h-80">
              <Pie data={pieChartData} options={options} />
            </div>
          </div>

          {/* Monthly Income vs Expenses Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <LineChart className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Monthly Summary</h2>
            </div>
            <div className="h-80">
              <Bar data={barChartData} options={options} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 