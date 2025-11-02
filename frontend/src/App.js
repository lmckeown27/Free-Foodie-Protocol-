import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletProvider';
import { DirectWalletProvider } from './contexts/DirectWalletContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import PantryWorkerDashboard from './pages/PantryWorkerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import Inventory from './pages/Inventory';
import Voting from './pages/Voting';
import Allocations from './pages/Allocations';
import Analytics from './pages/Analytics';
import './styles/App.css';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  switch (user.role) {
    case 'student':
      return <Navigate to="/student" />;
    case 'pantry_worker':
      return <Navigate to="/pantry-worker" />;
    case 'supplier':
      return <Navigate to="/supplier" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <WalletProvider>
      <DirectWalletProvider>
        <Router>
          <div className="App min-h-screen bg-primary-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard redirect for authenticated users */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/pantry-worker" 
                element={
                  <ProtectedRoute allowedRoles={['pantry_worker']}>
                    <PantryWorkerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/supplier" 
                element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <SupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/voting" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Voting />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/allocations" 
                element={
                  <ProtectedRoute>
                    <Allocations />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['pantry_worker']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </DirectWalletProvider>
    </WalletProvider>
  );
}

export default App;

