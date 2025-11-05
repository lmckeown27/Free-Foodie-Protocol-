import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { walletAPI } from '../services/api';
import PantrySidebar from '../components/PantrySidebar';

const CredentialManagementPage = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get credential type from URL
  const [custodialCredentials, setCustodialCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [issueForm, setIssueForm] = useState({
    userId: '',
    userEmail: '',
    credentialType: '',
    metadata: {}
  });

  useEffect(() => {
    fetchAllCredentials();
  }, []);

  const fetchAllCredentials = async () => {
    try {
      setLoading(true);
      const credentialsRes = await walletAPI.getCustodialNFTs();
      setCustodialCredentials(credentialsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const credentialCategories = [
    {
      type: 'governance',
      name: 'Voting Rights',
      description: 'Governance credentials for students',
      color: 'amber',
      icon: '',
      userType: 'Student',
      purpose: 'Grant voting power in governance proposals'
    },
    {
      type: 'allocation',
      name: 'Pickup Tickets',
      description: 'Food pickup credentials for students',
      color: 'green',
      icon: '',
      userType: 'Student',
      purpose: 'Authorize food pickup and claim rights'
    },
    {
      type: 'volunteer',
      name: 'Service Badges',
      description: 'Volunteer credentials for students',
      color: 'yellow',
      icon: '',
      userType: 'Student',
      purpose: 'Recognize volunteer contributions and milestones'
    },
    {
      type: 'supplier',
      name: 'Donation Receipts',
      description: 'Verification credentials for suppliers',
      color: 'blue',
      icon: '',
      userType: 'Supplier',
      purpose: 'Verify donations and track impact'
    }
  ];

  // Filter categories based on type parameter
  const filteredCategories = type 
    ? credentialCategories.filter(cat => cat.type === type)
    : credentialCategories;

  const getColorClasses = (color) => {
    const colors = {
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-600',
        hover: 'hover:bg-amber-100',
        button: 'bg-amber-600 hover:bg-amber-700'
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

  const getCredentialsByType = (type) => {
    return custodialCredentials.filter(cred => cred.nft_type === type);
  };

  const handleOpenIssueModal = (category) => {
    setSelectedCategory(category);
    setIssueForm({
      userId: '',
      userEmail: '',
      credentialType: category.type,
      metadata: {}
    });
    setShowIssueModal(true);
  };

  const handleIssueCredential = async (e) => {
    e.preventDefault();
    try {
      alert(`Issuing ${selectedCategory.name}...\n\nRecipient: ${issueForm.userEmail}\nType: ${issueForm.credentialType}\n\nThis will trigger the Pantry's custodial wallet to issue the credential.`);
      setShowIssueModal(false);
      setIssueForm({ userId: '', userEmail: '', credentialType: '', metadata: {} });
      setSelectedCategory(null);
      await fetchAllCredentials();
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('Failed to issue credential');
    }
  };

  const handleRedeemCredential = async (credId, credType) => {
    if (window.confirm(`Are you sure you want to mark this ${credType} credential as redeemed?`)) {
      try {
        alert(`Redeeming credential ${credId}...\n\nThis would update the credential status to 'redeemed' in the custodial wallet.`);
        await fetchAllCredentials();
      } catch (error) {
        console.error('Error redeeming credential:', error);
        alert('Failed to redeem credential');
      }
    }
  };

  const totalCredentials = custodialCredentials.length;
  const activeCredentials = custodialCredentials.filter(n => n.nft_status === 'active').length;
  const redeemedCredentials = custodialCredentials.filter(n => n.nft_status === 'redeemed').length;

  return (
    <div className="min-h-screen bg-amber-50 flex">
      <PantrySidebar user={user} />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {type 
                    ? `${credentialCategories.find(c => c.type === type)?.name || 'Credential'} Management`
                    : 'Master Credential Management'
                }
              </h1>
              <p className="text-sm text-amber-200 mt-1">
                {type
                  ? `Issue, monitor, and manage ${credentialCategories.find(c => c.type === type)?.description || 'credentials'}`
                  : 'Issue, monitor, and manage all custodial credentials across 4 categories'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-600">
            <p className="text-3xl font-bold text-amber-600">{totalCredentials}</p>
            <p className="text-sm text-gray-600 mt-1">Total Credentials in Custody</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <p className="text-3xl font-bold text-green-600">{activeCredentials}</p>
            <p className="text-sm text-gray-600 mt-1">Active Credentials</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-600">
            <p className="text-3xl font-bold text-gray-600">{redeemedCredentials}</p>
            <p className="text-sm text-gray-600 mt-1">Redeemed Credentials</p>
          </div>
        </div>

        {/* Credential Category Sections */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading credentials...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => {
              const colors = getColorClasses(category.color);
              const credentials = getCredentialsByType(category.type);
              const activeCount = credentials.filter(n => n.nft_status === 'active').length;
              const redeemedCount = credentials.filter(n => n.nft_status === 'redeemed').length;

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
                        onClick={() => handleOpenIssueModal(category)}
                        className={`${colors.button} text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Issue New
                      </button>
                    </div>
                  </div>

                  {/* Category Info Bar */}
                  <div className={`${colors.bg} px-6 py-3 flex items-center justify-between border-b ${colors.border}`}>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className={`text-2xl font-bold ${colors.text}`}>{credentials.length}</p>
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

                  {/* Credential List */}
                  {credentials.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-500">No {category.name.toLowerCase()} have been issued yet</p>
                      <button
                        onClick={() => handleOpenIssueModal(category)}
                        className={`mt-4 ${colors.button} text-white px-6 py-2 rounded-lg font-semibold transition`}
                      >
                        Issue First Credential
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {credentials.slice(0, 5).map((cred) => (
                        <div key={cred.mapping_id} className={`px-6 py-4 ${colors.hover} transition`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${colors.badge}`}>
                                {cred.nft_type.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {cred.first_name} {cred.last_name}
                                </p>
                                <p className="text-xs text-gray-600">{cred.email}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1 break-all">ID: {cred.nft_id}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Issued</p>
                                <p className="text-sm text-gray-700">{new Date(cred.minted_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  cred.nft_status === 'active' ? 'bg-green-100 text-green-800' :
                                  cred.nft_status === 'redeemed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {cred.nft_status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => navigate(`/user/${cred.user_id}`)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition"
                              >
                                View User
                              </button>
                              <button
                                onClick={() => navigate(`/nft/${cred.nft_id}`)}
                                className={`${colors.text} hover:opacity-75 font-medium text-sm px-3 py-1 border ${colors.border} rounded hover:${colors.bg} transition`}
                              >
                                Details
                              </button>
                              {cred.nft_status === 'active' && category.type === 'allocation' && (
                                <button
                                  onClick={() => handleRedeemCredential(cred.nft_id, category.type)}
                                  className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
                                >
                                  Redeem
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {credentials.length > 5 && (
                        <div className={`px-6 py-3 ${colors.bg} text-center`}>
                          <p className="text-sm text-gray-600">
                            Showing 5 of {credentials.length} {category.name.toLowerCase()}
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

      {/* Issue Modal */}
      {showIssueModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className={`${getColorClasses(selectedCategory.color).bg} px-6 py-4 border-b-2 ${getColorClasses(selectedCategory.color).border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCategory.icon}</span>
                  <h3 className={`text-lg font-bold ${getColorClasses(selectedCategory.color).text}`}>
                    Issue {selectedCategory.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowIssueModal(false);
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
            <form onSubmit={handleIssueCredential} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={issueForm.userEmail}
                  onChange={(e) => setIssueForm({ ...issueForm, userEmail: e.target.value })}
                  placeholder={`${selectedCategory.userType} email address`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the {selectedCategory.userType.toLowerCase()}'s email to issue their credential</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential Type
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
                    setShowIssueModal(false);
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
                  Issue Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default CredentialManagementPage;
