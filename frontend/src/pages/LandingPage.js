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
      title: 'Pantry Workers',
      headline: 'Smart Allocation. Multi-Sig Security. Zero Guesswork.',
      subheadline: 'POAS-driven decisions backed by blockchain accountability.',
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
    },
    bni: {
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-b from-orange-100 to-white',
      sectionBg: 'bg-orange-100',
      title: 'Basic Needs Initiative',
      headline: 'Governance. Verification. System Oversight.',
      subheadline: 'Empower the ecosystem through infrastructure, compliance, and blockchain oversight.',
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
      title: 'Fair Allocation (POAS)',
      description: 'Predicted Optimal Allocation Score ensures equitable distribution based on need, participation, and demand.'
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
      { step: 1, title: 'Register', description: 'Sign up with Cal Poly ID - BNI creates your custodial wallet' },
      { step: 2, title: 'Vote on Food', description: 'Browse available inventory and vote for items you need' },
      { step: 3, title: 'Earn Priority', description: 'Your POAS score increases with voting activity and engagement' },
      { step: 4, title: 'Claim & Pickup', description: 'Receive allocation notification, show QR code, pick up food' }
    ],
    pantry: [
      { step: 1, title: 'Accept Donations', description: 'Receive supplier donations and log them in inventory' },
      { step: 2, title: 'View POAS Rankings', description: 'See AI-powered recommendations for fair allocation' },
      { step: 3, title: 'Allocate Food', description: 'Assign items to students based on POAS priority scores' },
      { step: 4, title: 'Verify Pickups', description: 'Scan student QR codes to confirm food distribution' }
    ],
    supplier: [
      { step: 1, title: 'Apply & Get Approved', description: 'Submit application - BNI verifies and mints your Supplier NFT' },
      { step: 2, title: 'Donate Surplus', description: 'Add food donations with details (type, quantity, expiration)' },
      { step: 3, title: 'Get Protected', description: 'Automatic compliance with Good Samaritan Act and SB 1383' },
      { step: 4, title: 'Track Impact', description: 'View pounds donated, meals saved, and CO₂ reduced on blockchain' }
    ],
    bni: [
      { step: 1, title: 'Approve Suppliers', description: 'Review applications and mint Supplier NFTs via Multi-Sig Vault' },
      { step: 2, title: 'Manage Wallets', description: 'Create and oversee custodial wallets for all students' },
      { step: 3, title: 'Mint NFTs', description: 'Issue Governance NFTs (voting) and Allocation NFTs (claims)' },
      { step: 4, title: 'Monitor Compliance', description: 'Track system analytics, audit logs, and blockchain transactions' }
    ]
  };

  const faqsByRole = {
    student: [
      {
        id: 1,
        question: "How do I get food from FFQ?",
        answer: "First, vote on the food items you'd like to see in the pantry. Your votes help determine what gets stocked. When food becomes available, you can request it through the platform. The POAS (Predicted Optimal Allocation Score) algorithm fairly distributes food based on need, participation, and timing. If approved, you'll receive an Allocation NFT—a digital pickup ticket—in your wallet. Present this at the pantry to collect your food!"
      },
      {
        id: 2,
        question: "What is an Allocation NFT and why do I need one?",
        answer: "An Allocation NFT is like a digital pickup ticket stored in your wallet. When the pantry approves your food request, this NFT is automatically created and sent to you. It contains details like what food you're allocated, when to pick it up, and expiration dates. Because it's on the blockchain, it can't be forged or stolen. When you arrive at the pantry, workers scan your NFT to verify your claim—preventing fraud and ensuring only approved students get food. After pickup, the NFT is 'redeemed' (marked as used) so no one can claim the same food twice."
      },
      {
        id: 3,
        question: "Wait, aren't NFTs just those monkey pictures? How is this different?",
        answer: "Great question! You're thinking of collectible NFTs (like Bored Apes, CryptoPunks, etc.)—digital art sold for speculation and status. FFQ uses utility NFTs, which serve completely different purposes. Collectible NFTs are bought/sold for money, used as profile pictures, purely aesthetic, and often expensive. FFQ's Utility NFTs are 100% FREE, serve as your voting rights and food pickup tickets, have specific practical purposes, and are not tradeable. They're digital certificates that prove rights, prevent fraud, and enable fair distribution. Think of them like digital tickets, receipts, and ID cards—not collectibles or investments."
      },
      {
        id: 4,
        question: "How does voting work and why does my vote matter?",
        answer: "Your votes tell the pantry what food you actually want. When you vote, your choice is recorded on the blockchain as a permanent, tamper-proof record. You also receive a Governance NFT—a digital certificate that proves you participated and gives you voting power in future decisions. The more you engage, the more influence you have. The POAS algorithm uses voting data to predict demand and optimize food allocation. This ensures the pantry stocks what students actually need, not just what's easy to source. Your voice truly shapes the food available!"
      },
      {
        id: 5,
        question: "Do I need cryptocurrency or money to use FFQ?",
        answer: "Absolutely not! FFQ is 100% free. You don't need to buy crypto or pay any fees. We're running on Aptos testnet (a test blockchain network) where everything is free. Any small transaction fees ('gas fees') are covered by FFQ—you'll never be charged. Just install the free Petra wallet, sign up with your Cal Poly ID, and start using FFQ. The blockchain tech runs in the background; from your perspective, it's just a regular app. No crypto knowledge required!"
      },
      {
        id: 6,
        question: "Why is FFQ better than traditional food pantries?",
        answer: "Traditional pantries often operate on 'first come, first served' (favoring those who can line up early), lack transparency (students can't see how decisions are made), and rely on manual processes (prone to errors and bias). FFQ uses blockchain to create fair allocation (POAS algorithm ensures equity), complete transparency (see the entire food supply chain), student voice (vote on what food comes in), and fraud prevention (tamper-proof records). Blockchain transforms food pantries from charity handouts into an equitable, student-driven system where everyone has a voice and a fair shot at the food they need."
      }
    ],
    pantry: [
      {
        id: 1,
        question: "How does FFQ help manage food allocations?",
        answer: "FFQ uses the POAS (Predicted Optimal Allocation Score) algorithm to automatically calculate fair food distribution. Instead of manual decisions or first-come-first-served, POAS considers factors like student need, participation history, timing, and current demand. The system provides allocation recommendations that you can review and approve. All allocation data is recorded on the blockchain for complete transparency and accountability. This eliminates bias, reduces manual work, and ensures equitable distribution."
      },
      {
        id: 2,
        question: "What is multi-sig security and why do we need it?",
        answer: "Multi-signature (multi-sig) security requires multiple people to approve important actions, like releasing food allocations or accepting donations. Think of it like a safety deposit box that needs two keys to open. FFQ uses Petra Vault for 2-of-3 or 3-of-5 multi-sig setups. This prevents any single person from making unauthorized changes, protects against fraud or mistakes, and creates an audit trail for compliance. It's essential for managing pantry operations with accountability and institutional trust."
      },
      {
        id: 3,
        question: "How does blockchain prevent fraud in our pantry operations?",
        answer: "Blockchain prevents fraud through immutable records (once recorded, transactions can't be altered or deleted), unique NFTs (allocation tickets can't be copied or reused), automated smart contracts (no human can override fair allocation rules), and transparent auditing (anyone can verify the entire distribution chain). Traditional systems rely on trust and manual checks—blockchain replaces trust with mathematical proof. Students can't fake Allocation NFTs, suppliers can't falsify donations, and all pantry actions are permanently recorded. The system is fraud-proof by design."
      },
      {
        id: 4,
        question: "What happens when we scan a student's Allocation NFT?",
        answer: "When you scan a student's Allocation NFT at pickup, the system verifies: (1) The NFT is authentic and issued by your pantry, (2) The student's wallet owns this NFT, (3) The NFT hasn't been redeemed yet, (4) The pickup is within the valid timeframe. Once verified, you mark it as 'redeemed' on the blockchain. The NFT status updates permanently, preventing the same student from claiming twice. This creates a tamper-proof pickup record and real-time inventory tracking."
      },
      {
        id: 5,
        question: "How do we track inventory and donations on blockchain?",
        answer: "Every donation from suppliers is recorded on the blockchain with details like weight, type, expiry date, and source. Suppliers receive Supplier NFTs as permanent donation receipts. As you process donations and distribute food, all inventory movements are logged on-chain. You get real-time dashboards showing: current inventory levels, donation sources, allocation history, and compliance metrics. This creates complete supply chain visibility and automated reporting for audits or compliance checks."
      },
      {
        id: 6,
        question: "Do we need technical blockchain knowledge to use FFQ?",
        answer: "No! FFQ's interface looks and feels like a regular pantry management system. The blockchain runs in the background—you'll interact with familiar buttons, dashboards, and workflows. For setup, you'll need to create a Petra Wallet and configure multi-sig security (we provide step-by-step guides). Once set up, daily operations are simple: review POAS recommendations, scan student NFTs at pickup, and track inventory through intuitive dashboards. The complexity is hidden; the benefits are clear."
      }
    ],
    supplier: [
      {
        id: 1,
        question: "How do I donate food through FFQ?",
        answer: "Connect your Petra Wallet to FFQ, then list your available surplus food with details like weight, type, and expiration date. FFQ's smart contracts automatically handle the custody transfer—you don't need manual paperwork. Once logged, you immediately receive a Supplier NFT: a permanent, blockchain-verified donation receipt. The system tracks exactly where your food goes and how many students it helps. Everything is automated, compliant, and transparent."
      },
      {
        id: 2,
        question: "What is a Supplier NFT and how does it help my business?",
        answer: "A Supplier NFT is a permanent, verifiable record of your food donation on the blockchain. It serves as: (1) IRS-compliant proof for tax deductions, (2) Public record of your community contribution (builds reputation), (3) Impact metrics showing exactly how many students you helped. Unlike paper receipts that can be lost or forged, blockchain records are permanent and instantly verifiable. This makes donating easier, safer, and more rewarding. You can show stakeholders real, auditable proof of your social impact."
      },
      {
        id: 3,
        question: "How does FFQ protect us from liability when donating food?",
        answer: "FFQ enforces the Good Samaritan Act and SB 1383 compliance through smart contracts. The system automatically verifies that donations meet VLCP (Verifiable Logistics Checklist Protocol) standards for food safety. This includes temperature logs, expiration dates, and handling procedures—all recorded on-chain. Smart contracts create an immutable compliance trail, protecting you from liability claims. If anyone questions a donation, you have blockchain-verified proof that all safety and legal requirements were met at the time of donation."
      },
      {
        id: 4,
        question: "Can I track where my donated food goes?",
        answer: "Yes! FFQ provides complete supply chain visibility. After donating, you can see: which pantry received your food, when it was received and distributed, which students benefited (anonymous data), and impact metrics (lbs rescued, meals provided, waste prevented). Your supplier dashboard shows donation history, cumulative impact, and community recognition. This transparency helps you report to stakeholders, qualify for grants, and demonstrate corporate social responsibility."
      },
      {
        id: 5,
        question: "Wait, aren't NFTs just those monkey pictures? How is this different?",
        answer: "Great question! You're thinking of collectible NFTs (like Bored Apes)—digital art sold for speculation. FFQ uses utility NFTs, which are completely different. Collectible NFTs are bought/sold for money, used as status symbols, and purely aesthetic. FFQ's Supplier NFTs are 100% FREE, serve as donation receipts for tax purposes, prove community impact, and are not tradeable. Think of them like digital receipts and certificates—not collectibles. You'll never see monkey pictures on FFQ, just functional blockchain tools that make donating easier and provide permanent proof of your contributions."
      },
      {
        id: 6,
        question: "Do I need cryptocurrency to participate?",
        answer: "No! FFQ is completely free for suppliers. You don't need to buy any cryptocurrency. We're running on Aptos testnet (a free test network). Any transaction fees are covered by FFQ—you'll never be charged. Just install the free Petra wallet and connect it to FFQ. The blockchain technology handles all the compliance, receipts, and tracking automatically in the background. From your perspective, it's a simple donation platform that happens to provide blockchain-verified proof and impact tracking."
      }
    ],
    bni: [
      {
        id: 1,
        question: "What is the Basic Needs Initiative's role in FFQ?",
        answer: "The Basic Needs Initiative (BNI) serves as the governance layer for the Free Foodie Quest platform. BNI provides oversight and infrastructure without centralized control. We verify suppliers, manage custodial wallets for students, configure pantry multi-sig vaults, monitor system-wide analytics, and ensure compliance. Think of BNI as the foundation that empowers each role to operate independently while maintaining transparency and accountability through blockchain technology."
      },
      {
        id: 2,
        question: "How do we verify and approve new suppliers?",
        answer: "When suppliers apply to donate through FFQ, BNI reviews their application and business credentials (EIN, licenses, food safety certifications). If approved, BNI mints a Supplier NFT on the Aptos blockchain and sends it to the supplier's wallet. This NFT acts as their verified credential to donate food through the platform. The entire verification process is recorded on-chain for transparency. This protects students and pantries by ensuring only legitimate, compliant suppliers can participate."
      },
      {
        id: 3,
        question: "What are custodial wallets and why do students need them?",
        answer: "Custodial wallets are blockchain wallets managed by BNI on behalf of students. Students don't need to download wallet apps or manage private keys—BNI handles the technical blockchain interactions for them. This provides a seamless Web2-style user experience while maintaining Web3 benefits (transparency, fraud prevention, fair allocation). When students vote or claim food, BNI's system executes the blockchain transactions automatically. It's like having a bank account where BNI is the trusted custodian, but all transactions are transparent on the public blockchain."
      },
      {
        id: 4,
        question: "How does BNI configure pantry multi-sig vaults?",
        answer: "BNI sets up Petra Vault multi-signature wallets for each pantry. These vaults require multiple pantry workers to approve important actions (like releasing allocations or accepting donations). BNI assigns co-signers, sets approval thresholds (e.g., 2-of-3 or 3-of-5), and registers the vault on the blockchain. This ensures no single person can make unauthorized changes, creating accountability and preventing fraud. BNI provides the infrastructure, but pantry workers maintain operational control."
      },
      {
        id: 5,
        question: "What kind of analytics and oversight does BNI monitor?",
        answer: "BNI has access to comprehensive system-wide analytics: student participation rates and token usage, supplier contributions and donation patterns, pantry operations and allocation efficiency, POAS algorithm fairness metrics, and compliance logs and audit trails. This data helps BNI identify issues, optimize the platform, and provide transparency to stakeholders. All monitoring is based on blockchain data—BNI can see what's happening but cannot alter past transactions. It's oversight without control."
      },
      {
        id: 6,
        question: "How is BNI's governance different from traditional administration?",
        answer: "Unlike traditional centralized administration, BNI provides governance without micromanagement. BNI manages infrastructure (wallets, vaults, verification) but doesn't control day-to-day operations. Pantry workers decide allocations, students vote on preferences, and suppliers choose what to donate—all independently. BNI's role is to ensure the system is fair, transparent, and compliant through blockchain oversight. Think of it as building roads (infrastructure) rather than directing traffic (operations). This creates a truly decentralized ecosystem where power is distributed among all participants."
      }
    ]
  };

  const currentUser = userTypes[activeUserType];
  const currentFaqs = faqsByRole[activeUserType];

  // Dynamic button colors for each user type
  const buttonColors = {
    student: 'bg-primary-600 hover:bg-primary-700',
    pantry: 'bg-purple-600 hover:bg-purple-700',
    supplier: 'bg-blue-600 hover:bg-blue-700',
    bni: 'bg-orange-600 hover:bg-orange-700'
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
    },
    bni: {
      activeTab: 'bg-orange-600',
      inactiveTabBorder: 'border-orange-200',
      stepCircle: 'bg-orange-600',
      arrow: 'bg-orange-300'
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
    },
    bni: {
      background: 'bg-orange-100',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-200',
      plusSign: 'text-orange-600',
      ctaBackground: 'bg-orange-200',
      ctaButton: 'bg-orange-600 hover:bg-orange-700'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - FAQ & Features */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                FAQ
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Features
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 ${buttonColors[activeUserType]} text-white rounded-lg transition`}
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
              A Web3-powered platform that brings transparency, fairness, and efficiency to campus food pantries.
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Four actors work together to create a fair, transparent food distribution system powered by blockchain
            </p>
            <div className="flex justify-center items-center gap-3 text-sm text-gray-500 font-medium">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Suppliers Donate</span>
              <span>→</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Pantry Workers Allocate</span>
              <span>→</span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full">Students Receive</span>
              <span>→</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">BNI Oversees</span>
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

          {/* Complete System Flow Visualization */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Complete System Flow</h3>
              <p className="text-gray-600">How all actors work together in the FFQ ecosystem</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
              {/* Flow Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Supplier */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-4 shadow-lg">
                    <div className="text-4xl mb-2">🏪</div>
                    <h4 className="font-bold text-lg">Supplier</h4>
                    <p className="text-sm text-blue-100 mt-2">Donates surplus food</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    • Apply & get approved<br/>
                    • Add donation to inventory<br/>
                    • Receive Supplier NFT<br/>
                    • Track impact metrics
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="text-3xl text-gray-300">→</div>
                </div>

                {/* Pantry Worker */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white mb-4 shadow-lg">
                    <div className="text-4xl mb-2">👥</div>
                    <h4 className="font-bold text-lg">Pantry Worker</h4>
                    <p className="text-sm text-purple-100 mt-2">Manages allocation</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    • Accept donations<br/>
                    • Review POAS rankings<br/>
                    • Allocate to students<br/>
                    • Verify pickups via QR
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="text-3xl text-gray-300">→</div>
                </div>

                {/* Student */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white mb-4 shadow-lg">
                    <div className="text-4xl mb-2">🎓</div>
                    <h4 className="font-bold text-lg">Student</h4>
                    <p className="text-sm text-primary-100 mt-2">Receives food fairly</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    • Vote on food items<br/>
                    • Earn POAS priority<br/>
                    • Receive allocation notice<br/>
                    • Show QR code, pick up
                  </div>
                </div>
              </div>

              {/* BNI Oversight */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">🏛️</div>
                      <div>
                        <h4 className="font-bold text-xl">Basic Needs Initiative (BNI)</h4>
                        <p className="text-sm text-orange-100 mt-1">Institutional Governance & Oversight</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-orange-100">
                      Multi-Sig Petra Vault<br/>
                      <span className="text-xs">Manages all blockchain transactions</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="font-bold">Approve Suppliers</div>
                      <div className="text-orange-100">Mint Supplier NFTs</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="font-bold">Manage Wallets</div>
                      <div className="text-orange-100">Custodial for students</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="font-bold">Mint NFTs</div>
                      <div className="text-orange-100">Governance & Allocation</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="font-bold">Monitor System</div>
                      <div className="text-orange-100">Analytics & compliance</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Layer */}
              <div className="mt-6 text-center">
                <div className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⛓️</div>
                    <div className="text-left">
                      <div className="font-bold">Aptos Blockchain</div>
                      <div className="text-xs text-gray-400">Immutable audit trail of all transactions</div>
                    </div>
                  </div>
                </div>
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
            <p>&copy; 2024 Free Foodie Quest. Built on Aptos. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

