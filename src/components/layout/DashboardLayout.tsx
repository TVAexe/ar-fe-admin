'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { resetToken } from '@/utils';
import { toastSuccess } from '@/utils/toast';
import ROUTES from '@/config/route';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mặc định đóng trên mobile
  const pathname = usePathname();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      path: ROUTES.ORDERS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      id: 'products',
      label: 'Products',
      path: ROUTES.PRODUCTS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      path: ROUTES.USERS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    resetToken();
    toastSuccess('Successfully logged out');
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 1000);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-grey-50 overflow-x-hidden">
      {/* Overlay mobile */}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary">
            <h1 className="text-xl font-bold text-white">AR Admin</h1>
          </div>

          {/* Nav */}
          <nav className="mt-5 px-2 flex-1">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-150 ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-grey-700 hover:bg-grey-100 hover:text-grey-900'
                  }`}
                >
                  <span
                    className={`mr-3 ${
                      isActive(item.path) ? 'text-white' : 'text-grey-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Hide sidebar mobile */}
          <div className="px-2 pb-3 lg:hidden">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSidebarOpen(false)}
              classes="w-full text-grey-700 border-grey-300 hover:bg-grey-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Hide sidebar
            </Button>
          </div>

          {/* Logout */}
          <div className="px-2 pb-4">
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              classes="w-full text-red-600 border-red-600 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-grey-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative flex justify-between h-16">
              <div className="relative z-10 flex items-center lg:w-auto">
                {/* Mobile menu */}
                <button
                  className="p-2 rounded-md text-grey-500 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Center (search) */}
              <div className="relative z-0 flex-1 px-2 flex items-center justify-center sm:absolute sm:inset-0">
                <div className="w-full sm:max-w-xs">
                  {/* search sau cũng được */}
                </div>
              </div>

              {/* Right (profile) */}
              <div className="relative z-10 flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">A</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-grey-700">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 w-full">
          <div className="py-4 sm:py-6">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
