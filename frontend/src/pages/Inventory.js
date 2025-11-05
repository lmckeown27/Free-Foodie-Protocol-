import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import RoleSidebar from '../components/RoleSidebar';

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [filter, setFilter] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchInventory();
  }, [filter]);
  
  useEffect(() => {
    applyFiltersAndSort();
  }, [inventory, searchTerm, categoryFilter, sortBy]);
  
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
  
  const applyFiltersAndSort = () => {
    let filtered = [...inventory];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.item_type === categoryFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item_name.localeCompare(b.item_name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    setFilteredInventory(filtered);
  };
  
  const categories = ['all', ...new Set(inventory.map(item => item.item_type).filter(Boolean))];
  
  return (
    <div className="min-h-screen bg-primary-50 flex">
      <RoleSidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredInventory.length} items • {filter} status
              </p>
            </div>
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
        
        {/* Search and Filters */}
        <div className="bg-primary-100 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="quantity">Quantity (High to Low)</option>
                  <option value="status">Status</option>
                </select>
            </div>
          </div>
        </div>
        
        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="bg-primary-100 rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              {inventory.length === 0 
                ? `No inventory items found with status: ${filter}`
                : 'No items match your search and filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => {
              return (
                <div key={item.id} className="bg-primary-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'allocated' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'pending' ? 'Coming Soon' : item.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Type:</span> {item.item_type || 'N/A'}</p>
                      <p><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</p>
                      {item.location && (
                        <p><span className="font-medium">Location:</span> {item.location}</p>
                      )}
                      {item.supplier_first_name && (
                        <p><span className="font-medium">Supplier:</span> {item.supplier_first_name} {item.supplier_last_name}</p>
                      )}
                      {item.donation_date && (
                        <p><span className="font-medium">Donated:</span> {new Date(item.donation_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    {item.handling_notes && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                        <p className="text-xs text-gray-600">{item.handling_notes}</p>
                      </div>
                    )}
                    
                    {user.role === 'pantry_worker' && item.status === 'available' && (
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition">
                          Allocate
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition">
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;

