import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, votingAPI, allocationAPI, nftAPI, analyticsAPI, walletAPI } from '../services/api';
import StudentSidebar from '../components/StudentSidebar';
import PantrySidebar from '../components/PantrySidebar';
import SupplierSidebar from '../components/SupplierSidebar';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      switch(user.role) {
        case 'student':
          await fetchStudentDashboard();
          break;
        case 'pantry':
        case 'bni':
          await fetchPantryDashboard();
          break;
        case 'supplier':
          await fetchSupplierDashboard();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentDashboard = async () => {
    try {
      const [allocationsRes, credentialsRes, inventoryRes] = await Promise.all([
        allocationAPI.getMyAllocations().catch(() => ({ data: { data: [] } })),
        nftAPI.getMyNFTs().catch(() => ({ data: { data: [] } })),
        inventoryAPI.getInventory({ limit: 5 }).catch(() => ({ data: { data: [] } }))
      ]);
      
      // Filter to show only active requests (not picked up yet)
      const activeRequests = allocationsRes.data.data.filter(
        a => a.status !== 'redeemed' && a.status !== 'completed' && a.status !== 'picked_up'
      );
      const approvedRequests = activeRequests.filter(a => a.status === 'approved');
      
      const allocationTickets = credentialsRes.data.data.filter(
        c => c.credential_type === 'allocation' || c.nft_type === 'allocation'
      ).length;
      
      setDashboardData({
        allocationTickets: allocationTickets,
        activeRequests: activeRequests.length,
        approvedRequests: approvedRequests.length,
        availableItems: inventoryRes.data.data.length,
        requests: activeRequests.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching student dashboard', error);
    }
  };
  
  const fetchPantryDashboard = async () => {
    try {
      const [dashboardRes, inventoryRes, custodialRes, proposalsRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: { data: {} } })),
        inventoryAPI.getInventory().catch(() => ({ data: { data: [] } })),
        walletAPI.getCustodialCredentials().catch(() => ({ data: { data: [] } })),
        votingAPI.getProposals().catch(() => ({ data: { data: [] } }))
      ]);
      
      const students = dashboardRes.data.data.users?.find(u => u.role === 'student')?.count || 0;
      const suppliers = dashboardRes.data.data.users?.find(u => u.role === 'supplier')?.count || 0;
      const availableInventory = inventoryRes.data.data.filter(i => i.status === 'available').length;
      const totalInventory = inventoryRes.data.data.length;
      const activeProposals = proposalsRes.data.data.filter(p => p.status === 'active').length;
      const pendingProposals = proposalsRes.data.data.filter(p => p.status === 'pending').length;
      
      setDashboardData({
        totalStudents: students,
        totalSuppliers: suppliers,
        availableItems: availableInventory,
        totalItems: totalInventory,
        custodialCredentials: custodialRes.data.data.length,
        activeProposals: activeProposals,
        pendingProposals: pendingProposals,
        recentActivity: dashboardRes.data.data.recent_activity || []
      });
    } catch (error) {
      console.error('Error fetching pantry dashboard', error);
    }
  };
  
  const fetchSupplierDashboard = async () => {
    try {
      const [inventoryRes, credentialsRes] = await Promise.all([
        inventoryAPI.getMyInventory().catch(() => ({ data: { data: [] } })),
        nftAPI.getMyNFTs().catch(() => ({ data: { data: [] } }))
      ]);
      
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const thisMonthDonations = inventoryRes.data.data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === thisMonth && itemDate.getFullYear() === thisYear;
      });
      
      const totalQuantity = inventoryRes.data.data.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      const monthQuantity = thisMonthDonations.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      
      setDashboardData({
        totalDonations: inventoryRes.data.data.length,
        thisMonthDonations: thisMonthDonations.length,
        totalQuantity: Math.round(totalQuantity),
        monthQuantity: Math.round(monthQuantity),
        receipts: credentialsRes.data.data.filter(c => c.credential_type === 'supplier' || c.nft_type === 'supplier').length,
        recentDonations: inventoryRes.data.data.slice(0, 5),
        pendingVerifications: inventoryRes.data.data.filter(i => i.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching supplier dashboard', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }
  
  // Render based on user role
  const renderSidebar = () => {
    switch(user.role) {
      case 'student':
        return <StudentSidebar user={user} />;
      case 'pantry':
      case 'bni':
        return <PantrySidebar user={user} />;
      case 'supplier':
        return <SupplierSidebar user={user} />;
      default:
        return null;
    }
  };
  
  const renderContent = () => {
    switch(user.role) {
      case 'student':
        return renderStudentDashboard();
      case 'pantry':
      case 'bni':
        return renderPantryDashboard();
      case 'supplier':
        return renderSupplierDashboard();
      default:
        return <div>Unknown role</div>;
    }
  };
  
  const renderStudentDashboard = () => (
    <main className="flex-1 ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.email?.split('@')[0]}</h1>
          <p className="text-gray-600 mt-1">Here's your daily overview</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Allocation Tickets */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Allocation Tickets</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.allocationTickets || 0}</p>
            <p className="text-sm opacity-90">Available to use</p>
          </div>
          
          {/* Active Requests */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Active Requests</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.activeRequests || 0}</p>
            <p className="text-sm opacity-90">Food requests</p>
          </div>
          
          {/* Ready for Pickup */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Ready for Pickup</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.approvedRequests || 0}</p>
            <p className="text-sm opacity-90">Approved items</p>
          </div>
          
          {/* Items in Pantry */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Items in Pantry</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.availableItems || 0}</p>
            <p className="text-sm opacity-90">Available now</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* My Active Requests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Active Requests</h2>
              <button
                onClick={() => navigate('/my-food')}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            {dashboardData?.requests?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.requests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{request.item_name || 'Food Item'}</p>
                      <p className="text-sm text-gray-600">{request.quantity} {request.unit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status === 'approved' ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">No active requests yet</p>
                <button
                  onClick={() => navigate('/my-food')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                >
                  Request Food
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Access to Earn Tickets */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Earn More Tickets</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/governance')}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:shadow-md transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Vote on Proposals</p>
                    <p className="text-sm text-blue-700">Earn 1 ticket per vote</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/volunteering')}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:shadow-md transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Volunteer</p>
                    <p className="text-sm text-green-700">Earn 1-2 tickets per shift</p>
                  </div>
                  <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
  
  const renderPantryDashboard = () => (
    <main className="flex-1 ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pantry Dashboard</h1>
          <p className="text-gray-600 mt-1">Today's operations overview</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Students</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.totalStudents || 0}</p>
            <p className="text-sm opacity-90">Registered users</p>
          </div>
          
          {/* Available Inventory */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Available Items</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.availableItems || 0}</p>
            <p className="text-sm opacity-90">of {dashboardData?.totalItems || 0} total</p>
          </div>
          
          {/* Custodial Credentials */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Student Credentials</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.custodialCredentials || 0}</p>
            <p className="text-sm opacity-90">In custody</p>
          </div>
          
          {/* Active Proposals */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Active Proposals</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.activeProposals || 0}</p>
            <p className="text-sm opacity-90">{dashboardData?.pendingProposals || 0} pending</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Manage Inventory</h3>
                <p className="text-sm text-gray-600">Update stock levels</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/allocations')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Review Allocations</h3>
                <p className="text-sm text-gray-600">Approve requests</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/create-proposal')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Create Proposal</h3>
                <p className="text-sm text-gray-600">New governance item</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Suppliers Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Verified Suppliers</h2>
            <span className="text-2xl font-bold text-blue-600">{dashboardData?.totalSuppliers || 0}</span>
          </div>
          <p className="text-gray-600">Active donation partners</p>
        </div>
      </div>
    </main>
  );
  
  const renderSupplierDashboard = () => (
    <main className="flex-1 ml-64 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your donation impact</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Donations */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Donations</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.totalDonations || 0}</p>
            <p className="text-sm opacity-90">All time</p>
          </div>
          
          {/* This Month */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">This Month</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.thisMonthDonations || 0}</p>
            <p className="text-sm opacity-90">donations</p>
          </div>
          
          {/* Total Quantity */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Quantity</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.totalQuantity || 0}</p>
            <p className="text-sm opacity-90">units donated</p>
          </div>
          
          {/* Receipts */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Receipts</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold mb-1">{dashboardData?.receipts || 0}</p>
            <p className="text-sm opacity-90">Verified</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/add-donation')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 hover:shadow-xl transition text-left text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Add New Donation</h3>
                <p className="opacity-90">Record a new food donation</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/credentials')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">View Receipts</h3>
                <p className="text-gray-600">Access donation records</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Recent Donations */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Donations</h2>
          {dashboardData?.recentDonations?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentDonations.map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{donation.item_name}</p>
                    <p className="text-sm text-gray-600">{donation.quantity} {donation.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      donation.status === 'available' ? 'bg-green-100 text-green-700' :
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {donation.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No donations yet. Click "Add New Donation" to get started!</p>
          )}
        </div>
        
        {dashboardData?.pendingVerifications > 0 && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-900">Pending Verifications</p>
                <p className="text-sm text-yellow-800">
                  You have {dashboardData.pendingVerifications} donation{dashboardData.pendingVerifications > 1 ? 's' : ''} awaiting pantry verification
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      {renderContent()}
    </div>
  );
};

export default Dashboard;

