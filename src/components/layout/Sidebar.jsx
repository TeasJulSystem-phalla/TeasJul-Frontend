// src/components/layout/Sidebar.jsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
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
  UserCircle,
  Shield,
  DoorOpen,
  Sparkles,
  Layers,
  KeyRound,
  MailPlus,
  ChevronDown,
  Tags,
  Gauge,
  ClipboardList,
  CircleDollarSign,
  Folder,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'មេ',
    items: [
      { to: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard },
      { to: '/properties', label: 'អចលនទ្រព្យ', icon: Building2 },
      { to: '/rooms', label: 'បន្ទប់', icon: DoorOpen },
      { to: '/roomtype', label: 'ប្រភេទបន្ទប់', icon: Layers },
      { to: '/amenities', label: 'គ្រឿងបរិក្ខារ', icon: Sparkles },
      { to: '/tenants', label: 'អ្នកជួល', icon: Users },
      { to: '/tenant-invitations', label: 'អញ្ជើញអ្នកជួល', icon: MailPlus },
      { to: '/contracts', label: 'កិច្ចសន្យា', icon: FileText },
    ],
  },
  {
    label: 'ការគ្រប់គ្រង',
    items: [
      { to: '/users', label: 'អ្នកប្រើប្រាស់', icon: UserCircle },
      { to: '/roles', label: 'តួនាទី', icon: Shield },
      { to: '/profile', label: 'ប្រវត្តិរបស់ខ្ញុំ', icon: UserCircle },
      { to: '/access', label: 'ការចូលដំណើរការផ្ទះ', icon: KeyRound },
      { to: '/finance', label: 'ហិរញ្ញវត្ថុ', icon: Wallet },
      {
        basePath: '/utilities',
        label: 'ប្រើប្រាស់ទឹកភ្លើង',
        icon: Zap,
        children: [
          { to: '/utilities', label: 'ប្រភេទប្រើប្រាស់', icon: Tags, end: true },
          { to: '/utilities/meters', label: 'ម៉ែត្រប្រើប្រាស់', icon: Gauge },
          { to: '/utilities/readings', label: 'ការអានម៉ែត្រ', icon: ClipboardList },
          { to: '/utilities/rates', label: 'តម្លៃប្រើប្រាស់', icon: CircleDollarSign },
        ],
      },
      {
        basePath: '/maintenance',
        label: 'ការជួសជុល',
        icon: Wrench,
        children: [
          { to: '/maintenance', label: 'សំណើជួសជុល', icon: Wrench, end: true },
          { to: '/maintenance/categories', label: 'ប្រភេទការជួសជុល', icon: Folder },
        ],
      },
    ],
  },
  {
    label: 'ជំនួយ',
    items: [
      { to: '/assistant', label: 'ជំនួយការ AI', icon: Bot },
      { to: '/settings', label: 'ការកំណត់', icon: Settings },
      { to: '/help', label: 'ជំនួយ និងការគាំទ្រ', icon: HelpCircle },
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
        <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">អ្នកគ្រប់គ្រងអចលនទ្រព្យ</p>
      </div>
    )}
  </div>
);

const iconClass = (isActive) =>
  [
    'shrink-0 transition-colors',
    isActive
      ? 'text-gray-800 dark:text-white'
      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
  ].join(' ');

const SidebarLink = ({ item, isCollapsed, onNavigate, isChild = false }) => {
  const Icon = item.icon;

  if (isChild) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            'group flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 text-[12.5px] font-medium transition-colors',
            isActive
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100',
            'pl-3',
          ].join(' ')
        }
      >
        {({ isActive }) => (
          <>
            {Icon ? (
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gray-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
            ) : (
              <span className="ml-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-gray-600" />
            )}
            <span className="truncate">{item.label}</span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end ?? item.to === '/'}
      onClick={onNavigate}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
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
          <Icon className={`h-5 w-5 ${iconClass(isActive)}`} />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
};

const SidebarSubMenu = ({ item, isCollapsed, onNavigate }) => {
  const location = useLocation();
  const Icon = item.icon;
  const containerRef = useRef(null);
  const isChildActive = item.children.some((child) => {
    if (child.end) return location.pathname === child.to;
    return location.pathname === child.to || location.pathname.startsWith(`${child.to}/`);
  });
  const [open, setOpen] = useState(() => isChildActive);
  const [flyoutOpen, setFlyoutOpen] = useState(false);

  useEffect(() => {
    if (!isCollapsed && isChildActive) setOpen(true);
  }, [isCollapsed, isChildActive]);

  useEffect(() => {
    if (!isCollapsed || !flyoutOpen) return undefined;
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isCollapsed, flyoutOpen]);

  const handleNavigate = (event) => {
    setFlyoutOpen(false);
    if (onNavigate) onNavigate(event);
  };

  if (isCollapsed) {
    return (
      <li ref={containerRef} className="relative">
        <button
          onClick={() => setFlyoutOpen((value) => !value)}
          title={item.label}
          aria-label={item.label}
          aria-expanded={flyoutOpen}
          className={[
            'group relative flex w-full items-center justify-center rounded-lg p-2.5 transition-colors',
            isChildActive
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100',
          ].join(' ')}
        >
          {isChildActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gray-800" />
          )}
          <Icon className={`h-5 w-5 ${iconClass(isChildActive)}`} />
        </button>

        {flyoutOpen && (
          <div className="absolute left-full top-0 z-50 ml-3 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30">
            <div className="flex items-center gap-2 px-3 pb-1.5 pt-2">
              <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {item.label}
              </p>
            </div>
            <ul className="space-y-0.5">
              {item.children.map((child) => (
                <li key={child.to}>
                  <SidebarLink item={child} onNavigate={handleNavigate} isChild />
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={[
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
          isChildActive
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100',
        ].join(' ')}
      >
        {isChildActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gray-800" />
        )}
        <Icon className={`h-5 w-5 ${iconClass(isChildActive)}`} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={[
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-slate-500',
            open && 'rotate-180',
          ].join(' ')}
        />
      </button>

      <div
        className={[
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="ml-3 mt-1 border-l border-slate-200 pl-2 dark:border-gray-700">
            <ul className="space-y-0.5 py-0.5">
              {item.children.map((child) => (
                <li key={child.to}>
                  <SidebarLink item={child} onNavigate={handleNavigate} isChild />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
};

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
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
          'fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 print:hidden dark:border-gray-800 dark:bg-gray-900',
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
          aria-label="បិទរបារចំហៀង"
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
                  <div key={item.to ?? item.basePath}>
                    {item.children ? (
                      <SidebarSubMenu
                        item={item}
                        isCollapsed={isCollapsed}
                        onNavigate={handleNavigate}
                      />
                    ) : (
                      <li>
                        <SidebarLink
                          item={item}
                          isCollapsed={isCollapsed}
                          onNavigate={handleNavigate}
                        />
                      </li>
                    )}
                  </div>
                ))}
              </ul>
            </div>
          ))}
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

export default Sidebar;