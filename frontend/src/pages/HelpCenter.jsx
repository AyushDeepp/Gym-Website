import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiShield, FiSmile, FiAlertTriangle, FiInfo, FiMail } from 'react-icons/fi';
import { getFaqs } from '../utils/api';

const policyCards = [
  {
    title: 'Membership Policies',
    description: 'Freeze up to 30 days/year. Auto renew reminders 7 days prior to billing.',
    icon: FiShield,
  },
  {
    title: 'Cancellation & Refunds',
    description: '7-day cooling-off for new signups. Post that we issue prorated credits only.',
    icon: FiAlertTriangle,
  },
  {
    title: 'Dress Code',
    description: 'Closed shoes, quick-dry fabrics, no denim. Locker rooms stocked with essentials.',
    icon: FiSmile,
  },
  {
    title: 'Class Etiquette',
    description: 'Arrive 10 mins early, wipe stations, and re-rack weights. Late arrivals may be rescheduled.',
    icon: FiInfo,
  },
];

const HelpCenter = () => {
  const [faqs, setFaqs] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data } = await getFaqs({ publicOnly: true });
        setFaqs(data);
      } catch (error) {
        console.error('FAQ load failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const groupedFaqs = useMemo(() => {
    return faqs.reduce((acc, faq) => {
      const key = faq.category || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(faq);
      return acc;
    }, {});
  }, [faqs]);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Help Center</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Policies, FAQs & Support
          </h1>
          <p className="text-gray-400 max-w-3xl text-base sm:text-lg">
            Everything you need to know about Elite Gym membership, etiquette, payments, privacy, and member benefits. Tap a
            topic to expand quick answers or contact concierge support anytime.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 md:grid-cols-2"
        >
          {policyCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-primary-gray/70 border border-primary-lightGray rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="text-primary-red text-2xl" />
                  <p className="text-white text-lg font-semibold">{card.title}</p>
                </div>
                <p className="text-gray-400 text-sm">{card.description}</p>
              </div>
            );
          })}
        </motion.div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-gray-400">Loading FAQs…</div>
          ) : (
            Object.entries(groupedFaqs).map(([category, items]) => (
              <section key={category} className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-semibold">{category}</h2>
                  <span className="text-gray-400 text-sm">{items.length} articles</span>
                </div>
                <div className="divide-y divide-primary-lightGray/60">
                  {items.map((item) => {
                    const isOpen = active === item._id;
                    return (
                      <div key={item._id}>
                        <button
                          onClick={() => setActive(isOpen ? null : item._id)}
                          className="w-full flex items-center justify-between py-4 text-left"
                        >
                          <span className="text-white font-medium pr-6">{item.question}</span>
                          <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-gray-300 pb-4 text-sm leading-relaxed"
                            >
                              {item.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row items-start md:items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <FiMail className="text-primary-red text-3xl flex-shrink-0" />
            <div>
              <h3 className="text-white text-xl font-semibold">Need concierge support?</h3>
              <p className="text-gray-400 text-sm">Our member success desk replies within 2 working hours.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@elitegym.com"
              className="px-6 py-3 rounded-2xl bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
            >
              Email Support
            </a>
            <a
              href="/contact"
              className="px-6 py-3 rounded-2xl border border-primary-lightGray text-white text-sm font-semibold hover:border-primary-red transition-colors"
            >
              Book a Call
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;


