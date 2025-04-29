import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 