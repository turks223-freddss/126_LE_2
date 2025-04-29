import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import './App.css'
import Dashboard from './components/dashboard/dashboard';
import FinanceDetails from './components/dashboard/financeDetails';
import Reports from './components/dashboard/reports';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset/:uid/:token" element={<PasswordReset />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/finance-details" element={<PrivateRoute><FinanceDetails /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      {/* Add more routes here, e.g. dashboard, home, etc. */}
    </Routes>
  );
}

export default App;
