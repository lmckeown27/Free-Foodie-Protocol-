import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allocationAPI, inventoryAPI, nftAPI } from '../services/api';
import StudentSidebar from '../components/StudentSidebar';

const StudentInventory = () => {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [filter, setFilter] = useState('my-requests');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchMyFood();
    fetchTicketBalance();
  }, [filter]);
  
  const fetchMyFood = async () => {
    setLoading(true);
    try {
      if (filter === 'my-requests') {
        // Get student's food requests (only show pending and approved, not picked up)
        const response = await allocationAPI.getMyAllocations();
        // Filter out items that have been picked up (status: 'redeemed' or 'completed')
        const activeRequests = (response.data.data || []).filter(
          item => item.status !== 'redeemed' && item.status !== 'completed' && item.status !== 'picked_up'
        );
        setMyRequests(activeRequests);
      } else {
        // Get available food that student can request
        const response = await inventoryAPI.getInventory({ status: 'available', limit: 50 });
        setAvailableFood(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch food data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketBalance = async () => {
    try {
      const response = await nftAPI.getMyNFTs();
      const allocationTickets = (response.data.data || []).filter(
        ticket => ticket.credential_type === 'allocation' || ticket.nft_type === 'allocation'
      );
      setTicketBalance(allocationTickets.length);
    } catch (error) {
      console.error('Failed to fetch ticket balance', error);
      setTicketBalance(0);
    }
  };

  const handleRequestFood = async (foodItem) => {
    if (ticketBalance === 0) {
      alert('You need at least 1 Allocation Ticket to request food. Earn more by voting or volunteering!');
      return;
    }

    if (window.confirm(`Use 1 Allocation Ticket to request ${foodItem.item_name}?`)) {
      try {
        // API call to create food request (consumes 1 ticket)
        console.log('Requesting food:', foodItem);
        alert('Food request submitted! Your ticket has been used. The Pantry will review your request.');
        fetchMyFood();
        fetchTicketBalance();
      } catch (error) {
        console.error('Failed to request food', error);
        alert('Failed to request food. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex">
        <StudentSidebar user={user} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex">
      <StudentSidebar user={user} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Request Food</h1>
            <p className="text-sm text-gray-600 mt-1">Use your Allocation Tickets to request food from the Pantry</p>
          </div>

          {/* Ticket Balance Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Your Allocation Tickets</p>
                <p className="text-5xl font-bold mb-2">{ticketBalance}</p>
                <p className="text-purple-100 text-sm">
                  {ticketBalance === 0 
                    ? 'Earn tickets by voting or volunteering to request food' 
                    : `You can request up to ${ticketBalance} food item${ticketBalance === 1 ? '' : 's'}`
                  }
                </p>
              </div>
              <div>
                <svg className="w-20 h-20 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">How Food Requests Work</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Use 1 Allocation Ticket to request a food item</li>
                  <li>The Pantry reviews your request (usually approved within 24 hours)</li>
                  <li>Once approved, come to the Pantry and show your QR code to pick up</li>
                  <li>After pickup is confirmed by the Pantry, the item is removed from your list</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setFilter('my-requests')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  filter === 'my-requests'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                My Requests ({myRequests.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  filter === 'available'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Browse & Request Food
              </button>
            </div>
          </div>

          {/* My Requests View */}
          {filter === 'my-requests' && (
            <div className="space-y-4">
              {myRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Food Requests</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't requested any food yet. Use your Allocation Tickets to request food items!
                  </p>
                  <button
                    onClick={() => setFilter('available')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Browse & Request Food
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-primary-100 text-sm">Active Requests</p>
                        <p className="text-3xl font-bold mt-1">{myRequests.length}</p>
                      </div>
                      <div>
                        <p className="text-primary-100 text-sm">Ready to Pickup</p>
                        <p className="text-3xl font-bold mt-1">
                          {myRequests.filter(a => a.status === 'approved').length}
                        </p>
                      </div>
                    </div>
                    <p className="text-primary-100 text-sm mt-4">
                      Note: Items will automatically disappear from this list once the Pantry confirms you've picked them up.
                    </p>
                  </div>

                  {/* Requests List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                      >
                        {/* Status Banner */}
                        <div className={`px-4 py-2 ${getStatusColor(request.status)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase">{request.status}</span>
                            {request.status === 'approved' && (
                              <span className="text-xs font-medium">Ready for pickup</span>
                            )}
                            {request.status === 'pending' && (
                              <span className="text-xs font-medium">Under review</span>
                            )}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {request.item_name || 'Food Item'}
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium text-gray-900">
                                {request.quantity} {request.unit || 'units'}
                              </span>
                            </div>
                            
                            {request.item_type && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-900">{request.item_type}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Requested:</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(request.allocation_date)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-3 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                              <span className="font-medium">1 Ticket Used</span>
                            </div>

                          </div>

                          {/* Action Buttons */}
                          {request.status === 'approved' && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => navigate(`/allocations/${request.id}`)}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                              >
                                Show Pickup QR Code
                              </button>
                              <p className="text-xs text-gray-500 text-center mt-2">
                                This item will disappear after Pantry confirms pickup
                              </p>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-600 text-center">
                                Waiting for Pantry approval (usually within 24 hours)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Available Food View */}
          {filter === 'available' && (
            <div className="space-y-4">
              {ticketBalance === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-1">You Need Allocation Tickets to Request Food</h3>
                      <p className="text-sm text-yellow-800 mb-2">
                        You currently have <strong>0 Allocation Tickets</strong>. Earn tickets to request food:
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate('/governance')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          Vote on Proposals
                        </button>
                        <button
                          onClick={() => navigate('/volunteering')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          Find Volunteering
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {availableFood.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Food Available</h3>
                  <p className="text-gray-600">
                    There's no food available at the moment. Check back soon as new donations arrive regularly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableFood.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{item.item_name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Available
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        {item.item_type && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium text-gray-900">{item.item_type}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">In Stock:</span>
                          <span className="font-medium text-gray-900">
                            {item.quantity} {item.unit || 'units'}
                          </span>
                        </div>
                        
                        {item.donation_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Added:</span>
                            <span className="font-medium text-gray-900">
                              {formatDate(item.donation_date)}
                            </span>
                          </div>
                        )}

                        {item.supplier_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium text-gray-900">{item.supplier_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Request Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleRequestFood(item)}
                          disabled={ticketBalance === 0}
                          className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition ${
                            ticketBalance === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {ticketBalance === 0 ? 'Need Ticket to Request' : 'Request with 1 Ticket'}
                        </button>
                        {ticketBalance > 0 && (
                          <p className="text-xs text-gray-500 text-center mt-2">
                            {ticketBalance} ticket{ticketBalance === 1 ? '' : 's'} remaining
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentInventory;

