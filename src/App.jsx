import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset/:uid/:token" element={<PasswordReset />} />
      {/* Add more routes here, e.g. dashboard, home, etc. */}
    </Routes>
  );
}

export default App;
