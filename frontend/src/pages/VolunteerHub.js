import React, { useState, useEffect } from 'react';
import { volunteerAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const VolunteerHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('opportunities');
  const [myHours, setMyHours] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    activity_type: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const [hoursRes, opportunitiesRes, leaderboardRes] = await Promise.all([
        volunteerAPI.getMyHours(),
        volunteerAPI.getOpportunities(),
        volunteerAPI.getLeaderboard(10)
      ]);
      
      setMyHours(hoursRes.data.data);
      setOpportunities(opportunitiesRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
    } catch (error) {
      console.error('Failed to fetch volunteer data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await volunteerAPI.logHours(formData);
      alert('Volunteer hours logged successfully! Awaiting pantry verification.');
      setShowLogModal(false);
      setFormData({
        activity_type: '',
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchVolunteerData();
    } catch (error) {
      alert('Failed to log hours: ' + (error.response?.data?.error || error.message));
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { color: 'from-amber-700 to-amber-500', text: 'Bronze' },
      silver: { color: 'from-gray-400 to-gray-200', text: 'Silver' },
      gold: { color: 'from-yellow-500 to-yellow-300', text: 'Gold' },
      platinum: { color: 'from-amber-600 to-pink-400', text: 'Platinum' }
    };
    return tiers[tier] || { color: 'from-gray-500 to-gray-300', text: 'No Tier' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteer hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex">
      <StudentSidebar user={user} />
      
      <main className="flex-1 ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Hub</h1>
              <p className="text-gray-600 mt-1">Earn NFTs and boost your POAS score by volunteering</p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-md hover:shadow-lg transition"
            >
              + Log Volunteer Hours
          </button>
        </div>

        {/* Stats Overview */}
        {myHours && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 font-medium">Total Verified Hours</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{myHours.summary.verified_hours || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{myHours.summary.verified_sessions || 0} sessions</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 font-medium">Pending Hours</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{myHours.summary.pending_hours || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{myHours.summary.pending_sessions || 0} awaiting verification</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 font-medium">Current Tier</p>
              <div className="flex items-center mt-2">
                {myHours.summary.current_tier ? (
                  <>
                    <span className="text-2xl mr-2">{getTierInfo(myHours.summary.current_tier).icon}</span>
                    <span className="text-xl font-bold text-gray-900">
                      {getTierInfo(myHours.summary.current_tier).text}
                    </span>
                  </>
                ) : (
                  <span className="text-xl text-gray-500">No Tier Yet</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {myHours.summary.next_tier ? `${myHours.summary.progress_to_next}% to ${getTierInfo(myHours.summary.next_tier).text}` : 'Max tier reached!'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 font-medium">NFTs Earned</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{myHours.nfts.length}</p>
              <div className="flex gap-1 mt-2">
                {myHours.nfts.map((nft) => (
                  <span key={nft.id} className="text-xl" title={`${nft.tier} NFT`}>
                    {getTierInfo(nft.tier).icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar to Next Tier */}
        {myHours && myHours.summary.next_tier && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress to {getTierInfo(myHours.summary.next_tier).text} Tier
              </span>
              <span className="text-sm font-medium text-primary-600">
                {myHours.summary.verified_hours}/{myHours.tiers[myHours.summary.next_tier].hours} hours
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${myHours.summary.progress_to_next}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {myHours.tiers[myHours.summary.next_tier].benefits}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'opportunities'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('my-hours')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'my-hours'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Hours
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'leaderboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'benefits'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Benefits & Tiers
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'opportunities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                <p className="text-gray-600 mb-4">{opp.description}</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">Hours per Session:</span> {opp.hours_per_session}</p>
                  <p><span className="font-medium text-gray-700">Location:</span> {opp.location}</p>
                  <p><span className="font-medium text-gray-700">Days Available:</span> {opp.days_available.join(', ')}</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      activity_type: opp.title,
                      hours: opp.hours_per_session.toString()
                    });
                    setShowLogModal(true);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
                >
                  Sign Up
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-hours' && myHours && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myHours.hours.length > 0 ? (
                    myHours.hours.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.activity_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.hours} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {entry.description || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No volunteer hours logged yet. Start by signing up for an opportunity!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Volunteers</h2>
              <p className="text-sm text-gray-600 mt-1">Students making the biggest impact through volunteering</p>
            </div>
            <div className="divide-y divide-gray-200">
              {leaderboard.map((student, index) => {
                const tierInfo = student.highest_tier ? getTierInfo(student.highest_tier) : { color: 'from-gray-300 to-gray-100' };
                return (
                  <div key={student.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center text-xl font-bold text-white shadow-md`}>
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student.total_hours} hours • {student.sessions} sessions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {student.highest_tier && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">{tierInfo.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'benefits' && myHours && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">How Volunteering Benefits You</h2>
              <p className="text-lg mb-4">
                Volunteering doesn't just help the community—it directly improves your access to food through FFQ!
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Your POAS (Predicted Optimal Allocation Score) increases significantly with verified volunteer hours</li>
                <li>Higher POAS means you're prioritized when food becomes available</li>
                <li>Earn exclusive tier NFTs that unlock additional platform benefits</li>
                <li>Build a verifiable record of community contribution</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(myHours.tiers).map(([tier, info]) => {
                const tierInfo = getTierInfo(tier);
                const hasEarned = myHours.nfts.some(nft => nft.tier === tier);
                return (
                  <div key={tier} className={`bg-white rounded-lg shadow-md p-6 border-2 ${hasEarned ? 'border-primary-500' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{tierInfo.text} Tier</h3>
                      </div>
                      {hasEarned && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Required:</span> {info.hours} verified hours
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {info.benefits}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

      {/* Log Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Log Volunteer Hours</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
                <input
                  type="text"
                  required
                  value={formData.activity_type}
                  onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Food Pantry Sorting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 2.5"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 12 hours per session</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Briefly describe what you did..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
                >
                  Submit for Verification
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancel
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

export default VolunteerHub;

