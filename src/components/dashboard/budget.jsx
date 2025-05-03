import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetTable from './BudgetTable';  
import MonthlyBudgetForm from './AddBudgetForm';
import Card from '../ui/Card'; 
import { useTheme } from '../../contexts/ThemeContext';
import Filters from '../ui/HistoryFilter'; 
import { Plus, Filter} from 'lucide-react';

export default function Budget() {
    const [userId, setUserId] = useState(null);
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDark } = useTheme();
    const [showForm, setShowForm] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [availableCategories, setAvailableCategories] = useState([]);
    
    // Fetch the user ID (could be from context or localStorage)
    useEffect(() => {
        const storedUserId = localStorage.getItem('user_id');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    // Fetch budget data whenever the user ID, selected category, or date range changes
    useEffect(() => {
        if (userId) {
            fetchBudgetData();
        }
    }, [userId, selectedMonth, selectedCategory, dateRange]);

    const handleBudgetSubmit = async (formData) => {
        try {
            const [year, month] = formData.date.split('-');
        
            const payload = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                month: parseInt(month), 
                year: parseInt(year),
                description: formData.description || '',  
            };
        
            console.log('Payload:', payload); 
        
            const response = await axios.post('/api/finances/set-monthly-budget/', payload);
            console.log('Budget set successfully:', response.data);
            setShowForm(null);
            window.location.reload();
            } catch (error) {
            console.error('Error submitting budget:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                setMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
            } else {
                setMessage('Unknown error occurred.');
            }
            }
        };

    const handleUpdate = async (userId, entryId, updatedData, onSuccess) => {
        try {
            // Make the PATCH request to update the budget 
            const response = await axios.patch(`/api/finances/${userId}/budget/update/${entryId}/`, updatedData);
    
            if (response.status === 200) {
                alert('Budget entry updated successfully.');
                if (onSuccess) onSuccess(); // Call the onSuccess callback to refresh or update the UI
            } else {
                alert(`Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Something went wrong while updating the entry.');
        }
    };

    const onDelete = async (userId, entryId) => {
        // Confirm the deletion action with the user
        const confirmed = window.confirm('Are you sure you want to delete this budget entry?');
        if (!confirmed) return;
    
        try {
            // Make the DELETE request to the server with the userId and entryId
            const response = await axios.delete(`/api/finances/${userId}/budget/delete/${entryId}/`);
    
            // Check if the response status is 204 (No Content), meaning deletion was successful
            if (response.status === 204) {
                alert('Budget entry deleted successfully.');
                // Optionally, refresh the budget data if needed
                fetchBudgetData();
            } else {
                alert(`Error: ${response.data.error}`);
            }
        } catch (error) {
            alert('Something went wrong while deleting the entry.');
            console.error(error);
        }
    };

    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        category: '',
        description: '',
        amount: '',
    });
    
    const startEditing = (entry,index) => {
        setEditId({ id: entry.id, index: index });
        setEditForm({
            title: entry.title,
            description: entry.description,
            category: entry.category,
            amount: Math.abs(entry.amount),
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

    

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            let url = `/api/finances/${userId}/budget/`;
    
            const params = new URLSearchParams();
    
    
            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
    
            if (selectedMonth !== 'all') {
                params.append('month_year', selectedMonth);  // e.g. "5-2025"
            }
    
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            console.log('Request URL:', url);
            console.log('Selected month-year filter:', selectedMonth);

            const response = await axios.get(url);
    
            if (response.data.budget) {
                const sortedData = response.data.budget.sort((a, b) =>
                    new Date(b.year, b.month - 1) - new Date(a.year, a.month - 1)
                );
                setBudgetData(sortedData);
    
                setAvailableCategories(['Food', 'Transport', 'Utilities', 'Entertainment', 'Misc']);
            }
    
            setError(null);
        } catch (error) {
            console.error('Error fetching budget data:', error);
            setError('Failed to load budget data.');
        } finally {
            setLoading(false);
        }
    };
        

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setSelectedMonth('all')
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
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Budget Overview</h1>
                    <div className="flex items-center gap-4">
                        
                        <button
                            onClick={() => setShowForm('monthlyBudget')}
                            className={`flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-400 hover:text-white text-whitetext-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
                        >
                            <Plus className="h-5 w-5" />
                            Add Monthly Budget
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 shadow hover:shadow-md hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                            <Filter className="h-5 w-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                <Filters
                    budgetData={budgetData}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedCategory={selectedCategory}
                    selectedMonth = {selectedMonth}
                    setSelectedMonth={setSelectedMonth} 
                    setSelectedCategory={setSelectedCategory}
                    availableCategories={availableCategories}
                    resetFilters={resetFilters}
                    filterOptions={['month', 'category']}
                />
                )}

                {/* Budget Table */}
                <BudgetTable
                budgetData={budgetData}
                editId={editId}
                editForm={editForm} 
                onDelete={onDelete}
                handleUpdate={handleUpdate}
                handleChange={handleChange}
                userId={userId}
                startEditing={startEditing}
                cancelEditing={cancelEditing}
                />
            </Card>

            {showForm === 'monthlyBudget' && (
                <MonthlyBudgetForm
                    onSubmit={handleBudgetSubmit}
                    onCancel={() => setShowForm(null)}
                />
            )}
        </div>
    );
}
