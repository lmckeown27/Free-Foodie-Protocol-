import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allocationAPI, inventoryAPI } from '../services/api';
import StudentSidebar from '../components/StudentSidebar';

const StudentInventory = () => {
  const navigate = useNavigate();
  const [myAllocations, setMyAllocations] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [filter, setFilter] = useState('allocated');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchMyFood();
  }, [filter]);
  
  const fetchMyFood = async () => {
    setLoading(true);
    try {
      if (filter === 'allocated') {
        // Get student's personal allocations
        const response = await allocationAPI.getMyAllocations();
        setMyAllocations(response.data.data || []);
      } else {
        // Get available food that student might request
        const response = await inventoryAPI.getInventory({ status: 'available', limit: 50 });
        setAvailableFood(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch food data', error);
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">My Food</h1>
            <p className="text-sm text-gray-600 mt-1">View your allocated food and available items</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setFilter('allocated')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  filter === 'allocated'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                My Allocations ({myAllocations.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                  filter === 'available'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Browse Available Food
              </button>
            </div>
          </div>

          {/* My Allocations View */}
          {filter === 'allocated' && (
            <div className="space-y-4">
              {myAllocations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Allocations Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any food allocated to you right now. Check back soon or browse available food to see what's coming.
                  </p>
                  <button
                    onClick={() => setFilter('available')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Browse Available Food
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-primary-100 text-sm">Total Allocations</p>
                        <p className="text-3xl font-bold mt-1">{myAllocations.length}</p>
                      </div>
                      <div>
                        <p className="text-primary-100 text-sm">Ready to Pickup</p>
                        <p className="text-3xl font-bold mt-1">
                          {myAllocations.filter(a => a.status === 'approved').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-100 text-sm">Already Redeemed</p>
                        <p className="text-3xl font-bold mt-1">
                          {myAllocations.filter(a => a.status === 'redeemed').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Allocations List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myAllocations.map((allocation) => (
                      <div 
                        key={allocation.id} 
                        className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                      >
                        {/* Status Banner */}
                        <div className={`px-4 py-2 ${getStatusColor(allocation.status)}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase">{allocation.status}</span>
                            {allocation.status === 'approved' && (
                              <span className="text-xs font-medium">Ready for pickup</span>
                            )}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {allocation.item_name || 'Food Item'}
                          </h3>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium text-gray-900">
                                {allocation.quantity} {allocation.unit || 'units'}
                              </span>
                            </div>
                            
                            {allocation.item_type && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-900">{allocation.item_type}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">Allocated:</span>
                              <span className="font-medium text-gray-900">
                                {formatDate(allocation.allocation_date)}
                              </span>
                            </div>

                            {allocation.pickup_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Picked up:</span>
                                <span className="font-medium text-gray-900">
                                  {formatDate(allocation.pickup_date)}
                                </span>
                              </div>
                            )}

                            {allocation.poas_score && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">POAS Score:</span>
                                <span className="font-medium text-primary-600">
                                  {allocation.poas_score}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {allocation.status === 'approved' && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => navigate(`/allocations/${allocation.id}`)}
                                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                              >
                                View Pickup QR Code
                              </button>
                            </div>
                          )}

                          {allocation.status === 'redeemed' && allocation.nft_token_id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Digital Receipt Issued</span>
                              </div>
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
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">How Food Allocation Works</h3>
                    <p className="text-sm text-blue-800">
                      Food is automatically allocated to students based on your POAS (Predicted Optimal Allocation Score). 
                      Your score increases through governance participation, volunteering, and reliable pickups. 
                      When food becomes available, students with higher scores are prioritized.
                    </p>
                  </div>
                </div>
              </div>

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
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-gray-900">
                            {item.quantity} {item.unit || 'units'}
                          </span>
                        </div>
                        
                        {item.donation_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Donated:</span>
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

                      <p className="text-xs text-gray-500 italic">
                        Food will be automatically allocated based on your POAS score and availability
                      </p>
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

