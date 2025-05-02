import { useState, useEffect } from 'react';
import axios from 'axios';
import BudgetTable from './BudgetTable';  // Your BudgetTable component
import Card from '../ui/Card'; // Assuming you have a Card component

export default function Budget() {
    const [userId, setUserId] = useState(null);
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
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
    }, [userId, selectedCategory, dateRange]);

    const fetchBudgetData = async () => {
        try {
            setLoading(true);
            let url = `/api/finances/${userId}/budget/`;

            // Add query parameters for filters
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

            if (response.data.budget) {
                const sortedData = response.data.budget.sort((a, b) =>
                    new Date(b.year, b.month - 1) - new Date(a.year, a.month - 1)
                );
                setBudgetData(sortedData);

                // Optionally, define your categories (hardcoded or fetched)
                setAvailableCategories(['Rent', 'Groceries', 'Utilities', 'Transport', 'Savings', 'Misc']);
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching budget data:', error);
            setError('Failed to load budget data.');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedCategory('all');
        setDateRange({ start: '', end: '' });
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
                            onClick={() => {}}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={() => {}}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            Toggle Filters
                        </button>
                    </div>
                </div>

                {/* Filters (optional) */}
                {false && (
                    <div className="text-gray-500">Filter UI placeholder</div>
                )}

                {/* Budget Table */}
                <BudgetTable budgetData={budgetData} />
            </Card>
        </div>
    );
}
