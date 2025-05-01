import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Filter, Download,Edit, Trash, Check, X } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  const [editingEntry, setEditingEntry] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');


  

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFinanceDetails();
    }
  }, [userId, selectedMonth, selectedCategory]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchFinanceDetails();
    }
  }, [dateRange]);

  const fetchFinanceDetails = async () => {
    try {
      setLoading(true);
      let url = `/api/finances/${userId}/finance-details/`;
      
      // Add query parameters based on filters
      const params = new URLSearchParams();
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
      
      if (response.data.finance) {
        // Sort by date, most recent first
        const sortedData = response.data.finance.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setFinanceData(sortedData);
  
        // Hardcoded categories list
        const hardcodedCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Misc'];

        setAvailableCategories(hardcodedCategories);
  
        // Apply the category filter if needed
        if (selectedCategory !== 'all') {
          const filteredData = sortedData.filter(item => item.category === selectedCategory);
          setFinanceData(filteredData);  // Update the finance data based on the selected category
        }
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching finance details:', error);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (userId, entryId, entryType) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${entryType} entry?`);
  
    if (!confirmed) return;
  
    try {
      const response = await axios.delete(`/api/finances/delete/${userId}/${entryId}/`, {
        data: { type: entryType }
      });
  
      if (response.status === 204) {
        alert(`${entryType} entry deleted successfully.`);
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      alert('Something went wrong while deleting the entry.');
      console.error(error);
    }
  };
  

  const handleUpdate = async (userId, entryId, entryType, updatedData, onSuccess) => {
    try {
      const response = await axios.patch(`/api/finances/update/${userId}/${entryId}/`, {
        type: entryType,
        ...updatedData,
      });
  
      if (response.status === 200) {
        alert(`${entryType} entry updated successfully.`);
        if (onSuccess) onSuccess(); // refresh data or UI
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Something went wrong while updating the entry.');
    }
  };
  
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
  });

  const startEditing = (entry) => {
    setEditId(entry.id);
    setEditForm({
      title: entry.title,
      description: entry.description,
      category: entry.category,
      amount: Math.abs(entry.amount), // remove negative sign for expense
    });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      amount: '',
    });
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };









  const resetFilters = () => {
    setSelectedMonth('all');
    setDateRange({ start: '', end: '' });
    setSelectedCategory('all');
  };

  // Get unique months from data for the month filter
  const availableMonths = [...new Set(financeData.map(item => {
    const date = new Date(item.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))];

  const exportToCSV = () => {
    // Only proceed if there's data to export
    if (financeData.length === 0) return;
  
    // Define new headers for the CSV
    const headers = ['Type', 'Category', 'Title', 'Amount', 'Description', 'Date'];
  
    // Convert data to CSV format with the new columns
    const csvData = financeData.map(item => [
      item.type,
      item.category || (item.type === 'income' ? 'Income' : 'Expense'),
      item.title,  // Include title in the export
      item.amount,
      item.description,  // Include description in the export
      new Date(item.date).toLocaleDateString()  // Format the date
    ]);
  
    // Add headers to the beginning
    csvData.unshift(headers);
  
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
  
    // Create blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Get current date for filename
    const today = new Date().toISOString().split('T')[0];
    
    // Create filename based on filters
    let filename = `transactions_${today}`;
    if (selectedMonth !== 'all') filename += `_${selectedMonth}`;
    if (selectedCategory !== 'all') filename += `_${selectedCategory}`;
    if (dateRange.start && dateRange.end) {
      filename += `_${dateRange.start}_to_${dateRange.end}`;
    }
    filename += '.csv';
  
    // Trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-6">
              

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
          </div>
        )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 rounded-tr-lg">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {financeData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              financeData.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-all duration-300 ${editId === item.id ? 'bg-orange-200' : 'hover:bg-orange-50'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.type === 'income' ? (
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      <span>{item.type === 'income' ? 'Income' : 'Expense'}</span>
                    </div>
                  </td>

                  {editId === item.id ? (
                    <>
                      <td className="px-4 py-3">
                        <select
                          name="category"
                          className="w-full border rounded px-2 py-1"
                          value={editForm.category}
                          onChange={handleChange}
                        >
                          {/* Hardcoded categories */}
                          <option value="">Select...</option>
                          <option value="Food">Food</option>
                          <option value="Transport">Transport</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Misc">Miscellanous</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="title"
                          className="w-full border rounded px-2 py-1"
                          value={editForm.title}
                          onChange={handleChange}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="amount"
                          type="number"
                          className="w-full border rounded px-2 py-1"
                          value={editForm.amount}
                          onChange={handleChange}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="description"
                          className="w-full border rounded px-2 py-1"
                          value={editForm.description}
                          onChange={handleChange}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{item.title}</td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          item.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {`${item.type === 'income' ? '+' : '-'}₱${Math.abs(item.amount)}`}
                      </td>
                      <td className="px-4 py-3">{item.description}</td>
                    </>
                  )}

                  <td className="px-4 py-3 text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleUpdate(
                                userId,
                                item.id,
                                item.type,
                                {
                                  title: editForm.title,
                                  description: editForm.description,
                                  category: editForm.category,
                                  amount: editForm.amount,
                                },
                                () => {
                                  cancelEditing();
                                  // Optionally refresh financeData here
                                }
                              );
                              window.location.reload();
                            }}
                            className="text-green-500 hover:text-white hover:bg-green-500 rounded-full p-1 transition-all duration-200"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-500 hover:text-white hover:bg-red-500 rounded-full p-1 transition-all duration-200"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(userId, item.id, item.type);
                            window.location.reload();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      </Card>
    </div>
  );
}   
