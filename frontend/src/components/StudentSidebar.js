import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const StudentSidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItemClass = (path) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'bg-white text-primary-600 hover:bg-primary-50'
    }`;

  return (
    <aside className="w-64 bg-primary-100 shadow-lg fixed h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600 mb-2">Free Foodie Quest</h1>
        <p className="text-sm text-gray-600 mb-6">Welcome, {user?.first_name || 'Student'}!</p>
        
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
          
          {/* Core Activities - Earn Tickets */}
          <div className="pt-2 space-y-2">
            <p className="px-4 text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">Earn Tickets</p>
            
            <Link
              to="/governance"
              className={navItemClass('/governance')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Vote on Proposals
            </Link>
            
            <Link
              to="/volunteering"
              className={navItemClass('/volunteering')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Volunteering
            </Link>
          </div>
          
          {/* Use Tickets */}
          <div className="pt-2 space-y-2">
            <p className="px-4 text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">Use Tickets</p>
            
            <Link
              to="/my-food"
              className={navItemClass('/my-food')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Request Food
            </Link>
          </div>
          
          <hr className="my-4 border-primary-200" />
          
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
            className="flex items-center gap-3 px-4 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition w-full text-left"
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

export default StudentSidebar;

