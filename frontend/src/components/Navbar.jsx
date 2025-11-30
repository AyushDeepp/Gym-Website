import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiInfo,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiImage,
  FiMessageSquare,
  FiMail,
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiLayout,
  FiTool,
  FiHelpCircle,
  FiStar,
  FiActivity,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Essential navigation links for header (keep it clean)
  const headerLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/programs', label: 'Programs', icon: FaDumbbell },
    { path: '/exercises', label: 'Exercises', icon: FiActivity },
    { path: '/plans', label: 'Plans', icon: FiCreditCard },
    { path: '/tools', label: 'Tools', icon: FiTool },
    { path: '/transformations', label: 'Stories', icon: FiStar },
  ];

  // All navigation links for sidebar (complete menu)
  const allNavLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/about', label: 'About', icon: FiInfo },
    { path: '/programs', label: 'Programs', icon: FaDumbbell },
    { path: '/exercises', label: 'Exercises', icon: FiActivity },
    { path: '/trainers', label: 'Trainers', icon: FiUsers },
    { path: '/plans', label: 'Plans', icon: FiCreditCard },
    { path: '/timetable', label: 'Timetable', icon: FiCalendar },
    { path: '/gallery', label: 'Gallery', icon: FiImage },
    { path: '/testimonials', label: 'Testimonials', icon: FiMessageSquare },
    { path: '/tools', label: 'Tools', icon: FiTool },
    { path: '/help-center', label: 'Help Center', icon: FiHelpCircle },
    { path: '/transformations', label: 'Transformations', icon: FiStar },
    { path: '/contact', label: 'Contact', icon: FiMail },
  ];

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-primary-darker/98 backdrop-blur-lg shadow-2xl border-b border-primary-gray/50'
            : 'bg-transparent'
      }`}
    >
        <div className="container-responsive py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
            >
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold gradient-text-red tracking-tight whitespace-nowrap">
              ELITE GYM
                </div>
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary-red"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
            </motion.div>
          </Link>

            {/* 1200px+: Essential options with icon + text - Centered */}
            <div className="hidden min-[1200px]:flex items-center gap-1 flex-1 justify-center">
            {headerLinks.map((link) => {
              const IconComponent = link.icon;
                const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-primary-red bg-primary-red/10'
                          : 'text-gray-300 hover:text-white hover:bg-primary-gray/50'
                  }`}
                >
                  <IconComponent className="text-base" />
                      <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>
                    </motion.div>
                    {isActive && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-red rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

            {/* lg screens (1024px-1199px): Essential options with icon + text - Centered */}
            <div className="hidden lg:flex min-[1200px]:hidden items-center gap-1 flex-1 justify-center">
              {headerLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative group"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-primary-red bg-primary-red/10'
                          : 'text-gray-300 hover:text-white hover:bg-primary-gray/50'
                      }`}
                    >
                      <IconComponent className="text-base" />
                      <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>
                    </motion.div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-red rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* md screens (768px-1023px): Essential icons only - Centered */}
            <div className="hidden md:flex lg:hidden items-center gap-1 flex-1 justify-center">
              {headerLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`p-2.5 rounded-lg transition-all duration-200 relative group ${
                      isActive
                        ? 'text-primary-red bg-primary-red/10'
                        : 'text-gray-300 hover:text-white hover:bg-primary-gray/50'
                    }`}
                    title={link.label}
                  >
                    <IconComponent className="text-lg" />
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-primary-gray text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {link.label}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Menu / Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-gray/50 hover:bg-primary-gray transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiUser className="text-white" />
                    <span className="text-white text-sm font-medium">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <FiChevronDown className={`text-white text-xs transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-primary-gray border border-primary-lightGray rounded-lg shadow-2xl overflow-hidden z-50"
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-primary-lightGray hover:text-white transition-colors"
                        >
                          <FiLayout className="text-lg" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <div className="px-4 py-2 text-xs text-gray-400 border-t border-primary-lightGray">
                          {user?.role === 'member' ? 'Member' : 'Visitor'}
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-primary-lightGray hover:text-white transition-colors"
                        >
                          <FiLogOut className="text-lg" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>

            {/* sm screens and below: Sidebar menu button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:flex md:hidden text-white focus:outline-none p-2.5 rounded-lg hover:bg-primary-gray/50 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-primary-darker border-r border-primary-gray shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Sidebar Header - Fixed */}
              <div className="flex items-center justify-between p-6 border-b border-primary-gray flex-shrink-0">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-extrabold gradient-text-red"
                >
                  ELITE GYM
                </Link>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-primary-gray transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX className="w-6 h-6 text-gray-300" />
                </motion.button>
              </div>

              {/* Sidebar Navigation - Scrollable */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scrollbar-thin">
                {allNavLinks.map((link, index) => {
                  const IconComponent = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary-red/20 text-primary-red border-l-4 border-primary-red'
                            : 'text-gray-300 hover:bg-primary-gray hover:text-white'
                        }`}
                      >
                        <IconComponent
                          className={`text-xl transition-transform group-hover:scale-110 ${
                            isActive ? 'text-primary-red' : ''
                          }`}
                        />
                        <span className="font-medium text-base">{link.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="ml-auto w-2 h-2 bg-primary-red rounded-full"
                            initial={false}
                          />
                        )}
                      </Link>
            </motion.div>
                  );
                })}
              </nav>

              {/* Sidebar Footer - Fixed */}
              <div className="p-6 border-t border-primary-gray bg-primary-darker flex-shrink-0">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-6 py-3 bg-primary-red text-white font-semibold rounded-lg hover:bg-primary-red/90 transition-colors text-center"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                        navigate('/');
                      }}
                      className="block w-full px-6 py-3 bg-primary-gray text-white font-semibold rounded-lg hover:bg-primary-lightGray transition-colors text-center"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Ready to transform?</p>
                  <Link
                    to="/plans"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-6 py-3 bg-primary-red text-white font-semibold rounded-lg hover:bg-primary-red/90 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full mt-2 px-6 py-3 bg-primary-gray text-white font-semibold rounded-lg hover:bg-primary-lightGray transition-colors text-center"
                    >
                      Login
                    </Link>
                </div>
                )}
              </div>
            </motion.aside>
          </>
          )}
        </AnimatePresence>
    </>
  );
};

export default Navbar;

