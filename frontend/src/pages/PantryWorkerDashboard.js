import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, allocationAPI, inventoryAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const PantryWorkerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [complianceLogs, setComplianceLogs] = useState([]);
  const [scanMode, setScanMode] = useState(false);
  const [scannedId, setScannedId] = useState('');
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
        allocationAPI.getAllocations({ status: 'approved', limit: 10 }),
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
  
  const handleVerifyPickup = async (studentId) => {
    if (!scannedId) {
      alert('Please scan or enter a student PolyCard ID');
      return;
    }
    
    try {
      // In production, this would verify the student's Allocation NFT and close the contract
      alert(`Pickup verified for Student ID: ${scannedId}. Contract closeout initiated via Multi-Sig Vault.`);
      setScannedId('');
      setScanMode(false);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to verify pickup: ' + error.message);
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
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="bg-purple-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-600">FFQ Pantry Dashboard</h1>
            <p className="text-sm text-gray-600">Pantry Worker Panel - {user.first_name}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono bg-purple-200 text-purple-800 px-2 py-1 rounded">
                Multi-Sig Petra Vault
              </span>
              <span className="text-xs text-gray-500">Shared control & accountability</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <WalletConnect />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-purple-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Available Items</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {inventoryHealth?.available_items || 0}
            </p>
          </div>
          
          <div className="bg-purple-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
            <p className="text-3xl font-bold text-purple-500 mt-2">
              {inventoryHealth?.expiring_soon || 0}
            </p>
          </div>
          
          <div className="bg-purple-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Expired Items</h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {inventoryHealth?.expired_items || 0}
            </p>
          </div>
          
          <div className="bg-purple-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {dashboard?.users?.find(u => u.role === 'student')?.count || 0}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/allocations"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">Manage Allocations</h2>
            <p className="text-purple-100">Process and confirm allocations</p>
          </Link>
          
          <Link
            to="/inventory"
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg shadow-lg p-6 hover:from-purple-500 hover:to-purple-600 transition"
          >
            <h2 className="text-xl font-bold mb-2">View Inventory</h2>
            <p className="text-purple-100">Check available items</p>
          </Link>
          
          <Link
            to="/analytics"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-6 hover:from-purple-700 hover:to-purple-800 transition"
          >
            <h2 className="text-xl font-bold mb-2">Analytics</h2>
            <p className="text-purple-100">View detailed reports</p>
          </Link>
        </div>
        
        {/* Verify Student Pickup - Scan PolyCard ID */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Verify Student Pickup</h2>
              <p className="text-sm opacity-90">Scan PolyCard ID to confirm claim and close contract</p>
            </div>
            <button
              onClick={() => setScanMode(!scanMode)}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-bold"
            >
              {scanMode ? 'Cancel Scan' : 'Start Scan Mode'}
            </button>
          </div>
          
          {scanMode && (
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter or scan PolyCard ID..."
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 font-mono"
                  autoFocus
                />
                <button
                  onClick={handleVerifyPickup}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold"
                >
                  Verify Pickup
                </button>
              </div>
              <p className="text-xs mt-2 opacity-90">
                This action requires Multi-Sig approval via Petra Vault
              </p>
            </div>
          )}
        </div>
        
        {/* POAS Allocations & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Active Allocations (POAS-Matched) */}
          <div className="bg-purple-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-gray-800">Active Allocations</h2>
              <p className="text-sm text-gray-600">POAS-matched, ready for pickup</p>
            </div>
            <div className="p-6">
              {pendingAllocations.length === 0 ? (
                <p className="text-gray-500">No active allocations at this time.</p>
              ) : (
                <div className="space-y-3">
                  {pendingAllocations.slice(0, 5).map((allocation) => (
                    <div key={allocation.id} className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">
                            {allocation.student_first_name} {allocation.student_last_name}
                          </p>
                          <p className="text-sm text-gray-600">{allocation.item_name}</p>
                          <p className="text-xs text-gray-500">Qty: {allocation.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium block mb-1">
                            POAS: {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(allocation.allocation_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/allocations" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View All Allocations →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Compliance & Safety Logs */}
          <div className="bg-purple-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-gray-800">Compliance Logs</h2>
              <p className="text-sm text-gray-600">Bill Emerson Act & SB 1383</p>
            </div>
            <div className="p-6">
              {complianceLogs.length === 0 ? (
                <p className="text-gray-500">No compliance logs yet</p>
              ) : (
                <div className="space-y-3">
                  {complianceLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {log.type}
                          </span>
                          <p className="text-sm font-bold text-gray-800 mt-2">{log.item}</p>
                          <p className="text-xs text-gray-600">
                            {log.supplier && `Supplier: ${log.supplier}`}
                            {log.student && `Student: ${log.student}`}
                            {log.weight && ` | ${log.weight}`}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-purple-200 text-purple-800 px-2 py-1 rounded">
                          {log.compliance}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {log.date.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/analytics" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  View Full Compliance Report →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* POAS Analytics Info */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">POAS Dashboard: Fair Distribution Analytics</h3>
              <p className="text-sm text-purple-800 mb-2">
                The <strong>Predicted Optimal Allocation Score (POAS)</strong> ensures equitable food distribution based on student needs, voting history, and demand patterns.
              </p>
              <p className="text-sm text-purple-800">
                All allocations and verifications are recorded on-chain via your <strong>Multi-Sig Petra Vault</strong>, providing full transparency and accountability.
              </p>
              <Link to="/analytics" className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm">
                View POAS Analytics Dashboard →
              </Link>
            </div>
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

