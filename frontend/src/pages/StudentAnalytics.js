import React, { useState, useEffect } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import { allocationAPI, votingAPI, volunteerAPI } from '../services/api';

const StudentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // For now, using mock data. Replace with real API calls later
      const mockData = {
        personal: {
          totalAllocations: 12,
          redeemedAllocations: 10,
          totalVotes: 8,
          volunteerHours: 15,
          governanceCredentials: 3,
          pickupTickets: 10,
          volunteerBadges: 2
        },
        participation: {
          thisMonth: {
            votes: 3,
            allocations: 4,
            volunteerHours: 5
          },
          lastMonth: {
            votes: 2,
            allocations: 3,
            volunteerHours: 6
          },
          trend: {
            votes: '+50%',
            allocations: '+33%',
            volunteerHours: '-17%'
          }
        },
        foodImpact: {
          totalPoundsReceived: 45.3,
          mealsEquivalent: 36,
          co2Saved: 23.5,
          wasteReduced: 45.3
        },
        votingHistory: [
          { month: 'Nov', votes: 3 },
          { month: 'Oct', votes: 2 },
          { month: 'Sep', votes: 1 },
          { month: 'Aug', votes: 2 }
        ],
        allocationHistory: [
          { month: 'Nov', allocations: 4, redeemed: 4 },
          { month: 'Oct', allocations: 3, redeemed: 3 },
          { month: 'Sep', allocations: 2, redeemed: 2 },
          { month: 'Aug', allocations: 3, redeemed: 1 }
        ],
        topCategories: [
          { category: 'Fresh Produce', count: 5, percentage: 42 },
          { category: 'Dairy', count: 3, percentage: 25 },
          { category: 'Bakery', count: 2, percentage: 17 },
          { category: 'Protein', count: 2, percentage: 16 }
        ],
        recentActivity: [
          { date: '2024-11-20', type: 'allocation', description: 'Received 2 lbs Fresh Apples', status: 'redeemed' },
          { date: '2024-11-18', type: 'vote', description: 'Voted on "More Organic Options"', status: 'completed' },
          { date: '2024-11-15', type: 'volunteer', description: 'Volunteered 3 hours at pantry', status: 'verified' },
          { date: '2024-11-12', type: 'allocation', description: 'Received 1 gallon Milk', status: 'redeemed' },
          { date: '2024-11-10', type: 'vote', description: 'Voted on "Weekend Hours Extension"', status: 'completed' }
        ],
        goals: {
          nextTier: 'Silver',
          currentHours: 15,
          requiredHours: 20,
          progressPercentage: 75,
          benefits: 'Priority notifications, Special volunteer badge'
        }
      };

      setAnalytics(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StudentSidebar user={user} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <StudentSidebar user={user} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-xl text-gray-600">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar user={user} />
      
      <main className="flex-1 ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Track your participation and impact on the Free Foodie Quest platform</p>
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Credentials</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.personal.governanceCredentials + analytics.personal.pickupTickets + analytics.personal.volunteerBadges}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">NFTs earned</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Allocations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.personal.totalAllocations}</p>
                  <p className="text-xs text-green-600 mt-1">{analytics.personal.redeemedAllocations} redeemed</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Governance Votes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.personal.totalVotes}</p>
                  <p className="text-xs text-blue-600 mt-1">{analytics.personal.governanceCredentials} credentials earned</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.personal.volunteerHours}</p>
                  <p className="text-xs text-amber-600 mt-1">{analytics.personal.volunteerBadges} badges</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Participation Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Votes Cast</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{analytics.participation.thisMonth.votes}</span>
                    <span className="text-xs text-green-600 font-medium">{analytics.participation.trend.votes}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Allocations</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{analytics.participation.thisMonth.allocations}</span>
                    <span className="text-xs text-green-600 font-medium">{analytics.participation.trend.allocations}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Volunteer Hours</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{analytics.participation.thisMonth.volunteerHours}</span>
                    <span className="text-xs text-red-600 font-medium">{analytics.participation.trend.volunteerHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Impact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Pounds Received</p>
                  <p className="text-2xl font-bold text-primary-600">{analytics.foodImpact.totalPoundsReceived} lbs</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Meals Equivalent</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.foodImpact.mealsEquivalent} meals</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">CO₂ Emissions Saved</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.foodImpact.co2Saved} lbs</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Waste Reduced</p>
                  <p className="text-2xl font-bold text-amber-600">{analytics.foodImpact.wasteReduced} lbs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Voting History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting History</h3>
              <div className="space-y-3">
                {analytics.votingHistory.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">{item.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                      <div 
                        className="bg-primary-500 h-8 rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${(item.votes / 5) * 100}%` }}
                      >
                        <span className="text-white text-sm font-medium">{item.votes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation History</h3>
              <div className="space-y-3">
                {analytics.allocationHistory.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">{item.month}</span>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        <div 
                          className="bg-green-500 h-8 rounded-l-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${(item.redeemed / 5) * 100}%` }}
                        >
                          {item.redeemed > 0 && item.redeemed}
                        </div>
                        <div 
                          className="bg-gray-300 h-8 rounded-r-full flex items-center justify-center text-gray-700 text-xs font-medium"
                          style={{ width: `${((item.allocations - item.redeemed) / 5) * 100}%` }}
                        >
                          {item.allocations - item.redeemed > 0 && (item.allocations - item.redeemed)}
                        </div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Redeemed: {item.redeemed}</span>
                        <span>Missed: {item.allocations - item.redeemed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Categories & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Food Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Food Categories</h3>
              <div className="space-y-4">
                {analytics.topCategories.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.count} items ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === 'allocation' ? 'bg-green-500' :
                      activity.type === 'vote' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'redeemed' ? 'bg-green-100 text-green-700' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Progress to {analytics.goals.nextTier} Tier</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Volunteer Hours</span>
                <span className="text-sm font-medium">{analytics.goals.currentHours} / {analytics.goals.requiredHours} hours</span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-4">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${analytics.goals.progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-primary-700 rounded-lg p-4">
              <p className="text-sm font-medium mb-1">Benefits on reaching {analytics.goals.nextTier}:</p>
              <p className="text-sm opacity-90">{analytics.goals.benefits}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAnalytics;

