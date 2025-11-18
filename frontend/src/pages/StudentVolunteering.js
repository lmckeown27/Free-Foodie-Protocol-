import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSidebar from '../components/RoleSidebar';

const StudentVolunteering = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [filter, setFilter] = useState('available');
  const [ticketBalance, setTicketBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOpportunities();
    fetchMySignups();
    fetchTicketBalance();
  }, [filter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockOpportunities = [
        {
          id: 1,
          title: 'Food Sorting & Packaging',
          description: 'Help sort and package fresh produce for distribution to the campus pantry',
          supplier_name: 'Campus Food Services',
          location: 'Campus Warehouse - Building C',
          hours_required: 3,
          spots_available: 5,
          spots_filled: 2,
          skills_needed: 'No experience required',
          start_date: '2025-11-20',
          end_date: '2025-11-20',
          ticket_reward: 1,
          status: 'available'
        },
        {
          id: 2,
          title: 'Delivery Driver Assistant',
          description: 'Assist with loading and unloading food deliveries from supplier trucks',
          supplier_name: 'Campus Food Services',
          location: 'Campus Pantry Loading Dock',
          hours_required: 4,
          spots_available: 3,
          spots_filled: 3,
          skills_needed: 'Must be able to lift 25+ lbs',
          start_date: '2025-11-21',
          end_date: '2025-11-21',
          ticket_reward: 1,
          status: 'full'
        },
        {
          id: 3,
          title: 'Inventory Management',
          description: 'Help organize and count inventory in the warehouse storage area',
          supplier_name: 'Local Grocery Co.',
          location: 'Main Warehouse',
          hours_required: 2,
          spots_available: 4,
          spots_filled: 1,
          skills_needed: 'Attention to detail, basic computer skills',
          start_date: '2025-11-22',
          end_date: '2025-11-22',
          ticket_reward: 1,
          status: 'available'
        },
        {
          id: 5,
          title: 'Fresh Produce Inspection',
          description: 'Inspect incoming fresh produce for quality and proper handling',
          supplier_name: 'Farm Fresh Suppliers',
          location: 'Receiving Area',
          hours_required: 3,
          spots_available: 2,
          spots_filled: 0,
          skills_needed: 'No experience required, training provided',
          start_date: '2025-11-23',
          end_date: '2025-11-23',
          ticket_reward: 1,
          status: 'available'
        },
        {
          id: 6,
          title: 'Community Outreach Event',
          description: 'Help staff our booth at the community food fair to promote food security',
          supplier_name: 'Campus Food Services',
          location: 'Student Union Plaza',
          hours_required: 5,
          spots_available: 8,
          spots_filled: 3,
          skills_needed: 'Friendly demeanor, communication skills',
          start_date: '2025-11-25',
          end_date: '2025-11-25',
          ticket_reward: 2,
          status: 'available'
        }
      ];

      let filtered = mockOpportunities;
      if (filter === 'available') {
        filtered = mockOpportunities.filter(opp => opp.status === 'available');
      } else if (filter === 'full') {
        filtered = mockOpportunities.filter(opp => opp.status === 'full');
      }
      
      setOpportunities(filtered);
    } catch (error) {
      console.error('Failed to fetch opportunities', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySignups = async () => {
    try {
      // Mock data for student's signups
      const mockSignups = [
        {
          id: 101,
          opportunity_id: 1,
          opportunity_title: 'Food Sorting & Packaging',
          start_date: '2025-11-20',
          hours_required: 3,
          status: 'upcoming',
          supplier_name: 'Campus Food Services'
        },
        {
          id: 102,
          opportunity_id: 4,
          opportunity_title: 'Community Food Drive',
          start_date: '2025-11-15',
          hours_required: 5,
          status: 'completed',
          completed_date: '2025-11-15',
          ticket_earned: true,
          supplier_name: 'Campus Food Services'
        }
      ];
      setMySignups(mockSignups);
    } catch (error) {
      console.error('Failed to fetch signups', error);
    }
  };

  const fetchTicketBalance = async () => {
    try {
      // Mock ticket balance
      setTicketBalance(3);
    } catch (error) {
      console.error('Failed to fetch ticket balance', error);
    }
  };

  const handleSignup = async (opportunityId) => {
    console.log('Signing up for opportunity:', opportunityId);
    // API call would go here
    alert('Successfully signed up for volunteering opportunity!');
    fetchOpportunities();
    fetchMySignups();
  };

  const handleCancelSignup = async (signupId) => {
    if (!window.confirm('Are you sure you want to cancel this signup?')) return;
    console.log('Cancelling signup:', signupId);
    // API call would go here
    fetchMySignups();
    fetchOpportunities();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleSidebar user={user} />
        <main className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RoleSidebar user={user} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Volunteering Opportunities</h1>
            <p className="text-gray-600 mt-1">Earn Allocation Tickets by volunteering with food suppliers</p>
          </div>

          {/* Allocation Tickets Balance Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm font-medium mb-1">Your Allocation Tickets</div>
                <div className="text-4xl font-bold">{ticketBalance}</div>
                <p className="text-purple-100 text-sm mt-2">
                  Use these tickets to request food from the Pantry
                </p>
              </div>
              <div className="text-right">
                <svg className="w-20 h-20 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info Banner - Two Ways to Earn */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2 text-lg">Two Ways to Earn Allocation Tickets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-1">1. Volunteer (This Page)</h4>
                    <p className="text-sm text-blue-800">
                      Sign up for and complete volunteer opportunities from Suppliers. Earn <strong>1-2 tickets per shift</strong> once the Pantry approves your completion.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-1">2. Vote on Proposals</h4>
                    <p className="text-sm text-purple-800">
                      Participate in governance proposals created by the Pantry. Earn <strong>1 ticket per vote</strong> automatically.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3 font-medium">
                  → Use your tickets to request food items from the Pantry!
                </p>
              </div>
            </div>
          </div>

          {/* My Signups Section */}
          {mySignups.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Volunteer Signups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySignups.map(signup => (
                  <div key={signup.id} className="bg-white border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{signup.opportunity_title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(signup.status)}`}>
                        {signup.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Supplier: {signup.supplier_name}</div>
                      <div>Date: {new Date(signup.start_date).toLocaleDateString()}</div>
                      <div>Hours: {signup.hours_required}</div>
                      {signup.ticket_earned && (
                        <div className="text-purple-600 font-semibold mt-2">
                          ✓ Allocation Ticket Earned!
                        </div>
                      )}
                    </div>
                    {signup.status === 'upcoming' && (
                      <button
                        onClick={() => handleCancelSignup(signup.id)}
                        className="mt-3 w-full px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition"
                      >
                        Cancel Signup
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Available Opportunities
            </button>
            <button
              onClick={() => setFilter('full')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'full'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
          </div>

          {/* Opportunities Grid */}
          {opportunities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities available</h3>
              <p className="text-gray-600">Check back soon for new volunteering opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map(opp => (
                <div key={opp.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{opp.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(opp.status)}`}>
                        {opp.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{opp.description}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">{opp.supplier_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600">{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">{new Date(opp.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">{opp.hours_required} hours</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <div className="text-xs text-gray-500">Spots Remaining</div>
                        <div className="font-bold text-gray-900">
                          {opp.spots_available - opp.spots_filled} of {opp.spots_available}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 text-right">Ticket Reward</div>
                        <div className="font-bold text-purple-600 text-lg">
                          +{opp.ticket_reward} Ticket{opp.ticket_reward > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {opp.skills_needed && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <strong>Skills:</strong> {opp.skills_needed}
                      </div>
                    )}

                    <button
                      onClick={() => handleSignup(opp.id)}
                      disabled={opp.status === 'full'}
                      className={`mt-4 w-full px-6 py-3 rounded-lg font-semibold transition ${
                        opp.status === 'full'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {opp.status === 'full' ? 'Fully Booked' : 'Sign Up to Volunteer'}
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

export default StudentVolunteering;

