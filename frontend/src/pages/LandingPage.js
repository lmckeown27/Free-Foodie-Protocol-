import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [activeUserType, setActiveUserType] = useState('student');
  const [openFaqId, setOpenFaqId] = useState(null);
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
      subheadline: 'Combined operations and governance with data-driven allocation, supplier verification, and blockchain accountability.',
      cta: 'Get Started',
      ctaAction: () => navigate('/login')
    },
    supplier: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-b from-blue-100 to-white',
      sectionBg: 'bg-blue-100',
      title: 'Supplier',
      headline: 'Donate Surplus. Track Impact. Stay Compliant.',
      subheadline: 'Automated compliance, liability protection, and transparent donation tracking.',
      cta: 'Get Started',
      ctaAction: () => navigate('/login')
    }
  };

  const features = [
    {
      title: 'Blockchain Transparency',
      description: 'Every transaction and allocation is permanently recorded for full accountability.'
    },
    {
      title: 'Fair Allocation',
      description: 'Smart algorithm ensures equitable distribution based on need and participation.'
    },
    {
      title: 'Liability Protection',
      description: 'Automatic compliance and Good Samaritan Act protection for all donations.'
    },
    {
      title: 'Real-Time Analytics',
      description: 'Live dashboards show inventory, demand, allocations, and key metrics.'
    }
  ];

  const howItWorks = {
    student: [
      { step: 1, title: 'Register', description: 'Sign up with Cal Poly ID and get a custodial wallet managed by the Pantry' },
      { step: 2, title: 'Vote & Participate', description: 'Vote on proposals and policies to shape what food the pantry stocks' },
      { step: 3, title: 'Earn Priority', description: 'Gain priority through voting, volunteering, and reliable pickups' },
      { step: 4, title: 'Claim & Pickup', description: 'Get your pickup ticket, show QR code at pantry, and collect food' }
    ],
    pantry: [
      { step: 1, title: 'Manage Operations', description: 'Verify suppliers, manage inventory, and handle food distribution' },
      { step: 2, title: 'Create Proposals', description: 'Create proposals for students to vote on and execute approved decisions' },
      { step: 3, title: 'Manage Wallets', description: 'Hold custodial wallets for students and issue credentials on their behalf' },
      { step: 4, title: 'POAS & Analytics', description: 'Use POAS for allocations, verify pickups, and monitor platform health' }
    ],
    supplier: [
      { step: 1, title: 'Apply & Get Approved', description: 'Submit application and get verified by the Pantry for donations' },
      { step: 2, title: 'Receive Requests', description: 'Get food requests based on student votes and current needs' },
      { step: 3, title: 'Log Donations', description: 'Log donations with type, quantity, and location for tracking' },
      { step: 4, title: 'Track Impact', description: 'View pounds donated, meals saved, and verified receipts' }
    ]
  };

  const faqsByRole = {
    student: [
      {
        id: 1,
        question: "How do I get food from FFQ?",
        answer: "Vote and volunteer to earn priority. The pantry allocates food based on your participation and need. You'll get a pickup ticket when approved."
      },
      {
        id: 2,
        question: "What is a pickup ticket?",
        answer: "Digital proof of your food allocation. Show it at pickup. It's tamper-proof and automatically marked as used after collection."
      },
      {
        id: 3,
        question: "Why does my vote matter?",
        answer: "Your votes shape what food gets stocked and help the pantry predict demand. More participation = more influence."
      },
      {
        id: 4,
        question: "Do I need cryptocurrency?",
        answer: "No. FFQ is free—no crypto, no fees. Just sign up with your Cal Poly ID. The Pantry handles everything behind the scenes."
      },
      {
        id: 5,
        question: "Why FFQ over traditional pantries?",
        answer: "Traditional pantries favor those who can skip class and lack transparency. FFQ uses fair allocation, gives students voting power, and prevents fraud."
      }
    ],
    pantry: [
      {
        id: 1,
        question: "What are the Pantry's responsibilities?",
        answer: "Handle operations (donations, allocations, pickups), governance (verify suppliers, issue credentials), and monitoring (analytics, compliance). Multi-party approval ensures no single person controls critical functions."
      },
      {
        id: 2,
        question: "How does POAS help allocate food?",
        answer: "POAS scores students based on participation, volunteering, need, and reliability. It provides recommendations you review and approve. All data is permanently recorded."
      },
      {
        id: 3,
        question: "How do we verify new suppliers?",
        answer: "Review their credentials (EIN, licenses). If approved, issue a Partner Certificate. The system handles setup and records the verification."
      },
      {
        id: 4,
        question: "What is multi-party approval?",
        answer: "Multiple people must approve important actions. Uses 2-of-3 or 3-of-5 setups. Prevents fraud and creates an audit trail."
      },
      {
        id: 5,
        question: "How does the student wallet system work?",
        answer: "The Pantry holds secure wallets for students. When they vote or claim food, the system handles verification automatically. Students see a regular app."
      },
      {
        id: 6,
        question: "What happens when we scan a pickup ticket?",
        answer: "System verifies authenticity and ownership. You mark it redeemed, permanently updating status to prevent duplicate claims."
      }
    ],
    supplier: [
      {
        id: 1,
        question: "How do I donate food?",
        answer: "Log in and list your surplus food (weight, type, location). The Pantry handles verification. You get a permanent receipt and tracking."
      },
      {
        id: 2,
        question: "What is a donation receipt?",
        answer: "Permanent proof for tax deductions and impact reporting. Digital records can't be lost or forged—show stakeholders auditable proof of your impact."
      },
      {
        id: 3,
        question: "How does FFQ protect from liability?",
        answer: "Automatic Good Samaritan Act and SB 1383 compliance. System verifies food safety standards and creates an immutable compliance trail."
      },
      {
        id: 4,
        question: "Can I track my donations?",
        answer: "Yes. See distribution details, anonymous student impact, and metrics (lbs rescued, meals, CO₂ saved) for reports."
      },
      {
        id: 5,
        question: "Do I need technical setup?",
        answer: "No. FFQ is free—no setup, no fees. Just log in and donate. The system handles compliance and tracking automatically."
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
      ctaButton: 'bg-primary-600 hover:bg-primary-700',
      answerText: 'text-green-600'
    },
    pantry: {
      background: 'bg-amber-100',
      border: 'border-amber-300',
      hover: 'hover:bg-amber-200',
      plusSign: 'text-amber-600',
      ctaBackground: 'bg-amber-200',
      ctaButton: 'bg-amber-600 hover:bg-amber-700',
      answerText: 'text-orange-600'
    },
    supplier: {
      background: 'bg-blue-100',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-200',
      plusSign: 'text-blue-600',
      ctaBackground: 'bg-blue-200',
      ctaButton: 'bg-blue-600 hover:bg-blue-700',
      answerText: 'text-blue-600'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Features & How It Works & Governance */}
            <div className="flex items-center gap-8">
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
              <button
                onClick={() => document.getElementById('governance')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Governance
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
            
            {/* Right - FAQ & Get Started */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                FAQ
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
              Transparent, fair, and efficient campus food distribution.
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
              Students vote, Pantry executes, Suppliers fulfill
            </p>
            
            {/* Visual Flow Diagram */}
            <div className="relative max-w-5xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border border-gray-200">
              
              {/* Title: Governance Model */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Student-Centric Governance</h3>
                <p className="text-xs text-gray-600 mt-1">Students have full voting power</p>
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

                {/* Supplier (Food Provision) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-center">Supplier</div>
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
                  Supplier Donate
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

      {/* Governance Section */}
      <section id="governance" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What is Governance?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Student government for your food pantry. You vote on what food is available.
            </p>
          </div>

          {/* Simple Explanation Card */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 shadow-lg border-2 border-primary-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Governance in Simple Terms</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Students vote on what food to stock and policies to implement. Your votes shape the pantry. More participation = higher priority for food.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How Governance Works in FFQ */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How Governance Works in FFQ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-full ${howItWorksColors[activeUserType].stepCircle} text-white flex items-center justify-center font-bold text-xl mb-4 mx-auto`}>
                    1
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Pantry Creates Proposal</h4>
                  <p className="text-gray-600 text-center flex-grow">
                    Pantry creates proposals for students to vote on.
                  </p>
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-800 font-medium">Example: "Should we stock more gluten-free bread?"</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-full ${howItWorksColors[activeUserType].stepCircle} text-white flex items-center justify-center font-bold text-xl mb-4 mx-auto`}>
                    2
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Students Vote</h4>
                  <p className="text-gray-600 text-center flex-grow">
                    Students cast their vote. Every vote is recorded.
                  </p>
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-800 font-medium">Voting increases your priority for food allocations!</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-full ${howItWorksColors[activeUserType].stepCircle} text-white flex items-center justify-center font-bold text-xl mb-4 mx-auto`}>
                    3
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Decision Executed</h4>
                  <p className="text-gray-600 text-center flex-grow">
                    Pantry implements approved decisions.
                  </p>
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-800 font-medium">Democracy in action—students decide the outcome!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Vote On */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Can You Vote On?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${howItWorksColors[activeUserType].stepCircle} mt-2 flex-shrink-0`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">Food Types & Preferences</p>
                    <p className="text-sm text-gray-600 mt-1">"Should we stock more organic produce?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${howItWorksColors[activeUserType].stepCircle} mt-2 flex-shrink-0`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">Supplier Approvals</p>
                    <p className="text-sm text-gray-600 mt-1">"Should we accept donations from this restaurant?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${howItWorksColors[activeUserType].stepCircle} mt-2 flex-shrink-0`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">Operating Hours & Policies</p>
                    <p className="text-sm text-gray-600 mt-1">"Should we add weekend pickup hours?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${howItWorksColors[activeUserType].stepCircle} mt-2 flex-shrink-0`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">Allocation Priorities</p>
                    <p className="text-sm text-gray-600 mt-1">"Should volunteer hours count for more priority?"</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-700">
                  <strong>If it affects the pantry, you vote on it.</strong>
                </p>
              </div>
            </div>
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
                  onClick={() => {
                    setActiveUserType(key);
                    setOpenFaqId(null); // Close any open FAQ when switching user types
                  }}
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
            {currentFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className={`${faqColors[activeUserType].background} rounded-lg shadow-md overflow-hidden border-2 ${faqColors[activeUserType].border} transition-all duration-300`}>
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className={`w-full px-6 py-5 text-left flex justify-between items-center ${faqColors[activeUserType].hover} transition`}
                  >
                    <span className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </span>
                    <span className={`text-2xl ${faqColors[activeUserType].plusSign} transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  <div 
                    className={`px-6 transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 pb-5 pt-3 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <p className={`font-bold ${faqColors[activeUserType].answerText}`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-12 text-center ${faqColors[activeUserType].ctaBackground} rounded-xl p-8`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to get started?
            </h3>
            <p className="text-gray-700 mb-6">
              Using FFQ is simple and free.
            </p>
            <button
              onClick={() => navigate('/login')}
              className={`px-8 py-3 ${faqColors[activeUserType].ctaButton} text-white font-semibold rounded-lg transition shadow-lg`}
            >
              Get Started - It's Free
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

