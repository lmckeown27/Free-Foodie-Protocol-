import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { governanceAPI } from '../services/api';

const CreateProposal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposal_type: 'policy_update',
    voting_duration_days: 7
  });

  const proposalTypes = [
    {
      value: 'policy_update',
      label: 'Policy Update',
      description: 'Changes to platform policies, rules, or guidelines',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      value: 'supplier_onboarding',
      label: 'Supplier Onboarding',
      description: 'Approve new supplier partnerships',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      value: 'distribution_change',
      label: 'Distribution Change',
      description: 'Adjust allocation methods or food categories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      value: 'budget_allocation',
      label: 'Budget Allocation',
      description: 'Fund requests or budget changes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      value: 'operational_update',
      label: 'Operational Update',
      description: 'Changes to hours, locations, or procedures',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      value: 'other',
      label: 'Other',
      description: 'General proposals not covered above',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a proposal description');
      return;
    }
    
    try {
      setLoading(true);
      
      const votingEndsAt = new Date();
      votingEndsAt.setDate(votingEndsAt.getDate() + parseInt(formData.voting_duration_days));
      
      await governanceAPI.createProposal({
        title: formData.title,
        description: formData.description,
        proposal_type: formData.proposal_type,
        voting_ends_at: votingEndsAt.toISOString()
      });
      
      alert('Proposal created successfully!\n\nStudents can now vote on this proposal.');
      navigate('/pantry');
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectedType = proposalTypes.find(t => t.value === formData.proposal_type);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/pantry" className="text-amber-600 hover:text-amber-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Proposal</h1>
          <p className="text-gray-600 mt-2">
            Submit a proposal for student voting. Students have 100% voting power on all governance decisions.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 text-white rounded-full p-3 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg">How Proposal Creation Works</h3>
              <ul className="text-amber-800 text-sm mt-2 space-y-1">
                <li>• Choose a proposal type and provide clear details</li>
                <li>• Set the voting duration (typically 7 days)</li>
                <li>• Students will vote YES, NO, or ABSTAIN</li>
                <li>• Students have 100% voting power on all proposals</li>
                <li>• Proposals need majority YES votes to pass</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Step 1: Type Selection */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Select Proposal Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposalTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, proposal_type: type.value })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.proposal_type === type.value
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${
                      formData.proposal_type === type.value
                        ? 'text-amber-600'
                        : 'text-gray-400'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Title */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Proposal Title</h2>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 'Add More Vegan Options to Food Selection'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-2">
              Keep it clear and concise. Students will see this first.
            </p>
          </div>

          {/* Step 3: Description */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Detailed Description</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context, reasons, and expected outcomes. Be thorough but clear."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Explain what the proposal does, why it matters, and what happens if it passes.
            </p>
          </div>

          {/* Step 4: Voting Duration */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Voting Duration</h2>
            <div className="grid grid-cols-4 gap-3">
              {[3, 5, 7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFormData({ ...formData, voting_duration_days: days })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.voting_duration_days === days
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-gray-200 hover:border-amber-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl font-bold">{days}</div>
                  <div className="text-xs">days</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Most proposals use 7 days. Use 3 days for urgent matters, 14 days for major changes.
            </p>
          </div>

          {/* Preview */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            <div className="bg-white rounded-lg border-2 border-amber-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-amber-100 text-amber-600 rounded-lg p-3">
                  {selectedType.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                      active
                    </span>
                    <span className="text-xs text-gray-500">{selectedType.label}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formData.title || 'Your proposal title will appear here'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {formData.description || 'Your proposal description will appear here'}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Voting ends:</strong> {new Date(Date.now() + formData.voting_duration_days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-white">
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="w-full px-6 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Proposal...' : 'Submit Proposal for Student Vote'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Students will be notified and can begin voting immediately
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;

