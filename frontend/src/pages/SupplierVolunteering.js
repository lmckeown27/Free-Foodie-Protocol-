import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSidebar from '../components/RoleSidebar';

const SupplierVolunteering = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Form state for creating opportunities
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    hours_required: '',
    spots_available: '',
    skills_needed: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockOpportunities = [
        {
          id: 1,
          title: 'Food Sorting & Packaging',
          description: 'Help sort and package fresh produce for distribution to the campus pantry',
          location: 'Campus Warehouse - Building C',
          hours_required: 3,
          spots_available: 5,
          spots_filled: 2,
          skills_needed: 'No experience required',
          start_date: '2025-11-20',
          end_date: '2025-11-20',
          status: 'active',
          signups: [
            { id: 1, student_name: 'Emily Chen', student_email: 'emily@university.edu', signup_date: '2025-11-18' },
            { id: 2, student_name: 'Marcus Johnson', student_email: 'marcus@university.edu', signup_date: '2025-11-17' }
          ]
        },
        {
          id: 2,
          title: 'Delivery Driver Assistant',
          description: 'Assist with loading and unloading food deliveries from supplier trucks',
          location: 'Campus Pantry Loading Dock',
          hours_required: 4,
          spots_available: 3,
          spots_filled: 3,
          skills_needed: 'Must be able to lift 25+ lbs',
          start_date: '2025-11-21',
          end_date: '2025-11-21',
          status: 'active',
          signups: [
            { id: 3, student_name: 'Sarah Martinez', student_email: 'sarah@university.edu', signup_date: '2025-11-18' },
            { id: 4, student_name: 'David Kim', student_email: 'david@university.edu', signup_date: '2025-11-18' },
            { id: 5, student_name: 'Alex Thompson', student_email: 'alex@university.edu', signup_date: '2025-11-19' }
          ]
        },
        {
          id: 3,
          title: 'Inventory Management',
          description: 'Help organize and count inventory in the warehouse storage area',
          location: 'Main Warehouse',
          hours_required: 2,
          spots_available: 4,
          spots_filled: 1,
          skills_needed: 'Attention to detail, basic computer skills',
          start_date: '2025-11-22',
          end_date: '2025-11-22',
          status: 'active',
          signups: [
            { id: 6, student_name: 'Kate Martin', student_email: 'kate@university.edu', signup_date: '2025-11-19' }
          ]
        },
        {
          id: 4,
          title: 'Community Food Drive',
          description: 'Staff the collection table at the campus community food drive event',
          location: 'Student Union',
          hours_required: 5,
          spots_available: 6,
          spots_filled: 6,
          skills_needed: 'Friendly demeanor, communication skills',
          start_date: '2025-11-15',
          end_date: '2025-11-15',
          status: 'completed',
          signups: [
            { id: 7, student_name: 'Lisa Wong', student_email: 'lisa@university.edu', signup_date: '2025-11-10', completed: true },
            { id: 8, student_name: 'James Brown', student_email: 'james@university.edu', signup_date: '2025-11-11', completed: true },
            { id: 9, student_name: 'Nina Patel', student_email: 'nina@university.edu', signup_date: '2025-11-12', completed: true },
            { id: 10, student_name: 'Tom Wilson', student_email: 'tom@university.edu', signup_date: '2025-11-13', completed: true },
            { id: 11, student_name: 'Rachel Green', student_email: 'rachel@university.edu', signup_date: '2025-11-13', completed: true },
            { id: 12, student_name: 'Mike Ross', student_email: 'mike@university.edu', signup_date: '2025-11-14', completed: true }
          ]
        }
      ];
      
      let filtered = mockOpportunities;
      if (filter !== 'all') {
        filtered = mockOpportunities.filter(opp => opp.status === filter);
      }
      
      setOpportunities(filtered);
    } catch (error) {
      console.error('Failed to fetch opportunities', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    console.log('Creating opportunity:', formData);
    // API call would go here
    setShowCreateModal(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      hours_required: '',
      spots_available: '',
      skills_needed: '',
      start_date: '',
      end_date: ''
    });
    fetchOpportunities();
  };

  const handleMarkComplete = async (opportunityId, studentSignupId) => {
    console.log('Marking complete:', { opportunityId, studentSignupId });
    // API call to mark volunteer work complete and notify Pantry
    // Pantry will receive notification and decide whether to issue ticket
    alert('Completion notification sent to Pantry for review');
    fetchOpportunities();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Volunteering Opportunities</h1>
              <p className="text-gray-600 mt-1">Create and manage volunteer opportunities for students</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              + Create Opportunity
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-1">Volunteer Completion Notifications</h3>
                <p className="text-sm text-purple-800">
                  When students complete volunteer work, mark the shift as complete to <strong>notify the Pantry</strong>. 
                  The Pantry will review the completion and decide whether to issue Allocation Tickets to the student.
                </p>
              </div>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Active Opportunities ({opportunities.filter(o => o.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'completed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Completed ({opportunities.filter(o => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All ({opportunities.length})
            </button>
          </div>

          {/* Opportunities List */}
          <div className="space-y-6">
            {opportunities.map(opp => (
              <div key={opp.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{opp.title}</h2>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(opp.status)}`}>
                          {opp.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{opp.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 font-medium">Location</div>
                          <div className="text-gray-900">{opp.location}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 font-medium">Hours Required</div>
                          <div className="text-gray-900">{opp.hours_required} hours</div>
                        </div>
                        <div>
                          <div className="text-gray-500 font-medium">Date</div>
                          <div className="text-gray-900">{new Date(opp.start_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 font-medium">Spots</div>
                          <div className={`font-semibold ${opp.spots_filled >= opp.spots_available ? 'text-orange-600' : 'text-green-600'}`}>
                            {opp.spots_filled} / {opp.spots_available} filled
                          </div>
                        </div>
                      </div>
                      
                      {opp.skills_needed && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-gray-700">Skills needed:</span> {opp.skills_needed}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signed Up Students */}
                  {opp.signups && opp.signups.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Signed Up Students ({opp.signups.length})</h3>
                      <div className="space-y-2">
                        {opp.signups.map(signup => (
                          <div key={signup.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{signup.student_name}</div>
                              <div className="text-sm text-gray-600">{signup.student_email}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Signed up: {new Date(signup.signup_date).toLocaleDateString()}
                              </div>
                            </div>
                            {opp.status === 'active' && !signup.notified && (
                              <button
                                onClick={() => handleMarkComplete(opp.id, signup.id)}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                              >
                                Mark Complete & Notify Pantry
                              </button>
                            )}
                            {signup.notified && !signup.ticket_approved && (
                              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg font-semibold">
                                ⏳ Pending Pantry Review
                              </span>
                            )}
                            {signup.ticket_approved && (
                              <span className="px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded-lg font-semibold">
                                ✓ Ticket Issued by Pantry
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {opportunities.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 mb-4">Create your first volunteering opportunity to get students involved!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Create Opportunity
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Volunteering Opportunity</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateOpportunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Food Sorting & Packaging"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe what volunteers will be doing..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Campus Warehouse"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours Required *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.hours_required}
                      onChange={(e) => setFormData({...formData, hours_required: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spots Available *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.spots_available}
                    onChange={(e) => setFormData({...formData, spots_available: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills Needed (optional)</label>
                  <input
                    type="text"
                    value={formData.skills_needed}
                    onChange={(e) => setFormData({...formData, skills_needed: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., No experience required"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Create Opportunity
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierVolunteering;

