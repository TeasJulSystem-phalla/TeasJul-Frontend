// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wallet,
  Zap,
  Wrench,
  Bot,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Home,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/properties', label: 'Properties', icon: Building2 },
      { to: '/tenants', label: 'Tenants', icon: Users },
      { to: '/contracts', label: 'Contracts', icon: FileText },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/finance', label: 'Finance', icon: Wallet },
      { to: '/utilities', label: 'Utilities', icon: Zap },
      { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Support',
    items: [
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/help', label: 'Help & Support', icon: HelpCircle },
    ],
  },
];

const Brand = ({ isCollapsed }) => (
  <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 dark:border-gray-800">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white shadow-sm shadow-gray-800/30">
      <Home className="h-5 w-5" />
    </div>
    {!isCollapsed && (
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">RentalHub</p>
        <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">Property Manager</p>
      </div>
    )}
  </div>
);

const SidebarLink = ({ item, isCollapsed, onNavigate }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
          isActive
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100',
          isCollapsed && 'justify-center px-2',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gray-800" />
          )}
          <Icon
            className={`h-5 w-5 shrink-0 ${
              isActive
                ? 'text-gray-800 dark:text-white'
                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
            }`}
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const handleNavigate = () => {
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64 lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/10 dark:shadow-black/30' : '-translate-x-full',
        ].join(' ')}
      >
        <Brand isCollapsed={isCollapsed} />

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-gray-800 dark:hover:text-slate-300"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              {isCollapsed && <div className="mx-auto mb-3 h-px w-8 bg-slate-200 dark:bg-gray-800" />}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <SidebarLink
                      item={item}
                      isCollapsed={isCollapsed}
                      onNavigate={handleNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-gray-800">
          <button
            className={[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10',
              isCollapsed && 'justify-center px-2',
            ].join(' ')}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
