import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nftAPI, walletAPI } from '../services/api';

const MyNFTs = () => {
  const [nfts, setNFTs] = useState([]);
  const [custodialAssets, setCustodialAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const [nftsRes, assetsRes] = await Promise.all([
        nftAPI.getMyNFTs(),
        walletAPI.getMyAssets()
      ]);
      
      setNFTs(nftsRes.data || []);
      setCustodialAssets(assetsRes.data || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNFTsByType = (type) => {
    if (type === 'all') return nfts;
    return nfts.filter(nft => nft.nft_type === type);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'redeemed': return 'bg-gray-100 text-gray-800';
      case 'burned': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getNFTIcon = (type) => {
    switch (type) {
      case 'governance':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'allocation':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'volunteer':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'supplier':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
    }
  };

  const getNFTTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' NFT';
  };

  const filteredNFTs = getNFTsByType(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={user.role === 'student' ? '/student' : '/supplier'} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My NFT Collection</h1>
          <p className="text-gray-600 mt-2">
            View all your blockchain-verified digital assets held in the Pantry's custodial wallet
          </p>
        </div>

        {/* Custodial Wallet Info */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 text-white rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 text-lg">Custodial Wallet Protection</h3>
              <p className="text-purple-800 text-sm mt-1">
                All your NFTs are securely held in the Pantry's multi-sig custodial wallet on Aptos blockchain.
                You don't need to manage private keys or pay gas fees—we handle everything for you!
              </p>
              <div className="mt-3 flex gap-4 text-xs text-purple-700">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multi-sig Security</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No Gas Fees</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Aptos Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total NFTs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{nfts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Governance NFTs</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {nfts.filter(n => n.nft_type === 'governance').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Allocation NFTs</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {nfts.filter(n => n.nft_type === 'allocation').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Volunteer NFTs</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {nfts.filter(n => n.nft_type === 'volunteer').length}
            </p>
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
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tab === 'all' ? nfts.length : getNFTsByType(tab).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* NFT Grid */}
        {filteredNFTs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You don't have any NFTs yet. Start participating to earn them!"
                : `You don't have any ${activeTab} NFTs yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNFTs.map((nft) => (
              <div key={nft.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* NFT Header */}
                <div className={`p-6 ${
                  nft.nft_type === 'governance' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  nft.nft_type === 'allocation' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  nft.nft_type === 'volunteer' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-blue-500 to-blue-600'
                } text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    {getNFTIcon(nft.nft_type)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(nft.status)}`}>
                      {nft.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{getNFTTypeLabel(nft.nft_type)}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    Minted {new Date(nft.minted_at).toLocaleDateString()}
                  </p>
                </div>

                {/* NFT Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">NFT ID</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{nft.nft_id}</p>
                    </div>
                    
                    {nft.metadata && typeof nft.metadata === 'object' && (
                      <>
                        {nft.metadata.tier && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Tier</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{nft.metadata.tier}</p>
                          </div>
                        )}
                        {nft.metadata.hours && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Hours Earned</p>
                            <p className="text-sm font-bold text-gray-900">{nft.metadata.hours} hours</p>
                          </div>
                        )}
                        {nft.metadata.quantity && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Quantity</p>
                            <p className="text-sm font-bold text-gray-900">{nft.metadata.quantity}</p>
                          </div>
                        )}
                        {nft.metadata.poas_score && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">POAS Score</p>
                            <p className="text-sm font-bold text-gray-900">{nft.metadata.poas_score}</p>
                          </div>
                        )}
                      </>
                    )}

                    {nft.transaction_hash && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Transaction</p>
                        <p className="text-sm font-mono text-gray-900 truncate">{nft.transaction_hash}</p>
                      </div>
                    )}

                    {nft.burned_at && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Redeemed/Burned</p>
                        <p className="text-sm text-gray-900">{new Date(nft.burned_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* View on Blockchain */}
                  <button className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                    View on Aptos Explorer →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNFTs;

