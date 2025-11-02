import React, { useState, useEffect } from 'react';
import { allocationAPI } from '../services/api';

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [filter, setFilter] = useState('approved');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchAllocations();
  }, [filter]);
  
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      if (user.role === 'student') {
        const response = await allocationAPI.getMyAllocations();
        setAllocations(response.data.data.filter(a => !filter || a.status === filter));
      } else {
        const response = await allocationAPI.getAllocations({ status: filter, limit: 100 });
        setAllocations(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch allocations', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRedeem = async (allocationId) => {
    if (!window.confirm('Confirm redemption of this allocation?')) {
      return;
    }
    
    try {
      await allocationAPI.redeemAllocation(allocationId);
      alert('Allocation redeemed successfully! Allocation NFT burned.');
      fetchAllocations();
    } catch (error) {
      alert('Failed to redeem allocation: ' + (error.response?.data?.error || error.message));
    }
  };
  
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Allocations</h1>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-primary-100 rounded-lg shadow mb-6">
          <div className="flex border-b border-primary-200">
            {['pending', 'approved', 'redeemed', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 text-sm font-medium ${
                  filter === status
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Allocations List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading allocations...</p>
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-primary-100 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No allocations found with status: {filter}</p>
          </div>
        ) : (
          <div className="bg-primary-100 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-50">
                <tr>
                  {user.role !== 'student' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">POAS Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  {user.role === 'pantry_worker' && filter === 'approved' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-primary-100 divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    {user.role !== 'student' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {allocation.student_first_name} {allocation.student_last_name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allocation.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.quantity} {allocation.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        allocation.status === 'approved' ? 'bg-green-100 text-green-800' :
                        allocation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        allocation.status === 'redeemed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(allocation.allocation_date).toLocaleString()}
                    </td>
                    {user.role === 'pantry_worker' && filter === 'approved' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRedeem(allocation.id)}
                          className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                        >
                          Redeem
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Allocations;

