import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { exportToCSV } from '../../contexts/FinanceContext';
import Card from '../ui/Card';
import Filters from '../ui/HistoryFilter'; 
import TransactionTable from "../finance/TransactionTable";
import { Filter, Download } from 'lucide-react';


export default function History() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedType, setSelectedType] = useState('all');
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
  }, [userId, selectedType, selectedCategory]);

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

        if (selectedType !== 'all') {  
          params.append('type', selectedType);
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

        if (response.data.finance) {
          const sortedData = response.data.finance.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
          );
          setFinanceData(sortedData);

          const hardcodedCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Misc'];

          setAvailableCategories(hardcodedCategories);

          if (selectedCategory !== 'all') {
            const filteredData = sortedData.filter(item => item.category === selectedCategory);
            setFinanceData(filteredData);
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

  const startEditing = (entry,index) => {
    setEditId({ id: entry.id, index: index });
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
    setSelectedType('all');
    setDateRange({ start: '', end: '' });
    setSelectedCategory('all');
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
              onClick={() => exportToCSV(financeData, { selectedType, selectedCategory, dateRange })}
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
        <Filters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          availableCategories={availableCategories}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          resetFilters={resetFilters}
          filterOptions={['type', 'date', 'category']}
        />
      )}


      <TransactionTable
        financeData={financeData}
        editId={editId}
        editForm={editForm}
        handleChange={handleChange}
        handleUpdate={handleUpdate}
        cancelEditing={cancelEditing}
        startEditing={startEditing}
        handleDelete={handleDelete}
        userId={userId}
      />


      </Card>
    </div>
  );
}   
