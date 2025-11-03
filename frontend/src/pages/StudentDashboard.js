import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI, votingAPI, allocationAPI, nftAPI, poasAPI, volunteerAPI } from '../services/api';
import HowItWorksModal from '../components/HowItWorksModal';
import PickupQRCode from '../components/PickupQRCode';

const StudentDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [nfts, setNfts] = useState({ governance: 0, allocation: 0 });
  const [trending, setTrending] = useState([]);
  const [poasScore, setPoasScore] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
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
      
      // Fetch student's POAS score
      try {
        const poasRes = await poasAPI.getMyScore();
        setPoasScore(poasRes.data.data);
      } catch (poasError) {
        console.log('POAS score not available yet', poasError);
        setPoasScore(null);
      }
      
      // Fetch volunteer data
      try {
        const volunteerRes = await volunteerAPI.getMyHours();
        setVolunteerData(volunteerRes.data.data);
      } catch (volunteerError) {
        console.log('Volunteer data not available', volunteerError);
        setVolunteerData(null);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-primary-100 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-600">Free Foodie Quest</h1>
            <p className="text-sm text-gray-600">Welcome, {user.first_name}!</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowHowItWorks(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              How This Works
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition"
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
              <p className="text-xs font-mono bg-white/20 px-3 py-1 rounded">Managed by Basic Needs Initiative</p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Voting Power</h3>
            <p className="text-3xl font-bold text-primary-700 mt-2">{nfts.governance}</p>
            <p className="text-xs text-gray-500 mt-1">Governance NFTs</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Claims</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{allocations.length}</p>
            <p className="text-xs text-gray-500 mt-1">Ready to pick up</p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Pickups</h3>
            <p className="text-3xl font-bold text-primary-800 mt-2">{nfts.allocation}</p>
            <p className="text-xs text-gray-500 mt-1">Lifetime claims</p>
          </div>
          
          {/* Volunteer Stats Card */}
          <Link 
            to="/volunteer"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <h3 className="text-sm font-medium text-white opacity-90">Volunteer Hours</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {volunteerData?.summary?.verified_hours || 0}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white opacity-75">
                {volunteerData?.summary?.current_tier ? `${volunteerData.summary.current_tier.charAt(0).toUpperCase() + volunteerData.summary.current_tier.slice(1)} Tier` : 'Start volunteering!'}
              </p>
              <span className="text-white opacity-75 group-hover:opacity-100 transition">→</span>
            </div>
          </Link>
        </div>
        
        {/* POAS Score Display */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Your Allocation Priority Score</h2>
              <p className="text-sm opacity-90">Based on governance participation, volunteering, and need</p>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-4 rounded-lg">
              <p className="text-xs opacity-90 text-center">POAS Score</p>
              <p className="text-4xl font-bold">
                {poasScore?.poas_score ? Number(poasScore.poas_score).toFixed(1) : '—'}
              </p>
            </div>
          </div>
          
          {poasScore ? (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Governance (35%)</p>
                  <p className="text-lg font-bold">{poasScore.governance_participation ? Number(poasScore.governance_participation).toFixed(1) : '0.0'}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Volunteer (20%)</p>
                  <p className="text-lg font-bold">{poasScore.volunteer_contribution ? Number(poasScore.volunteer_contribution).toFixed(1) : '0.0'}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Need (20%)</p>
                  <p className="text-lg font-bold">{poasScore.need_factor ? Number(poasScore.need_factor).toFixed(1) : '0.0'}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Reliability (10%)</p>
                  <p className="text-lg font-bold">{poasScore.redemption_rate ? Number(poasScore.redemption_rate).toFixed(1) : '0.0'}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Recent Activity (10%)</p>
                  <p className="text-lg font-bold">{poasScore.recency ? Number(poasScore.recency).toFixed(1) : '0.0'}</p>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-2">
                  <p className="text-xs opacity-75">Equity (5%)</p>
                  <p className="text-lg font-bold">{poasScore.equity ? Number(poasScore.equity).toFixed(1) : '0.0'}</p>
                </div>
              </div>
              <p className="text-xs text-center opacity-90 mb-3">
                Higher scores = priority access. Improve your score by participating in governance and volunteering!
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/volunteer" className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition font-medium text-sm">
                  Log Volunteer Hours
                </Link>
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium text-sm" disabled>
                  View Governance (Coming Soon)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="text-center text-white/90 mb-3">
                Your POAS score will be calculated based on your governance participation, volunteer hours, and pickup reliability.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/volunteer" className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition font-medium text-sm">
                  Start Volunteering
                </Link>
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-medium text-sm" disabled>
                  View Governance (Coming Soon)
                </button>
              </div>
            </div>
          )}
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
            className="bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg shadow-lg p-8 hover:from-primary-500 hover:to-primary-600 transition transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2">Vote for Items</h2>
            <p className="text-primary-100">Earn Governance NFTs by voting</p>
          </Link>
        </div>
        
        {/* Available Food Inventory */}
        <div className="bg-primary-100 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-primary-200">
            <h2 className="text-xl font-semibold text-gray-800">Available Food</h2>
            <p className="text-sm text-gray-600">Real-time pantry inventory</p>
          </div>
          <div className="p-6">
            {inventory.length === 0 ? (
              <p className="text-gray-500">No items available right now. Check back soon!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.slice(0, 6).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border-2 border-primary-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.item_name}</h3>
                        <p className="text-sm text-gray-600">{item.item_type}</p>
                      </div>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Available: {item.quantity} {item.unit}</p>
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
                    <div key={allocation.id} className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{allocation.item_name}</p>
                          <p className="text-sm text-gray-600">Quantity: {allocation.quantity} {allocation.unit}</p>
                        </div>
                        <span className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium">
                          Confirmed
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        POAS Score: {allocation.poas_score ? Number(allocation.poas_score).toFixed(2) : 'N/A'} | Fair allocation via blockchain
                      </p>
                      <PickupQRCode allocation={allocation} student={user} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-primary-900 mb-2">How FFQ Works</h3>
              <p className="text-sm text-primary-800 mb-2">
                Your FFQ tokens are stored in a <strong>custodial wallet managed by the Basic Needs Initiative</strong>. This means you don't need to worry about complicated crypto stuff.
              </p>
              <p className="text-sm text-primary-800">
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

