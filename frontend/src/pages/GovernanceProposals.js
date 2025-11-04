import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { governanceAPI } from '../services/api';

const GovernanceProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingOn, setVotingOn] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const proposalsRes = await governanceAPI.getProposals();
      
      // Backend returns { success: true, data: [...] }, axios wraps in .data
      const proposalsData = proposalsRes.data?.data || [];
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      
      // TODO: Fetch user's votes when endpoint is ready
      setMyVotes([]);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId, vote) => {
    try {
      setVotingOn(proposalId);
      
      await governanceAPI.voteOnProposal(proposalId, {
        vote,
        reasoning: ''
      });
      
      // Refresh proposals
      await fetchProposals();
      
      alert(`Vote cast successfully! Your ${vote.toUpperCase()} vote has been recorded on the blockchain.`);
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to cast vote: ' + (error.response?.data?.error || error.message));
    } finally {
      setVotingOn(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'passed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'executed': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProposalIcon = (type) => {
    switch (type) {
      case 'supplier_onboarding':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'policy_update':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'distribution_change':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const formatProposalType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const hasVoted = (proposalId) => {
    return myVotes.some(v => v.proposal_id === proposalId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/student" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Governance Proposals</h1>
          <p className="text-gray-600 mt-2">
            Vote on platform proposals to earn Governance NFTs and increase your POAS score
          </p>
        </div>

        {/* Governance Info */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 text-white rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg">Your Voting Power: 10%</h3>
              <p className="text-amber-800 text-sm mt-1">
                As a student, you have 10% of the total voting weight on governance proposals. 
                Each vote you cast earns you a Governance NFT and increases your POAS score by 35%!
              </p>
              <div className="mt-3 flex gap-6 text-sm text-amber-700">
                <div>
                  <span className="font-semibold">Pantry:</span> 70% voting weight
                </div>
                <div>
                  <span className="font-semibold">Supplier:</span> Fulfills food requests
                </div>
                <div>
                  <span className="font-semibold">Students:</span> 10% voting weight
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active Proposals</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {proposals.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Your Votes</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{myVotes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Governance NFTs Earned</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {user.governance_nft_count || 0}
            </p>
          </div>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
            <p className="text-gray-600">Check back soon for new governance proposals to vote on!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Proposal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-amber-100 text-amber-600 rounded-lg p-3">
                        {getProposalIcon(proposal.proposal_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatProposalType(proposal.proposal_type)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{proposal.title}</h3>
                        <p className="text-gray-600 text-sm">{proposal.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposal Details */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Proposed By</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{proposal.proposed_by_entity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Voting Ends</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(proposal.voting_ends_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Yes Votes</p>
                      <p className="text-sm font-medium text-green-600">{proposal.yes_votes || 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">No Votes</p>
                      <p className="text-sm font-medium text-red-600">{proposal.no_votes || 0}%</p>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {proposal.status === 'active' && !hasVoted(proposal.id) ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(proposal.id, 'yes')}
                        disabled={votingOn === proposal.id}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {votingOn === proposal.id ? 'Voting...' : 'Vote YES'}
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'no')}
                        disabled={votingOn === proposal.id}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {votingOn === proposal.id ? 'Voting...' : 'Vote NO'}
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        disabled={votingOn === proposal.id}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Abstain
                      </button>
                    </div>
                  ) : hasVoted(proposal.id) ? (
                    <div className="bg-amber-100 border border-amber-200 rounded-lg p-4 text-center">
                      <svg className="w-8 h-8 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium text-amber-900">You've already voted on this proposal</p>
                      <p className="text-sm text-amber-700 mt-1">Thank you for participating in governance!</p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="font-medium text-gray-700">Voting has ended for this proposal</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Status: <span className="capitalize font-semibold">{proposal.status}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">How Governance Works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Each vote earns you a Governance NFT stored in the Pantry's custodial wallet</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Voting increases your POAS score by 35% (highest weight!)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Students have 10% collective voting weight on all proposals</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Proposals require Pantry multi-sig approval (70% weight) to execute</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GovernanceProposals;

