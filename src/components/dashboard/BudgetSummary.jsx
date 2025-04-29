import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const StatCard = ({ title, amount, icon: Icon, color }) => (
  <div className="bg-gray-900 rounded-xl p-6 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-white text-2xl font-semibold">₱{amount}</p>
    </div>
  </div>
);

const BudgetSummary = ({ totalIncome, totalExpense, remainingBudget }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Income"
        amount={totalIncome}
        icon={TrendingUp}
        color="bg-green-600"
      />
      <StatCard
        title="Total Expense"
        amount={totalExpense}
        icon={TrendingDown}
        color="bg-red-600"
      />
      <StatCard
        title="Remaining Budget"
        amount={remainingBudget}
        icon={Wallet}
        color="bg-blue-600"
      />
    </div>
  );
};

export default BudgetSummary; 