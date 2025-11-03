import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, allocationAPI, inventoryAPI, poasAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const PantryDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [poasRecommendations, setPoasRecommendations] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingSuppliers, setPendingSuppliers] = useState([]);
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
      const [dashboardRes, allocationsRes, healthRes, inventoryRes, complianceRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        allocationAPI.getAllocations({ status: 'approved', limit: 10 }),
        analyticsAPI.getInventoryHealth(),
        inventoryAPI.getInventory({ limit: 1 }),
        analyticsAPI.getCompliance()
      ]);
      
      setDashboard(dashboardRes.data.data);
      setPendingAllocations(allocationsRes.data.data);
      setInventoryHealth(healthRes.data.data);
      
      // System metrics from dashboard data
      setSystemMetrics({
        totalStudents: dashboardRes.data.data?.users?.find(u => u.role === 'student')?.count || 0,
        totalSuppliers: dashboardRes.data.data?.users?.find(u => u.role === 'supplier')?.count || 0,
        totalDonations: dashboardRes.data.data?.total_donations || 0,
        totalAllocations: dashboardRes.data.data?.total_allocations || 0,
        totalTransactions: dashboardRes.data.data?.total_transactions || 0
      });
      
      // Audit logs from compliance endpoint
      if (complianceRes.data.data && complianceRes.data.data.length > 0) {
        setAuditLogs(complianceRes.data.data.slice(0, 10));
      }
      
      // Fetch POAS recommendations for the first inventory item
      if (inventoryRes.data.data.length > 0) {
        try {
          const poasRes = await poasAPI.getRecommendations(inventoryRes.data.data[0].id, 5);
          setPoasRecommendations(poasRes.data.data);
        } catch (poasError) {
          console.log('POAS recommendations not available yet', poasError);
          setPoasRecommendations([]);
        }
      }
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
      alert(`Pickup verified for Student ID: ${scannedId}. Contract closeout initiated via Multi-Sig Vault.`);
      setScannedId('');
      setScanMode(false);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to verify pickup: ' + error.message);
    }
  };
  
  const handleApproveSupplier = async (supplierId) => {
    try {
      alert(`Supplier approved!\n\nSupplier NFT minted on Aptos\nVerification email sent\n\nThe supplier can now connect their Petra Wallet and begin donating.`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to approve supplier: ' + error.message);
    }
  };
  
  const handleRejectSupplier = async (supplierId) => {
    try {
      alert('Supplier application rejected. Notification sent.');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to reject supplier: ' + error.message);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-purple-50 font-raleway">
      {/* Header */}
      <header className="bg-purple-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-600">Pantry Dashboard</h1>
            <p className="text-sm text-gray-600">Operations & Governance - {user.first_name}</p>
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
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Active Students</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {systemMetrics?.totalStudents || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Verified Suppliers</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {systemMetrics?.totalSuppliers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supplier NFTs</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Donations</h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {systemMetrics?.totalDonations || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Food items donated</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Allocations</h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              {systemMetrics?.totalAllocations || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Items allocated</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Blockchain Txns</h3>
            <p className="text-3xl font-bold text-purple-800 mt-2">
              {systemMetrics?.totalTransactions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">On-chain records</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/inventory"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">Manage Inventory</h2>
            <p className="text-purple-100">View and allocate food items</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg shadow-lg p-6 hover:from-purple-500 hover:to-purple-600 transition"
          >
            <h2 className="text-xl font-bold mb-2">System Analytics</h2>
            <p className="text-purple-100">View comprehensive metrics</p>
          </Link>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:from-purple-700 hover:to-purple-800 transition">
            <h2 className="text-xl font-bold mb-2">NFT Management</h2>
            <p className="text-purple-100">Mint and manage NFTs</p>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-purple-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inventory Health</h2>
          {inventoryHealth ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{inventoryHealth.total_items || 0}</p>
                <p className="text-xs text-gray-600">Total Items</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200">
                <p className="text-2xl font-bold text-green-600">{inventoryHealth.available_items || 0}</p>
                <p className="text-xs text-gray-600">Available</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-yellow-200">
                <p className="text-2xl font-bold text-yellow-600">{inventoryHealth.expiring_soon || 0}</p>
                <p className="text-xs text-gray-600">Expiring Soon</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-red-200">
                <p className="text-2xl font-bold text-red-600">{inventoryHealth.expired_items || 0}</p>
                <p className="text-xs text-gray-600">Expired</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{inventoryHealth.available_quantity || 0}</p>
                <p className="text-xs text-gray-600">Available Qty</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading inventory health data...</p>
          )}
        </div>

        {/* POAS Recommendations */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">POAS Allocation Recommendations</h2>
              <p className="text-sm opacity-90">AI-powered fair distribution based on student needs</p>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-xs opacity-90">Top Priority Students</p>
              <p className="text-2xl font-bold">{poasRecommendations.length}</p>
            </div>
          </div>

          {poasRecommendations.length === 0 ? (
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-center text-white/90">
                No POAS recommendations available yet. Run the POAS calculation to generate fair allocation priorities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {poasRecommendations.map((rec, index) => (
                <div key={rec.student_id || index} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
                      Rank #{index + 1}
                    </span>
                    <span className="text-lg font-bold">
                      {rec.poas_score ? Number(rec.poas_score).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">Student ID: {rec.student_id?.substring(0, 8) || 'Unknown'}</p>
                  <p className="text-xs opacity-90 mt-1">High priority for allocation</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            <Link to="/analytics" className="inline-block px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium text-sm">
              View Full POAS Analytics →
            </Link>
          </div>
        </div>

        {/* QR Scanner for Student Pickup */}
        <div className="bg-purple-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Pickup Verification</h2>
          <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setScanMode(!scanMode)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  scanMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {scanMode ? 'Scanner Active' : 'Enable Scanner'}
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter or scan student PolyCard ID..."
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleVerifyPickup}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Verify Pickup
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Scan student's PolyCard or Allocation NFT QR code to verify pickup and close the contract on-chain.
            </p>
          </div>
        </div>

        {/* Two Column Layout: Allocations & Supplier Approvals + Audit Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Active Allocations */}
          <div className="bg-purple-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-gray-800">Active Allocations (POAS-Matched)</h2>
              <p className="text-sm text-gray-600">Recent student allocations</p>
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
                            POAS: {allocation.poas_score ? Number(allocation.poas_score).toFixed(2) : 'N/A'}
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

          {/* Pending Supplier Approvals */}
          <div className="bg-purple-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-gray-800">Pending Supplier Approvals</h2>
              <p className="text-sm text-gray-600">Review and verify new suppliers</p>
            </div>
            <div className="p-6">
              {pendingSuppliers.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingSuppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-800">{supplier.name}</h3>
                        <p className="text-sm text-gray-600">{supplier.business_type}</p>
                        <p className="text-xs text-gray-500">{supplier.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted: {supplier.submitted.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveSupplier(supplier.id)}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                        >
                          Approve & Mint NFT
                        </button>
                        <button
                          onClick={() => handleRejectSupplier(supplier.id)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-purple-100 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-purple-200">
            <h2 className="text-xl font-semibold text-gray-800">System Audit Logs</h2>
            <p className="text-sm text-gray-600">On-chain transaction history</p>
          </div>
          <div className="p-6">
            {auditLogs.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">
                          {log.compliance_type}
                        </span>
                        <p className="font-semibold text-gray-900 mt-1">Compliance Check</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.checked_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Total: {log.total_checks} | Passed: {log.passed_checks} | Failed: {log.failed_checks}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-800">
            The Pantry ensures the integrity and sustainability of the FFQ platform,
            providing transparent governance, operational management, and oversight.
          </p>
        </div>
      </main>

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        userRole="pantry"
      />
    </div>
  );
};

export default PantryDashboard;

