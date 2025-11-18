import React from 'react';

const HowItWorksModal = ({ isOpen, onClose, userRole }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (userRole) {
      case 'pantry':
        return {
          title: 'How This Works: Pantry',
          purpose: 'You manage all food operations and control the entire Allocation Ticket system. Create governance proposals, manage inventory, approve student food requests, and review volunteer completions before issuing tickets. Only the Pantry can issue Allocation Tickets to students.',
          features: [
            {
              title: 'Create Governance Proposals',
              description: 'Start new votes for students (like "Should we add more vegan options?"). ONLY the Pantry can create proposals. When students vote, they automatically earn 1 Allocation Ticket per vote.'
            },
            {
              title: 'Approve Volunteer Completions',
              description: 'Receive notifications from Suppliers when students complete volunteer work. Review each completion and decide whether to approve and issue Allocation Tickets (1-2 per shift). Only you can issue tickets.'
            },
            {
              title: 'Review Student Food Requests',
              description: 'When students use their Allocation Tickets to request food, review and approve their requests (usually within 24 hours). Once approved, students can pick up their items.'
            },
            {
              title: 'Confirm Pickups',
              description: 'Scan student QR codes when they pick up food. Once confirmed, the item automatically disappears from their active requests and is marked as completed.'
            },
            {
              title: 'Manage Inventory by Category',
              description: 'Organize food by categories (Produce, Protein, Dairy, etc.) with governance context. Track what\'s available, low stock items, and what needs to be requested from suppliers.'
            },
            {
              title: 'Supply Planning (POAS)',
              description: 'View POAS-based recommendations organized by priority (Critical, High, Medium, Low, Optional). Use this data to optimize what to request from suppliers based on student demand.'
            },
            {
              title: 'Allocation Ticket Control',
              description: 'You are the ONLY entity that can issue Allocation Tickets. This ensures system integrity, prevents abuse, and maintains fair food distribution across all students.'
            }
          ]
        };

      case 'supplier':
        return {
          title: 'How This Works: Supplier',
          purpose: 'You donate surplus food to help students while reducing waste, and recruit student volunteers to help with food operations. Get instant verified receipts for every donation, create volunteering opportunities, and track your community impact.',
          features: [
            {
              title: 'Donate Food',
              description: 'Record a new food donation. Enter the food item, quantity, and details. Submit and you\'ll instantly get a verified receipt for your records (great for tax purposes!).'
            },
            {
              title: 'Create Volunteering Opportunities',
              description: 'Post volunteer opportunities for students (food sorting, packaging, delivery assistance, etc.). Specify hours, spots available, skills needed, and the Allocation Ticket reward (1-2 tickets per shift).'
            },
            {
              title: 'Manage Student Signups',
              description: 'See which students have signed up for your volunteering opportunities. View their profiles and track upcoming volunteer shifts.'
            },
            {
              title: 'Mark Volunteer Work Complete',
              description: 'When a student completes their volunteer work, mark it as complete. This sends a notification to the Pantry for review. The Pantry decides whether to approve and issue the Allocation Tickets.'
            },
            {
              title: 'Track Approval Status',
              description: 'See the status of volunteer completions: "Not Notified" → "Pending Pantry Review" → "Ticket Issued by Pantry". You can only notify the Pantry; they have final approval.'
            },
            {
              title: 'View Donation History',
              description: 'Track all your past donations and see how they moved through the system: Donated → Available → Requested → Picked Up. Watch your food reach students in real-time.'
            }
          ]
        };

      case 'student':
        return {
          title: 'How This Works: Students',
          purpose: 'Get free food from the pantry by earning Allocation Tickets! There are only TWO ways to earn tickets: vote on governance proposals or complete volunteering opportunities. Use your tickets to request food items from the Pantry.',
          features: [
            {
              title: 'Earn Tickets by Voting',
              description: 'Vote on governance proposals created by the Pantry (like "Should we add more vegan options?"). Every vote you cast earns you 1 Allocation Ticket automatically. Your voice helps decide what food is available!'
            },
            {
              title: 'Earn Tickets by Volunteering',
              description: 'Browse volunteering opportunities posted by Suppliers (food sorting, delivery assistance, etc). Sign up, complete the work, and the Supplier will notify the Pantry. Once the Pantry approves, you earn 1-2 Allocation Tickets per shift.'
            },
            {
              title: 'Request Food with Your Tickets',
              description: 'Browse available food items and use 1 Allocation Ticket to request any item. Your ticket is used immediately. The Pantry will review and approve your request (usually within 24 hours).'
            },
            {
              title: 'Pick Up Your Food',
              description: 'Once approved, come to the Pantry and show your QR code. After the Pantry confirms pickup, the item automatically disappears from your requests list.'
            },
            {
              title: 'View Your Ticket Balance',
              description: 'Check your current Allocation Tickets on your Dashboard, Volunteering page, or Request Food page. Always visible so you know how many items you can request.'
            },
            {
              title: 'Track Your Active Requests',
              description: 'See all your food requests in one place. Requests show as "Pending" (awaiting approval) or "Ready" (approved for pickup). Items disappear once picked up.'
            }
          ]
        };
      
      default:
        return {
          title: 'How This Works',
          purpose: '',
          features: []
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
            <h4 className={`font-semibold ${colors.text} mb-2`}>Key System Features</h4>
            <ul className={`space-y-1 text-sm ${colors.textLight}`}>
              <li>• Allocation Ticket economy for fair food access</li>
              <li>• Two clear ways to earn: Vote or Volunteer</li>
              <li>• Pantry controls all ticket issuance (prevents abuse)</li>
              <li>• Real-time tracking of requests and pickups</li>
              <li>• Automatic item removal after pickup confirmation</li>
              <li>• Secure, tamper-proof blockchain records</li>
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

