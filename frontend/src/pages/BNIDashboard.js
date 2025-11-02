import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, supplierAPI, userAPI, nftAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const BNIDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pendingSuppliers, setPendingSuppliers] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, analyticsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getCompliance()
      ]);
      
      setDashboard(dashboardRes.data.data);
      
      // Mock pending suppliers - in production, this would come from backend
      setPendingSuppliers([
        { 
          id: 1, 
          name: 'Campus Market', 
          email: 'contact@campusmarket.com',
          business_type: 'Grocery Store',
          submitted: new Date(),
          status: 'pending'
        }
      ]);
      
      // Mock system metrics
      setSystemMetrics({
        totalStudents: dashboardRes.data.data?.users?.find(u => u.role === 'student')?.count || 0,
        totalSuppliers: dashboardRes.data.data?.users?.find(u => u.role === 'supplier')?.count || 0,
        totalPantries: dashboardRes.data.data?.users?.find(u => u.role === 'pantry_worker')?.count || 0,
        totalDonations: 0,
        totalAllocations: 0,
        custodialWallets: 0
      });
      
      // Mock audit logs
      setAuditLogs([
        {
          id: 1,
          type: 'Supplier Approved',
          actor: 'Basic Needs Initiative Staff',
          target: 'Campus Market',
          timestamp: new Date(),
          blockchain_tx: '0xabc123...'
        },
        {
          id: 2,
          type: 'NFT Minted',
          actor: 'System',
          target: 'Student Wallet',
          timestamp: new Date(Date.now() - 3600000),
          blockchain_tx: '0xdef456...'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveSupplier = async (supplierId) => {
    try {
      // In production, this would:
      // 1. Update supplier status in database
      // 2. Mint Supplier NFT on Aptos
      // 3. Send to supplier's wallet
      alert(`✅ Supplier approved!\n\n🎫 Supplier NFT minted on Aptos\n📧 Verification email sent\n\nThe supplier can now connect their Petra Wallet and begin donating.`);
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
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-orange-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Basic Needs Initiative Governance Dashboard</h1>
            <p className="text-sm text-gray-600">System Oversight & Infrastructure</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono bg-orange-200 text-orange-800 px-2 py-1 rounded">
                Multi-Sig Petra Vault
              </span>
              <span className="text-xs text-gray-500">Governance Authority</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <WalletConnect />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-orange-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {systemMetrics?.totalStudents || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Custodial wallets managed</p>
          </div>
          
          <div className="bg-orange-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Verified Suppliers</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {systemMetrics?.totalSuppliers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supplier NFTs issued</p>
          </div>
          
          <div className="bg-orange-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Pantries</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {systemMetrics?.totalPantries || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Multi-sig vaults configured</p>
          </div>
          
          <div className="bg-orange-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {dashboard?.total_transactions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">On-chain verifications</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/analytics"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:from-orange-600 hover:to-orange-700 transition"
          >
            <h2 className="text-xl font-bold mb-2">System Analytics</h2>
            <p className="text-orange-100">View comprehensive metrics</p>
          </Link>
          
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:from-orange-500 hover:to-orange-600 transition">
            <h2 className="text-xl font-bold mb-2">NFT Management</h2>
            <p className="text-orange-100">Mint and manage NFTs</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg shadow-lg p-6 cursor-pointer hover:from-orange-700 hover:to-orange-800 transition">
            <h2 className="text-xl font-bold mb-2">Wallet Management</h2>
            <p className="text-orange-100">Custodial wallet oversight</p>
          </div>
        </div>
        
        {/* Pending Supplier Approvals & Audit Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pending Supplier Approvals */}
          <div className="bg-orange-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-orange-200">
              <h2 className="text-xl font-semibold text-gray-800">Pending Supplier Approvals</h2>
              <p className="text-sm text-gray-600">Review and verify new suppliers</p>
            </div>
            <div className="p-6">
              {pendingSuppliers.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingSuppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 bg-white rounded-lg border-2 border-orange-200">
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
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                        >
                          ✓ Approve & Mint NFT
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
          
          {/* Audit Logs */}
          <div className="bg-orange-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-orange-200">
              <h2 className="text-xl font-semibold text-gray-800">System Audit Logs</h2>
              <p className="text-sm text-gray-600">On-chain transaction history</p>
            </div>
            <div className="p-6">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-white rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs font-medium">
                            {log.type}
                          </span>
                          <p className="text-sm font-bold text-gray-800 mt-2">{log.target}</p>
                          <p className="text-xs text-gray-600">By: {log.actor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono bg-orange-50 px-2 py-1 rounded border border-orange-200 truncate">
                          {log.blockchain_tx}
                        </span>
                        <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                          View on Aptos
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/analytics" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View Full Audit Trail →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-orange-900 mb-2">Basic Needs Initiative Governance Role</h3>
              <p className="text-sm text-orange-800 mb-2">
                As the <strong>Basic Needs Initiative</strong>, you provide oversight and infrastructure for the Free Foodie Quest platform:
              </p>
              <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Verify and approve new suppliers (mint Supplier NFTs)</li>
                <li>Manage custodial wallets for students</li>
                <li>Configure pantry multi-sig vaults</li>
                <li>Monitor system-wide analytics and compliance</li>
                <li>Maintain audit trails on Aptos blockchain</li>
              </ul>
              <p className="text-sm text-orange-800 mt-2">
                You provide <strong>governance without centralized control</strong> - empowering each role while ensuring transparency and accountability.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
        userRole="bni" 
      />
    </div>
  );
};

export default BNIDashboard;

