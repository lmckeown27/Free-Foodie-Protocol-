import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [activeUserType, setActiveUserType] = useState('student');
  const navigate = useNavigate();

  const userTypes = {
    student: {
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      bgColor: 'bg-gradient-to-b from-primary-100 to-white',
      sectionBg: 'bg-primary-100',
      title: 'Students',
      headline: 'Vote on Food. Earn Tokens. Get Fair Allocations.',
      subheadline: 'No more waiting in line. Your voice determines what the pantry stocks.',
      cta: 'Get Started',
      ctaAction: () => navigate('/login')
    },
    pantry: {
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-gradient-to-b from-amber-100 to-white',
      sectionBg: 'bg-amber-100',
      title: 'Pantry',
      headline: 'Operate. Govern. Allocate with Intelligence.',
      subheadline: 'Combined operations and governance with AI-driven allocation, supplier verification, and blockchain accountability.',
      cta: 'Get Started',
      ctaAction: () => navigate('/login')
    },
    supplier: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-b from-blue-100 to-white',
      sectionBg: 'bg-blue-100',
      title: 'Suppliers',
      headline: 'Donate Surplus. Track Impact. Stay Compliant.',
      subheadline: 'Automated compliance, liability protection, and transparent donation tracking.',
      cta: 'Get Started',
      ctaAction: () => navigate('/login')
    }
  };

  const features = [
    {
      title: 'Blockchain Transparency',
      description: 'Every transaction, vote, and allocation is recorded on Aptos for full accountability and auditability.'
    },
    {
      title: 'Fair Allocation',
      description: 'AI-powered algorithm ensures equitable distribution based on need, participation, and reliability.'
    },
    {
      title: 'Liability Protection',
      description: 'Smart contracts enforce VLCP compliance and Good Samaritan Act protection for all suppliers.'
    },
    {
      title: 'Real-Time Analytics',
      description: 'Live dashboards provide instant insights on inventory, demand, allocations, and compliance metrics.'
    }
  ];

  const howItWorks = {
    student: [
      { step: 1, title: 'Register', description: 'Sign up with Cal Poly ID - Pantry manages your custodial wallet automatically' },
      { step: 2, title: 'Participate in Governance', description: 'Vote on platform proposals, supplier approvals, and policy changes' },
      { step: 3, title: 'Earn Priority', description: 'Gain priority access through governance participation, volunteering, and reliable pickups' },
      { step: 4, title: 'Claim & Pickup', description: 'Receive pickup ticket when approved, show QR code at pantry, collect food' }
    ],
    pantry: [
      { step: 1, title: 'Manage Operations', description: 'Combined BNI + Pantry team handles supplier verification, inventory, and distribution logistics' },
      { step: 2, title: 'Create Proposals', description: 'Identify needs and create governance proposals for students to vote on - execute approved decisions via multi-sig' },
      { step: 3, title: 'Custodial Wallet Service', description: 'Hold ONE custodial wallet for ALL students - issue NFTs and execute blockchain transactions on their behalf' },
      { step: 4, title: 'POAS & Analytics', description: 'Use AI-powered POAS (allocation algorithm), verify pickups via QR codes, monitor platform health' }
    ],
    supplier: [
      { step: 1, title: 'Apply & Get Approved', description: 'Submit application - Pantry verifies your credentials for donation tracking' },
      { step: 2, title: 'Receive Food Requests', description: 'Pantry sends food requests based on student governance votes and current needs' },
      { step: 3, title: 'Fulfill Donations', description: 'Log donations with type, quantity, and location - inventory automatically updated' },
      { step: 4, title: 'Track Impact', description: 'View pounds donated, meals saved, CO₂ reduced, and blockchain-verified donation receipts' }
    ]
  };

  const faqsByRole = {
    student: [
      {
        id: 1,
        question: "How do I get food from FFQ?",
        answer: "Vote on proposals and volunteer to build priority access. The pantry allocates food based on your participation, need, and pickup reliability. When approved, you'll receive a digital pickup ticket to collect your food. More engagement = better priority."
      },
      {
        id: 2,
        question: "What is a pickup ticket and why do I need one?",
        answer: "It's your digital proof of food allocation. The Pantry automatically creates it when you're approved. Workers scan it at pickup to verify your claim, then mark it 'used' to prevent duplicate claims. It's tamper-proof and can't be forged."
      },
      {
        id: 3,
        question: "How does voting work and why does my vote matter?",
        answer: "Your votes tell the pantry what food you want and are permanently recorded. More participation = more influence in future decisions. This helps the pantry predict demand and stock what students actually need. Your voice shapes the food available!"
      },
      {
        id: 4,
        question: "Do I need cryptocurrency or money to use FFQ?",
        answer: "No! FFQ is 100% free. Just sign up with your Cal Poly ID—no crypto, no fees, no technical setup. The Pantry manages everything. It's just a regular app."
      },
      {
        id: 5,
        question: "Why is FFQ better than traditional food pantries?",
        answer: "Traditional pantries use first-come-first-served (favors those who can skip class), lack transparency, and rely on manual processes prone to bias. FFQ provides fair AI-powered allocation, complete supply chain visibility, student voting power, and fraud prevention. It's an equitable, student-driven system—not just charity."
      }
    ],
    pantry: [
      {
        id: 1,
        question: "What are the Pantry's responsibilities in FFQ?",
        answer: "You handle daily operations (donations, allocations, pickups), governance tasks (verify suppliers, issue credentials), and monitoring (analytics, compliance, audits). The Pantry manages a secure team account on behalf of all students using multi-party approval—no single person controls critical functions."
      },
      {
        id: 2,
        question: "How does POAS help us allocate food fairly?",
        answer: "POAS is an AI algorithm that scores students based on governance participation (35%), volunteering (20%), need (20%), pickup reliability (10%), and recency (10%). It provides allocation recommendations you review and approve—rewarding engaged students while prioritizing those in need. All data is permanently recorded for transparency."
      },
      {
        id: 3,
        question: "How do we verify and approve new suppliers?",
        answer: "Review their application and credentials (EIN, licenses, certifications). If approved, issue a verified Partner Certificate through your secure account. The system handles all technical setup and permanently records the verification—ensuring only legitimate suppliers can participate."
      },
      {
        id: 4,
        question: "What is multi-party approval and why is it critical?",
        answer: "Multiple people must approve important actions (allocations, donations)—like a safety deposit box needing two keys. FFQ uses 2-of-3 or 3-of-5 approval setups. This prevents unauthorized changes, protects against fraud, and creates an audit trail for compliance and accountability."
      },
      {
        id: 5,
        question: "How does the secure account system work for students?",
        answer: "The Pantry maintains a secure team account that manages all verification for students—no apps, credentials, or fees required. When students vote or claim food, the system automatically verifies and issues credentials. They just see a regular app; security runs in the background."
      },
      {
        id: 6,
        question: "What happens when we scan a student's pickup ticket?",
        answer: "The system verifies the ticket is authentic, owned by the student, not yet redeemed, and within the valid timeframe. You mark it 'redeemed,' permanently updating the status to prevent duplicate claims. Creates tamper-proof records and real-time inventory tracking."
      }
    ],
    supplier: [
      {
        id: 1,
        question: "How do I donate food through FFQ?",
        answer: "After approval, log in and list your surplus food (weight, type, location). The Pantry manages all verification—no technical setup needed. You get a permanent donation receipt, and the system tracks where your food goes and how many students it helps. Just focus on donating!"
      },
      {
        id: 2,
        question: "What is a donation receipt and how does it help my business?",
        answer: "It's permanent, verifiable proof of your donation for: (1) IRS-compliant tax deductions, (2) Public reputation building, (3) Impact metrics (students helped). Unlike paper receipts, digital records can't be lost or forged. Show stakeholders real, auditable proof of your social impact."
      },
      {
        id: 3,
        question: "How does FFQ protect us from liability when donating food?",
        answer: "FFQ enforces Good Samaritan Act and SB 1383 compliance automatically. The system verifies donations meet VLCP food safety standards (temperature logs, handling, timestamps). Everything is permanently recorded, creating an immutable compliance trail. You have tamper-proof proof that all requirements were met."
      },
      {
        id: 4,
        question: "Can I track where my donated food goes?",
        answer: "Yes! See which pantry received it, when it was distributed, which students benefited (anonymous), and impact metrics (lbs rescued, meals provided, CO₂ saved). Your dashboard shows donation history and cumulative impact—perfect for stakeholder reports and grant applications."
      },
      {
        id: 5,
        question: "Do I need any technical setup to participate?",
        answer: "No! FFQ is completely free—no setup, no fees. The Pantry manages all verification and record-keeping. Just log in and start donating. The technology handles compliance, receipts, and tracking in the background. It's a simple platform with permanent verified proof."
      }
    ]
  };

  const currentUser = userTypes[activeUserType];
  const currentFaqs = faqsByRole[activeUserType];

  // Dynamic button colors for each user type
  const buttonColors = {
    student: 'bg-primary-600 hover:bg-primary-700',
    pantry: 'bg-amber-600 hover:bg-amber-700',
    supplier: 'bg-blue-600 hover:bg-blue-700'
  };

  // Dynamic colors for How It Works section
  const howItWorksColors = {
    student: {
      activeTab: 'bg-primary-600',
      inactiveTabBorder: 'border-primary-200',
      stepCircle: 'bg-primary-600',
      arrow: 'bg-primary-300'
    },
    pantry: {
      activeTab: 'bg-amber-600',
      inactiveTabBorder: 'border-amber-200',
      stepCircle: 'bg-amber-600',
      arrow: 'bg-amber-300'
    },
    supplier: {
      activeTab: 'bg-blue-600',
      inactiveTabBorder: 'border-blue-200',
      stepCircle: 'bg-blue-600',
      arrow: 'bg-blue-300'
    }
  };

  // Dynamic colors for FAQ section
  const faqColors = {
    student: {
      background: 'bg-primary-100',
      border: 'border-primary-300',
      hover: 'hover:bg-primary-200',
      plusSign: 'text-primary-600',
      ctaBackground: 'bg-primary-200',
      ctaButton: 'bg-primary-600 hover:bg-primary-700'
    },
    pantry: {
      background: 'bg-amber-100',
      border: 'border-amber-300',
      hover: 'hover:bg-amber-200',
      plusSign: 'text-amber-600',
      ctaBackground: 'bg-amber-200',
      ctaButton: 'bg-amber-600 hover:bg-amber-700'
    },
    supplier: {
      background: 'bg-blue-100',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200',
      plusSign: 'text-blue-600',
      ctaBackground: 'bg-blue-200',
      ctaButton: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - FAQ & Features & How It Works */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                FAQ
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                How It Works
              </button>
            </div>
            
            {/* Center - Free Foodie Quest */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition cursor-pointer"
              >
                Free Foodie Quest
              </button>
            </div>
            
            {/* Right - Navigation */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 ${buttonColors[activeUserType]} text-white rounded-lg transition font-medium`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 ${currentUser.bgColor}`}>
        <div className="max-w-7xl mx-auto">
          {/* User Type Selector */}
          <div className="flex justify-center gap-4 mb-12">
            {Object.entries(userTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setActiveUserType(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeUserType === key
                    ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.title}
              </button>
            ))}
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              {currentUser.headline}
            </h2>
            <div className="mb-8 max-w-2xl mx-auto min-h-[3.5rem] flex items-center justify-center">
              <p className="text-xl text-gray-600">
                {currentUser.subheadline}
              </p>
            </div>
            <button
              onClick={currentUser.ctaAction}
              className={`px-8 py-4 bg-gradient-to-r ${currentUser.gradient} text-white text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all`}
            >
              {currentUser.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Free Foodie Quest?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A secure digital platform that brings transparency, fairness, and efficiency to campus food pantries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Student-driven democratic governance: students vote, Pantry executes, suppliers fulfill requests
            </p>
            
            {/* Visual Flow Diagram */}
            <div className="relative max-w-5xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200">
              
              {/* Title: Governance Model */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Student-Centric Governance Model</h3>
                <p className="text-xs text-gray-600 mt-1">Students have 100% voting power on all platform decisions</p>
              </div>

              {/* Three Entities with Roles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Students (100% Voting Power) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-center">Students</div>
                    <div className="text-xs text-primary-100 text-center mt-1 mb-3">Full Voting Power</div>
                    <div className="space-y-1 text-xs text-primary-100">
                      <div className="bg-white/10 rounded px-2 py-1">Vote on ALL proposals</div>
                      <div className="bg-white/10 rounded px-2 py-1">Earn via POAS</div>
                      <div className="bg-white/10 rounded px-2 py-1">Volunteer & engage</div>
                    </div>
                  </div>
                </div>

                {/* Pantry (Proposal Creation) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-center">Pantry</div>
                    <div className="text-xs text-amber-100 text-center mt-1 mb-3">BNI + Operations</div>
                    <div className="space-y-1 text-xs text-amber-100">
                      <div className="bg-white/10 rounded px-2 py-1">Create proposals</div>
                      <div className="bg-white/10 rounded px-2 py-1">Execute decisions</div>
                      <div className="bg-white/10 rounded px-2 py-1">Custodial wallet</div>
                    </div>
                  </div>
                </div>

                {/* Suppliers (Food Provision) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-center">Suppliers</div>
                    <div className="text-xs text-blue-100 text-center mt-1 mb-3">Food Donors</div>
                    <div className="space-y-1 text-xs text-blue-100">
                      <div className="bg-white/10 rounded px-2 py-1">Receive requests</div>
                      <div className="bg-white/10 rounded px-2 py-1">Fulfill donations</div>
                      <div className="bg-white/10 rounded px-2 py-1">Track impact</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider: Food Distribution Flow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gray-100 px-4 text-xs font-medium text-gray-500">Food Distribution Flow</span>
                </div>
              </div>

              {/* Food Flow: Supplier → Pantry → Student */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  Suppliers Donate
                </div>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  Pantry Allocates
                </div>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  Students Receive
                </div>
              </div>

              {/* Blockchain Layer Badge */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-xl text-xs font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Powered by Aptos</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Type Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            {Object.entries(userTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setActiveUserType(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeUserType === key
                    ? `${howItWorksColors[key].activeTab} text-white`
                    : `bg-white text-gray-600 hover:bg-gray-50 border ${howItWorksColors[key].inactiveTabBorder}`
                }`}
              >
                {type.title}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks[activeUserType].map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
                  <div className={`w-12 h-12 rounded-full ${howItWorksColors[activeUserType].stepCircle} text-white flex items-center justify-center font-bold text-xl mb-4`}>
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {step.step < howItWorks[activeUserType].length && (
                  <div className={`hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 ${howItWorksColors[activeUserType].arrow}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${currentUser.sectionBg}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {currentUser.title} - Everything you need to know about using FFQ
            </p>

            {/* User Type Selector */}
            <div className="flex justify-center gap-4">
              {Object.entries(userTypes).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => setActiveUserType(key)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeUserType === key
                      ? `${howItWorksColors[key].activeTab} text-white`
                      : `bg-white text-gray-600 hover:bg-gray-50 border ${howItWorksColors[key].inactiveTabBorder}`
                  }`}
                >
                  {type.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {currentFaqs.map((faq) => (
              <div key={faq.id} className={`${faqColors[activeUserType].background} rounded-lg shadow-md overflow-hidden border-2 ${faqColors[activeUserType].border}`}>
                <button
                  onClick={() => {
                    const content = document.getElementById(`faq-${faq.id}`);
                    if (content) {
                      content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className={`w-full px-6 py-5 text-left flex justify-between items-center ${faqColors[activeUserType].hover} transition`}
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <span className={`text-2xl ${faqColors[activeUserType].plusSign}`}>+</span>
                </button>
                <div id={`faq-${faq.id}`} style={{ display: 'none' }} className="px-6 pb-5">
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-12 text-center ${faqColors[activeUserType].ctaBackground} rounded-xl p-8`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              We're here to help! Blockchain might seem complex, but using FFQ is simple.
            </p>
            <button
              onClick={() => navigate('/login')}
              className={`px-8 py-3 ${faqColors[activeUserType].ctaButton} text-white font-semibold rounded-lg transition shadow-lg`}
            >
              Try It Yourself - It's Free!
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of students, pantry workers, and suppliers using FFQ today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Get Started Now
            </button>
            <button
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-primary-400 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Free Foodie Quest</h3>
              <p className="text-sm">
                Blockchain-powered food pantry management for Cal Poly and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><button onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition text-left">Blockchain FAQ</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition text-left">Sign In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.calrecycle.ca.gov/organics/slcp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">SB 1383</a></li>
                <li><a href="https://www.usda.gov/media/blog/2020/08/13/good-samaritan-act-provides-liability-protection-food-donations" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Good Samaritan Act</a></li>
                <li><a href="https://www.fda.gov/food/guidance-regulation-food-and-dietary-supplements/retail-food-protection" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">VLCP Standards</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>contact@ffq.io</li>
                <li>Cal Poly SLO</li>
                <li>San Luis Obispo, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Free Foodie Quest. Built on Aptos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

