import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [activeUserType, setActiveUserType] = useState('student');
  const navigate = useNavigate();

  const userTypes = {
    student: {
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      bgColor: 'bg-gradient-to-b from-primary-50 to-white',
      sectionBg: 'bg-primary-50',
      title: 'Students',
      headline: 'Vote on Food. Earn Tokens. Get Fair Allocations.',
      subheadline: 'No more waiting in line. Your voice determines what the pantry stocks.',
      cta: 'Sign In with Cal Poly ID',
      ctaAction: () => navigate('/login')
    },
    pantry: {
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-b from-purple-50 to-white',
      sectionBg: 'bg-purple-50',
      title: 'Pantry Workers',
      headline: 'Smart Allocation. Multi-Sig Security. Zero Guesswork.',
      subheadline: 'POAS-driven decisions backed by blockchain accountability.',
      cta: 'Connect Multi-Sig Wallet',
      ctaAction: () => navigate('/login')
    },
    supplier: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-b from-blue-50 to-white',
      sectionBg: 'bg-blue-50',
      title: 'Suppliers',
      headline: 'Donate Surplus. Track Impact. Stay Compliant.',
      subheadline: 'Automated compliance, liability protection, and transparent donation tracking.',
      cta: 'Register as Supplier',
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
      { step: 1, title: 'Sign Up', description: 'Register with your Cal Poly ID' },
      { step: 2, title: 'Vote & Earn', description: 'Vote on desired items, earn Governance Tokens' },
      { step: 3, title: 'Bid & Receive', description: 'Use tokens to bid on allocations via POAS' },
      { step: 4, title: 'Pickup', description: 'Get notified and pick up your allocation' }
    ],
    pantry: [
      { step: 1, title: 'Connect Wallet', description: 'Link your Petra Wallet to FFQ' },
      { step: 2, title: 'Setup Multi-Sig', description: 'Create Vault with co-signers (e.g., 2-of-3)' },
      { step: 3, title: 'Review POAS', description: 'Access allocation recommendations' },
      { step: 4, title: 'Approve & Execute', description: 'Multi-sig approval for all operations' }
    ],
    supplier: [
      { step: 1, title: 'Connect Wallet', description: 'Link your Petra Wallet' },
      { step: 2, title: 'List Inventory', description: 'Add donations with weight, type, expiry' },
      { step: 3, title: 'Auto-Execute', description: 'Smart contracts handle custody transfer' },
      { step: 4, title: 'Track Impact', description: 'View donation stats and Supplier NFTs' }
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
    ]
  };

  const currentUser = userTypes[activeUserType];
  const currentFaqs = faqsByRole[activeUserType];

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
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {currentUser.subheadline}
            </p>
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
            <p className="text-xl text-gray-600">Simple steps for each user type</p>
          </div>

          {/* User Type Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            {Object.entries(userTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setActiveUserType(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeUserType === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-primary-200'
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
                  <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xl mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {step.step < howItWorks[activeUserType].length && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-300"></div>
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
            <p className="text-xl text-gray-600">
              {currentUser.title} - Everything you need to know about using FFQ
            </p>
          </div>

          <div className="space-y-4">
            {currentFaqs.map((faq) => (
              <div key={faq.id} className={`bg-primary-100 rounded-lg shadow-md overflow-hidden ${faq.id === 3 ? 'border-2 border-primary-300' : ''}`}>
                <button
                  onClick={() => {
                    const content = document.getElementById(`faq-${faq.id}`);
                    if (content) {
                      content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <span className="text-2xl text-primary-600">+</span>
                </button>
                <div id={`faq-${faq.id}`} style={{ display: 'none' }} className="px-6 pb-5">
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-primary-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              We're here to help! Blockchain might seem complex, but using FFQ is simple.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg"
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

