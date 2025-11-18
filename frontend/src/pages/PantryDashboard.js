import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI, allocationAPI, inventoryAPI, votingAPI, nftAPI, volunteerAPI } from '../services/api';
import PantrySidebar from '../components/PantrySidebar';

const PantryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingVolunteerReviews, setPendingVolunteerReviews] = useState([]);
  const [quickStats, setQuickStats] = useState(null);
  const [scannedId, setScannedId] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, requestsRes, inventoryRes, proposalsRes, nftsRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: { data: {} } })),
        allocationAPI.getAllocations({ status: 'pending', limit: 10 }).catch(() => ({ data: { data: [] } })),
        inventoryAPI.getInventory({ limit: 1 }).catch(() => ({ data: { data: [] } })),
        votingAPI.getProposals().catch(() => ({ data: { data: [] } })),
        nftAPI.getAllNFTs().catch(() => ({ data: { data: [] } }))
      ]);
      
      // Calculate ticket statistics
      const allNFTs = nftsRes.data?.data || [];
      const allocationTickets = allNFTs.filter(n => n.nft_type === 'allocation' || n.credential_type === 'allocation');
      const votingTickets = allocationTickets.filter(n => n.source === 'voting' || n.earned_via === 'voting');
      const volunteerTickets = allocationTickets.filter(n => n.source === 'volunteering' || n.earned_via === 'volunteering');
      
      setTicketStats({
        total: allocationTickets.length,
        fromVoting: votingTickets.length,
        fromVolunteering: volunteerTickets.length,
        uniqueStudents: [...new Set(allocationTickets.map(t => t.user_id))].length
      });
      
      // Set pending food requests
      setPendingRequests(requestsRes.data.data);
      
      // Mock pending volunteer reviews (TODO: replace with actual API call)
      setPendingVolunteerReviews([
        {
          id: 1,
          student_name: 'Emily Chen',
          opportunity_title: 'Food Sorting Shift',
          supplier_name: 'Campus Market',
          completed_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          ticket_reward: 1,
          status: 'pending_review'
        },
        {
          id: 2,
          student_name: 'Marcus Johnson',
          opportunity_title: 'Delivery Assistant',
          supplier_name: 'Local Bakery',
          completed_date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          ticket_reward: 2,
          status: 'pending_review'
        }
      ]);
      
      // Set quick stats
      const activeProposals = proposalsRes.data.data.filter(p => p.status === 'active');
      setQuickStats({
        totalStudents: dashboardRes.data.data?.users?.find(u => u.role === 'student')?.count || 0,
        totalSuppliers: dashboardRes.data.data?.users?.find(u => u.role === 'supplier')?.count || 0,
        activeProposals: activeProposals.length,
        availableItems: inventoryRes.data.data.length || 0
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveRequest = async (requestId) => {
    try {
      await allocationAPI.updateAllocation(requestId, { status: 'approved' });
      alert('Food request approved! Student can now pick up the item.');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to approve request: ' + error.message);
    }
  };
  
  const handleDenyRequest = async (requestId) => {
    try {
      await allocationAPI.updateAllocation(requestId, { status: 'denied' });
      alert('Food request denied.');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to deny request: ' + error.message);
    }
  };
  
  const handleApproveVolunteerCompletion = async (reviewId, ticketReward) => {
    try {
      // TODO: Call actual API to issue allocation ticket
      alert(`Volunteer work approved!\n\n${ticketReward} Allocation Ticket(s) issued to student.`);
      setPendingVolunteerReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      alert('Failed to approve: ' + error.message);
    }
  };
  
  const handleDenyVolunteerCompletion = async (reviewId) => {
    try {
      alert('Volunteer completion denied. No tickets issued.');
      setPendingVolunteerReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      alert('Failed to deny: ' + error.message);
    }
  };
  
  const handleVerifyPickup = () => {
    if (!scannedId) {
      alert('Please scan or enter a student ID');
      return;
    }
    
    alert(`Pickup verified for Student ID: ${scannedId}\n\nItem removed from student's active requests.`);
    setScannedId('');
    fetchDashboardData();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-amber-50 flex">
      <PantrySidebar user={user} />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pantry Dashboard</h1>
          <p className="text-gray-600 mt-1">Control allocation tickets, approve requests, and manage operations</p>
        </div>
        
        {/* Allocation Ticket Control Center */}
        <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white rounded-lg shadow-lg p-6 mb-6 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Allocation Ticket Control</h2>
              <p className="text-sm text-gray-600">You are the ONLY entity that can issue tickets to students</p>
            </div>
            <div className="bg-purple-600 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
          
          {ticketStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                <p className="text-4xl font-bold text-purple-600">{ticketStats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Tickets Issued</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-200 shadow-sm">
                <p className="text-4xl font-bold text-blue-600">{ticketStats.fromVoting}</p>
                <p className="text-sm text-gray-600 mt-1">From Voting</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                <p className="text-4xl font-bold text-green-600">{ticketStats.fromVolunteering}</p>
                <p className="text-sm text-gray-600 mt-1">From Volunteering</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border-2 border-amber-200 shadow-sm">
                <p className="text-4xl font-bold text-amber-600">{ticketStats.uniqueStudents}</p>
                <p className="text-sm text-gray-600 mt-1">Students with Tickets</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading ticket statistics...</p>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{quickStats?.totalStudents || 0}</p>
              </div>
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Proposals</p>
                <p className="text-3xl font-bold text-gray-900">{quickStats?.activeProposals || 0}</p>
              </div>
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available Items</p>
                <p className="text-3xl font-bold text-gray-900">{quickStats?.availableItems || 0}</p>
              </div>
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Suppliers</p>
                <p className="text-3xl font-bold text-gray-900">{quickStats?.totalSuppliers || 0}</p>
              </div>
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Two Column Layout: Pending Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pending Student Food Requests */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <h2 className="text-xl font-bold text-white">Pending Food Requests</h2>
              <p className="text-sm text-blue-100 mt-1">Students who used tickets to request food</p>
            </div>
            <div className="p-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="mb-3">
                        <p className="font-bold text-gray-900">
                          {request.student_first_name} {request.student_last_name}
                        </p>
                        <p className="text-sm text-gray-700 font-medium mt-1">{request.item_name}</p>
                        <p className="text-xs text-gray-600">Quantity: {request.quantity} {request.unit}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(request.allocation_date).toLocaleString()}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                          1 Ticket Used
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request.id)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/allocations" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All Requests →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Pending Volunteer Completion Reviews */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
              <h2 className="text-xl font-bold text-white">Volunteer Completions</h2>
              <p className="text-sm text-green-100 mt-1">Supplier notifications - Approve to issue tickets</p>
            </div>
            <div className="p-6">
              {pendingVolunteerReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No pending reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVolunteerReviews.map((review) => (
                    <div key={review.id} className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="mb-3">
                        <p className="font-bold text-gray-900">{review.student_name}</p>
                        <p className="text-sm text-gray-700 font-medium mt-1">{review.opportunity_title}</p>
                        <p className="text-xs text-gray-600">Supplier: {review.supplier_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {review.completed_date.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                            Reward: {review.ticket_reward} Ticket{review.ticket_reward > 1 ? 's' : ''}
                          </span>
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                            Pending Your Review
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVolunteerCompletion(review.id, review.ticket_reward)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                        >
                          Approve & Issue Tickets
                        </button>
                        <button
                          onClick={() => handleDenyVolunteerCompletion(review.id)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* QR Scanner for Student Pickup */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
            <h2 className="text-xl font-bold text-white">Pickup Verification</h2>
            <p className="text-sm text-purple-100 mt-1">Scan student QR code to confirm pickup</p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Scan or enter student ID..."
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleVerifyPickup}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-md"
              >
                Verify Pickup
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Once verified, the item will automatically disappear from the student's active requests.
            </p>
          </div>
        </div>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Link
            to="/governance-proposals"
            className="block p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-blue-900">Create Proposal</h3>
              <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm text-blue-800">Start a new governance vote for students (they earn 1 ticket per vote)</p>
          </Link>
          
          <Link
            to="/inventory"
            className="block p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-900">Manage Inventory</h3>
              <svg className="w-6 h-6 text-amber-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm text-amber-800">View and organize food by category, track stock levels</p>
          </Link>
          
          <Link
            to="/allocations"
            className="block p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-purple-900">Supply Planning</h3>
              <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm text-purple-800">View POAS recommendations to optimize supplier requests</p>
          </Link>
        </div>
        
        {/* Info Banner */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-2">You Control the Allocation Ticket System</h3>
              <p className="text-sm text-purple-800 mb-2">
                As the Pantry, you are the ONLY entity authorized to issue Allocation Tickets. This ensures:
              </p>
              <ul className="text-sm text-purple-700 space-y-1 ml-4">
                <li>• System integrity and abuse prevention</li>
                <li>• Fair distribution across all students</li>
                <li>• Transparent governance and oversight</li>
                <li>• Final approval authority on all ticket issuance</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PantryDashboard;
