import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, allocationAPI, inventoryAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const PantryWorkerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, allocationsRes, healthRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        allocationAPI.getAllocations({ status: 'pending', limit: 10 }),
        analyticsAPI.getInventoryHealth()
      ]);
      
      setDashboard(dashboardRes.data.data);
      setPendingAllocations(allocationsRes.data.data);
      setInventoryHealth(healthRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-primary-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">FFQ Pantry Dashboard</h1>
            <p className="text-sm text-gray-600">Pantry Worker Panel - {user.first_name}</p>
          </div>
          <div className="flex gap-3 items-center">
            <WalletConnect />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Available Items</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {inventoryHealth?.available_items || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {inventoryHealth?.expiring_soon || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Expired Items</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {inventoryHealth?.expired_items || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {dashboard?.users?.find(u => u.role === 'student')?.count || 0}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/allocations"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-6 hover:from-primary-600 hover:to-primary-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">Manage Allocations</h2>
            <p className="text-primary-100">Process and confirm allocations</p>
          </Link>
          
          <Link
            to="/inventory"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:from-blue-600 hover:to-blue-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">View Inventory</h2>
            <p className="text-blue-100">Check available items</p>
          </Link>
          
          <Link
            to="/analytics"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">Analytics</h2>
            <p className="text-purple-100">View detailed reports</p>
          </Link>
        </div>
        
        {/* Pending Allocations */}
        <div className="bg-primary-100 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-primary-200">
            <h2 className="text-xl font-semibold text-gray-800">Pending Allocations</h2>
          </div>
          <div className="p-6">
            {pendingAllocations.length === 0 ? (
              <p className="text-gray-500">No pending allocations at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POAS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary-100 divide-y divide-gray-200">
                    {pendingAllocations.map((allocation) => (
                      <tr key={allocation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.student_first_name} {allocation.student_last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(allocation.allocation_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
        userRole="pantry_worker" 
      />
    </div>
  );
};

export default PantryWorkerDashboard;

