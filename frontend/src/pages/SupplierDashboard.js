import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierAPI, inventoryAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: '',
    quantity: '',
    unit: '',
    expiration_date: '',
    location: '',
    handling_notes: ''
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchSupplierData();
  }, []);
  
  const fetchSupplierData = async () => {
    try {
      const [statsRes, donationsRes] = await Promise.all([
        supplierAPI.getSupplierStats(user.id),
        supplierAPI.getSupplierDonations(user.id)
      ]);
      
      setStats(statsRes.data.data);
      setDonations(donationsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch supplier data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.addInventory(formData);
      alert('Donation added successfully! Supplier NFT minted.');
      setShowAddForm(false);
      setFormData({
        item_name: '',
        item_type: '',
        quantity: '',
        unit: '',
        expiration_date: '',
        location: '',
        handling_notes: ''
      });
      fetchSupplierData();
    } catch (error) {
      alert('Failed to add donation: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-primary-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Supplier Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.first_name}!</p>
          </div>
          <div className="flex gap-3 items-center">
            <WalletConnect />
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats?.total_donations || 0}</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.total_quantity || 0}</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Items Redeemed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats?.items_redeemed || 0}</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Supplier NFTs</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.supplier_nft_count || 0}</p>
          </div>
        </div>
        
        {/* Add Donation Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {showAddForm ? 'Cancel' : '+ Add New Donation'}
          </button>
        </div>
        
        {/* Add Donation Form */}
        {showAddForm && (
          <div className="bg-primary-100 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Donation</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  name="item_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.item_name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                <select
                  name="item_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.item_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="grains">Grains</option>
                  <option value="canned">Canned Goods</option>
                  <option value="beverages">Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  name="unit"
                  type="text"
                  placeholder="e.g., lbs, count, gallons"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  name="expiration_date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.expiration_date}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Handling Notes</label>
                <textarea
                  name="handling_notes"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={formData.handling_notes}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Submit Donation
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Donation History */}
        <div className="bg-primary-100 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-primary-200">
            <h2 className="text-xl font-semibold text-gray-800">Donation History</h2>
          </div>
          <div className="p-6">
            {donations.length === 0 ? (
              <p className="text-gray-500">No donations yet. Add your first donation above!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary-100 divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {donation.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.item_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.quantity} {donation.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            donation.status === 'available' ? 'bg-green-100 text-green-800' :
                            donation.status === 'allocated' ? 'bg-blue-100 text-blue-800' :
                            donation.status === 'redeemed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.donation_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
        userRole="supplier" 
      />
    </div>
  );
};

export default SupplierDashboard;

