import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Map, 
  Plus, 
  Slack
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'Relationship Map', href: '/map', icon: Map },
    { name: 'Add Relationships', href: '/add', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top bar with logo */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Slack className="h-8 w-8 text-slack-purple" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Relationship Map</span>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group inline-flex items-center px-3 py-2 mx-1 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-md ${
                      isActive
                        ? 'border-[#1264A3] text-[#1D1C1D] bg-transparent'
                        : 'border-transparent text-[#453337] hover:text-[#1D1C1D] hover:bg-[#4544470f] hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="-ml-0.5 mr-2 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;