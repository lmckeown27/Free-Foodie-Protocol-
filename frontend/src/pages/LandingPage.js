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
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-b from-purple-100 to-white',
      sectionBg: 'bg-purple-100',
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
        answer: "Participate in platform governance by voting on proposals and volunteering in your community. When food becomes available, the pantry fairly allocates it based on multiple factors including your participation, need, and pickup reliability. If approved, you'll receive a digital pickup ticket managed by the Pantry. Present this at the pantry to collect your food! The more you engage with the platform, the better your priority access becomes."
      },
      {
        id: 2,
        question: "What is a pickup ticket and why do I need one?",
        answer: "A pickup ticket is like a digital receipt that proves your food allocation. When the pantry approves your food request, this ticket is automatically created for you. It contains details like what food you're allocated and when to pick it up. Because it's securely managed by the Pantry, it can't be forged or stolen. When you arrive at the pantry, workers scan your ticket to verify your claim—preventing fraud and ensuring only approved students get food. After pickup, the ticket is marked as 'used' so no one can claim the same food twice."
      },
      {
        id: 3,
        question: "How does voting work and why does my vote matter?",
        answer: "Your votes tell the pantry what food you actually want. When you vote, your choice is recorded as a permanent, tamper-proof record. You also build voting power—the more you participate, the more influence you have in future decisions. Your participation helps the pantry predict demand and optimize food allocation. This ensures the pantry stocks what students actually need, not just what's easy to source. Your voice truly shapes the food available!"
      },
      {
        id: 4,
        question: "Do I need cryptocurrency or money to use FFQ?",
        answer: "Absolutely not! FFQ is 100% free. You don't need to buy crypto, pay any fees, or connect a wallet. The Pantry manages everything on your behalf—you just sign up with your Cal Poly ID and use the platform. All fees are covered by FFQ. The secure technology runs in the background; from your perspective, it's just a regular app. No technical knowledge required!"
      },
      {
        id: 5,
        question: "Why is FFQ better than traditional food pantries?",
        answer: "Traditional pantries often operate on 'first come, first served' (favoring those who can line up early), lack transparency (students can't see how decisions are made), and rely on manual processes (prone to errors and bias). FFQ provides fair allocation (prioritizing need, participation, and reliability), complete transparency (see the entire food supply chain), student voice (vote on what food comes in), and fraud prevention (tamper-proof records). FFQ transforms food pantries from charity handouts into an equitable, student-driven system where everyone has a voice and a fair shot at the food they need."
      }
    ],
    pantry: [
      {
        id: 1,
        question: "What are the Pantry's responsibilities in FFQ?",
        answer: "The Pantry role combines operational management and governance oversight. You manage daily operations (accept donations, allocate food, verify pickups), handle governance tasks (verify suppliers, maintain secure student accounts, issue digital credentials), and monitor system health (track analytics, ensure compliance, audit all transactions). The Pantry maintains a secure team account that manages verification on behalf of all students, so they don't need to manage any accounts themselves. The Pantry uses multi-party approval to ensure no single person controls critical functions."
      },
      {
        id: 2,
        question: "How does POAS help us allocate food fairly?",
        answer: "POAS (Predicted Optimal Allocation Score) is an AI-powered algorithm that calculates fair food distribution based on: governance participation (35% - students who vote on proposals), volunteer hours (20% - community contributors), need factor (20% - fewer past allocations), pickup reliability (10% - redemption rate), and recent activity (10%). Instead of manual decisions or first-come-first-served, POAS provides allocation recommendations you review and approve. This rewards engaged, responsible students while ensuring those in need get priority. All allocation data is permanently recorded in the secure system for complete transparency and accountability."
      },
      {
        id: 3,
        question: "How do we verify and approve new suppliers?",
        answer: "When suppliers apply to donate through FFQ, the Pantry reviews their application and business credentials (EIN, licenses, food safety certifications). If approved, you issue a verified Partner Certificate through the Pantry's secure team account. This certificate acts as their verified credential to donate food through the platform. Suppliers don't need any technical setup—the Pantry's system handles all verification on their behalf. The entire verification process is permanently recorded for transparency, ensuring only legitimate, compliant suppliers can participate."
      },
      {
        id: 4,
        question: "What is multi-party approval and why is it critical?",
        answer: "Multi-party approval (team verification) requires multiple people to approve important actions, like releasing food allocations or accepting donations. Think of it like a safety deposit box that needs two keys to open. FFQ uses secure team verification for 2-of-3 or 3-of-5 approval setups. This prevents any single person from making unauthorized changes, protects against fraud or mistakes, and creates an audit trail for compliance. It's essential for institutional trust and accountability."
      },
      {
        id: 5,
        question: "How does the secure account system work for students?",
        answer: "The Pantry maintains a secure team account (requiring multiple staff approvals) that manages all digital verification on behalf of students. Students don't need to download any apps, manage account credentials, or pay any fees—the Pantry's secure system handles all technical verification automatically. This provides a seamless app-like user experience while maintaining key benefits: transparency, fraud prevention, and fair allocation. When students vote or claim food, the Pantry's system automatically verifies and issues digital credentials. Students interact with FFQ like a regular app, while secure verification runs in the background."
      },
      {
        id: 6,
        question: "What happens when we scan a student's pickup ticket?",
        answer: "When you scan a student's pickup ticket at the pantry, the system verifies: (1) The ticket is authentic and issued by your pantry, (2) The student's account owns this ticket, (3) The ticket hasn't been redeemed yet, (4) The pickup is within the valid timeframe. Once verified, you mark it as 'redeemed' in the system. The ticket status updates permanently, preventing the same student from claiming twice. This creates a tamper-proof pickup record and real-time inventory tracking."
      }
    ],
    supplier: [
      {
        id: 1,
        question: "How do I donate food through FFQ?",
        answer: "After the Pantry approves your application, simply log in to your supplier portal and list your available surplus food with details like weight, type, and location. The Pantry manages all verification automatically—you don't need any technical setup. Once logged, a permanent, verified donation receipt is created on your behalf. The system tracks exactly where your food goes and how many students it helps. Everything is automated, compliant, and transparent—you just focus on donating food!"
      },
      {
        id: 2,
        question: "What is a donation receipt and how does it help my business?",
        answer: "Your donation receipt is a permanent, verifiable record of your food donation. It serves as: (1) IRS-compliant proof for tax deductions, (2) Public record of your community contribution (builds reputation), (3) Impact metrics showing exactly how many students you helped. Unlike paper receipts that can be lost or forged, digital records are permanent and instantly verifiable. This makes donating easier, safer, and more rewarding. You can show stakeholders real, auditable proof of your social impact."
      },
      {
        id: 3,
        question: "How does FFQ protect us from liability when donating food?",
        answer: "FFQ enforces the Good Samaritan Act and SB 1383 compliance through automated verification systems. The system automatically verifies that donations meet VLCP (Verifiable Logistics Checklist Protocol) standards for food safety. This includes temperature logs, handling procedures, and donation timestamps—all permanently recorded in the secure system. Automated verification creates an immutable compliance trail, protecting you from liability claims. If anyone questions a donation, you have tamper-proof digital proof that all safety and legal requirements were met at the time of donation."
      },
      {
        id: 4,
        question: "Can I track where my donated food goes?",
        answer: "Yes! FFQ provides complete supply chain visibility. After donating, you can see: which pantry received your food, when it was received and distributed, which students benefited (anonymous data), and impact metrics (lbs rescued, meals provided, waste prevented). Your supplier dashboard shows donation history, cumulative impact, and community recognition. This transparency helps you report to stakeholders, qualify for grants, and demonstrate corporate social responsibility."
      },
      {
        id: 5,
        question: "Do I need any technical setup to participate?",
        answer: "No! FFQ is completely free and requires no technical setup. The Pantry manages all the verification and record-keeping on your behalf. Any fees are covered by FFQ—you'll never be charged. Just log in to your supplier portal and start donating food. The secure technology handles all the compliance, receipts, and tracking automatically in the background. From your perspective, it's a simple donation platform that provides permanent verified proof and impact tracking. No technical knowledge required!"
      }
    ]
  };

  const currentUser = userTypes[activeUserType];
  const currentFaqs = faqsByRole[activeUserType];

  // Dynamic button colors for each user type
  const buttonColors = {
    student: 'bg-primary-600 hover:bg-primary-700',
    pantry: 'bg-purple-600 hover:bg-purple-700',
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
      activeTab: 'bg-purple-600',
      inactiveTabBorder: 'border-purple-200',
      stepCircle: 'bg-purple-600',
      arrow: 'bg-purple-300'
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
      background: 'bg-purple-100',
      border: 'border-purple-300',
      hover: 'hover:bg-purple-200',
      plusSign: 'text-purple-600',
      ctaBackground: 'bg-purple-200',
      ctaButton: 'bg-purple-600 hover:bg-purple-700'
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
                    <div className="absolute -top-3 -right-3 bg-white text-primary-600 rounded-full w-14 h-14 flex items-center justify-center font-bold text-base shadow-md border-2 border-primary-600">
                      100%
                    </div>
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
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute -top-3 -right-3 bg-purple-200 text-purple-900 rounded-full w-14 h-14 flex items-center justify-center font-bold text-xs shadow-md border-2 border-purple-600 leading-tight">
                      <div className="text-center">Create<br/>Proposals</div>
                    </div>
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-lg text-center">Pantry</div>
                    <div className="text-xs text-purple-100 text-center mt-1 mb-3">BNI + Operations</div>
                    <div className="space-y-1 text-xs text-purple-100">
                      <div className="bg-white/10 rounded px-2 py-1">Create proposals</div>
                      <div className="bg-white/10 rounded px-2 py-1">Execute decisions</div>
                      <div className="bg-white/10 rounded px-2 py-1">Custodial wallet</div>
                    </div>
                  </div>
                </div>

                {/* Suppliers (Food Provision) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute -top-3 -right-3 bg-blue-200 text-blue-900 rounded-full w-14 h-14 flex items-center justify-center font-bold text-xs shadow-md border-2 border-blue-600 leading-tight">
                      <div className="text-center">Food<br/>Provision</div>
                    </div>
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
                <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold text-sm">
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
                  <span>Powered by Aptos Blockchain</span>
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
                <li><a href="#" className="hover:text-white transition">SB 1383</a></li>
                <li><a href="#" className="hover:text-white transition">Good Samaritan Act</a></li>
                <li><a href="#" className="hover:text-white transition">VLCP Standards</a></li>
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

