import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const PantrySidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItemClass = (path, isSpecial = false) => {
    if (isSpecial) {
      return 'flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition';
    }
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive(path)
        ? 'bg-amber-600 text-white'
        : 'bg-white text-amber-600 hover:bg-amber-50'
    }`;
  };

  return (
    <aside className="w-64 bg-amber-100 shadow-lg fixed h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-amber-600 mb-2">Pantry Dashboard</h1>
        <p className="text-sm text-gray-600 mb-2">Welcome, {user?.first_name || 'Pantry'}!</p>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-mono bg-amber-200 text-amber-800 px-2 py-1 rounded">
            Multi-Sig Vault
          </span>
        </div>
        
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className={navItemClass('/dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          
          <Link
            to="/create-proposal"
            className={navItemClass('/create-proposal', true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Proposal
          </Link>
          
          <Link
            to="/inventory"
            className={navItemClass('/inventory')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Manage Inventory
          </Link>
          
          <Link
            to="/allocations"
            className={navItemClass('/allocations')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Supply Planning
          </Link>
          
          <Link
            to="/credential-management"
            className={navItemClass('/credential-management')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Credential Management
          </Link>
          
          <hr className="my-4 border-amber-200" />
          
          <div className="px-2 py-2">
            <WalletConnect />
          </div>
          
          <hr className="my-4 border-amber-200" />
          
          <Link
            to="/how-it-works"
            className={navItemClass('/how-it-works')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How This Works
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default PantrySidebar;

