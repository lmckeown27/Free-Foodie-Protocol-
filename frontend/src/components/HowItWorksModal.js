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
      
      case 'bni':
        return {
          title: 'How This Works: Basic Needs Initiative Governance',
          steps: [
            {
              number: 1,
              title: 'System Oversight',
              description: 'The Basic Needs Initiative provides governance infrastructure for the Free Foodie Quest platform without centralized control.'
            },
            {
              number: 2,
              title: 'Supplier Verification',
              description: 'Review and approve supplier applications. Verify business credentials (EIN, licenses). Mint Supplier NFTs on Aptos blockchain to grant access.'
            },
            {
              number: 3,
              title: 'Custodial Wallet Management',
              description: 'Manage custodial wallets for students through multi-sig system controlled by the Basic Needs Initiative. Execute blockchain transactions on behalf of students for simplified UX.'
            },
            {
              number: 4,
              title: 'Pantry Configuration',
              description: 'Configure pantry multi-sig vaults. Assign Pantry Workers as co-signers. Set approval thresholds for security and accountability.'
            },
            {
              number: 5,
              title: 'Audit & Analytics',
              description: 'Monitor system-wide metrics: student participation, supplier contributions, food rescued. Review on-chain audit logs for compliance and transparency.'
            },
            {
              number: 6,
              title: 'NFT & Smart Contract Control',
              description: 'Mint Governance NFTs, Allocation NFTs, and Supplier NFTs. Manage smart contract upgrades and system parameters. Control treasury wallet for platform sustainability.'
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
      case 'pantry_worker':
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
      case 'bni':
        return {
          bg: 'bg-orange-100',
          bgDark: 'bg-orange-50',
          border: 'border-orange-200',
          circle: 'bg-orange-600',
          circleHover: 'hover:bg-orange-700',
          text: 'text-orange-900',
          textLight: 'text-orange-800'
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

