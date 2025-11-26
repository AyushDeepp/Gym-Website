import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SectionTitle from '../components/SectionTitle';
import PlanCard from '../components/PlanCard';
import { getPlans } from '../utils/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans();
        setPlans(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setLoading(false);
      }
    };
    fetchPlans();
    
    // Refetch on focus to get latest data
    const handleFocus = () => {
      fetchPlans();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="page-padding">
      <div className="container-responsive max-w-container">
        <SectionTitle
          title="Membership Plans"
          subtitle="Choose the perfect plan for your fitness journey"
          center
        />

        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>Loading plans...</p>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-container mx-auto">
            {plans.map((plan, index) => (
              <PlanCard key={plan._id} plan={plan} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <p>No membership plans available at the moment.</p>
          </div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 bg-primary-gray rounded-xl p-6 sm:p-8 border border-primary-lightGray max-w-4xl mx-auto"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
            What's Included in All Plans
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              'Access to all equipment',
              'Group fitness classes',
              'Locker room facilities',
              'Free parking',
              'WiFi access',
              'Nutritional guidance',
            ].map((item, index) => (
              <div key={index} className="flex items-center text-sm sm:text-base text-gray-300">
                <span className="text-primary-red mr-3">✓</span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Plans;

