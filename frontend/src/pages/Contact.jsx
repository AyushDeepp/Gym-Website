import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { submitContact } from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitContact(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Address',
      details: ['123 Fitness Street', 'City, State 12345'],
    },
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 123-4568'],
    },
    {
      icon: FiMail,
      title: 'Email',
      details: ['info@elitegym.com', 'support@elitegym.com'],
    },
    {
      icon: FiClock,
      title: 'Hours',
      details: ['Mon - Fri: 6:00 AM - 11:00 PM', 'Sat - Sun: 8:00 AM - 10:00 PM'],
    },
  ];

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Get In Touch"
          subtitle="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
          center
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-gray rounded-xl p-6 sm:p-8 border border-primary-lightGray"
            >
              {submitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm sm:text-base"
                >
                  Thank you! Your message has been sent successfully.
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm sm:text-base">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm sm:text-base">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red resize-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-primary-red text-white font-semibold rounded-lg glow-red hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-primary-gray rounded-xl p-5 sm:p-6 border border-primary-lightGray"
                >
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 text-primary-red">
                    <IconComponent />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-400 text-xs sm:text-sm mb-1">
                      {detail}
                    </p>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

