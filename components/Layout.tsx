import React, { useState } from 'react';
// FIX: Import Outlet to render nested routes.
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MenuIcon, XIcon, HomeIcon, CurrencyDollarIcon, DocumentReportIcon, CogIcon, LogoutIcon } from './icons/Icons';

interface LayoutProps {
  // FIX: The children prop is no longer needed as nested routes will be rendered via Outlet.
  onLogout: () => void;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    end
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-700 text-white'
          : 'text-primary-100 hover:bg-primary-800 hover:text-white'
      }`
    }
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

const SidebarContent: React.FC<{onNavItemClick?: () => void, onLogout: () => void}> = ({onNavItemClick, onLogout}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  };
  
  return (
    <div className="flex h-full flex-col bg-primary-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-primary-800 px-6">
        <h1 className="text-xl font-bold text-white">Pondok<span className="font-light text-primary-300">Finance</span></h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={onNavItemClick}>Dashboard</NavItem>
        <NavItem to="/transaksi" icon={<CurrencyDollarIcon />} onClick={onNavItemClick}>Transaksi</NavItem>
        <NavItem to="/laporan" icon={<DocumentReportIcon />} onClick={onNavItemClick}>Laporan</NavItem>
        <NavItem to="/settings" icon={<CogIcon />} onClick={onNavItemClick}>Settings</NavItem>
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-100 transition-colors hover:bg-primary-800 hover:text-white"
        >
          <LogoutIcon />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};


// FIX: Removed children from props, as Outlet will handle rendering nested routes.
export default function Layout({ onLogout }: LayoutProps) {
  const { settings } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Static sidebar for desktop */}
      <aside className="hidden w-64 md:block">
        <SidebarContent onLogout={onLogout} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent onNavItemClick={() => setSidebarOpen(false)} onLogout={onLogout} />
          </div>
          <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:justify-end">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="text-right">
            <h2 className="text-md font-semibold text-slate-800">{settings.name}</h2>
            <p className="text-xs text-slate-500">{settings.treasurerName}</p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* FIX: Use Outlet to render the matched child route's component. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}