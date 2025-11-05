import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { inventoryAPI, votingAPI, allocationAPI, nftAPI, poasAPI, volunteerAPI } from '../services/api';
import PickupQRCode from '../components/PickupQRCode';
import StudentSidebar from '../components/StudentSidebar';

const StudentDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [credentials, setCredentials] = useState({ governance: 0, allocation: 0 });
  const [trending, setTrending] = useState([]);
  const [poasScore, setPoasScore] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, allocationsRes, credentialsRes, trendingRes] = await Promise.all([
        inventoryAPI.getInventory({ limit: 10 }),
        allocationAPI.getMyAllocations(),
        nftAPI.getMyNFTs(),
        votingAPI.getTrending()
      ]);
      
      setInventory(inventoryRes.data.data);
      setAllocations(allocationsRes.data.data.filter(a => a.status === 'approved'));
      
      const governanceCount = credentialsRes.data.data.filter(c => c.credential_type === 'governance' || c.nft_type === 'governance').length;
      const allocationCount = credentialsRes.data.data.filter(c => c.credential_type === 'allocation' || c.nft_type === 'allocation').length;
      setCredentials({ governance: governanceCount, allocation: allocationCount });
      
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-50 flex">
      <StudentSidebar user={user} />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
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
              <Link to="/my-food" className="text-primary-600 hover:text-primary-700 font-medium">
                View All My Food →
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
    </div>
  );
};

export default StudentDashboard;

