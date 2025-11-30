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
      { path: '/exercises', label: 'Exercises' },
      { path: '/trainers', label: 'Trainers' },
      { path: '/plans', label: 'Plans' },
    ],
    resources: [
      { path: '/timetable', label: 'Timetable' },
      { path: '/gallery', label: 'Gallery' },
      { path: '/testimonials', label: 'Testimonials' },
      { path: '/tools', label: 'Tools' },
      { path: '/help-center', label: 'Help Center' },
      { path: '/transformations', label: 'Transformations' },
    ],
  };

  return (
    <footer className="bg-primary-darker border-t border-primary-gray">
      <div className="container-responsive py-8 md:py-10 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-3">
              <h3 className="text-xl md:text-2xl font-extrabold gradient-text-red">
                ELITE GYM
              </h3>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-sm leading-relaxed">
              Transform your body, transform your life. Join the elite community of fitness enthusiasts.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-primary-gray border border-primary-lightGray flex items-center justify-center text-gray-400 hover:text-primary-red hover:border-primary-red transition-all"
                aria-label="Facebook"
              >
                <FiFacebook className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-primary-gray border border-primary-lightGray flex items-center justify-center text-gray-400 hover:text-primary-red hover:border-primary-red transition-all"
                aria-label="Instagram"
              >
                <FiInstagram className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-primary-gray border border-primary-lightGray flex items-center justify-center text-gray-400 hover:text-primary-red hover:border-primary-red transition-all"
                aria-label="Twitter"
              >
                <FiTwitter className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-red transition-colors text-sm inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base">Resources</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-primary-red transition-colors text-sm inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary-red mt-0.5 flex-shrink-0 w-4 h-4" />
                <span className="text-gray-400 text-sm leading-relaxed">
                  123 Fitness Street, City, State 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-red flex-shrink-0 w-4 h-4" />
                <a
                  href="tel:+15551234567"
                  className="text-gray-400 hover:text-primary-red transition-colors text-sm"
                >
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-red flex-shrink-0 w-4 h-4" />
                <a
                  href="mailto:info@elitegym.com"
                  className="text-gray-400 hover:text-primary-red transition-colors text-sm"
                >
                  info@elitegym.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-gray pt-6 md:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              &copy; {currentYear} Elite Gym. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <Link
                to="/contact"
                className="text-gray-400 hover:text-primary-red transition-colors"
              >
                Contact
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/help-center"
                className="text-gray-400 hover:text-primary-red transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
