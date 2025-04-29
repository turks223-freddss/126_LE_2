import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import './App.css'
import Dashboard from './components/dashboard/dashboard';
import FinanceDetails from './components/dashboard/financeDetails';
import THistory from './components/dashboard/history';
import Reports from './components/dashboard/reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset/:uid/:token" element={<PasswordReset />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/finance-details" element={<FinanceDetails />} />
      <Route path="/history" element={<THistory />} />
      <Route path="/reports" element={<Reports />} />
      {/* Add more routes here, e.g. dashboard, home, etc. */}
    </Routes>
  );
}

export default App;
