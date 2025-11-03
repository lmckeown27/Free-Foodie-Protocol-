import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';

const NFTDetailPage = () => {
  const { nftId } = useParams();
  const navigate = useNavigate();
  const [nftDetails, setNftDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNFTDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId]);

  const fetchNFTDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch all custodial NFTs and find this specific one
      const nftsRes = await walletAPI.getCustodialNFTs();
      const allNFTs = nftsRes.data?.data || [];
      
      // Find the specific NFT
      const nft = allNFTs.find(n => n.nft_id === nftId);
      
      if (!nft) {
        console.error('NFT not found');
        navigate('/pantry');
        return;
      }
      
      setNftDetails(nft);
      
    } catch (error) {
      console.error('Error fetching NFT details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NFT details...</p>
        </div>
      </div>
    );
  }

  if (!nftDetails) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">NFT not found</p>
          <button
            onClick={() => navigate('/pantry')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'governance':
        return 'purple';
      case 'allocation':
        return 'green';
      case 'volunteer':
        return 'yellow';
      case 'supplier':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const color = getTypeColor(nftDetails.nft_type);
  const metadata = nftDetails.metadata || {};

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="bg-purple-600 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/user/${nftDetails.user_id}`)}
                className="text-white hover:text-purple-200 mb-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to User Profile
              </button>
              <h1 className="text-3xl font-bold text-white">NFT Details</h1>
              <p className="text-sm text-purple-200 mt-1">Custodial asset managed by Pantry multi-sig wallet</p>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-${color}-500`}>
              {nftDetails.nft_type.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* NFT Overview Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{nftDetails.nft_type} NFT</h2>
              <p className="text-sm text-gray-600 mt-1">
                Minted on {new Date(nftDetails.minted_at).toLocaleString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              nftDetails.nft_status === 'active' ? 'bg-green-100 text-green-800' :
              nftDetails.nft_status === 'redeemed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {nftDetails.nft_status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Information */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Owner</h3>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {nftDetails.first_name} {nftDetails.last_name}
              </p>
              <p className="text-sm text-gray-600">{nftDetails.email}</p>
              {nftDetails.calpoly_id && (
                <p className="text-sm text-purple-600 font-semibold">Cal Poly ID: {nftDetails.calpoly_id}</p>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2 capitalize">
                {nftDetails.role}
              </span>
            </div>

            {/* Mapping Information */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Custodial Mapping</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Asset Type:</span> {nftDetails.asset_type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Mapping Status:</span>{' '}
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  nftDetails.mapping_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {nftDetails.mapping_status}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Mapped:</span> {new Date(nftDetails.mapped_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* NFT ID Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">NFT Identifier</h3>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <p className="text-xs text-gray-500 mb-1">NFT ID</p>
            <p className="font-mono text-sm text-gray-900 break-all">{nftDetails.nft_id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 mt-3">
            <p className="text-xs text-gray-500 mb-1">Asset Identifier (Same as NFT ID)</p>
            <p className="font-mono text-sm text-gray-900 break-all">{nftDetails.asset_identifier}</p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Blockchain Transaction</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-1">
                <p className="font-mono text-sm text-gray-900 break-all">{nftDetails.transaction_hash}</p>
              </div>
              <a
                href={`https://explorer.aptoslabs.com/txn/${nftDetails.transaction_hash}?network=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mt-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Aptos Explorer
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-500">Network</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Aptos Devnet</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-500">Contract Standard</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Aptos Token</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-500">Custodian</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">Pantry Multi-Sig</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">NFT Metadata</h3>
          {Object.keys(metadata).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No metadata available</p>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Type-Specific Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {nftDetails.nft_type.charAt(0).toUpperCase() + nftDetails.nft_type.slice(1)} NFT Information
          </h3>
          <div className="space-y-3">
            {nftDetails.nft_type === 'governance' && (
              <>
                <p className="text-sm text-gray-600">
                  This Governance NFT grants the holder voting rights in FFQ platform governance.
                  Each student receives one Governance NFT upon registration.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-900">Voting Power: 1 vote</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Proportional to student body (10% collective voting power)
                  </p>
                </div>
              </>
            )}
            
            {nftDetails.nft_type === 'allocation' && (
              <>
                <p className="text-sm text-gray-600">
                  This Allocation NFT represents a claim right for food distribution.
                  It is minted when a student is allocated food based on their POAS score.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-900">Claim Status: {nftDetails.nft_status}</p>
                  <p className="text-xs text-green-700 mt-1">
                    {nftDetails.nft_status === 'active' 
                      ? 'Ready for pickup - student can redeem at pantry'
                      : 'Already redeemed or burned'}
                  </p>
                </div>
              </>
            )}
            
            {nftDetails.nft_type === 'volunteer' && (
              <>
                <p className="text-sm text-gray-600">
                  This Volunteer NFT is a milestone reward for community service.
                  Students earn these for reaching volunteer hour thresholds.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900">Achievement Badge</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Contributes to POAS score (20% weight on volunteer contribution)
                  </p>
                </div>
              </>
            )}
            
            {nftDetails.nft_type === 'supplier' && (
              <>
                <p className="text-sm text-gray-600">
                  This Supplier NFT verifies the holder as an approved food donor.
                  It tracks donation history and compliance with food safety standards.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900">Verified Supplier Badge</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Grants 20% collective voting power in governance
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custodial Info Banner */}
        <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-800">
            <span className="font-semibold">Custodial Asset:</span> This NFT is held in the Pantry's multi-sig wallet on behalf of{' '}
            {nftDetails.first_name} {nftDetails.last_name}. The Pantry maintains custody for security, compliance, and ease of use.
            The user can view this NFT but all transactions require Pantry multi-sig approval.
          </p>
        </div>
      </main>
    </div>
  );
};

export default NFTDetailPage;

