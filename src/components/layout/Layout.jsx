// src/components/layout/Layout.jsx
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSidebar } from '../../hooks/useSidebar';

const Layout = ({ children }) => {
  const { isOpen, toggle, close, isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-gray-950">
      <Navbar toggleSidebar={toggle} isCollapsed={isCollapsed} />

      <div className="flex pt-16">
        <Sidebar isOpen={isOpen} onClose={close} isCollapsed={isCollapsed} />

        <main
          className={[
            'flex-1 transition-all duration-300',
            isCollapsed ? 'lg:pl-20' : 'lg:pl-64',
          ].join(' ')}
        >
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
