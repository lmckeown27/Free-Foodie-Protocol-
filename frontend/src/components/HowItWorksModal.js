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
              title: 'Connect Your Secure Account',
              description: 'Set up your Pantry account with team verification. Multiple team members can approve important decisions together (like adding new suppliers).'
            },
            {
              number: 2,
              title: 'Review & Approve Suppliers',
              description: 'Check supplier applications and business info. Click "Approve" to give them verified access to donate food. We handle all the technical verification automatically.'
            },
            {
              number: 3,
              title: 'Manage Student Records',
              description: 'Your account manages all student records securely. When students vote or volunteer, we automatically track their participation. No technical work needed from students or you.'
            },
            {
              number: 4,
              title: 'Allocate Food Fairly',
              description: 'Our system recommends which students should get food based on need, participation, and volunteering. Review the recommendations and click "Allocate" to assign food.'
            },
            {
              number: 5,
              title: 'Verify Pickups & Track Everything',
              description: 'Scan student pickup tickets when they collect food. View real-time reports on donations, distributions, and impact. Everything is automatically tracked and saved.'
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
              description: 'Fill out a simple application with your business info. The Pantry team reviews and approves you—usually within 24 hours. Once approved, you can start donating!'
            },
            {
              number: 2,
              title: 'Log Your Donations',
              description: 'Enter what food you want to donate: item name, weight, and how many. Click "Submit" and you\'re done! We handle all the record-keeping automatically.'
            },
            {
              number: 3,
              title: 'Get Your Receipt',
              description: 'Every donation gets a verified digital receipt instantly. Use these receipts for tax write-offs and compliance reports. Everything is tracked and secure.'
            },
            {
              number: 4,
              title: 'See Your Impact',
              description: 'Watch your dashboard to see total pounds donated, students helped, and environmental impact. Track where your food goes and when it\'s picked up.'
            }
          ]
        };

      case 'student':
        return {
          title: 'How This Works: Students',
          steps: [
            {
              number: 1,
              title: 'Sign Up with Your Student ID',
              description: 'Log in with your school ID. That\'s it! You\'re automatically registered and can start using the food pantry right away.'
            },
            {
              number: 2,
              title: 'Vote on Proposals',
              description: 'The Pantry asks students to vote on changes (like "Should we add more vegan options?"). Vote on what matters to you. Each vote boosts your food priority by 35%!'
            },
            {
              number: 3,
              title: 'Volunteer to Increase Priority',
              description: 'Help out at the pantry and log your hours. Volunteering gives you even higher priority for food allocation. More help = more priority!'
            },
            {
              number: 4,
              title: 'Get Your Pickup Notification',
              description: 'When food is available for you, we\'ll notify you with a pickup ticket. Bring your student ID to the pantry during operating hours.'
            },
            {
              number: 5,
              title: 'Pick Up Your Food',
              description: 'Show your pickup ticket at the pantry. The team will scan it and give you your food. That\'s it! Your pickup is recorded automatically.'
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
          bg: 'bg-amber-100',
          bgDark: 'bg-amber-50',
          border: 'border-amber-200',
          circle: 'bg-amber-600',
          circleHover: 'hover:bg-amber-700',
          text: 'text-amber-900',
          textLight: 'text-amber-800'
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
              <li>• Secure, tamper-proof record keeping</li>
              <li>• Real-time food tracking and reports</li>
              <li>• Food safety compliance built-in</li>
              <li>• Fair distribution based on need and participation</li>
              <li>• Legal protection for donors (Good Samaritan Act)</li>
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

