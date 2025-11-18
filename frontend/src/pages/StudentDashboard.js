import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI, allocationAPI, nftAPI } from '../services/api';
import StudentSidebar from '../components/StudentSidebar';

const StudentDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [credentials, setCredentials] = useState({ governance: 0, allocation: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, allocationsRes, credentialsRes] = await Promise.all([
        inventoryAPI.getInventory({ limit: 6 }),
        allocationAPI.getMyAllocations(),
        nftAPI.getMyNFTs()
      ]);
      
      setInventory(inventoryRes.data.data);
      // Filter to show only active requests (not picked up yet)
      const activeRequests = allocationsRes.data.data.filter(
        a => a.status !== 'redeemed' && a.status !== 'completed' && a.status !== 'picked_up'
      );
      setMyRequests(activeRequests);
      
      const governanceCount = credentialsRes.data.data.filter(c => c.credential_type === 'governance' || c.nft_type === 'governance').length;
      const allocationCount = credentialsRes.data.data.filter(c => c.credential_type === 'allocation' || c.nft_type === 'allocation').length;
      setCredentials({ governance: governanceCount, allocation: allocationCount });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-50 flex">
      <StudentSidebar user={user} />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        {/* Ticket Balance - Hero Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Your Allocation Tickets</p>
              <p className="text-5xl font-bold mb-3">{credentials.allocation}</p>
              <p className="text-purple-100 text-sm">
                Use these tickets to request food from the Pantry
              </p>
            </div>
            <div className="text-right">
              <svg className="w-24 h-24 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* How to Earn Tickets - Clear Call to Action */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Earn More Allocation Tickets</h2>
          <p className="text-gray-600 mb-4">There are two ways to earn tickets:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vote on Proposals Card */}
            <Link to="/governance" className="block group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6 hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Vote on Governance Proposals</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Have your say on what food items the Pantry should stock. Every vote earns you <strong>1 Allocation Ticket</strong>.
                    </p>
                    <div className="flex items-center gap-2 text-blue-700 font-semibold group-hover:gap-3 transition-all">
                      <span>View Active Proposals</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Volunteer Card */}
            <Link to="/volunteering" className="block group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 hover:shadow-lg transition transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-900 mb-2">Complete Volunteer Opportunities</h3>
                    <p className="text-green-800 text-sm mb-3">
                      Help food suppliers with tasks like sorting, packaging, and delivery. Earn <strong>1-2 Allocation Tickets</strong> per shift.
                    </p>
                    <div className="flex items-center gap-2 text-green-700 font-semibold group-hover:gap-3 transition-all">
                      <span>Browse Opportunities</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Allocation Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{credentials.allocation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">{myRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items in Pantry</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* My Active Requests */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">My Active Requests</h2>
              <p className="text-sm text-gray-600">Food items you've requested with your tickets</p>
            </div>
            <Link 
              to="/my-food"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
            >
              View All Requests
            </Link>
          </div>
          <div className="p-6">
            {myRequests.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 mb-3">No active food requests yet</p>
                <p className="text-sm text-gray-500 mb-4">Use your Allocation Tickets to request food from the Pantry</p>
                <Link
                  to="/my-food"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Request Food
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{request.item_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {request.quantity} {request.unit}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status === 'approved' ? 'Ready for Pickup' : 'Pending Approval'}
                      </span>
                    </div>
                    {request.status === 'approved' && (
                      <div className="mt-3">
                        <Link
                          to={`/allocations/${request.id}`}
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          Show Pickup QR Code
                        </Link>
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Waiting for Pantry approval (usually within 24 hours)
                      </p>
                    )}
                  </div>
                ))}
                {myRequests.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/my-food" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      View all {myRequests.length} requests →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-primary-900 mb-2">How Free Foodie Quest Works</h3>
              <p className="text-sm text-primary-800 mb-3">
                <strong>The Simple Process:</strong>
              </p>
              <ol className="text-sm text-primary-800 space-y-2 list-decimal list-inside">
                <li><strong>Earn Tickets:</strong> Vote on governance proposals or volunteer with suppliers to earn Allocation Tickets</li>
                <li><strong>Request Food:</strong> Use your tickets to request food items from the Pantry</li>
                <li><strong>Pick Up:</strong> Show your QR code and collect your food</li>
              </ol>
              <p className="text-sm text-primary-800 mt-3">
                Your tickets are managed by the Basic Needs Initiative, so you don't need to worry about anything complicated!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

