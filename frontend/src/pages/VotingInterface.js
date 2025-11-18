import React, { useState, useEffect } from 'react';
import { votingAPI, inventoryAPI } from '../services/api';

const VotingInterface = () => {
  const [inventory, setInventory] = useState([]);
  const [votes, setVotes] = useState({});
  const [myVotes, setMyVotes] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [inventoryRes, myVotesRes, trendingRes] = await Promise.all([
        inventoryAPI.getInventory({ status: 'available' }),
        votingAPI.getMyVotes(),
        votingAPI.getTrending()
      ]);
      
      setInventory(inventoryRes.data.data || []);
      setMyVotes(myVotesRes.data.data || []);
      setTrending(trendingRes.data.data || []);
      
      // Initialize votes from my previous votes
      const existingVotes = {};
      myVotesRes.data.data.forEach(vote => {
        existingVotes[`${vote.item_name}-${vote.item_type}`] = vote.priority;
      });
      setVotes(existingVotes);
    } catch (error) {
      console.error('Failed to fetch voting data', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVote = (itemName, itemType, priority) => {
    const key = `${itemName}-${itemType}`;
    setVotes(prev => ({
      ...prev,
      [key]: priority
    }));
  };
  
  const submitVotes = async () => {
    setSubmitting(true);
    try {
      const votePromises = Object.entries(votes).map(([key, priority]) => {
        const [itemName, itemType] = key.split('-');
        return votingAPI.submitVote({
          item_name: itemName,
          item_type: itemType,
          priority: priority
        });
      });
      
      await Promise.all(votePromises);
      alert('Votes submitted successfully! Your votes help determine pantry inventory.');
      fetchData(); // Refresh
    } catch (error) {
      alert('Failed to submit votes: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 5: return 'bg-primary-600 text-white';
      case 4: return 'bg-primary-500 text-white';
      case 3: return 'bg-primary-400 text-white';
      case 2: return 'bg-primary-300 text-primary-900';
      case 1: return 'bg-primary-200 text-primary-900';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  
  // Group inventory by type
  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-600">Vote on What You Want</h1>
          <p className="text-gray-600 mt-2">
            Your votes help determine pantry inventory and shape what food is available
          </p>
        </div>
        
        {/* Trending Items */}
        {trending.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending This Week</h2>
            <div className="flex flex-wrap gap-2">
              {trending.slice(0, 10).map((item, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {item.item_name} ({item.vote_count} votes)
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Voting Interface */}
        <div className="space-y-6">
          {Object.entries(groupedInventory).map(([type, items]) => (
            <div key={type} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 capitalize">{type}</h2>
              </div>
              <div className="p-6 space-y-4">
                {items.map(item => {
                  const key = `${item.item_name}-${item.item_type}`;
                  const currentPriority = votes[key] || 0;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.item_name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Available: {item.quantity} {item.unit}</span>
                          {item.status === 'pending' && (
                            <span className="text-blue-600 font-medium">Coming Soon</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">Priority:</span>
                        {[1, 2, 3, 4, 5].map(priority => (
                          <button
                            key={priority}
                            onClick={() => handleVote(item.item_name, item.item_type, priority)}
                            className={`w-10 h-10 rounded-lg font-bold transition ${
                              currentPriority === priority
                                ? getPriorityColor(priority)
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-gray-900 font-medium">
              {Object.keys(votes).length} items selected
            </p>
            <p className="text-sm text-gray-600">
              Higher priority votes have more weight
            </p>
          </div>
          <button
            onClick={submitVotes}
            disabled={Object.keys(votes).length === 0 || submitting}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Votes'}
          </button>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
          <h3 className="font-bold text-primary-900 mb-2">How Voting Works</h3>
          <ul className="text-sm text-primary-800 space-y-1 list-disc list-inside">
            <li>Vote on items you want to see in the pantry</li>
            <li>Priority 5 = Highest need, Priority 1 = Low interest</li>
            <li>Your votes help the pantry understand student needs and preferences</li>
            <li>The pantry uses collective voting data to request food from suppliers</li>
            <li>You can change your votes anytime before submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface;

