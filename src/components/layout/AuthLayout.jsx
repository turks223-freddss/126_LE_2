import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, DollarSign, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-6 py-12 transition-colors ${isDark ? 'bg-[#111111]' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute animate-ping w-20 h-20 rounded-full bg-blue-500/20"></div>
              <div className="absolute animate-pulse w-20 h-20 rounded-full bg-blue-500/10"></div>
              <DollarSign className="h-12 w-12 text-blue-500 relative z-10 animate-bounce" />
            </div>
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={`relative rounded-xl p-8 shadow-xl border ${isDark ? 'bg-[#1A1A1A] border-gray-800' : 'bg-white border-gray-200'}`}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {children}
        </div>

        <div className="text-center mt-8 space-y-3">
          <div className={`flex items-center justify-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            <Wallet className="h-5 w-5" />
            <span className="text-base">Budget Tracker</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} Budget Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 