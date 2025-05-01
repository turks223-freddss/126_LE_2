import React from 'react';

export default function Filters({
    dateRange,
    setDateRange,
    selectedCategory,
    setSelectedCategory,
    availableCategories,
    resetFilters
    }) {
    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-6">
            {/* Date Range Filter */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex gap-2">
                <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
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
                <option key={category} value={category}>
                    {category}
                </option>
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
    );
}
