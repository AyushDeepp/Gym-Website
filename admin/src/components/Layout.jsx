import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLayout,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiMail,
  FiDollarSign,
  FiUserCheck,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTarget,
  FiBookOpen,
  FiHelpCircle,
  FiStar,
  FiActivity,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';

const Layout = ({ children, setIsAuthenticated }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiLayout },
    { path: '/programs', label: 'Programs', icon: FaDumbbell },
    { path: '/trainers', label: 'Trainers', icon: FiUsers },
    { path: '/plans', label: 'Plans', icon: FiCreditCard },
    { path: '/workouts', label: 'Workouts', icon: FiTarget },
    { path: '/diets', label: 'Diet Plans', icon: FiBookOpen },
    { path: '/faq', label: 'FAQ', icon: FiHelpCircle },
    { path: '/transformations', label: 'Transformations', icon: FiStar },
    { path: '/progress', label: 'Progress Logs', icon: FiActivity },
    { path: '/timetable', label: 'Timetable', icon: FiCalendar },
    { path: '/customers', label: 'Customers', icon: FiUsers },
    { path: '/contacts', label: 'Contacts', icon: FiMail },
    { path: '/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/admins', label: 'Admins', icon: FiUserCheck },
  ];

  return (
    <div className="min-h-screen bg-primary-darker flex">
      {/* Mobile Header */}
      <header className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-primary-gray border-b border-primary-lightGray h-16">
        <div className="flex items-center justify-between p-4 h-full">
          <h1 className="text-xl font-bold gradient-text-red">Elite Gym</h1>
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-primary-lightGray transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6 text-white" />
            ) : (
              <FiMenu className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-primary-gray border-r border-primary-lightGray shadow-2xl z-50 sm:hidden overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary-lightGray">
                <div>
                  <h1 className="text-2xl font-bold gradient-text-red">Elite Gym</h1>
                  <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
                </div>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-primary-lightGray transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX className="w-6 h-6 text-gray-300" />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-red text-white'
                            : 'text-gray-300 hover:bg-primary-lightGray hover:text-white'
                        }`}
                      >
                        <IconComponent className="text-xl" />
                        <span className="font-medium text-base">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-primary-lightGray text-white rounded-lg hover:bg-primary-red transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <FiLogOut className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden sm:flex flex-col bg-primary-gray border-r border-primary-lightGray fixed h-full transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-primary-lightGray flex-shrink-0 ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <h1 className="text-2xl font-bold gradient-text-red truncate">Elite Gym</h1>
                  <p className="text-gray-400 text-sm mt-1 truncate">Admin Panel</p>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex justify-center"
                >
                  <h1 className="text-xl font-bold gradient-text-red">EG</h1>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-primary-lightGray transition-colors flex-shrink-0 ml-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCollapsed ? (
                <FiChevronRight className="w-5 h-5 text-gray-300" />
              ) : (
                <FiChevronLeft className="w-5 h-5 text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-primary-red text-white'
                    : 'text-gray-300 hover:bg-primary-lightGray hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent className="text-xl flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {item.label}
                  </motion.span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-primary-lightGray text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className={`p-4 border-t border-primary-lightGray flex-shrink-0 ${isCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-3 bg-primary-lightGray text-white rounded-lg hover:bg-primary-red transition-all font-medium flex items-center overflow-hidden ${
              isCollapsed ? 'justify-center px-2' : 'justify-center space-x-2'
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 overflow-x-hidden ${
          isMobile ? 'pt-16' : isCollapsed ? 'sm:ml-20' : 'sm:ml-64'
        }`}
      >
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-full overflow-x-hidden"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

