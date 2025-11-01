import React, { useState, useEffect } from 'react';
import { votingAPI } from '../services/api';

const Voting = () => {
  const [itemType, setItemType] = useState('');
  const [itemName, setItemName] = useState('');
  const [priority, setPriority] = useState(1);
  const [myVotes, setMyVotes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchVotingData();
  }, []);
  
  const fetchVotingData = async () => {
    try {
      const [votesRes, resultsRes] = await Promise.all([
        votingAPI.getMyVotes(),
        votingAPI.getResults({ limit: 10 })
      ]);
      
      setMyVotes(votesRes.data.data);
      setResults(resultsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch voting data', error);
    }
  };
  
  const handleSubmitVote = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await votingAPI.submitVote({ item_type: itemType, item_name: itemName, priority });
      alert('Vote submitted successfully! You earned a Governance NFT!');
      setItemType('');
      setItemName('');
      setPriority(1);
      fetchVotingData();
    } catch (error) {
      alert('Failed to submit vote: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vote for Food Items</h1>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Vote Form */}
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit Your Vote</h2>
            <p className="text-sm text-gray-600 mb-6">
              Vote for food items you'd like to see in the pantry. Each vote earns you a Governance NFT!
            </p>
            
            <form onSubmit={handleSubmitVote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a type</option>
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="grains">Grains</option>
                  <option value="canned">Canned Goods</option>
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name (Optional)</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Bananas, Milk, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority (1 = Low, 5 = High)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center mt-1">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">
                    {priority}
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Vote & Earn NFT'}
              </button>
            </form>
          </div>
          
          {/* Voting Results */}
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Voted Items</h2>
            {results.length === 0 ? (
              <p className="text-gray-500">No votes yet. Be the first to vote!</p>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{result.item_name || result.item_type}</p>
                        <p className="text-sm text-gray-500">{result.item_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">{result.vote_count} votes</p>
                      <p className="text-xs text-gray-500">Priority: {parseFloat(result.avg_priority).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* My Votes History */}
        <div className="bg-primary-100 rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Voting History</h2>
          {myVotes.length === 0 ? (
            <p className="text-gray-500">You haven't voted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-primary-100 divide-y divide-gray-200">
                  {myVotes.map((vote) => (
                    <tr key={vote.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.item_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.item_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vote.vote_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Voting;

