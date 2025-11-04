import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletProvider';
import { DirectWalletProvider } from './contexts/DirectWalletContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import PantryDashboard from './pages/PantryDashboard';
import UserDetailPage from './pages/UserDetailPage';
import NFTDetailPage from './pages/NFTDetailPage';
import NFTManagementPage from './pages/NFTManagementPage';
import SupplierDashboard from './pages/SupplierDashboard';
import Inventory from './pages/Inventory';
import DonationHistory from './pages/DonationHistory';
import Voting from './pages/Voting';
import VotingInterface from './pages/VotingInterface';
import Allocations from './pages/Allocations';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import VolunteerHub from './pages/VolunteerHub';
import MyNFTs from './pages/MyNFTs';
import GovernanceProposals from './pages/GovernanceProposals';
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
    case 'pantry':
      return <Navigate to="/pantry" />;
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
                path="/pantry" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <PantryDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/user/:userId" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <UserDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/nft/:nftId" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <NFTDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/nft-management" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <NFTManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/nft-management/:type" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <NFTManagementPage />
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
                path="/donation-history" 
                element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <DonationHistory />
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
                path="/vote" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <VotingInterface />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/volunteer" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <VolunteerHub />
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
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/nfts" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'supplier']}>
                    <MyNFTs />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/governance" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <GovernanceProposals />
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

