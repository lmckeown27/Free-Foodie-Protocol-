import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('available');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchInventory();
  }, [filter]);
  
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getInventory({ status: filter, limit: 100 });
      setInventory(response.data.data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
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
            {['available', 'allocated', 'redeemed'].map((status) => (
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
        
        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="bg-primary-100 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No inventory items found with status: {filter}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <div key={item.id} className="bg-primary-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Type:</span> {item.item_type || 'N/A'}</p>
                    <p><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</p>
                    {item.expiration_date && (
                      <p><span className="font-medium">Expires:</span> {new Date(item.expiration_date).toLocaleDateString()}</p>
                    )}
                    {item.location && (
                      <p><span className="font-medium">Location:</span> {item.location}</p>
                    )}
                    {item.supplier_first_name && (
                      <p><span className="font-medium">Supplier:</span> {item.supplier_first_name} {item.supplier_last_name}</p>
                    )}
                  </div>
                  
                  {item.handling_notes && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                      <p className="text-xs text-gray-600">{item.handling_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;

