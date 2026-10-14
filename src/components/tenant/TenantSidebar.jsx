// src/components/tenant/TenantSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Wrench,
  Wallet,
  Zap,
  Home,
  LogOut,
  X,
  Bell,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const NAV_ITEMS = [
  { to: '/tenant', label: 'ទំព័រដើម', icon: LayoutDashboard, end: true },
  { to: '/tenant/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: Home },
  { to: '/tenant/assistant', label: 'ជំនួយការ AI', icon: Bot },
  { to: '/tenant/profile', label: 'ប្រវត្តិរបស់ខ្ញុំ', icon: UserCircle },
  { to: '/tenant/maintenance', label: 'ការជួសជុល', icon: Wrench },
  { to: '/tenant/payments', label: 'ការទូទាត់ (Payments)', icon: Wallet },
  { to: '/tenant/utilities', label: 'ទឹក និងភ្លើង', icon: Zap },
  { to: '/tenant/notifications', label: 'ការជូនដំណឹង', icon: Bell },
];

const Brand = ({ isCollapsed }) => (
  <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 dark:border-gray-800">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
      <Home className="h-5 w-5" />
    </div>
    {!isCollapsed && (
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-white">TeasJul</p>
        <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">តំបន់អ្នកជួល</p>
      </div>
    )}
  </div>
);

const TenantSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleNavigate = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
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
          'fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 print:hidden dark:border-gray-800 dark:bg-gray-900',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64 lg:translate-x-0 lg:shadow-none',
          isOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/10 dark:shadow-black/30' : '-translate-x-full',
        ].join(' ')}
      >
        <Brand isCollapsed={isCollapsed} />

        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-gray-800 dark:hover:text-slate-300"
          aria-label="បិទរបារចំហៀង"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              មេ
            </p>
          )}
          {isCollapsed && <div className="mx-auto mb-3 h-px w-8 bg-slate-200 dark:bg-gray-800" />}
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end ?? item.to === '/tenant'}
                    onClick={handleNavigate}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      [
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100',
                        isCollapsed && 'justify-center px-2',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary dark:bg-primary" />
                        )}
                        <Icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive
                              ? 'text-primary dark:text-primary'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className={[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10',
              isCollapsed && 'justify-center px-2',
            ].join(' ')}
            title={isCollapsed ? 'ចេញពីប្រព័ន្ធ' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>ចេញពីប្រព័ន្ធ</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default TenantSidebar;