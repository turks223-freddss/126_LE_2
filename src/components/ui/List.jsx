import React from 'react';
import { List as ListIcon } from 'lucide-react';

const List = ({ 
  items = [], 
  renderItem, 
  emptyMessage = "No items available",
  className = ''
}) => {
  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 text-gray-500 ${className}`}>
        <ListIcon className="w-8 h-8 mb-2" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <li key={index}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};

export default List; 