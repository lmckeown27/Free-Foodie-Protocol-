import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [activeUserType, setActiveUserType] = useState('student');
  const navigate = useNavigate();

  const userTypes = {
    student: {
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      title: 'Students',
      headline: 'Vote on Food. Earn Tokens. Get Fair Allocations.',
      subheadline: 'No more waiting in line. Your voice determines what the pantry stocks.',
      cta: 'Sign In with Cal Poly ID',
      ctaAction: () => navigate('/login')
    },
    pantry: {
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      title: 'Pantry Workers',
      headline: 'Smart Allocation. Multi-Sig Security. Zero Guesswork.',
      subheadline: 'POAS-driven decisions backed by blockchain accountability.',
      cta: 'Connect Multi-Sig Wallet',
      ctaAction: () => navigate('/login')
    },
    supplier: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
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

  const testimonials = [
    {
      quote: "FFQ transformed how we access food. No more uncertainty—I know exactly what's available and when I can pick it up.",
      author: "Sarah M.",
      role: "Cal Poly Student"
    },
    {
      quote: "The POAS algorithm takes the guesswork out of allocations. We're serving more students fairly and efficiently.",
      author: "James K.",
      role: "Pantry Manager"
    },
    {
      quote: "We've donated 500+ lbs of surplus food with complete peace of mind. The compliance tracking is automatic.",
      author: "Maria G.",
      role: "Local Restaurant Owner"
    }
  ];

  const currentUser = userTypes[activeUserType];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-primary-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - FAQ */}
            <div className="flex items-center">
              <button
                onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                FAQ
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
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How It Works</a>
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Students Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+ lbs</div>
              <div className="text-gray-600">Food Rescued</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Blockchain Verified</div>
            </div>
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

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What People Say</h2>
            <p className="text-xl text-gray-600">Real feedback from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How FFQ Uses Blockchain
            </h2>
            <p className="text-xl text-gray-600">
              Learn why blockchain makes food distribution fairer, more transparent, and fraud-proof.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 - Why blockchain? */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-1');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Why does FFQ use blockchain instead of a regular app?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-1" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Blockchain provides <strong>three key benefits</strong> for food distribution: <strong>transparency</strong> (anyone can verify 
                  where food came from and where it went), <strong>fraud prevention</strong> (no one can fake donations or double-claim food), 
                  and <strong>automated fairness</strong> (smart contracts ensure everyone gets treated equally). Traditional apps can be manipulated 
                  by admins or hacked. Blockchain creates a permanent, unchangeable record that everyone can trust—making food distribution 
                  accountable and equitable.
                </p>
              </div>
            </div>

            {/* FAQ Item 2 - What happens when I vote? */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-2');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What happens when I vote for food items on FFQ?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-2" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  When you vote, your choice is recorded on the blockchain as a <strong>permanent, tamper-proof record</strong>. 
                  You also receive a <strong>Governance NFT</strong>—a digital certificate that proves you participated and gives you 
                  voting power in future decisions. The more you engage, the more influence you have. This blockchain-based system 
                  ensures no one can manipulate votes or silence student voices. Your vote truly counts and can never be erased or changed.
                </p>
              </div>
            </div>

            {/* FAQ Item 3 - Allocation NFT */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-3');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What's an Allocation NFT and why do I need one to pick up food?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-3" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  An <strong>Allocation NFT</strong> is like a <strong>digital pickup ticket</strong> stored in your wallet. When the pantry 
                  approves your request, this NFT is automatically created and sent to you. It contains details like what food you're 
                  allocated, when to pick it up, and expiration dates. Because it's on the blockchain, it can't be forged or stolen. 
                  When you arrive at the pantry, workers scan your NFT to verify your claim—preventing fraud and ensuring only approved 
                  students get food. After pickup, the NFT is "redeemed" (marked as used) so no one can claim the same food twice.
                </p>
              </div>
            </div>

            {/* FAQ Item 4 - NFTs vs monkey pictures */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden border-2 border-primary-300">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-4');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Wait, aren't NFTs just those monkey pictures? How is this different?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-4" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700 mb-4">
                  <strong>Great question!</strong> You're thinking of <strong>collectible NFTs</strong> (like Bored Apes, CryptoPunks, etc.)—
                  digital art sold for speculation and status. FFQ uses <strong>utility NFTs</strong>, which serve completely different purposes. 
                  Here's the key difference:
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-semibold text-gray-900 mb-2">Collectible NFTs (Monkey Pictures):</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    <li>Bought and sold for money (speculative investment)</li>
                    <li>Used as profile pictures or status symbols</li>
                    <li>Purely aesthetic—no functional purpose</li>
                    <li>Often expensive (thousands of dollars)</li>
                    <li>Can lose value overnight</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-semibold text-gray-900 mb-2">FFQ's Utility NFTs (Functional Tools):</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    <li><strong>100% FREE</strong>—never bought or sold</li>
                    <li><strong>Governance NFTs</strong> = Your voting rights (participate in decisions)</li>
                    <li><strong>Allocation NFTs</strong> = Your food pickup tickets (fraud-proof claims)</li>
                    <li><strong>Supplier NFTs</strong> = Donation receipts (tax deduction proof)</li>
                    <li>Serve specific, practical purposes—not collectibles</li>
                    <li>Not tradeable—tied to your identity and needs</li>
                  </ul>
                </div>
                <p className="text-gray-700">
                  <strong>The bottom line:</strong> FFQ's NFTs are <em>tools</em>, not art. They're digital certificates that prove rights, 
                  prevent fraud, and enable fair distribution. You'll never see a monkey picture on FFQ—just functional blockchain technology 
                  solving real problems in food distribution. Think of them like <strong>digital tickets, receipts, and ID cards</strong>—
                  not collectibles or investments. And again: they're completely free!
                </p>
              </div>
            </div>

            {/* FAQ Item 5 - Transparency */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-5');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  How does blockchain make FFQ more transparent?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-5" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Every action in FFQ—donations, votes, allocations, pickups—is recorded on the blockchain as a <strong>public, 
                  permanent record</strong> (though your personal info stays private). Students can see: How much food was donated? 
                  Where did it come from? How was it allocated? Who picked it up? This transparency builds trust and holds everyone 
                  accountable. If something seems unfair, you can verify it yourself. Traditional food pantries often lack this 
                  visibility—blockchain ensures FFQ operates in the open, not behind closed doors.
                </p>
              </div>
            </div>

            {/* FAQ Item 6 - Supplier benefits */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-6');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  How do suppliers benefit from blockchain donations?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-6" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  When suppliers donate food, they receive a <strong>Supplier NFT</strong>—a permanent, verifiable record of their 
                  contribution on the blockchain. This serves as <strong>proof for tax deductions</strong> (IRS-compliant), builds their 
                  <strong>community reputation</strong> (visible donation history), and provides <strong>impact metrics</strong> (see exactly 
                  how many students their donations helped). Unlike paper receipts that can be lost or forged, blockchain records are 
                  permanent and instantly verifiable. This makes donating easier, safer, and more rewarding for suppliers.
                </p>
              </div>
            </div>

            {/* FAQ Item 7 - Fraud prevention */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-7');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  How does blockchain prevent fraud in food distribution?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-7" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Blockchain prevents fraud through <strong>immutable records</strong> (once recorded, transactions can't be altered or deleted), 
                  <strong>unique NFTs</strong> (allocation tickets can't be copied or reused), <strong>automated smart contracts</strong> 
                  (no human can override fair allocation rules), and <strong>transparent auditing</strong> (anyone can verify the entire 
                  distribution chain). Traditional systems rely on trust and manual checks—blockchain replaces trust with mathematical proof. 
                  You can't fake a donation, double-claim food, or manipulate voting. The system is fraud-proof by design.
                </p>
              </div>
            </div>

            {/* FAQ Item 8 - Wallet needed */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-8');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Why do I need a wallet for a food pantry?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-8" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Your <strong>wallet</strong> (like Petra Wallet) is your <strong>digital identity and secure storage</strong> on the blockchain. 
                  It holds your Governance NFTs (voting rights), Allocation NFTs (food pickup tickets), and participation history. Think of it 
                  like a digital backpack that only you control. Unlike traditional apps where the company controls your account, blockchain 
                  wallets give <em>you</em> full ownership. FFQ can't lock you out, lose your records, or access your assets without permission. 
                  It's free to set up (just a browser extension) and doesn't require cryptocurrency—it's simply how you interact securely with FFQ.
                </p>
              </div>
            </div>

            {/* FAQ Item 9 - Do I need crypto? */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-9');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Do I need cryptocurrency or money to use FFQ?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-9" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  <strong>Absolutely not!</strong> FFQ is 100% free. You don't need to buy crypto or pay any fees. We're running on 
                  Aptos <strong>testnet</strong> (a test blockchain network) where everything is free. Any small transaction fees 
                  ("gas fees") are covered by FFQ—you'll never be charged. Just install the free Petra wallet, sign up with your 
                  Cal Poly ID, and start using FFQ. The blockchain tech runs in the background; from your perspective, it's just a 
                  regular app. No crypto knowledge required!
                </p>
              </div>
            </div>

            {/* FAQ Item 10 - Data privacy */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-10');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Is my personal information private on the blockchain?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-10" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  <strong>Yes—blockchain is public but pseudonymous.</strong> Here's what that means: The blockchain records 
                  <em>anonymous wallet addresses</em> and transaction data (e.g., "wallet 0x123... voted for apples"). It does NOT store your 
                  name, email, or personal details. Your identity info (student ID, name, etc.) stays in FFQ's secure database, separate 
                  from the blockchain. Only you can connect your wallet address to your real identity. So the blockchain is transparent 
                  (anyone can verify activity), but your personal information stays private. Best of both worlds!
                </p>
              </div>
            </div>

            {/* FAQ Item 11 - Different from traditional */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-11');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  How is FFQ different from traditional food pantries?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-11" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Traditional pantries often operate on <strong>"first come, first served"</strong> (favoring those who can line up early), 
                  <strong>lack transparency</strong> (students can't see how decisions are made), and rely on <strong>manual processes</strong> 
                  (prone to errors and bias). FFQ uses blockchain to create <strong>fair allocation</strong> (POAS algorithm ensures equity), 
                  <strong>complete transparency</strong> (see the entire food supply chain), <strong>student voice</strong> (vote on what food 
                  comes in), and <strong>fraud prevention</strong> (tamper-proof records). Blockchain transforms food pantries from charity 
                  handouts into an equitable, student-driven system where everyone has a voice and a fair shot at the food they need.
                </p>
              </div>
            </div>
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

