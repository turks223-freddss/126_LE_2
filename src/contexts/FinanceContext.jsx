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