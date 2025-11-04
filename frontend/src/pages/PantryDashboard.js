import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI, allocationAPI, inventoryAPI, poasAPI, volunteerAPI, walletAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const PantryDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [poasRecommendations, setPoasRecommendations] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingSupplier, setPendingSupplier] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [custodialNFTs, setCustodialNFTs] = useState([]);
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
      const [dashboardRes, allocationsRes, healthRes, inventoryRes, complianceRes, nftsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        allocationAPI.getAllocations({ status: 'approved', limit: 10 }),
        analyticsAPI.getInventoryHealth(),
        inventoryAPI.getInventory({ limit: 1 }),
        analyticsAPI.getCompliance(),
        walletAPI.getCustodialNFTs()
      ]);
      
      setDashboard(dashboardRes.data.data);
      setPendingAllocations(allocationsRes.data.data);
      setInventoryHealth(healthRes.data.data);
      setCustodialNFTs(nftsRes.data?.data || []);
      
      // System metrics from dashboard data
      setSystemMetrics({
        totalStudents: dashboardRes.data.data?.users?.find(u => u.role === 'student')?.count || 0,
        totalSupplier: dashboardRes.data.data?.users?.find(u => u.role === 'supplier')?.count || 0,
        totalDonations: dashboardRes.data.data?.total_donations || 0,
        totalAllocations: dashboardRes.data.data?.total_allocations || 0,
        totalTransactions: dashboardRes.data.data?.total_transactions || 0
      });
      
      // Mock data for system audit logs
      setAuditLogs([
        {
          event_type: 'pickup_verified',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          user: 'Emily Chen',
          details: 'Student pickup verified - 2 lbs Organic Apples',
          status: 'completed'
        },
        {
          event_type: 'allocation_issued',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          user: 'Sarah Martinez',
          details: 'Pickup ticket issued - Whole Wheat Bread',
          status: 'completed'
        },
        {
          event_type: 'donation_received',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          user: 'Campus Dining',
          details: 'Donation received - 50 lbs Fresh Vegetables',
          status: 'completed'
        },
        {
          event_type: 'volunteer_badge_issued',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          user: 'Marcus Johnson',
          details: 'Service badge issued - Silver Tier (20 hours)',
          status: 'completed'
        },
        {
          event_type: 'governance_vote',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          user: 'Student Body',
          details: 'Governance vote cast - Proposal #12 (Add More Vegan Options)',
          status: 'completed'
        },
        {
          event_type: 'supplier_verified',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          user: 'Local Bakery Co.',
          details: 'Partner certificate issued - New supplier onboarded',
          status: 'completed'
        },
        {
          event_type: 'allocation_redeemed',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          user: 'Alex Thompson',
          details: 'Pickup ticket redeemed - Fresh Produce Box',
          status: 'completed'
        },
        {
          event_type: 'donation_receipt_issued',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
          user: 'Campus Market',
          details: 'Donation receipt issued - 75 lbs Mixed Items',
          status: 'completed'
        }
      ]);
      
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
      
      // Mock data for pending supplier approvals
      setPendingSupplier([
        {
          id: 'pending-1',
          name: 'Campus Market Co.',
          business_type: 'Grocery Store',
          email: 'partnerships@campusmarket.com',
          submitted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: 'pending-2',
          name: 'Green Valley Produce',
          business_type: 'Produce Distributor',
          email: 'info@greenvalley.com',
          submitted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          id: 'pending-3',
          name: 'Downtown Bakery',
          business_type: 'Bakery',
          email: 'manager@downtownbakery.com',
          submitted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]);
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
      // Remove the approved supplier from the pending list
      setPendingSupplier(prev => prev.filter(s => s.id !== supplierId));
      alert(`Supplier approved!\n\nPartner Certificate issued via Pantry's secure account\nVerification email sent\n\nThe supplier can now log in and begin donating food (all verification handled by Pantry).`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to approve supplier: ' + error.message);
    }
  };
  
  const handleRejectSupplier = async (supplierId) => {
    try {
      // Remove the rejected supplier from the pending list
      setPendingSupplier(prev => prev.filter(s => s.id !== supplierId));
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
    <div className="min-h-screen bg-amber-50 font-raleway">
      {/* Header */}
      <header className="bg-amber-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-600">Pantry Dashboard</h1>
            <p className="text-sm text-gray-600">Operations & Governance - {user.first_name}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono bg-amber-200 text-amber-800 px-2 py-1 rounded">
                Multi-Sig Petra Vault
              </span>
              <span className="text-xs text-gray-500">Shared control & accountability</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <WalletConnect />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Active Students</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {systemMetrics?.totalStudents || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Registered users</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Verified Supplier</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {systemMetrics?.totalSupplier || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supplier NFTs</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Donations</h3>
            <p className="text-3xl font-bold text-amber-700 mt-2">
              {systemMetrics?.totalDonations || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Food items donated</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Allocations</h3>
            <p className="text-3xl font-bold text-amber-700 mt-2">
              {systemMetrics?.totalAllocations || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Items allocated</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-300 to-amber-400 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Blockchain Txns</h3>
            <p className="text-3xl font-bold text-amber-800 mt-2">
              {systemMetrics?.totalTransactions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">On-chain records</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Link
            to="/create-proposal"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:from-green-600 hover:to-green-700 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h2 className="text-xl font-bold">Create Proposal</h2>
            </div>
            <p className="text-green-100">Let students vote on changes</p>
          </Link>

          <Link
            to="/inventory"
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-lg p-6 hover:from-amber-600 hover:to-amber-700 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="text-xl font-bold">Manage Inventory</h2>
            </div>
            <p className="text-amber-100">View and allocate food items</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow-lg p-6 hover:from-amber-500 hover:to-amber-600 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold">System Analytics</h2>
            </div>
            <p className="text-amber-100">View comprehensive metrics</p>
          </Link>

          <Link
            to="/nft-management"
            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg shadow-lg p-6 hover:from-amber-700 hover:to-amber-800 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h2 className="text-xl font-bold">NFT Management</h2>
            </div>
            <p className="text-amber-100">Mint and manage NFTs</p>
          </Link>
        </div>

        {/* Inventory Health */}
        <div className="bg-amber-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inventory Health</h2>
        {inventoryHealth ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border-2 border-amber-200">
              <p className="text-2xl font-bold text-amber-600">{inventoryHealth.total_items || 0}</p>
              <p className="text-xs text-gray-600">Total Items</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200">
              <p className="text-2xl font-bold text-green-600">{inventoryHealth.available_items || 0}</p>
              <p className="text-xs text-gray-600">Available Now</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{inventoryHealth.coming_soon_items || 0}</p>
              <p className="text-xs text-gray-600">Coming Soon</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-amber-200">
              <p className="text-2xl font-bold text-amber-600">{inventoryHealth.available_quantity || 0}</p>
              <p className="text-xs text-gray-600">Available Qty</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading inventory health data...</p>
        )}
        </div>

        {/* Combined: Custodial NFT Vault & POAS User Management */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-500 to-amber-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Custodial User Management</h2>
                <p className="text-sm text-amber-100 mt-1">
                  NFTs held in custody with POAS allocation recommendations
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur text-white rounded-lg px-4 py-2 text-center">
                  <span className="text-xl font-bold">{custodialNFTs.length}</span>
                  <span className="text-xs block">Total NFTs</span>
                </div>
                <div className="bg-white/20 backdrop-blur text-white rounded-lg px-4 py-2 text-center">
                  <span className="text-xl font-bold">
                    {[...new Set(custodialNFTs.map(n => n.user_id))].length}
                  </span>
                  <span className="text-xs block">Total Users</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {custodialNFTs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>No NFTs in custody yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* NFT Type Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {custodialNFTs.filter(n => n.nft_type === 'governance').length}
                    </p>
                    <p className="text-xs text-gray-600">Governance NFTs</p>
                  </div>
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {custodialNFTs.filter(n => n.nft_type === 'allocation').length}
                    </p>
                    <p className="text-xs text-gray-600">Allocation NFTs</p>
                  </div>
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {custodialNFTs.filter(n => n.nft_type === 'volunteer').length}
                    </p>
                    <p className="text-xs text-gray-600">Volunteer NFTs</p>
                  </div>
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {custodialNFTs.filter(n => n.nft_type === 'supplier').length}
                    </p>
                    <p className="text-xs text-gray-600">Supplier NFTs</p>
                  </div>
                </div>

                {/* NFT Sections - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Governance NFTs Section */}
                  <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 overflow-hidden">
                    <div className="bg-green-100 px-4 py-3 border-b-2 border-green-200">
                      <h3 className="text-base font-bold text-green-700">Governance</h3>
                      <p className="text-xs text-gray-600">Voting Rights</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {[...new Map(custodialNFTs.filter(n => n.nft_type === 'governance').map(nft => [nft.user_id, nft])).values()].slice(0, 3).map((userNFT) => {
                        const userNFTs = custodialNFTs.filter(n => n.user_id === userNFT.user_id && n.nft_type === 'governance');
                        const poasRec = poasRecommendations.find(p => p.student_id === userNFT.user_id);
                        return (
                          <div 
                            key={userNFT.user_id} 
                            className="bg-green-50 rounded-lg p-3 hover:bg-green-100 cursor-pointer transition border border-green-200"
                            onClick={() => navigate(`/user/${userNFT.user_id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{userNFT.first_name} {userNFT.last_name}</p>
                                <p className="text-xs text-gray-500">{userNFT.email}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                {userNFTs.length}
                              </span>
                            </div>
                            {poasRec && (
                              <p className="text-xs text-green-700 font-semibold">POAS: {Number(poasRec.poas_score).toFixed(1)}</p>
                            )}
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => navigate('/nft-management/governance')}
                        className="w-full text-center text-xs text-green-600 hover:text-green-900 font-medium py-2"
                      >
                        View All →
                      </button>
                    </div>
                  </div>

                  {/* Allocation NFTs Section */}
                  <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 overflow-hidden">
                    <div className="bg-green-100 px-4 py-3 border-b-2 border-green-200">
                      <h3 className="text-base font-bold text-green-700">Allocation</h3>
                      <p className="text-xs text-gray-600">Pickup Tickets</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {[...new Map(custodialNFTs.filter(n => n.nft_type === 'allocation').map(nft => [nft.user_id, nft])).values()].slice(0, 3).map((userNFT) => {
                        const userNFTs = custodialNFTs.filter(n => n.user_id === userNFT.user_id && n.nft_type === 'allocation');
                        const poasRec = poasRecommendations.find(p => p.student_id === userNFT.user_id);
                        return (
                          <div 
                            key={userNFT.user_id} 
                            className="bg-green-50 rounded-lg p-3 hover:bg-green-100 cursor-pointer transition border border-green-200"
                            onClick={() => navigate(`/user/${userNFT.user_id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{userNFT.first_name} {userNFT.last_name}</p>
                                <p className="text-xs text-gray-500">{userNFT.email}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                {userNFTs.length}
                              </span>
                            </div>
                            {poasRec && (
                              <p className="text-xs text-green-700 font-semibold">POAS: {Number(poasRec.poas_score).toFixed(1)}</p>
                            )}
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => navigate('/nft-management/allocation')}
                        className="w-full text-center text-xs text-green-600 hover:text-green-900 font-medium py-2"
                      >
                        View All →
                      </button>
                    </div>
                  </div>

                  {/* Volunteer NFTs Section */}
                  <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 overflow-hidden">
                    <div className="bg-green-100 px-4 py-3 border-b-2 border-green-200">
                      <h3 className="text-base font-bold text-green-700">Volunteer</h3>
                      <p className="text-xs text-gray-600">Service Badges</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {[...new Map(custodialNFTs.filter(n => n.nft_type === 'volunteer').map(nft => [nft.user_id, nft])).values()].slice(0, 3).map((userNFT) => {
                        const userNFTs = custodialNFTs.filter(n => n.user_id === userNFT.user_id && n.nft_type === 'volunteer');
                        const poasRec = poasRecommendations.find(p => p.student_id === userNFT.user_id);
                        return (
                          <div 
                            key={userNFT.user_id} 
                            className="bg-green-50 rounded-lg p-3 hover:bg-green-100 cursor-pointer transition border border-green-200"
                            onClick={() => navigate(`/user/${userNFT.user_id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{userNFT.first_name} {userNFT.last_name}</p>
                                <p className="text-xs text-gray-500">{userNFT.email}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                                {userNFTs.length}
                              </span>
                            </div>
                            {poasRec && (
                              <p className="text-xs text-green-700 font-semibold">POAS: {Number(poasRec.poas_score).toFixed(1)}</p>
                            )}
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => navigate('/nft-management/volunteer')}
                        className="w-full text-center text-xs text-green-600 hover:text-green-900 font-medium py-2"
                      >
                        View All →
                      </button>
                    </div>
                  </div>

                  {/* Supplier NFTs Section */}
                  <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden">
                    <div className="bg-blue-100 px-4 py-3 border-b-2 border-blue-200">
                      <h3 className="text-base font-bold text-blue-700">Supplier</h3>
                      <p className="text-xs text-gray-600">Donation Receipts</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {[...new Map(custodialNFTs.filter(n => n.nft_type === 'supplier').map(nft => [nft.user_id, nft])).values()].slice(0, 3).map((userNFT) => {
                        const userNFTs = custodialNFTs.filter(n => n.user_id === userNFT.user_id && n.nft_type === 'supplier');
                        return (
                          <div 
                            key={userNFT.user_id} 
                            className="bg-blue-50 rounded-lg p-3 hover:bg-blue-100 cursor-pointer transition border border-blue-200"
                            onClick={() => navigate(`/user/${userNFT.user_id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{userNFT.first_name} {userNFT.last_name}</p>
                                <p className="text-xs text-gray-500">{userNFT.email}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                                {userNFTs.length}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 font-semibold">Active Supplier</p>
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => navigate('/nft-management/supplier')}
                        className="w-full text-center text-xs text-blue-600 hover:text-blue-900 font-medium py-2"
                      >
                        View All →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Scanner for Student Pickup */}
        <div className="bg-amber-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Pickup Verification</h2>
          <div className="bg-white rounded-lg p-6 border-2 border-amber-200">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setScanMode(!scanMode)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  scanMode
                    ? 'bg-amber-600 text-white'
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
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <button
                onClick={handleVerifyPickup}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold"
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
          <div className="bg-amber-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-amber-200">
              <h2 className="text-xl font-semibold text-gray-800">Active Allocations (POAS-Matched)</h2>
              <p className="text-sm text-gray-600">Recent student allocations</p>
            </div>
            <div className="p-6">
              {pendingAllocations.length === 0 ? (
                <p className="text-gray-500">No active allocations at this time.</p>
              ) : (
                <div className="space-y-3">
                  {pendingAllocations.slice(0, 5).map((allocation) => (
                    <div key={allocation.id} className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">
                            {allocation.student_first_name} {allocation.student_last_name}
                          </p>
                          <p className="text-sm text-gray-600">{allocation.item_name}</p>
                          <p className="text-xs text-gray-500">Qty: {allocation.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded text-xs font-medium block mb-1">
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
                <Link to="/allocations" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                  View All Allocations →
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Supplier Approvals */}
          <div className="bg-amber-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-amber-200">
              <h2 className="text-xl font-semibold text-gray-800">Pending Supplier Approvals</h2>
              <p className="text-sm text-gray-600">Review and verify new suppliers</p>
            </div>
            <div className="p-6">
              {pendingSupplier.length === 0 ? (
                <p className="text-gray-500">No pending approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingSupplier.map((supplier) => (
                    <div key={supplier.id} className="p-4 bg-white rounded-lg border-2 border-amber-200">
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
                          className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
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
        <div className="bg-amber-100 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-amber-200">
            <h2 className="text-xl font-semibold text-gray-800">System Audit Logs</h2>
            <p className="text-sm text-gray-600">Recent platform activity and events</p>
          </div>
          <div className="p-6">
            {auditLogs.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-amber-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.event_type === 'pickup_verified' ? 'bg-green-200 text-green-800' :
                            log.event_type === 'allocation_issued' ? 'bg-blue-200 text-blue-800' :
                            log.event_type === 'donation_received' ? 'bg-amber-200 text-amber-800' :
                            log.event_type === 'volunteer_badge_issued' ? 'bg-purple-200 text-purple-800' :
                            log.event_type === 'governance_vote' ? 'bg-indigo-200 text-indigo-800' :
                            log.event_type === 'supplier_verified' ? 'bg-cyan-200 text-cyan-800' :
                            log.event_type === 'allocation_redeemed' ? 'bg-teal-200 text-teal-800' :
                            log.event_type === 'donation_receipt_issued' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {log.event_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()} - {log.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{log.user}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                      <div className="ml-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-800">
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

