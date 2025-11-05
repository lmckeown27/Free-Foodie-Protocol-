import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nftAPI } from '../services/api';
import RoleSidebar from '../components/RoleSidebar';

const MyCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const credentialsRes = await nftAPI.getMyNFTs();
      
      // Backend returns { success: true, data: [...] }, axios wraps in .data
      const credentialsData = credentialsRes.data?.data || [];
      
      setCredentials(Array.isArray(credentialsData) ? credentialsData : []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const getCredentialsByType = (type) => {
    if (type === 'all') return credentials;
    return credentials.filter(credential => credential.nft_type === type);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'redeemed': return 'bg-gray-100 text-gray-800';
      case 'burned': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCredentialIcon = (type) => {
    // Supplier receipts don't show icons
    if (type === 'supplier') {
      return null;
    }
    
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
      default:
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
    }
  };

  const getCredentialDisplayName = (credential) => {
    // For supplier credentials, use the unique name from metadata
    if (credential.nft_type === 'supplier' && credential.metadata?.nft_name) {
      return credential.metadata.nft_name;
    }
    // For other types, use user-friendly labels
    const labelMap = {
      'governance': 'Voting Rights',
      'allocation': 'Pickup Ticket',
      'volunteer': 'Service Badge',
      'supplier': 'Donation Receipt'
    };
    return labelMap[credential.nft_type] || credential.nft_type.charAt(0).toUpperCase() + credential.nft_type.slice(1);
  };

  const filteredCredentials = getCredentialsByType(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RoleSidebar />
      
      <main className="flex-1 ml-64 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Credentials & Records</h1>
            <p className="text-gray-600 mt-2">
              View all your verified credentials and achievements managed by the Pantry
            </p>
          </div>

        {/* Security Info */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 text-white rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg">Secure Record Keeping</h3>
              <p className="text-amber-800 text-sm mt-1">
                All your credentials and records are securely managed by the Pantry.
                You don't need to worry about losing anything—we handle everything for you!
              </p>
              <div className="mt-3 flex gap-4 text-xs text-amber-700">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tamper-Proof</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Always Accessible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{credentials.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Voting Rights</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {credentials.filter(c => c.nft_type === 'governance').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Pickup Tickets</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {credentials.filter(c => c.nft_type === 'allocation').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Service Badges</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {credentials.filter(c => c.nft_type === 'volunteer').length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'all', label: 'All' },
                { key: 'governance', label: 'Voting Rights' },
                { key: 'allocation', label: 'Pickup Tickets' },
                { key: 'volunteer', label: 'Service Badges' },
                { key: 'supplier', label: 'Receipts' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tab.key === 'all' ? credentials.length : getCredentialsByType(tab.key).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Credentials Grid */}
        {filteredCredentials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You don't have any credentials yet. Start participating to earn them!"
                : `You don't have any ${activeTab === 'governance' ? 'voting rights' : activeTab === 'allocation' ? 'pickup tickets' : activeTab === 'volunteer' ? 'service badges' : 'receipts'} yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((credential) => (
              <div key={credential.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Credential Header */}
                <div className={`p-6 ${
                  credential.nft_type === 'governance' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                  credential.nft_type === 'allocation' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  credential.nft_type === 'volunteer' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-blue-500 to-blue-600'
                } text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    {getCredentialIcon(credential.nft_type)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                      {credential.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{getCredentialDisplayName(credential)}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    Issued {new Date(credential.minted_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Credential Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Record ID</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{credential.nft_id}</p>
                    </div>
                    
                    {credential.metadata && typeof credential.metadata === 'object' && (
                      <>
                        {credential.metadata.tier && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Tier</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{credential.metadata.tier}</p>
                          </div>
                        )}
                        {credential.metadata.hours && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Hours Earned</p>
                            <p className="text-sm font-bold text-gray-900">{credential.metadata.hours} hours</p>
                          </div>
                        )}
                        {credential.metadata.quantity && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Quantity</p>
                            <p className="text-sm font-bold text-gray-900">{credential.metadata.quantity}</p>
                          </div>
                        )}
                      </>
                    )}

                    {credential.transaction_hash && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Transaction</p>
                        <p className="text-sm font-mono text-gray-900 truncate">{credential.transaction_hash}</p>
                      </div>
                    )}

                    {credential.burned_at && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Redeemed/Burned</p>
                        <p className="text-sm text-gray-900">{new Date(credential.burned_at).toLocaleDateString()}</p>
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
      </main>
    </div>
  );
};

export default MyCredentials;

