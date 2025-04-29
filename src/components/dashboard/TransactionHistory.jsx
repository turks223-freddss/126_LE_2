import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-800">
              <th className="pb-3 text-gray-400 font-medium">Type</th>
              <th className="pb-3 text-gray-400 font-medium">Category</th>
              <th className="pb-3 text-gray-400 font-medium text-right">Amount</th>
              <th className="pb-3 text-gray-400 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr key={index} className="text-gray-300">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      <span>{transaction.type === 'income' ? 'Income' : 'Expense'}</span>
                    </div>
                  </td>
                  <td className="py-4">{transaction.category || (transaction.type === 'income' ? 'Income' : 'Expense')}</td>
                  <td className={`py-4 text-right ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ${Math.abs(transaction.amount)}
                  </td>
                  <td className="py-4 text-right">{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory; 