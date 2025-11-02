import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierAPI, inventoryAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [nftCollection, setNftCollection] = useState([]);
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
      
      // Mock impact metrics - in production, this would come from the backend
      setImpactMetrics({
        totalPounds: 2450,
        mealsSaved: 1850,
        co2Saved: 340,
        complianceRate: 100
      });
      
      // Mock NFT collection - in production, this would come from Aptos blockchain
      setNftCollection([
        { id: 1, itemName: 'Fresh Produce Mix', weight: '150 lbs', date: new Date(), txHash: '0xabc123...' },
        { id: 2, itemName: 'Organic Apples', weight: '200 lbs', date: new Date(Date.now() - 86400000), txHash: '0xdef456...' },
        { id: 3, itemName: 'Sushi Grade Tuna', weight: '50 lbs', date: new Date(Date.now() - 172800000), txHash: '0xghi789...' }
      ]);
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
      alert(`✅ Donation logged successfully!\n\n🎫 Supplier NFT minted on Aptos blockchain\n📦 Item: ${formData.item_name}\n⚖️ Quantity: ${formData.quantity} ${formData.unit}\n\nThis NFT serves as your immutable donation receipt for compliance and impact tracking.`);
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
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Supplier NFT Registered
              </span>
              <span className="text-xs text-gray-500">Blockchain-verified donations</span>
            </div>
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
        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Pounds Donated</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{impactMetrics?.totalPounds || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Lifetime surplus rescued</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Meals Saved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{impactMetrics?.mealsSaved || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Approx. meal equivalents</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">CO₂ Saved</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{impactMetrics?.co2Saved || 0} kg</p>
            <p className="text-xs text-gray-500 mt-1">Carbon footprint reduced</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Supplier NFTs</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.supplier_nft_count || nftCollection.length}</p>
            <p className="text-xs text-gray-500 mt-1">Blockchain receipts</p>
          </div>
        </div>
        
        {/* Compliance Badge */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-green-900">100% Compliance Rate</h3>
              <p className="text-sm text-green-800">Protected by Bill Emerson Good Samaritan Act & SB 1383</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm">
            Verified
          </span>
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
        
        {/* NFT Collection & Donation History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* NFT Donation Receipts */}
          <div className="bg-primary-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-800">NFT Donation Receipts</h2>
              <p className="text-sm text-gray-600">Immutable blockchain records</p>
            </div>
            <div className="p-6">
              {nftCollection.length === 0 ? (
                <p className="text-gray-500">No NFT receipts yet</p>
              ) : (
                <div className="space-y-3">
                  {nftCollection.map((nft) => (
                    <div key={nft.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{nft.itemName}</p>
                          <p className="text-sm text-gray-600">{nft.weight}</p>
                        </div>
                        <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold">
                          NFT
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {nft.date.toLocaleDateString()} at {nft.date.toLocaleTimeString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-purple-200 truncate">
                          {nft.txHash}
                        </span>
                        <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                          View on Aptos
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Donation Tracking */}
          <div className="bg-primary-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-800">Donation Tracking</h2>
              <p className="text-sm text-gray-600">Where your donations go</p>
            </div>
            <div className="p-6">
              {donations.length === 0 ? (
                <p className="text-gray-500">No donations yet. Add your first donation above!</p>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="p-4 bg-white rounded-lg border border-primary-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{donation.item_name}</p>
                          <p className="text-sm text-gray-600">{donation.item_type}</p>
                          <p className="text-xs text-gray-500">
                            {donation.quantity} {donation.unit}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          donation.status === 'available' ? 'bg-green-100 text-green-700' :
                          donation.status === 'allocated' ? 'bg-blue-100 text-blue-700' :
                          donation.status === 'redeemed' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {donation.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(donation.donation_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/inventory" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Full Donation History →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">How FFQ Benefits Suppliers</h3>
              <p className="text-sm text-blue-800 mb-2">
                Every donation you make is <strong>automatically minted as an NFT</strong> on the Aptos blockchain. This serves as your immutable donation receipt for tax deductions and compliance reporting.
              </p>
              <p className="text-sm text-blue-800 mb-2">
                You're protected by the <strong>Bill Emerson Good Samaritan Act</strong> and <strong>California SB 1383</strong>, which shield you from liability when donating surplus food in good faith.
              </p>
              <p className="text-sm text-blue-800">
                All blockchain transactions happen in the background—you just use this simple dashboard. No crypto knowledge required!
              </p>
            </div>
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

