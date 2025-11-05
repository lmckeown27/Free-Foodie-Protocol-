import React from 'react';
import RoleSidebar from '../components/RoleSidebar';

const HowItWorks = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getContent = () => {
    switch (user.role) {
      case 'pantry':
        return {
          title: 'How This Works: Pantry',
          color: 'amber',
          purpose: 'You manage all food operations, verify suppliers, create proposals for students to vote on, and ensure fair distribution using our data-driven recommendations. You also hold secure accounts for all students, so they never have to worry about technical details.',
          features: [
            {
              title: 'Create Proposal',
              description: 'Start a new vote for students on any topic (like "Should we add more vegan options?"). Students vote, and you see the results instantly.'
            },
            {
              title: 'Allocate Food',
              description: 'Our system shows you which students should get food based on their need, voting, and volunteer work. Click to assign food to students.'
            },
            {
              title: 'Pending Supplier Approvals',
              description: 'Review new supplier applications. Click "Approve" or "Deny" to control who can donate food to your pantry.'
            },
            {
              title: 'Custodial User Management',
              description: 'View all student and supplier records in one place. Click on any user to see their full profile, history, and credentials.'
            },
            {
              title: 'Inventory Management',
              description: 'See all available food, track what\'s coming soon, and monitor what\'s been picked up. Filter by food type, date, or supplier.'
            },
            {
              title: 'Analytics & Reports',
              description: 'View real-time dashboards showing total distributions, student participation, supplier donations, and system health.'
            },
            {
              title: 'Credential Management',
              description: 'Issue voting rights, pickup tickets, and service badges to students. Verify supplier donation receipts. Everything is tracked securely.'
            }
          ]
        };

      case 'supplier':
        return {
          title: 'How This Works: Supplier',
          color: 'blue',
          purpose: 'You donate surplus food to help students while reducing waste. Get instant verified receipts for every donation (great for taxes!), track your impact in real-time, and see exactly how your food helps the community.',
          features: [
            {
              title: 'Log Donation',
              description: 'Click to record a new donation. Enter the food item, quantity, and weight. Submit and you\'ll instantly get a verified receipt.'
            },
            {
              title: 'Donation Lifecycle Tracker',
              description: 'See the status of each donation you\'ve made: Donated → Available → Allocated → Redeemed. Watch your food go from your hands to students.'
            },
            {
              title: 'View Complete Redeemed Donation History',
              description: 'Click to see all past donations that have been picked up by students. Filter by date, item type, or status.'
            },
            {
              title: 'Impact Metrics Dashboard',
              description: 'View your total pounds donated, CO₂ saved, students served, and donation receipts. Updated in real-time as students pick up your donations.'
            },
            {
              title: 'My Credentials',
              description: 'View all your verified donation receipts in one place. Each receipt includes the full donation details and verification record for compliance.'
            }
          ]
        };

      case 'student':
        return {
          title: 'How This Works: Students',
          color: 'primary',
          purpose: 'Get free food from the pantry! Your voice matters here—vote on what food should be available, volunteer to help out, and you\'ll get priority access. The more you participate, the higher your priority for food allocation.',
          features: [
            {
              title: 'Vote on Proposals',
              description: 'Click to see current votes and cast your vote on pantry changes. Each vote you cast increases your food priority by 35%!'
            },
            {
              title: 'Log Volunteer Hours',
              description: 'Helped at the pantry? Click here to record your volunteer hours. Volunteering gives you even higher priority for food.'
            },
            {
              title: 'View Available Food',
              description: 'Browse what food is currently available at the pantry. See what\'s coming soon and when new donations arrive.'
            },
            {
              title: 'My Allocations',
              description: 'Check if food has been allocated to you. When you have a pickup ticket, it shows here with all the details.'
            },
            {
              title: 'My Credentials',
              description: 'View your voting rights, pickup tickets, and service badges. See your participation history and volunteer achievements.'
            },
            {
              title: 'Governance',
              description: 'See all active and past proposals. View detailed voting results and proposal descriptions.'
            }
          ]
        };
      
      default:
        return {
          title: 'How This Works',
          color: 'gray',
          purpose: '',
          features: []
        };
    }
  };

  const content = getContent();
  const getColorClasses = () => {
    switch (content.color) {
      case 'primary':
        return {
          bg: 'bg-primary-100',
          bgDark: 'bg-primary-50',
          border: 'border-primary-200',
          circle: 'bg-primary-600',
          text: 'text-primary-900',
          textLight: 'text-primary-800'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100',
          bgDark: 'bg-amber-50',
          border: 'border-amber-200',
          circle: 'bg-amber-600',
          text: 'text-amber-900',
          textLight: 'text-amber-800'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          bgDark: 'bg-blue-50',
          border: 'border-blue-200',
          circle: 'bg-blue-600',
          text: 'text-blue-900',
          textLight: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          bgDark: 'bg-gray-50',
          border: 'border-gray-200',
          circle: 'bg-gray-600',
          text: 'text-gray-900',
          textLight: 'text-gray-800'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RoleSidebar />
      
      <main className="flex-1 ml-64 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${colors.bg} rounded-lg shadow-lg`}>
            {/* Header */}
            <div className={`${colors.bg} border-b ${colors.border} px-6 py-6`}>
              <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Purpose Section */}
              {content.purpose && (
                <div className={`p-4 ${colors.bgDark} rounded-lg border ${colors.border}`}>
                  <h3 className={`font-semibold ${colors.text} mb-2`}>Your Role</h3>
                  <p className="text-gray-700 leading-relaxed">{content.purpose}</p>
                </div>
              )}

              {/* Features Section */}
              {content.features && content.features.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">What You Can Do</h3>
                  <div className="space-y-4">
                    {content.features.map((feature, index) => (
                      <div key={index} className="flex gap-4">
                        {/* Bullet Point */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${colors.circle}`}></div>
                        </div>

                        {/* Feature Content */}
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

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
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;

