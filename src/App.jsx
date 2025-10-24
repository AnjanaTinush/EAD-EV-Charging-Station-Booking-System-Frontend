import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { ErrorProvider } from './contexts/ErrorContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <NotificationProvider>
      <ConfirmationProvider>
        <ErrorProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </ErrorProvider>
      </ConfirmationProvider>
    </NotificationProvider>
  )
}
