import React from 'react';
import { Calendar, Tag } from 'lucide-react';

const FinanceItem = ({ 
  type, 
  amount, 
  category, 
  date, 
  className = '',
  onEdit,
  onDelete
}) => {
  const isIncome = type === 'income';
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{category}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-lg font-semibold ${amountColor}`}>
          {amountPrefix}₱{amount}
        </span>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-1 text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceItem; 