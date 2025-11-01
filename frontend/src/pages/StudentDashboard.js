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
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, allocationsRes, nftsRes, trendingRes] = await Promise.all([
        inventoryAPI.getInventory({ limit: 5 }),
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
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Governance NFTs</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{nfts.governance}</p>
            <p className="text-xs text-gray-500 mt-1">Earned from voting</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Allocations</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{allocations.length}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to redeem</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Allocation NFTs</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{nfts.allocation}</p>
            <p className="text-xs text-gray-500 mt-1">Total received</p>
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
        
        {/* Trending Items */}
        <div className="bg-primary-100 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-primary-200">
            <h2 className="text-xl font-semibold text-gray-800">Trending Items</h2>
          </div>
          <div className="p-6">
            {trending.length === 0 ? (
              <p className="text-gray-500">No trending items yet. Be the first to vote!</p>
            ) : (
              <div className="space-y-3">
                {trending.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{item.item_name || item.item_type}</p>
                      <p className="text-sm text-gray-500">{item.item_type}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {item.vote_count} votes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Active Allocations */}
        <div className="bg-primary-100 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-primary-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Active Allocations</h2>
          </div>
          <div className="p-6">
            {allocations.length === 0 ? (
              <p className="text-gray-500">No active allocations. Keep voting to earn allocations!</p>
            ) : (
              <div className="space-y-3">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-gray-800">{allocation.item_name}</p>
                      <p className="text-sm text-gray-600">Quantity: {allocation.quantity} {allocation.unit}</p>
                      <p className="text-xs text-gray-500">
                        POAS Score: {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <Link
                      to="/allocations"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Redeem
                    </Link>
                  </div>
                ))}
              </div>
            )}
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

