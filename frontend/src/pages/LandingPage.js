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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Free Foodie Quest</h1>
            </div>
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
              Blockchain 101
            </h2>
            <p className="text-xl text-gray-600">
              New to blockchain? No worries! Here's what you need to know.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 - Blockchain */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-1');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is a blockchain?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-1" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Think of blockchain as a <strong>digital ledger</strong> that keeps a permanent record of everything that happens. 
                  Like a notebook that everyone can read but no one can erase or change. In FFQ, this means every vote, 
                  donation, and food allocation is recorded forever—making the system transparent and trustworthy.
                </p>
              </div>
            </div>

            {/* FAQ Item 2 - Wallet */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-2');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is a wallet?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-2" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  A wallet is like your <strong>digital ID and account</strong> in one. It stores your tokens and NFTs, 
                  and lets you interact with FFQ securely. We use <strong>Petra Wallet</strong>—it's a free browser 
                  extension (like a password manager) that keeps your account safe. You don't need any cryptocurrency 
                  or money to use it on our test network!
                </p>
              </div>
            </div>

            {/* FAQ Item 3 - Tokens */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-3');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What are tokens?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-3" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Tokens are like <strong>points or tickets</strong> in the FFQ system. When you vote on what food you'd 
                  like, you earn <strong>Governance Tokens</strong>. These tokens give you voting power in the system—the 
                  more you participate, the more influence you have. Think of them like loyalty points that actually matter!
                </p>
              </div>
            </div>

            {/* FAQ Item 4 - NFTs */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-4');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is an NFT?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-4" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  NFT stands for "Non-Fungible Token"—but forget that jargon! In FFQ, NFTs are <strong>digital certificates</strong> 
                  that prove something happened. For example, when the pantry approves your food request, you get an 
                  <strong> Allocation NFT</strong>—like a digital ticket you bring to pick up your food. When suppliers donate, 
                  they get a <strong>Supplier NFT</strong> as a permanent thank-you record.
                </p>
              </div>
            </div>

            {/* FAQ Item 5 - Smart Contract */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-5');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is a smart contract?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-5" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  A smart contract is <strong>code that runs automatically</strong> when certain conditions are met. 
                  Think of it like a vending machine: you press a button, and if you've paid, you get your snack—no human needed. 
                  In FFQ, smart contracts automatically handle donations, allocations, and rewards without anyone needing to 
                  manually process paperwork. This makes everything faster and eliminates human error or bias.
                </p>
              </div>
            </div>

            {/* FAQ Item 6 - Gas Fees */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-6');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What are gas fees?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-6" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Gas fees are <strong>tiny transaction costs</strong> (like a few cents) needed to process actions on the blockchain. 
                  Think of it like paying a stamp to mail a letter. Good news: FFQ covers these fees for you! And on our test 
                  network, gas is completely free—you can get free test tokens from a "faucet" with one click.
                </p>
              </div>
            </div>

            {/* FAQ Item 7 - POAS */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-7');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is POAS?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-7" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  POAS stands for <strong>Predicted Optimal Allocation Score</strong>. It's FFQ's fairness algorithm that decides 
                  who gets what food. Instead of "first come, first served," POAS considers factors like: How often do you participate? 
                  What do you need? When did you last get food? This ensures everyone gets a fair shot, not just those who can line up early.
                </p>
              </div>
            </div>

            {/* FAQ Item 8 - Aptos */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-8');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  What is Aptos?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-8" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  Aptos is the <strong>blockchain platform</strong> FFQ runs on. Think of it as the foundation—like how websites run 
                  on the internet. We chose Aptos because it's fast, secure, and environmentally friendly. As a user, you don't need 
                  to know much about it—just that it's what makes FFQ's transparency and automation possible.
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
                  <strong>Nope! FFQ is completely free to use.</strong> You don't need to buy any cryptocurrency. We're running on 
                  a test network where you can get free tokens instantly. All you need is to install the Petra wallet (a free browser 
                  extension) and sign up with your Cal Poly ID. That's it!
                </p>
              </div>
            </div>

            {/* FAQ Item 10 - Is my data safe? */}
            <div className="bg-primary-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => {
                  const content = document.getElementById('faq-10');
                  content.style.display = content.style.display === 'none' ? 'block' : 'none';
                }}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-primary-200 transition"
              >
                <span className="text-lg font-semibold text-gray-900">
                  Is my personal information safe?
                </span>
                <span className="text-2xl text-primary-600">+</span>
              </button>
              <div id="faq-10" style={{ display: 'none' }} className="px-6 pb-5">
                <p className="text-gray-700">
                  <strong>Yes!</strong> FFQ only stores what's necessary (like your student ID and food preferences) in a secure database. 
                  The blockchain only records <em>anonymous transaction data</em>—not your name, address, or personal details. 
                  Your wallet is controlled by you and only you. We can't access your wallet or tokens without your permission.
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
                <li><button onClick={() => document.querySelector('section:has(#faq-1)')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition text-left">Blockchain 101 (FAQ)</button></li>
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

