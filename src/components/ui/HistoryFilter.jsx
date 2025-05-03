import React from 'react';

export default function Filters({
    budgetData,
    dateRange,
    setDateRange,
    selectedCategory,
    setSelectedCategory,
    selectedMonth,
    setSelectedMonth,
    availableCategories,
    resetFilters,
    selectedType,
    setSelectedType,
    filterOptions = ['type', 'date', 'category'], // Default to showing type, date, and category
}) {


    const availableMonths = [
        ...new Set(
            budgetData.map(item => `${item.month}-${item.year}`) // Create a unique identifier by combining month and year
        )
    ].map(monthYear => {
        const [month, year] = monthYear.split('-'); // Split the combined string back into month and year
        return {
            month: parseInt(month, 10), // Convert month to integer
            year: parseInt(year, 10)    // Convert year to integer
        };
    });
    

    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-6">

                {/* Month Filter (only if 'month' is in filterOptions) */}
                {filterOptions.includes('month') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)} // Set the selected month-year string
                            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Months</option>
                            {availableMonths
                                .map((month) => (
                                    <option key={`${month.month}-${month.year}`} value={`${month.month}-${month.year}`}>
                                        {`${new Date(0, month.month - 1).toLocaleString('en', { month: 'long' })} ${month.year}`} {/* Month and year */}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Type Filter (only if 'type' is in filterOptions) */}
                {filterOptions.includes('type') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                )}

                {/* Date Range Filter (only if 'date' is in filterOptions) */}
                {filterOptions.includes('date') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) =>
                                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                                }
                                className="w-full sm:w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) =>
                                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                                }
                                className="w-full sm:w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* Category Filter (always show, as it's needed on all pages) */}
                {filterOptions.includes('category') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {availableCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                

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
    );
}
