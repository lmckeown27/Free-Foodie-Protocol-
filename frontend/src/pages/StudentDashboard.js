import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI, votingAPI, allocationAPI, nftAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import WalletConnect from '../components/WalletConnect';

const StudentDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [nfts, setNfts] = useState({ governance: 0, allocation: 0 });
  const [trending, setTrending] = useState([]);
  const [ffqTokens, setFfqTokens] = useState(100); // Custodial tokens managed by BNI
  const [claimHistory, setClaimHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, allocationsRes, nftsRes, trendingRes] = await Promise.all([
        inventoryAPI.getInventory({ limit: 10 }),
        allocationAPI.getMyAllocations(),
        nftAPI.getMyNFTs(),
        votingAPI.getTrending()
      ]);
      
      setInventory(inventoryRes.data.data);
      setAllocations(allocationsRes.data.data.filter(a => a.status === 'approved'));
      
      const governanceCount = nftsRes.data.data.filter(n => n.nft_type === 'governance').length;
      const allocationCount = nftsRes.data.data.filter(n => n.nft_type === 'allocation').length;
      setNfts({ governance: governanceCount, allocation: allocationCount });
      
      setTrending(trendingRes.data.data);
      
      // Mock claim history - in production, this would come from the backend
      setClaimHistory([
        { id: 1, item: 'Fresh Apples', quantity: '2 lbs', status: 'Confirmed', date: new Date() },
        { id: 2, item: 'Whole Grain Bread', quantity: '1 loaf', status: 'Ready for Pickup', date: new Date(Date.now() - 86400000) },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimItem = async (item) => {
    if (!bidAmount || bidAmount <= 0) {
      alert('Please enter a valid token amount');
      return;
    }
    
    if (bidAmount > ffqTokens) {
      alert('Insufficient FFQ tokens');
      return;
    }
    
    try {
      // In production, this would call the backend to process the claim via POAS
      alert(`Your claim is confirmed! You've bid ${bidAmount} tokens for ${item.item_name}.`);
      setFfqTokens(ffqTokens - bidAmount);
      setSelectedItem(null);
      setBidAmount('');
    } catch (error) {
      alert('Failed to process claim: ' + error.message);
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
            <h1 className="text-3xl font-bold text-primary-600">Free Foodie Quest</h1>
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
        {/* Cal Poly ID Badge */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cal Poly Student ID</p>
              <p className="text-2xl font-bold">{user.email?.split('@')[0]?.toUpperCase() || 'STUDENT'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Custodial Wallet</p>
              <p className="text-xs font-mono bg-white/20 px-3 py-1 rounded">Managed by BNI</p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">FFQ Tokens</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{ffqTokens}</p>
            <p className="text-xs text-gray-500 mt-1">Use to claim food</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Voting Power</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{nfts.governance}</p>
            <p className="text-xs text-gray-500 mt-1">Governance NFTs</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Claims</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{allocations.length}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to pick up</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Pickups</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{nfts.allocation}</p>
            <p className="text-xs text-gray-500 mt-1">Lifetime claims</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link
            to="/inventory"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-8 hover:from-primary-600 hover:to-primary-700 transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Browse Inventory</h2>
            <p className="text-primary-100">View available food items</p>
          </Link>
          
          <Link
            to="/voting"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Vote for Items</h2>
            <p className="text-blue-100">Earn Governance NFTs by voting</p>
          </Link>
        </div>
        
        {/* Available Food - Claim with Tokens */}
        <div className="bg-primary-100 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-primary-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Available Food</h2>
              <p className="text-sm text-gray-600">Real-time pantry inventory</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{ffqTokens}</p>
              <p className="text-xs text-gray-500">FFQ Tokens Available</p>
            </div>
          </div>
          <div className="p-6">
            {inventory.length === 0 ? (
              <p className="text-gray-500">No items available right now. Check back soon!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.slice(0, 6).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border-2 border-primary-200 p-4 hover:border-primary-400 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{item.item_name}</h3>
                        <p className="text-sm text-gray-600">{item.item_type}</p>
                        <p className="text-xs text-gray-500 mt-1">Available: {item.quantity} {item.unit}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {item.status}
                      </span>
                    </div>
                    {selectedItem?.id === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Token amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleClaimItem(item)}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                          >
                            Confirm Claim
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(null);
                              setBidAmount('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                      >
                        Claim with Tokens
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link to="/inventory" className="text-primary-600 hover:text-primary-700 font-medium">
                View Full Inventory →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Your Claims & Pickup Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Active Claims */}
          <div className="bg-primary-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-800">Active Claims</h2>
              <p className="text-sm text-gray-600">POAS-matched allocations</p>
            </div>
            <div className="p-6">
              {allocations.length === 0 ? (
                <p className="text-gray-500">No active claims yet. Claim some food above!</p>
              ) : (
                <div className="space-y-3">
                  {allocations.map((allocation) => (
                    <div key={allocation.id} className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{allocation.item_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {allocation.quantity} {allocation.unit}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium">
                          Confirmed
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        POAS Score: {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'} | Fair allocation via blockchain
                      </p>
                      <Link
                        to="/allocations"
                        className="block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Show QR for Pickup
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Claim History */}
          <div className="bg-primary-100 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <p className="text-sm text-gray-600">Your claim history</p>
            </div>
            <div className="p-6">
              {claimHistory.length === 0 ? (
                <p className="text-gray-500">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {claimHistory.map((claim) => (
                    <div key={claim.id} className="p-4 bg-white rounded-lg border border-primary-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{claim.item}</p>
                          <p className="text-sm text-gray-600">{claim.quantity}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          claim.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          claim.status === 'Ready for Pickup' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {claim.date.toLocaleDateString()} at {claim.date.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/allocations" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Full History →
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
              <h3 className="font-bold text-blue-900 mb-2">How FFQ Works</h3>
              <p className="text-sm text-blue-800 mb-2">
                Your FFQ tokens are stored in a <strong>custodial wallet managed by BNI</strong>. This means you don't need to worry about complicated crypto stuff.
              </p>
              <p className="text-sm text-blue-800">
                When you claim food, our <strong>POAS (Predicted Optimal Allocation Score)</strong> algorithm ensures fair distribution. Your claim is confirmed instantly, and all you need to do is show up to pick it up!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
        userRole="student" 
      />
    </div>
  );
};

export default StudentDashboard;

