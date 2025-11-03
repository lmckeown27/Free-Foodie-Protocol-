import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI, nftAPI } from '../services/api';

const NFTManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [custodialNFTs, setCustodialNFTs] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintForm, setMintForm] = useState({
    userId: '',
    nftType: 'governance',
    metadata: {}
  });

  useEffect(() => {
    fetchAllNFTs();
  }, []);

  useEffect(() => {
    filterNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custodialNFTs, searchTerm, selectedType, selectedStatus, activeTab]);

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

  const filterNFTs = () => {
    let filtered = [...custodialNFTs];

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(nft => nft.nft_type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.nft_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nft.calpoly_id && nft.calpoly_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(nft => nft.nft_type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(nft => nft.nft_status === selectedStatus);
    }

    setFilteredNFTs(filtered);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'governance':
        return { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' };
      case 'allocation':
        return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' };
      case 'volunteer':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' };
      case 'supplier':
        return { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-100' };
    }
  };

  const handleMintNFT = async (e) => {
    e.preventDefault();
    try {
      // This would call a mint NFT endpoint
      alert(`NFT minting initiated for user ${mintForm.userId}\nType: ${mintForm.nftType}\n\nThis would trigger the Pantry's multi-sig wallet to mint the NFT on Aptos.`);
      setShowMintModal(false);
      setMintForm({ userId: '', nftType: 'governance', metadata: {} });
      fetchAllNFTs();
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT');
    }
  };

  const nftTypeCounts = {
    all: custodialNFTs.length,
    governance: custodialNFTs.filter(n => n.nft_type === 'governance').length,
    allocation: custodialNFTs.filter(n => n.nft_type === 'allocation').length,
    volunteer: custodialNFTs.filter(n => n.nft_type === 'volunteer').length,
    supplier: custodialNFTs.filter(n => n.nft_type === 'supplier').length,
  };

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
              <h1 className="text-3xl font-bold text-white">NFT Management</h1>
              <p className="text-sm text-purple-200 mt-1">Mint and manage all custodial NFTs</p>
            </div>
            <button
              onClick={() => setShowMintModal(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Mint New NFT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-2 border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{nftTypeCounts.all}</p>
            <p className="text-xs text-gray-600">Total NFTs</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{nftTypeCounts.governance}</p>
            <p className="text-xs text-gray-600">Governance</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-green-200">
            <p className="text-2xl font-bold text-green-600">{nftTypeCounts.allocation}</p>
            <p className="text-xs text-gray-600">Allocation</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{nftTypeCounts.volunteer}</p>
            <p className="text-xs text-gray-600">Volunteer</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{nftTypeCounts.supplier}</p>
            <p className="text-xs text-gray-600">Supplier</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NFT Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="governance">Governance</option>
                <option value="allocation">Allocation</option>
                <option value="volunteer">Volunteer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="burned">Burned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['all', 'governance', 'allocation', 'volunteer', 'supplier'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab} ({tab === 'all' ? nftTypeCounts.all : nftTypeCounts[tab]})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* NFT List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading NFTs...</p>
            </div>
          ) : filteredNFTs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500">No NFTs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NFT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNFTs.map((nft) => {
                    const colors = getTypeColor(nft.nft_type);
                    return (
                      <tr key={nft.mapping_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${colors.bg}`}>
                              {nft.nft_type.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 capitalize">{nft.nft_type}</p>
                              <p className="text-xs text-gray-500 font-mono">{nft.nft_id.substring(0, 16)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {nft.first_name} {nft.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{nft.email}</p>
                            {nft.calpoly_id && (
                              <p className="text-xs text-purple-600 font-semibold">ID: {nft.calpoly_id}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(nft.minted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            nft.nft_status === 'active' ? 'bg-green-100 text-green-800' :
                            nft.nft_status === 'redeemed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {nft.nft_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/nft/${nft.nft_id}`)}
                              className="text-purple-600 hover:text-purple-900 font-medium"
                            >
                              View
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => navigate(`/user/${nft.user_id}`)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Owner
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredNFTs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredNFTs.length} of {custodialNFTs.length} NFTs
          </div>
        )}
      </main>

      {/* Mint NFT Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Mint New NFT</h3>
              <button
                onClick={() => setShowMintModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleMintNFT}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    required
                    value={mintForm.userId}
                    onChange={(e) => setMintForm({ ...mintForm, userId: e.target.value })}
                    placeholder="Enter user UUID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find user ID in the user detail page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NFT Type
                  </label>
                  <select
                    value={mintForm.nftType}
                    onChange={(e) => setMintForm({ ...mintForm, nftType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="governance">Governance NFT</option>
                    <option value="allocation">Allocation NFT</option>
                    <option value="volunteer">Volunteer NFT</option>
                    <option value="supplier">Supplier NFT</option>
                  </select>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900 font-semibold mb-1">
                    Multi-Sig Required
                  </p>
                  <p className="text-xs text-purple-700">
                    This action will create a transaction proposal requiring approval from the Pantry's multi-sig wallet signers before the NFT is minted on Aptos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMintModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create Mint Proposal
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

