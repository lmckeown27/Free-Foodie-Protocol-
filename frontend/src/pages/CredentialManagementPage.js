import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nftAPI, analyticsAPI } from '../services/api';
import PantrySidebar from '../components/PantrySidebar';

const CredentialManagementPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [allocationTickets, setAllocationTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'voting', 'volunteering'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAllocationTickets();
  }, []);

  const fetchAllocationTickets = async () => {
    try {
      setLoading(true);
      const nftsRes = await nftAPI.getAllNFTs();
      const allNFTs = nftsRes.data?.data || [];
      
      // Filter to only allocation tickets
      const tickets = allNFTs.filter(
        n => n.nft_type === 'allocation' || n.credential_type === 'allocation'
      );
      
      setAllocationTickets(tickets);
    } catch (error) {
      console.error('Error fetching allocation tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    if (filterType === 'all') return allocationTickets;
    if (filterType === 'voting') {
      return allocationTickets.filter(
        t => t.source === 'voting' || t.earned_via === 'voting'
      );
    }
    if (filterType === 'volunteering') {
      return allocationTickets.filter(
        t => t.source === 'volunteering' || t.earned_via === 'volunteering'
      );
    }
    return allocationTickets;
  };

  const filteredTickets = getFilteredTickets();
  const votingTickets = allocationTickets.filter(
    t => t.source === 'voting' || t.earned_via === 'voting'
  );
  const volunteeringTickets = allocationTickets.filter(
    t => t.source === 'volunteering' || t.earned_via === 'volunteering'
  );
  const activeTickets = filteredTickets.filter(t => t.nft_status === 'active').length;
  const usedTickets = filteredTickets.filter(
    t => t.nft_status === 'redeemed' || t.nft_status === 'used'
  ).length;

  // Group tickets by student
  const ticketsByStudent = {};
  filteredTickets.forEach(ticket => {
    const studentId = ticket.user_id;
    if (!ticketsByStudent[studentId]) {
      ticketsByStudent[studentId] = {
        student: ticket,
        tickets: [],
        activeCount: 0,
        usedCount: 0,
        votingCount: 0,
        volunteeringCount: 0
      };
    }
    ticketsByStudent[studentId].tickets.push(ticket);
    if (ticket.nft_status === 'active') {
      ticketsByStudent[studentId].activeCount++;
    } else if (ticket.nft_status === 'redeemed' || ticket.nft_status === 'used') {
      ticketsByStudent[studentId].usedCount++;
    }
    if (ticket.source === 'voting' || ticket.earned_via === 'voting') {
      ticketsByStudent[studentId].votingCount++;
    } else if (ticket.source === 'volunteering' || ticket.earned_via === 'volunteering') {
      ticketsByStudent[studentId].volunteeringCount++;
    }
  });

  const studentsList = Object.values(ticketsByStudent);

  return (
    <div className="min-h-screen bg-purple-50 flex">
      <PantrySidebar user={user} />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Allocation Ticket Management</h1>
                <p className="text-sm text-purple-200 mt-1">
                  View and track all allocation tickets issued to students
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-white text-sm font-medium">You Control Ticket Issuance</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
              <p className="text-3xl font-bold text-purple-600">{allocationTickets.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Tickets Issued</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
              <p className="text-3xl font-bold text-blue-600">{votingTickets.length}</p>
              <p className="text-sm text-gray-600 mt-1">From Voting</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
              <p className="text-3xl font-bold text-green-600">{volunteeringTickets.length}</p>
              <p className="text-sm text-gray-600 mt-1">From Volunteering</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-amber-600">
              <p className="text-3xl font-bold text-amber-600">
                {Object.keys(ticketsByStudent).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Students with Tickets</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Filter Tickets</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Tickets ({allocationTickets.length})
                </button>
                <button
                  onClick={() => setFilterType('voting')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'voting'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Earned from Voting ({votingTickets.length})
                </button>
                <button
                  onClick={() => setFilterType('volunteering')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterType === 'volunteering'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Earned from Volunteering ({volunteeringTickets.length})
                </button>
              </div>
            </div>

            {/* Filtered Stats */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{filteredTickets.length}</p>
                  <p className="text-xs text-gray-600">Filtered Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{activeTickets}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{usedTickets}</p>
                  <p className="text-xs text-gray-600">Used</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Distribution by Student */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-100 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900">Student Ticket Distribution</h2>
              <p className="text-sm text-gray-600 mt-1">View tickets grouped by student</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tickets...</p>
              </div>
            ) : studentsList.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <p className="text-gray-500">No tickets found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {studentsList.map((studentData, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      {/* Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {studentData.student.first_name?.charAt(0)}
                          {studentData.student.last_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {studentData.student.first_name} {studentData.student.last_name}
                          </p>
                          <p className="text-xs text-gray-600">{studentData.student.email}</p>
                        </div>
                      </div>

                      {/* Ticket Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{studentData.activeCount}</p>
                          <p className="text-xs text-gray-600">Available</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-600">{studentData.usedCount}</p>
                          <p className="text-xs text-gray-600">Used</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{studentData.votingCount}</p>
                          <p className="text-xs text-gray-600">Voting</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{studentData.volunteeringCount}</p>
                          <p className="text-xs text-gray-600">Volunteer</p>
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="ml-6">
                        <button
                          onClick={() => navigate(`/user/${studentData.student.user_id}`)}
                          className="text-purple-600 hover:text-purple-900 font-medium text-sm px-4 py-2 border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">Two Ways to Earn Allocation Tickets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <p className="font-bold text-blue-900">Voting on Proposals</p>
                    </div>
                    <p className="text-xs text-blue-700">
                      Students automatically earn 1 ticket when they vote on governance proposals that you create.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <p className="font-bold text-green-900">Completing Volunteer Work</p>
                    </div>
                    <p className="text-xs text-green-700">
                      When Suppliers notify you of completed volunteer work, you review and decide to issue 1-2 tickets per shift.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CredentialManagementPage;
