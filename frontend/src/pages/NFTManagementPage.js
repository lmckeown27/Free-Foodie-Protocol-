import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { walletAPI } from '../services/api';

const NFTManagementPage = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get NFT type from URL
  const [custodialNFTs, setCustodialNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mintForm, setMintForm] = useState({
    userId: '',
    userEmail: '',
    nftType: '',
    metadata: {}
  });

  useEffect(() => {
    fetchAllNFTs();
  }, []);

  const fetchAllNFTs = async () => {
    try {
      setLoading(true);
      const nftsRes = await walletAPI.getCustodialNFTs();
      setCustodialNFTs(nftsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const nftCategories = [
    {
      type: 'governance',
      name: 'Governance NFTs',
      description: 'Voting rights for students',
      color: 'purple',
      icon: '',
      userType: 'Student',
      purpose: 'Grant voting power in governance proposals'
    },
    {
      type: 'allocation',
      name: 'Allocation NFTs',
      description: 'Food pickup tickets for students',
      color: 'green',
      icon: '',
      userType: 'Student',
      purpose: 'Authorize food pickup and claim rights'
    },
    {
      type: 'volunteer',
      name: 'Volunteer NFTs',
      description: 'Service badges for students',
      color: 'yellow',
      icon: '',
      userType: 'Student',
      purpose: 'Recognize volunteer contributions and milestones'
    },
    {
      type: 'supplier',
      name: 'Supplier NFTs',
      description: 'Donation receipts for suppliers',
      color: 'blue',
      icon: '',
      userType: 'Supplier',
      purpose: 'Verify donations and track impact'
    }
  ];

  // Filter categories based on type parameter
  const filteredCategories = type 
    ? nftCategories.filter(cat => cat.type === type)
    : nftCategories;

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        badge: 'bg-purple-600',
        hover: 'hover:bg-purple-100',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-600',
        hover: 'hover:bg-green-100',
        button: 'bg-green-600 hover:bg-green-700'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        badge: 'bg-yellow-600',
        hover: 'hover:bg-yellow-100',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-600',
        hover: 'hover:bg-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700'
      }
    };
    return colors[color];
  };

  const getNFTsByType = (type) => {
    return custodialNFTs.filter(nft => nft.nft_type === type);
  };

  const handleOpenMintModal = (category) => {
    setSelectedCategory(category);
    setMintForm({
      userId: '',
      userEmail: '',
      nftType: category.type,
      metadata: {}
    });
    setShowMintModal(true);
  };

  const handleMintNFT = async (e) => {
    e.preventDefault();
    try {
      alert(`Minting ${selectedCategory.name}...\n\nRecipient: ${mintForm.userEmail}\nType: ${mintForm.nftType}\n\nThis will trigger the Pantry's custodial wallet to mint the NFT.`);
      setShowMintModal(false);
      setMintForm({ userId: '', userEmail: '', nftType: '', metadata: {} });
      setSelectedCategory(null);
      await fetchAllNFTs();
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT');
    }
  };

  const handleRedeemNFT = async (nftId, nftType) => {
    if (window.confirm(`Are you sure you want to mark this ${nftType} NFT as redeemed?`)) {
      try {
        alert(`Redeeming NFT ${nftId}...\n\nThis would update the NFT status to 'redeemed' in the custodial wallet.`);
        await fetchAllNFTs();
      } catch (error) {
        console.error('Error redeeming NFT:', error);
        alert('Failed to redeem NFT');
      }
    }
  };

  const totalNFTs = custodialNFTs.length;
  const activeNFTs = custodialNFTs.filter(n => n.nft_status === 'active').length;
  const redeemedNFTs = custodialNFTs.filter(n => n.nft_status === 'redeemed').length;

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/pantry')}
                className="text-white hover:text-purple-200 mb-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">
                {type 
                  ? `${nftCategories.find(c => c.type === type)?.name || 'NFT'} Management`
                  : 'Master NFT Management'
                }
              </h1>
              <p className="text-sm text-purple-200 mt-1">
                {type
                  ? `Mint, monitor, and manage ${nftCategories.find(c => c.type === type)?.description || 'NFTs'}`
                  : 'Mint, monitor, and manage all custodial NFTs across 4 categories'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <p className="text-3xl font-bold text-purple-600">{totalNFTs}</p>
            <p className="text-sm text-gray-600 mt-1">Total NFTs in Custody</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <p className="text-3xl font-bold text-green-600">{activeNFTs}</p>
            <p className="text-sm text-gray-600 mt-1">Active NFTs</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-600">
            <p className="text-3xl font-bold text-gray-600">{redeemedNFTs}</p>
            <p className="text-sm text-gray-600 mt-1">Redeemed NFTs</p>
          </div>
        </div>

        {/* NFT Category Sections */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading NFTs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => {
              const colors = getColorClasses(category.color);
              const nfts = getNFTsByType(category.type);
              const activeCount = nfts.filter(n => n.nft_status === 'active').length;
              const redeemedCount = nfts.filter(n => n.nft_status === 'redeemed').length;

              return (
                <div key={category.type} className={`bg-white rounded-lg shadow-lg border-2 ${colors.border} overflow-hidden`}>
                  {/* Category Header */}
                  <div className={`${colors.bg} px-6 py-4 border-b-2 ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-xl font-bold ${colors.text}`}>{category.name}</h2>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <button
                        onClick={() => handleOpenMintModal(category)}
                        className={`${colors.button} text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Mint New
                      </button>
                    </div>
                  </div>

                  {/* Category Info Bar */}
                  <div className={`${colors.bg} px-6 py-3 flex items-center justify-between border-b ${colors.border}`}>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className={`text-2xl font-bold ${colors.text}`}>{nfts.length}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                        <p className="text-xs text-gray-600">Active</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-600">{redeemedCount}</p>
                        <p className="text-xs text-gray-600">Redeemed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 uppercase font-semibold">User Type</p>
                      <p className={`text-sm font-bold ${colors.text}`}>{category.userType}</p>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Purpose</p>
                    <p className="text-sm text-gray-700 mt-1">{category.purpose}</p>
                  </div>

                  {/* NFT List */}
                  {nfts.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-500">No {category.name.toLowerCase()} have been minted yet</p>
                      <button
                        onClick={() => handleOpenMintModal(category)}
                        className={`mt-4 ${colors.button} text-white px-6 py-2 rounded-lg font-semibold transition`}
                      >
                        Mint First NFT
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {nfts.slice(0, 5).map((nft) => (
                        <div key={nft.mapping_id} className={`px-6 py-4 ${colors.hover} transition`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${colors.badge}`}>
                                {nft.nft_type.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {nft.first_name} {nft.last_name}
                                </p>
                                <p className="text-xs text-gray-600">{nft.email}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">ID: {nft.nft_id.substring(0, 24)}...</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Minted</p>
                                <p className="text-sm text-gray-700">{new Date(nft.minted_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  nft.nft_status === 'active' ? 'bg-green-100 text-green-800' :
                                  nft.nft_status === 'redeemed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {nft.nft_status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => navigate(`/user/${nft.user_id}`)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition"
                              >
                                View User
                              </button>
                              <button
                                onClick={() => navigate(`/nft/${nft.nft_id}`)}
                                className={`${colors.text} hover:opacity-75 font-medium text-sm px-3 py-1 border ${colors.border} rounded hover:${colors.bg} transition`}
                              >
                                Details
                              </button>
                              {nft.nft_status === 'active' && category.type === 'allocation' && (
                                <button
                                  onClick={() => handleRedeemNFT(nft.nft_id, category.type)}
                                  className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
                                >
                                  Redeem
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {nfts.length > 5 && (
                        <div className={`px-6 py-3 ${colors.bg} text-center`}>
                          <p className="text-sm text-gray-600">
                            Showing 5 of {nfts.length} {category.name.toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Use filters above to view more</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mint Modal */}
      {showMintModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className={`${getColorClasses(selectedCategory.color).bg} px-6 py-4 border-b-2 ${getColorClasses(selectedCategory.color).border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCategory.icon}</span>
                  <h3 className={`text-lg font-bold ${getColorClasses(selectedCategory.color).text}`}>
                    Mint {selectedCategory.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowMintModal(false);
                    setSelectedCategory(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleMintNFT} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={mintForm.userEmail}
                  onChange={(e) => setMintForm({ ...mintForm, userEmail: e.target.value })}
                  placeholder={`${selectedCategory.userType} email address`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the {selectedCategory.userType.toLowerCase()}'s email to mint their NFT</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Type
                </label>
                <input
                  type="text"
                  value={selectedCategory.name}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedCategory.purpose}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMintModal(false);
                    setSelectedCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 ${getColorClasses(selectedCategory.color).button} text-white rounded-lg transition font-semibold`}
                >
                  Mint NFT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTManagementPage;
