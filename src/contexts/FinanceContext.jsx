import { createContext, useContext, useState } from 'react';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const triggerUpdate = () => {
    setLastUpdate(Date.now());
  };

  return (
    <FinanceContext.Provider value={{ lastUpdate, triggerUpdate }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

export const exportToCSV = (data, filters) => {
  if (data.length === 0) return;

  const headers = ['Type', 'Category', 'Title', 'Amount', 'Description', 'Date'];
  const csvData = data.map(item => [
    item.type,
    item.category || (item.type === 'income' ? 'Income' : 'Expense'),
    item.title,
    item.amount,
    item.description,
    new Date(item.date).toLocaleDateString()
  ]);
  csvData.unshift(headers);

  const csvString = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  let filename = `transactions_${today}`;
  if (filters.selectedMonth !== 'all') filename += `_${filters.selectedMonth}`;
  if (filters.selectedCategory !== 'all') filename += `_${filters.selectedCategory}`;
  if (filters.dateRange.start && filters.dateRange.end)
    filename += `_${filters.dateRange.start}_to_${filters.dateRange.end}`;
  filename += '.csv';

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};