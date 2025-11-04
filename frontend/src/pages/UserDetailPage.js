import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poasAPI, allocationAPI, volunteerAPI, nftAPI, walletAPI } from '../services/api';

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [poasScore, setPoasScore] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [volunteerData, setVolunteerData] = useState(null);
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch all user data from the custodial NFTs (includes user info)
      const nftsRes = await walletAPI.getCustodialNFTs();
      const allNFTs = nftsRes.data?.data || [];
      
      // Find this user's NFTs and extract user info
      const userNFTs = allNFTs.filter(nft => nft.user_id === userId);
      
      if (userNFTs.length === 0) {
        console.error('User not found');
        navigate('/pantry');
        return;
      }
      
      // Get user details from the first NFT
      const userInfo = {
        id: userNFTs[0].user_id,
        first_name: userNFTs[0].first_name,
        last_name: userNFTs[0].last_name,
        email: userNFTs[0].email,
        calpoly_id: userNFTs[0].calpoly_id,
        role: userNFTs[0].role
      };
      
      setUserDetails(userInfo);
      setNFTs(userNFTs);
      
      // If student, fetch additional data
      if (userInfo.role === 'student') {
        try {
          // Note: These endpoints would need to be updated to allow pantry to query for specific students
          // For now, we'll handle gracefully
          const [allocationsRes] = await Promise.all([
            allocationAPI.getAllocations({ student_id: userId }).catch(() => ({ data: { data: [] } }))
          ]);
          
          setAllocations(allocationsRes.data?.data || []);
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
      
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">User not found</p>
          <button
            onClick={() => navigate('/pantry')}
            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isStudent = userDetails.role === 'student';
  const isSupplier = userDetails.role === 'supplier';

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-600 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/pantry')}
                className="text-white hover:text-amber-200 mb-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">User Details</h1>
              <p className="text-sm text-amber-200 mt-1">Custodial account managed by Pantry</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                isStudent ? 'bg-green-500' :
                isSupplier ? 'bg-blue-500' :
                'bg-amber-500'
              }`}>
                {userDetails.first_name.charAt(0)}{userDetails.last_name.charAt(0)}
              </div>
              <div className="ml-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {userDetails.first_name} {userDetails.last_name}
                </h2>
                <p className="text-gray-600">{userDetails.email}</p>
                {userDetails.calpoly_id && (
                  <p className="text-amber-600 font-semibold mt-1">Cal Poly ID: {userDetails.calpoly_id}</p>
                )}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  isStudent ? 'bg-green-100 text-green-800' :
                  isSupplier ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NFTs in Custody */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">NFTs Held in Custody</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {nfts.filter(n => n.nft_type === 'governance').length}
              </p>
              <p className="text-xs text-gray-600">Governance NFTs</p>
            </div>
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {nfts.filter(n => n.nft_type === 'allocation').length}
              </p>
              <p className="text-xs text-gray-600">Allocation NFTs</p>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {nfts.filter(n => n.nft_type === 'volunteer').length}
              </p>
              <p className="text-xs text-gray-600">Volunteer NFTs</p>
            </div>
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {nfts.filter(n => n.nft_type === 'supplier').length}
              </p>
              <p className="text-xs text-gray-600">Supplier NFTs</p>
            </div>
          </div>

          {/* NFT List */}
          <div className="space-y-3">
            {nfts.map((nft) => (
              <div 
                key={nft.mapping_id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-amber-300 transition-all cursor-pointer"
                onClick={() => navigate(`/nft/${nft.nft_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      nft.nft_type === 'governance' ? 'bg-amber-500' :
                      nft.nft_type === 'allocation' ? 'bg-green-500' :
                      nft.nft_type === 'volunteer' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {nft.nft_type.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-gray-900 capitalize">{nft.nft_type} NFT</p>
                      <p className="text-xs text-gray-500 font-mono break-all">{nft.nft_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        nft.nft_status === 'active' ? 'bg-green-100 text-green-800' :
                        nft.nft_status === 'redeemed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {nft.nft_status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(nft.minted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nft/${nft.nft_id}`);
                      }}
                      className="text-amber-600 hover:text-amber-900 font-medium text-sm whitespace-nowrap"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocations (Students Only) */}
        {isStudent && allocations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Food Allocations</h3>
            <div className="space-y-3">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{allocation.item_name}</p>
                      <p className="text-sm text-gray-600">{allocation.item_type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Allocated: {new Date(allocation.allocation_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {allocation.quantity} {allocation.unit}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        allocation.status === 'redeemed' ? 'bg-green-100 text-green-800' :
                        allocation.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {allocation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-800">
            All assets displayed are held in the Pantry's multi-sig custodial wallet on behalf of this user.
            The user can view their assets but the Pantry maintains custody for security and compliance.
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserDetailPage;

