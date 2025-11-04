import React from 'react';

const HowItWorksModal = ({ isOpen, onClose, userRole }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (userRole) {
      case 'pantry':
        return {
          title: 'How This Works: Pantry',
          steps: [
            {
              number: 1,
              title: 'Connect Multi-Sig Petra Wallet',
              description: 'Set up a Petra Vault multi-sig wallet with co-signers. Define approval threshold (e.g., 2-of-3) for secure operations and governance.'
            },
            {
              number: 2,
              title: 'Verify & Approve Supplier',
              description: 'Review supplier applications and business credentials. Mint Supplier NFTs on Aptos blockchain to grant verified access to the platform.'
            },
            {
              number: 3,
              title: 'Custodial Wallet & NFT Operations',
              description: 'Hold a custodial wallet that executes blockchain transactions on behalf of students. Issue Governance NFTs (voting), Allocation NFTs (claims), and handle all on-chain operations for simplified student UX.'
            },
            {
              number: 4,
              title: 'Allocate Food with POAS',
              description: 'Use POAS (Predicted Optimal Allocation Score) reports to guide fair food distribution. Accept donations, manage inventory, and allocate items to students.'
            },
            {
              number: 5,
              title: 'Verify Pickups & Monitor Compliance',
              description: 'Scan student Allocation NFTs at pickup to confirm food distribution. Track analytics, audit logs, and ensure VLCP compliance with auditable on-chain records.'
            }
          ]
        };

      case 'supplier':
        return {
          title: 'How This Works: Supplier',
          steps: [
            {
              number: 1,
              title: 'Apply & Get Approved',
              description: 'Submit application with business credentials. Pantry verifies and mints your Supplier NFT on Aptos via their custodial wallet. No wallet connection needed!'
            },
            {
              number: 2,
              title: 'Log Donations',
              description: 'Log available food donations with weight, type, and location through the web portal. All blockchain transactions (NFT minting, on-chain receipts) are handled automatically by the Pantry\'s custodial wallet.'
            },
            {
              number: 3,
              title: 'Blockchain Verification',
              description: 'Pantry\'s custodial wallet records your donation on Aptos blockchain. You receive a blockchain-verified donation receipt (Supplier NFT transaction) for tax purposes and compliance, without needing to manage crypto.'
            },
            {
              number: 4,
              title: 'Track Impact & Governance',
              description: 'View real-time metrics (pounds donated, meals saved, CO₂ reduced) on your dashboard. Participate in governance votes (20% voting weight) on logistics and distribution policies—all off-chain with Pantry executing multi-sig decisions.'
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

  // Color mapping based on user role
  const getColorClasses = () => {
    switch (userRole) {
      case 'student':
        return {
          bg: 'bg-primary-100',
          bgDark: 'bg-primary-50',
          border: 'border-primary-200',
          circle: 'bg-primary-600',
          circleHover: 'hover:bg-primary-700',
          text: 'text-primary-900',
          textLight: 'text-primary-800'
        };
      case 'pantry':
        return {
          bg: 'bg-purple-100',
          bgDark: 'bg-purple-50',
          border: 'border-purple-200',
          circle: 'bg-purple-600',
          circleHover: 'hover:bg-purple-700',
          text: 'text-purple-900',
          textLight: 'text-purple-800'
        };
      case 'supplier':
        return {
          bg: 'bg-blue-100',
          bgDark: 'bg-blue-50',
          border: 'border-blue-200',
          circle: 'bg-blue-600',
          circleHover: 'hover:bg-blue-700',
          text: 'text-blue-900',
          textLight: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          bgDark: 'bg-gray-50',
          border: 'border-gray-200',
          circle: 'bg-gray-600',
          circleHover: 'hover:bg-gray-700',
          text: 'text-gray-900',
          textLight: 'text-gray-800'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${colors.bg} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`sticky top-0 ${colors.bg} border-b ${colors.border} px-6 py-4 flex justify-between items-center`}>
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
                <div className={`w-10 h-10 rounded-full ${colors.circle} text-white flex items-center justify-center font-bold text-lg`}>
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
          <div className={`mt-8 p-4 ${colors.bgDark} rounded-lg border ${colors.border}`}>
            <h4 className={`font-semibold ${colors.text} mb-2`}>Key Features</h4>
            <ul className={`space-y-1 text-sm ${colors.textLight}`}>
              <li>• Blockchain-based transparency and accountability</li>
              <li>• Real-time inventory tracking and analytics</li>
              <li>• VLCP compliance and automated reporting</li>
              <li>• Equitable allocation through POAS algorithm</li>
              <li>• Liability protection under Good Samaritan Act</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 ${colors.bgDark} border-t ${colors.border} px-6 py-4`}>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 ${colors.circle} text-white rounded-lg ${colors.circleHover} transition font-medium`}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;

