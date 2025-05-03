import { useEffect, useState } from 'react';
import axios from 'axios';
import { useFinance } from '../../contexts/FinanceContext';
import { LineChart, PieChart, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw, Calendar, Filter } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Card from '../ui/Card';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

export default function Reports() {
  const { lastUpdate } = useFinance();
  const [monthlyData, setMonthlyData] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    monthlyGrowth: 0
  });
  // Add state for overall income vs expenses and expense categories
  const [overallIncomeVsExpenses, setOverallIncomeVsExpenses] = useState({ income: 0, expenses: 0 });
  const [overallExpenseCategories, setOverallExpenseCategories] = useState([]);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      let url = `/api/finances/${userId}/reports/`;
      
      // Add query parameters based on filters
      const params = new URLSearchParams();
      if (selectedMonth !== 'all') {
        params.append('month', selectedMonth);
      }
      if (dateRange.start && dateRange.end) {
        params.append('start_date', dateRange.start);
        params.append('end_date', dateRange.end);
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setMonthlyData(response.data.monthly_data);
      setExpenseCategories(response.data.expense_categories);
      
      // Calculate total metrics from backend response
      const totalIncome = response.data.total_income || 0;
      const totalExpenses = response.data.total_expenses || 0;
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      setMetrics({
        totalIncome,
        totalExpenses,
        savingsRate: Math.round(savingsRate * 100) / 100,
        monthlyGrowth: 0 // This will be calculated if needed for the selected range
      });
      // Set overall income vs expenses and categories in state
      setOverallIncomeVsExpenses(response.data.overall_income_vs_expenses || { income: 0, expenses: 0 });
      setOverallExpenseCategories(response.data.overall_expense_categories || []);

      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError('Failed to fetch report data');
      setLoading(false);
      setRefreshing(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lastUpdate, selectedMonth, selectedCategory]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchData();
    }
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const resetFilters = () => {
    setSelectedMonth('all');
    setDateRange({ start: '', end: '' });
    setSelectedCategory('all');
  };

  // Get unique months from data for the month filter
  const availableMonths = monthlyData 
    ? [...new Set(monthlyData.map(item => item.month))]
    : [];

  // Get unique categories for the category filter
  const availableCategories = expenseCategories
    ? [...new Set(expenseCategories.map(item => item.category))]
    : [];

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-4">
      {error}
    </div>
  );

  const barChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [overallIncomeVsExpenses.income, overallIncomeVsExpenses.expenses],
        backgroundColor: ['#4BC0C0', '#FF6384'],
      },
    ],
  };

  const pieChartData = {
    labels: overallExpenseCategories.map(item => item.category),
    datasets: [
      {
        data: overallExpenseCategories.map(item => item.total),
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

  const savingsData = {
    labels: monthlyData?.map(item => item.month),
    datasets: [
      {
        label: 'Savings Rate',
        data: monthlyData?.map(item => 
          item.income > 0 ? ((item.income - item.expenses) / item.income) * 100 : 0
        ),
        borderColor: '#9966FF',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="p-6">
            <div className="flex flex-wrap gap-6">
              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Months</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold">${metrics.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">${metrics.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold">{metrics.savingsRate}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Percent className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold">{metrics.monthlyGrowth}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                {metrics.monthlyGrowth >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Income vs Expenses */}
          <Card className="flex flex-col h-full p-6">
            <div className="flex items-center mb-4">
              <LineChart className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Income vs Expenses</h2>
            </div>
            <div className="flex-1 min-h-[300px] h-full w-full">
              <Bar
                data={barChartData}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                  layout: {
                    padding: 20,
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 14 } },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: { font: { size: 14 } },
                    },
                  },
                  barThickness: 60, // Optional: makes bars thicker
                  maxBarThickness: 80,
                }}
                height={null} // Let the container control the height
              />
            </div>
          </Card>

          {/* Expense Categories */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Expense Categories</h2>
            </div>
            <div className="h-[400px] flex items-center justify-center">
              <div className="w-[350px]">
                <Pie data={pieChartData} options={{
                  ...chartOptions,
                  maintainAspectRatio: true,
                  responsive: true,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'right',
                      align: 'center',
                      labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      display: false
                    },
                    y: {
                      display: false
                    }
                  }
                }} />
              </div>
            </div>
          </Card>

          {/* Savings Rate Trend */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-semibold">Savings Rate Trend</h2>
            </div>
            <div className="h-80">
              <Line 
                data={savingsData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Savings Rate (%)'
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 