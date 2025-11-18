import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SupplierSidebar = ({ user }) => {
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
        ? 'bg-blue-600 text-white'
        : 'bg-white text-blue-600 hover:bg-blue-50'
    }`;
  };

  return (
    <aside className="w-64 bg-blue-100 shadow-lg fixed h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Supplier Dashboard</h1>
        <p className="text-sm text-gray-600 mb-2">Welcome, {user?.first_name || 'Supplier'}!</p>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-mono bg-blue-200 text-blue-800 px-2 py-1 rounded">
            Verified Supplier
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
            to="/add-donation"
            className={navItemClass('/add-donation', true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Donation
          </Link>
          
          <Link
            to="/donation-history"
            className={navItemClass('/donation-history')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Donation History
          </Link>
          
          <Link
            to="/supplier-volunteering"
            className={navItemClass('/supplier-volunteering')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Volunteering
          </Link>
          
          <hr className="my-4 border-blue-200" />
          
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
            className="flex items-center gap-3 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition w-full text-left"
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

export default SupplierSidebar;

