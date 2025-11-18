import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import RoleSidebar from '../components/RoleSidebar';

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
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

  // Get unique categories from inventory
  const categories = ['all', ...new Set(inventory.map(item => item.item_type).filter(Boolean))];
  
  // Get filtered and sorted inventory
  const getFilteredInventory = () => {
    let filtered = [...inventory];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category tab filter
    if (activeCategoryTab !== 'all') {
      filtered = filtered.filter(item => item.item_type === activeCategoryTab);
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
    
    return filtered;
  };

  const filteredInventory = getFilteredInventory();

  // Get category stats
  const getCategoryStats = (category) => {
    const items = category === 'all' 
      ? inventory 
      : inventory.filter(item => item.item_type === category);
    
    return {
      total: items.length,
      available: items.filter(i => i.status === 'available').length,
      allocated: items.filter(i => i.status === 'allocated').length,
      pending: items.filter(i => i.status === 'pending').length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    };
  };

  const getCategoryIcon = (category) => {
    // No icons needed
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleSidebar user={user} />
        <main className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex">
      <RoleSidebar user={user} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage food tokens approved through governance proposals</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                + Add Item
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Food Items Created Through Governance</h3>
                <p className="text-sm text-blue-800">
                  All food items in the system are text/token representations approved by Pantry through governance proposals. 
                  <Link to="/create-proposal" className="underline font-semibold ml-1 hover:text-blue-600">
                    Create a proposal
                  </Link> to add new food types to the inventory system.
                </p>
              </div>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Available ({inventory.filter(i => i.status === 'available').length})
            </button>
            <button
              onClick={() => setFilter('allocated')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'allocated'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Allocated ({inventory.filter(i => i.status === 'allocated').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Pending ({inventory.filter(i => i.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All Items ({inventory.length})
            </button>
          </div>

          {/* Category Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto -mb-px">
                {categories.map(category => {
                  const stats = getCategoryStats(category);
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategoryTab(category)}
                      className={`flex-shrink-0 py-4 px-6 text-center font-medium text-sm transition border-b-4 ${
                        activeCategoryTab === category
                          ? 'border-amber-500 text-amber-700 bg-amber-50'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{category === 'all' ? 'All Items' : category}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                          activeCategoryTab === category
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {stats.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
                <input
                  type="text"
                  placeholder="Search by name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
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

          {/* Category Summary Card */}
          {activeCategoryTab !== 'all' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeCategoryTab}</h2>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Items</div>
                      <div className="text-xl font-bold text-gray-900">{getCategoryStats(activeCategoryTab).total}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Available</div>
                      <div className="text-xl font-bold text-green-600">{getCategoryStats(activeCategoryTab).available}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Allocated</div>
                      <div className="text-xl font-bold text-yellow-600">{getCategoryStats(activeCategoryTab).allocated}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Pending</div>
                      <div className="text-xl font-bold text-blue-600">{getCategoryStats(activeCategoryTab).pending}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Grid */}
          {filteredInventory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'No items match your search criteria'
                  : `No items in this category with "${filter}" status`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInventory.map((item) => (
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
                      <p><span className="font-medium">Category:</span> {item.item_type || 'N/A'}</p>
                      <p><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</p>
                      {item.location && (
                        <p><span className="font-medium">Location:</span> {item.location}</p>
                      )}
                      {item.expires_at && (
                        <p><span className="font-medium">Expires:</span> {new Date(item.expires_at).toLocaleDateString()}</p>
                      )}
                      {item.source && (
                        <p className="text-xs text-gray-500 italic mt-2">
                          <span className="font-medium">Source:</span> {item.source}
                        </p>
                      )}
                    </div>
                    
                    {user.role === 'pantry' && (
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Inventory;
