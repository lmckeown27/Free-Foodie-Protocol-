import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletProvider';
import { DirectWalletProvider } from './contexts/DirectWalletContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetailPage from './pages/UserDetailPage';
import NFTDetailPage from './pages/NFTDetailPage';
import CredentialManagementPage from './pages/CredentialManagementPage';
import AddDonation from './pages/AddDonation';
import Inventory from './pages/Inventory';
import DonationHistory from './pages/DonationHistory';
import Voting from './pages/Voting';
import VotingInterface from './pages/VotingInterface';
import Allocations from './pages/Allocations';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import VolunteerHub from './pages/VolunteerHub';
import MyCredentials from './pages/MyCredentials';
import GovernanceProposals from './pages/GovernanceProposals';
import CreateProposal from './pages/CreateProposal';
import HowItWorks from './pages/HowItWorks';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentInventory from './pages/StudentInventory';
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
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <Navigate to="/dashboard" />;
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
              
              {/* Unified Dashboard for all user roles */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy routes - redirect to dashboard */}
              <Route path="/student" element={<Navigate to="/dashboard" replace />} />
              <Route path="/pantry" element={<Navigate to="/dashboard" replace />} />
              <Route path="/supplier" element={<Navigate to="/dashboard" replace />} />
              
              <Route 
                path="/create-proposal" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <CreateProposal />
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
                path="/credential-management" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <CredentialManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/credential-management/:type" 
                element={
                  <ProtectedRoute allowedRoles={['pantry']}>
                    <CredentialManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add-donation" 
                element={
                  <ProtectedRoute allowedRoles={['supplier']}>
                    <AddDonation />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute allowedRoles={['pantry', 'bni']}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/my-food" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentInventory />
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
                path="/credentials" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'supplier']}>
                    <MyCredentials />
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
              
              <Route 
                path="/how-it-works" 
                element={
                  <ProtectedRoute>
                    <HowItWorks />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/student-analytics" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAnalytics />
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

