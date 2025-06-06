import React, { useState } from 'react';
import { X } from 'lucide-react';

const MAX_DESCRIPTION_LENGTH = 50;
const MAX_TITLE_LENGTH = 20;
const MAX_AMOUNT_LENGTH = 10;

const MonthlyBudgetForm = ({ onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    amount: '',
    category: '',
    title: '',
    date: new Date().toISOString().slice(0, 7),
    description: '',
});

const [error, setError] = useState('');
const [titleError, setTitleError] = useState('');
const [amountError, setAmountError] = useState('');
const [shakeError, setShakeError] = useState(false);
const [shakeTitleError, setShakeTitleError] = useState(false);
const [shakeAmountError, setShakeAmountError] = useState(false);

const handleSubmit = (e) => {
    e.preventDefault();

    let formValid = true;

    if (formData.title.length > MAX_TITLE_LENGTH) {
    setTitleError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
    setShakeTitleError(true);
    formValid = false;
    } else {
    setTitleError('');
    }

    if (formData.amount.length > MAX_AMOUNT_LENGTH) {
    setAmountError(`Amount cannot exceed ${MAX_AMOUNT_LENGTH} characters.`);
    setShakeAmountError(true);
    formValid = false;
    } else {
    setAmountError('');
    }

    if (error) {
    setShakeError(true);
    formValid = false;
    }

    if (formValid) {
    onSubmit(formData);
    }

    setTimeout(() => {
    setShakeError(false);
    setShakeTitleError(false);
    setShakeAmountError(false);
    }, 500);
};

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'description') {
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
        setError('');
    } else {
        setError(`Maximum of ${MAX_DESCRIPTION_LENGTH} characters allowed.`);
    }
    }

    if (name === 'title') {
    if (value.length > MAX_TITLE_LENGTH) {
        setTitleError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
    } else {
        setTitleError('');
    }
    }

    if (name === 'amount') {
    if (value.length > MAX_AMOUNT_LENGTH) {
        setAmountError(`Amount cannot exceed ${MAX_AMOUNT_LENGTH} characters.`);
    } else {
        setAmountError('');
    }
    }
};

return (
    <div className="fixed inset-0 h-full backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative animate-fade-in">
        <button
        onClick={onCancel}
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
        <X className="h-6 w-6" />
        </button>

        <h3 className="text-xl font-semibold text-white mb-6">
        Add Monthly Budget
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
            Title
            </label>
            <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${shakeTitleError ? 'shake-error' : ''}`}
            required
            />
            {titleError && (
            <span className="text-red-500 text-sm">{titleError}</span>
            )}
        </div>

        {/* Category */}
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
            Category
            </label>
            <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Miscellanous">Miscellanous</option>
            </select>
        </div>

        {/* Amount */}
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
                Amount
            </label>
            <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${shakeAmountError ? 'shake-error' : ''}`}
                required
            />
            {amountError && (
                <span className="text-red-500 text-sm">{amountError}</span>
            )}
        </div>

        {/* Month Picker */}
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
            Month
            </label>
            <input
            type="month"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            />
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
            Description
            </label>
            <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${shakeError ? 'shake-error' : ''}`}
            rows="3"
            />
            <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </span>
            {error && <span className="text-red-500">{error}</span>}
            </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
            <button
            type="submit"
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
            Add Budget
            </button>
            <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors"
            >
            Cancel
            </button>
        </div>
        </form>
    </div>
    </div>
);
};

export default MonthlyBudgetForm;
