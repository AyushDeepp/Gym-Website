import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' },
      { path: '/programs', label: 'Programs' },
      { path: '/trainers', label: 'Trainers' },
      { path: '/plans', label: 'Membership Plans' },
      { path: '/tools', label: 'BMI & Tools' },
    ],
    more: [
      { path: '/timetable', label: 'Class Timetable' },
      { path: '/gallery', label: 'Gallery' },
      { path: '/testimonials', label: 'Testimonials' },
      { path: '/help-center', label: 'Help Center' },
      { path: '/transformations', label: 'Transformations' },
      { path: '/contact', label: 'Contact Us' },
    ],
  };

  return (
    <footer className="bg-primary-darker border-t border-primary-gray">
      <div className="container-responsive max-w-container py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold gradient-text-red mb-3 sm:mb-4">ELITE GYM</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 max-w-md">
              Transform your body, transform your life. Join the elite community of fitness enthusiasts.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-gray-400 hover:text-primary-red transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-gray-400 hover:text-primary-red transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2 }}
                className="text-gray-400 hover:text-primary-red transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-blue transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">More</h4>
            <ul className="space-y-2">
              {footerLinks.more.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-blue transition-colors text-xs sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
              <li className="flex items-start sm:items-center space-x-2">
                <FiMapPin className="text-primary-red mt-1 sm:mt-0 flex-shrink-0" />
                <span>123 Fitness Street, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="text-primary-red flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="text-primary-red flex-shrink-0" />
                <span>info@elitegym.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-gray mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {currentYear} Elite Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

