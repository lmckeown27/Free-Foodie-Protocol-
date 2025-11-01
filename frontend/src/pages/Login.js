import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  
  const handleRoleSelect = async (role) => {
    setError('');
    setLoading(true);
    
    try {
      // Map of role to test email
      const roleEmails = {
        student: 'student@test.com',
        supplier: 'supplier@test.com',
        pantry_worker: 'pantry@test.com',
        admin: 'admin@test.com'
      };
      
      const email = roleEmails[role];
      const response = await authAPI.login({ email });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on role
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'pantry_worker':
          navigate('/pantry-worker');
          break;
        case 'supplier':
          navigate('/supplier');
          break;
        case 'admin':
          navigate('/analytics');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl relative">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Back to Home
        </button>

        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Free Foodie Quest
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Decentralized Food Pantry System
          </p>
          <p className="mt-4 text-center text-lg font-medium text-gray-700">
            Select a Role to Test
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student */}
            <button
              onClick={() => handleRoleSelect('student')}
              disabled={loading}
              className="group relative p-6 border-2 border-primary-300 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
                <p className="text-sm text-gray-600">
                  Vote on items, earn Governance NFTs, view allocations
                </p>
              </div>
            </button>
            
            {/* Supplier */}
            <button
              onClick={() => handleRoleSelect('supplier')}
              disabled={loading}
              className="group relative p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Supplier</h3>
                <p className="text-sm text-gray-600">
                  Add donations, track impact, earn Supplier NFTs
                </p>
              </div>
            </button>
            
            {/* Pantry Worker */}
            <button
              onClick={() => handleRoleSelect('pantry_worker')}
              disabled={loading}
              className="group relative p-6 border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pantry Worker</h3>
                <p className="text-sm text-gray-600">
                  Manage allocations, view analytics, confirm redemptions
                </p>
              </div>
            </button>
            
            {/* Admin */}
            <button
              onClick={() => handleRoleSelect('admin')}
              disabled={loading}
              className="group relative p-6 border-2 border-red-300 rounded-lg hover:border-red-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Admin</h3>
                <p className="text-sm text-gray-600">
                  Full access to analytics and management features
                </p>
              </div>
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          )}
        </div>
        
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Testing Mode - Click any role to access that dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

