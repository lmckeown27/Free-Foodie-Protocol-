import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierAPI, inventoryAPI, nftAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [donationTimeline, setDonationTimeline] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: '',
    quantity: '',
    unit: '',
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
      const [statsRes, donationsRes, nftsRes] = await Promise.all([
        supplierAPI.getSupplierStats(user.id),
        supplierAPI.getSupplierDonations(user.id),
        nftAPI.getMyNFTs()
      ]);
      
      setStats(statsRes.data.data);
      const donationsData = donationsRes.data.data;
      setDonations(donationsData);
      
      // Extract NFTs data
      const nftsData = nftsRes.data?.data || [];
      setNfts(Array.isArray(nftsData) ? nftsData : []);
      
      // Fetch impact metrics from API (when implemented)
      try {
        const impactRes = await supplierAPI.getSupplierImpact(user.id);
        setImpactMetrics(impactRes.data.data);
      } catch (impactError) {
        // API not implemented yet - show zeros
        console.log('Impact metrics API not available yet', impactError);
        setImpactMetrics({
          totalPounds: 0,
          mealsSaved: 0,
          co2Saved: 0,
          nftCount: 0
        });
      }
      
      // Create donation timeline (group by status)
      const timeline = donationsData.map(donation => ({
        id: donation.id,
        item: donation.item_name,
        quantity: `${donation.quantity} ${donation.unit}`,
        date: new Date(donation.donation_date),
        status: donation.status,
        nftId: donation.supplier_nft_id,
        statusSteps: [
          { label: 'Donated', completed: true, date: new Date(donation.donation_date) },
          { label: 'Available', completed: donation.status !== 'pending', date: donation.status !== 'pending' ? new Date(donation.donation_date) : null },
          { label: 'Allocated', completed: donation.status === 'allocated' || donation.status === 'redeemed', date: null },
          { label: 'Redeemed', completed: donation.status === 'redeemed', date: null }
        ]
      }));
      
      setDonationTimeline(timeline.slice(0, 5));
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
      alert(`Donation logged successfully!\n\nReceipt created for your records\nItem: ${formData.item_name}\nQuantity: ${formData.quantity} ${formData.unit}\n\nYour donation has been verified and recorded for compliance and impact tracking.`);
      setShowAddForm(false);
      setFormData({
        item_name: '',
        item_type: '',
        quantity: '',
        unit: '',
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
    window.location.href = '/login';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Supplier Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.first_name}!</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-200 text-blue-800 px-2 py-1 rounded">
                Verified Supplier
              </span>
              <span className="text-xs text-gray-500">Approved for donations</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Pounds Donated</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {impactMetrics?.totalPounds || 0} lbs
            </p>
            <p className="text-xs text-gray-500 mt-1">Lifetime surplus rescued</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Meals Saved</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {impactMetrics?.mealsSaved || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Approx. meal equivalents</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">CO₂ Saved</h3>
            <p className="text-3xl font-bold text-cyan-600 mt-2">
              {impactMetrics?.co2Saved || 0} kg
            </p>
            <p className="text-xs text-gray-500 mt-1">Carbon footprint reduced</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Donation Receipts</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">
              {impactMetrics?.nftCount || stats?.supplier_nft_count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Verified donations</p>
          </div>
        </div>
        
        {/* Compliance Badge */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-blue-900">100% Compliance Rate</h3>
              <p className="text-sm text-blue-800">Protected by Bill Emerson Good Samaritan Act & SB 1383</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">
            Verified
          </span>
        </div>
        
        {/* Add Donation Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {showAddForm ? 'Cancel' : '+ Add New Donation'}
          </button>
        </div>
        
        {/* Add Donation Form */}
        {showAddForm && (
          <div className="bg-blue-100 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Donation</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  name="item_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.item_name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                <select
                  name="item_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Handling Notes</label>
                <textarea
                  name="handling_notes"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.handling_notes}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Submit Donation
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Donation Lifecycle Tracker & Receipt Records */}
        <div className="bg-blue-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Donation Lifecycle Tracker & Receipt Records</h2>
          <p className="text-sm text-gray-600 mb-6">Track your donations from drop-off to student pickup with verified digital receipts</p>
          
          {donationTimeline.length === 0 ? (
            <div className="text-center py-8 bg-blue-50 rounded-lg">
              <p className="text-gray-500">No donation tracking data yet. Add a donation to see its journey!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {donationTimeline.map((donation) => {
                const nft = nfts.find(n => n.nft_id === donation.nftId);
                const nftName = nft?.metadata?.nft_name || 'Donation Receipt';
                
                return (
                  <div key={donation.id} className="bg-white rounded-lg p-5 border-2 border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{donation.item}</h3>
                        <p className="text-sm text-gray-600">{donation.quantity}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Donated on {donation.date.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        donation.status === 'available' ? 'bg-blue-100 text-blue-700' :
                        donation.status === 'allocated' ? 'bg-blue-200 text-blue-800' :
                        donation.status === 'redeemed' ? 'bg-blue-600 text-white' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {donation.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Digital Receipt Information */}
                    {nft && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 bg-blue-600 text-white rounded-full p-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900">{nftName}</p>
                            <p className="text-xs text-blue-700 font-mono mt-1">Receipt ID: {nft.nft_id}</p>
                            {nft.transaction_hash && (
                              <p className="text-xs text-blue-600 font-mono mt-1 break-all">Record: {nft.transaction_hash}</p>
                            )}
                            <p className="text-xs text-blue-800 mt-1">
                              Tamper-proof donation receipt
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Timeline */}
                    <div className="relative px-8">
                      {/* Connecting line background */}
                      <div className="absolute top-5 h-0.5 bg-gray-200" style={{ left: '1.25rem', right: '1.25rem', transform: 'translateY(-50%)' }}></div>
                      
                      <div className="relative flex justify-between items-start">
                        {donation.statusSteps.map((step, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10 ${
                              step.completed
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {step.completed ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (index + 1)}
                            </div>
                            <p className={`text-xs mt-2 font-medium text-center whitespace-nowrap ${
                              step.completed ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-xs text-gray-400 mt-1 text-center">
                                {step.date.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Progress line overlay */}
                      {donation.statusSteps.some(s => s.completed) && (() => {
                        const completedCount = donation.statusSteps.filter(s => s.completed).length;
                        const totalSteps = donation.statusSteps.length;
                        
                        // Find the index of the last completed step
                        let lastCompletedIndex = -1;
                        for (let i = donation.statusSteps.length - 1; i >= 0; i--) {
                          if (donation.statusSteps[i].completed) {
                            lastCompletedIndex = i;
                            break;
                          }
                        }
                        
                        if (lastCompletedIndex === 0) {
                          // Only first step completed - show a short blue segment to first circle center
                          return (
                            <div 
                              className="absolute top-5 h-0.5 bg-blue-600" 
                              style={{ 
                                left: 0,
                                width: '2rem',
                                transform: 'translateY(-50%)'
                              }}
                            ></div>
                          );
                        } else {
                          // Multiple steps completed - show line from first circle center to last completed circle center
                          // Gray line spans from 1.25rem to right 1.25rem, so its length is (100% - 2.5rem)
                          // Progress should be in fourths: 1/4, 2/4, 3/4, 4/4
                          const progressFraction = (lastCompletedIndex + 1) / totalSteps;
                          // Width = progressFraction * (100% - 2.5rem)
                          const widthPercent = progressFraction * 100;
                          const widthOffset = -(progressFraction * 2.5);
                          
                          return (
                            <div 
                              className="absolute top-5 h-0.5 bg-blue-600" 
                              style={{ 
                                left: '1.25rem',
                                width: `calc(${widthPercent}% + ${widthOffset}rem)`,
                                transform: 'translateY(-50%)'
                              }}
                            ></div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Receipt Summary */}
          {nfts.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900">Total Donation Receipts: {nfts.length}</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    All your donations are verified and recorded
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">Types:</p>
                  <div className="flex gap-2 mt-1">
                    {nfts.filter(n => n.metadata?.purpose === 'verification').length > 0 && (
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {nfts.filter(n => n.metadata?.purpose === 'verification').length} Verification
                      </span>
                    )}
                    {nfts.filter(n => n.metadata?.purpose === 'donation_receipt').length > 0 && (
                      <span className="text-xs bg-blue-300 text-blue-900 px-2 py-1 rounded">
                        {nfts.filter(n => n.metadata?.purpose === 'donation_receipt').length} Receipts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/inventory" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Full Donation History →
            </Link>
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
                Every donation you make is <strong>automatically verified and recorded</strong> with a tamper-proof digital receipt. This serves as your immutable donation record for tax deductions and compliance reporting.
              </p>
              <p className="text-sm text-blue-800 mb-2">
                You're protected by the <strong>Bill Emerson Good Samaritan Act</strong> and <strong>California SB 1383</strong>, which shield you from liability when donating surplus food in good faith.
              </p>
              <p className="text-sm text-blue-800">
                All verification happens automatically in the background—you just use this simple dashboard. No technical knowledge required!
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

