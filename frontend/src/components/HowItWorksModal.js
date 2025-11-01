import React from 'react';

const HowItWorksModal = ({ isOpen, onClose, userRole }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (userRole) {
      case 'pantry_worker':
        return {
          title: 'How This Works: Pantry Workers',
          steps: [
            {
              number: 1,
              title: 'Connect Your Petra Wallet',
              description: 'Pantry Workers connect their personal Petra Wallet to FFQ.'
            },
            {
              number: 2,
              title: 'Create Multi-Sig Vault',
              description: 'Set up a Petra Vault multi-sig wallet with co-signers. Define the approval threshold (e.g., 2-of-3).'
            },
            {
              number: 3,
              title: 'Approve Operations',
              description: 'Food rescue pickups, token allocations, and supplier confirmations require multi-sig approval. Ensures security, accountability, and auditability.'
            },
            {
              number: 4,
              title: 'Track Inventory & POAS',
              description: 'Access real-time inventory dashboard. Use POAS reports to guide allocations. Confirm pickups and token redemptions on-chain.'
            },
            {
              number: 5,
              title: 'Compliance & Reporting',
              description: 'FFQ automatically logs Verifiable Logistics Checklist Protocol (VLCP) compliance. Provides auditable on-chain records for public health regulations.'
            }
          ]
        };

      case 'supplier':
        return {
          title: 'How This Works: Suppliers',
          steps: [
            {
              number: 1,
              title: 'Connect Your Petra Wallet',
              description: 'Suppliers connect a Petra Wallet to list donations.'
            },
            {
              number: 2,
              title: 'List Available Food',
              description: 'List inventory using weight, expiry, and type. Inventory flows through the Decentralized Oracle Network (DON) to FFQ smart contracts.'
            },
            {
              number: 3,
              title: 'Smart Contract Execution',
              description: 'When students bid using tokens, contracts automatically execute: Transfers custody to Pantry multi-sig Vault and updates inventory in real-time.'
            },
            {
              number: 4,
              title: 'Compliance & Liability Protection',
              description: 'Smart contracts enforce VLCP protocols (handling, temperature). Immutable ledger ensures suppliers are protected under the Good Samaritan Act.'
            }
          ]
        };

      case 'student':
        return {
          title: 'How This Works: Students',
          steps: [
            {
              number: 1,
              title: 'Sign Up with Student ID',
              description: 'Students log in using Cal Poly ID. Receive Governance Tokens by voting on demand and volunteering.'
            },
            {
              number: 2,
              title: 'Check Inventory & Vote',
              description: 'Access real-time pantry inventory. Vote on desired items to generate tokens that regulate allocation.'
            },
            {
              number: 3,
              title: 'Bid on Food Allocation',
              description: 'Use earned Governance Tokens to bid on available items. POAS ensures equitable distribution.'
            },
            {
              number: 4,
              title: 'Pickup & Confirmation',
              description: 'Students receive pickup notification with confirmation number. Go to pantry, pick up allocation, and Pantry Worker closes contract on-chain.'
            },
            {
              number: 5,
              title: 'Track Your Tokens',
              description: 'Governance Tokens are redeemable for future allocations. Students can see voting history, allocation success, and system participation metrics.'
            }
          ]
        };

      default:
        return {
          title: 'How This Works',
          steps: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-primary-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary-100 border-b border-primary-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {content.steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-semibold text-primary-900 mb-2">Key Features</h4>
            <ul className="space-y-1 text-sm text-primary-800">
              <li>• Blockchain-based transparency and accountability</li>
              <li>• Real-time inventory tracking and analytics</li>
              <li>• VLCP compliance and automated reporting</li>
              <li>• Equitable allocation through POAS algorithm</li>
              <li>• Liability protection under Good Samaritan Act</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-primary-50 border-t border-primary-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;

