// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, PanelLeft, Search, Bell, X, ChevronDown, User, Settings, LogOut, HelpCircle, Home } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuthStore } from '../../store/auth.store';

const NOTIFICATIONS = [
  { id: 1, title: 'ទទួលបានការទូទាត់', detail: 'សុខ ដារ៉ា បានបង់ថ្លៃផ្ទះសម្រាប់បន្ទប់ 4B', time: '២នាទីមុន', unread: true },
  { id: 2, title: 'សំណើជួសជុល', detail: 'សំណើថ្មីនៅអគារ 2 បន្ទប់ 12', time: '១ម៉ោងមុន', unread: true },
  { id: 3, title: 'កិច្ចសន្យាជិតផុតកំណត់', detail: 'កិច្ចសន្យាសម្រាប់បន្ទប់ 7A ផុតកំណត់ក្នុងរយៈពេល 14 ថ្ងៃ', time: '៣ម៉ោងមុន', unread: false },
];

const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
};

const Dropdown = ({ open, onClose, className, children }) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div className={`absolute z-40 ${className}`}>{children}</div>
    </>
  );
};

const iconButtonClass =
  'rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100';

const searchInputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-gray-300 focus:bg-white focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-gray-600 dark:focus:bg-gray-800 dark:focus:ring-gray-700';

const dropdownPanelClass =
  'absolute right-0 mt-2 origin-top-right rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20';

const Navbar = ({ toggleSidebar, isCollapsed }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isMobileSearch, setIsMobileSearch] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notifRef, () => setIsNotifOpen(false));
  useClickOutside(profileRef, () => setIsProfileOpen(false));

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const email = user?.email || '';
  const initials = fullName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-slate-200 bg-white transition-colors print:hidden dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        {/* Toggle + mobile brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className={iconButtonClass}
            aria-label="បិទ/បើករបារចំហៀង"
          >
            {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand — shown on mobile, and on desktop when the sidebar is collapsed */}
          <div className={isCollapsed ? 'flex items-center gap-2' : 'flex items-center gap-2 lg:hidden'}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-white">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-semibold text-slate-800 dark:text-white">RentalHub</span>
          </div>
        </div>

        {/* Desktop search */}
        <div className="relative ml-2 hidden max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="ស្វែងរកអចលនទ្រព្យ អ្នកជួល កិច្ចសន្យា..."
            className={searchInputClass}
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsMobileSearch((v) => !v)}
            className={`${iconButtonClass} lg:hidden`}
            aria-label="ស្វែងរក"
          >
            {isMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((v) => !v)}
              className={`relative ${iconButtonClass}`}
              aria-label="ការជូនដំណឹង"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <Dropdown
              open={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              className={`w-80 ${dropdownPanelClass}`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">ការជូនដំណឹង</p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {unreadCount} ថ្មី
                </span>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <button className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-gray-800">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.unread ? 'bg-gray-600 dark:bg-gray-400' : 'bg-slate-300 dark:bg-gray-600'
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold text-slate-800 dark:text-white">{n.title}</span>
                          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">{n.time}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-slate-500 dark:text-slate-400">
                          {n.detail}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button className="w-full border-t border-slate-100 px-4 py-2.5 text-center text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800">
                មើលការជូនដំណឹងទាំងអស់
              </button>
            </Dropdown>
          </div>

          {/* Profile */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800"
              aria-label="គណនី"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-[13px] font-semibold text-white">
                {initials || 'U'}
              </span>
              <span className="hidden text-left md:block">
                <span className="block text-[13px] font-semibold leading-tight text-slate-800 dark:text-white">
                  {fullName}
                </span>
                <span className="block text-[11px] leading-tight text-slate-400 dark:text-slate-500">{user?.username}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 dark:text-slate-500 md:block" />
            </button>

            <Dropdown
              open={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              className={`w-60 ${dropdownPanelClass}`}
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{fullName}</p>
                <p className="truncate text-[12px] text-slate-400 dark:text-slate-500">{email || user?.username}</p>
              </div>
              <ul className="p-1.5">
                {[
                  { icon: User, label: 'ប្រវត្តិរបស់ខ្ញុំ', onClick: () => handleNavigate('/profile') },
                  { icon: Settings, label: 'ការកំណត់គណនី', onClick: () => handleNavigate('/settings') },
                  { icon: HelpCircle, label: 'មជ្ឈមណ្ឌលជំនួយ', onClick: () => handleNavigate('/help') },
                ].map(({ icon: Icon, label, onClick }) => (
                  <li key={label}>
                    <button
                      onClick={onClick}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 p-1.5 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  ចេញពីប្រព័ន្ធ
                </button>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div
        className={[
          'absolute inset-x-0 top-full border-b border-slate-200 bg-white px-4 py-3 transition-all duration-200 lg:hidden dark:border-gray-800 dark:bg-gray-900',
          isMobileSearch ? 'visible opacity-100' : 'invisible -translate-y-1 opacity-0',
        ].join(' ')}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            autoFocus={isMobileSearch}
            type="search"
            placeholder="ស្វែងរក..."
            className={searchInputClass}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
