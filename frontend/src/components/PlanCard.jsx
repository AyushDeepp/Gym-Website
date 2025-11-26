import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../utils/api';
import { loadScript } from '../utils/razorpay';
import { useAuth } from '../context/AuthContext';

const PlanCard = ({ plan, index }) => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Check if demo mode is enabled
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_RAZORPAY_KEY_ID;

      // Get customer details - use logged-in user data if available
      let customerName, customerEmail, customerPhone, userId;
      
      if (isAuthenticated && user) {
        customerName = user.name;
        customerEmail = user.email;
        customerPhone = user.phone || '';
        userId = user._id;
      } else {
        // Prompt for login or guest checkout
        const shouldLogin = window.confirm('Would you like to login first? (Recommended for membership tracking)');
        if (shouldLogin) {
          navigate('/login', { state: { from: { pathname: '/plans' } } });
          setLoading(false);
          return;
        }
        customerName = prompt('Enter your name:') || 'Customer';
        customerEmail = prompt('Enter your email:') || 'customer@example.com';
        customerPhone = prompt('Enter your phone (optional):') || '';
      }

      // Create order
      const { data } = await createPaymentOrder({
        planId: plan._id,
        customerName,
        customerEmail,
        customerPhone,
        ...(userId && { userId }),
      });

      // Demo Mode - Simulate payment
      if (isDemoMode || data.demo) {
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify payment (demo mode)
        try {
          await verifyPayment({
            orderId: data.orderId,
            paymentId: `pay_demo_${Date.now()}`,
            signature: 'demo_signature',
          });
          alert('✅ Payment successful! (Demo Mode)\n\nWelcome to Elite Gym! Your membership has been activated.\n\nNote: This is a demo payment. Configure Razorpay for real payments.');
          if (isAuthenticated) {
            // Refresh page to update user data
            window.location.reload();
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment verification failed. Please contact support.');
        }
        setLoading(false);
        return;
      }

      // Production Mode - Use Razorpay
      // Load Razorpay script
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Elite Gym',
        description: `Membership: ${plan.name}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            alert('Payment successful! Welcome to Elite Gym!');
            if (isAuthenticated) {
              // Refresh page to update user data
              window.location.reload();
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
            color: '#FF5F1F',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className={`relative bg-primary-gray rounded-xl overflow-hidden border-2 transition-all ${
        plan.popular
          ? 'border-primary-red glow-red'
          : 'border-primary-lightGray hover:border-primary-blue'
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-primary-red text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
          POPULAR
        </div>
      )}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold gradient-text-red">₹{plan.price}</span>
          <span className="text-gray-400 ml-2">/{plan.duration}</span>
        </div>
        {plan.description && (
          <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
        )}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="text-gray-300 flex items-start">
              <span className="text-primary-red mr-3 mt-1">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg transition-all ${
            plan.popular
              ? 'bg-primary-red text-white hover:bg-opacity-90'
              : 'bg-primary-lightGray text-white hover:bg-primary-blue'
          }`}
        >
          {loading ? 'Processing...' : 'Choose Plan'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PlanCard;

