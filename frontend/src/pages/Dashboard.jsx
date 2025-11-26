import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiDollarSign,
  FiUserCheck,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getPlans, getMembershipStatus } from '../utils/api';
import { createPaymentOrder, verifyPayment } from '../utils/api';
import { loadScript } from '../utils/razorpay';

const Dashboard = () => {
  const { user, loading: authLoading, isAuthenticated, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, statusRes] = await Promise.all([
        getPlans(),
        getMembershipStatus(user._id),
      ]);
      setPlans(plansRes.data);
      setMembershipStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePlan = async (plan) => {
    try {
      const { data } = await createPaymentOrder({
        planId: plan._id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || '',
        userId: user._id,
      });

      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (isDemoMode || data.demo) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await verifyPayment({
          orderId: data.orderId,
          paymentId: `pay_demo_${Date.now()}`,
          signature: 'demo_signature',
        });
        alert('✅ Payment successful! Your membership has been activated.');
        // Refresh user data
        window.location.reload();
      } else {
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
              await verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              alert('Payment successful! Your membership has been activated.');
              window.location.reload();
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '',
          },
          theme: {
            color: '#FF5F1F',
          },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = () => {
    if (!membershipStatus?.membership?.endDate) return null;
    const endDate = new Date(membershipStatus.membership.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-primary-darker flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isMember = user.role === 'member';
  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div className="min-h-screen bg-primary-darker py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-text-red mb-2">
            Welcome, {user.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            {isMember ? 'Manage your membership and track your progress' : 'Upgrade to unlock all features'}
          </p>
        </motion.div>

        {/* Status Banner */}
        {isMember && membershipStatus?.isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${
              isExpiringSoon
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-green-500/20 border-green-500/50 text-green-400'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FiCheckCircle className="text-lg sm:text-xl flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Membership Active</p>
                  {daysUntilExpiry !== null && (
                    <p className="text-xs sm:text-sm">
                      {isExpiringSoon
                        ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} - Renew now!`
                        : `Valid until ${formatDate(membershipStatus.membership.endDate)}`}
                    </p>
                  )}
                </div>
              </div>
              {isExpiringSoon && (
                <button
                  onClick={() => setActiveTab('membership')}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
                >
                  Renew Now
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 border-b border-primary-gray overflow-x-auto scrollbar-hide">
          {['overview', 'membership', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-colors capitalize whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'text-primary-red border-b-2 border-primary-red'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary-gray rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-primary-lightGray"
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                  <div className="flex items-center justify-between mb-2">
                    <FiUser className="text-xl sm:text-2xl text-primary-red" />
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      isMember ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">Account Status</p>
                  <p className="text-white text-lg sm:text-xl font-bold mt-1">
                    {isMember ? 'Member' : 'Visitor'}
                  </p>
                </div>

                {isMember && membershipStatus?.membership && (
                  <>
                    <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                      <div className="flex items-center justify-between mb-2">
                        <FiCalendar className="text-xl sm:text-2xl text-primary-red" />
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">Membership Plan</p>
                      <p className="text-white text-lg sm:text-xl font-bold mt-1 break-words">
                        {membershipStatus.membership.planName || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                      <div className="flex items-center justify-between mb-2">
                        <FiClock className="text-xl sm:text-2xl text-primary-red" />
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">Days Remaining</p>
                      <p className="text-white text-lg sm:text-xl font-bold mt-1">
                        {daysUntilExpiry !== null ? `${daysUntilExpiry} days` : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Visitor View */}
              {!isMember && (
                <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Upgrade to Member</h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-4">
                    Become a member to unlock exclusive features, access to all programs, and personalized training.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    {plans.map((plan) => (
                      <div
                        key={plan._id}
                        className="bg-primary-gray p-4 rounded-lg border border-primary-lightGray"
                      >
                        <h4 className="text-base sm:text-lg font-bold text-white mb-2">{plan.name}</h4>
                        <p className="text-xl sm:text-2xl font-bold text-primary-red mb-2">
                          ₹{plan.price}
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm mb-4">{plan.duration}</p>
                        <button
                          onClick={() => handlePurchasePlan(plan)}
                          className="w-full py-2 sm:py-2.5 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
                        >
                          Purchase
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member View */}
              {isMember && membershipStatus?.membership && (
                <div className="space-y-4">
                  <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Membership Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">Plan</p>
                        <p className="text-white text-sm sm:text-base font-semibold break-words">
                          {membershipStatus.membership.planName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">Status</p>
                        <p className="text-white text-sm sm:text-base font-semibold capitalize">
                          {membershipStatus.membership.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">Start Date</p>
                        <p className="text-white text-sm sm:text-base font-semibold">
                          {formatDate(membershipStatus.membership.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">End Date</p>
                        <p className="text-white text-sm sm:text-base font-semibold">
                          {formatDate(membershipStatus.membership.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder sections */}
                  <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => navigate('/timetable')}
                        className="p-3 sm:p-4 bg-primary-gray rounded-lg border border-primary-lightGray hover:border-primary-red transition-colors text-left"
                      >
                        <FiCalendar className="text-xl sm:text-2xl text-primary-red mb-2" />
                        <p className="text-white text-sm sm:text-base font-semibold">View Timetable</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Check class schedules</p>
                      </button>
                      <div className="p-3 sm:p-4 bg-primary-gray rounded-lg border border-primary-lightGray text-left opacity-50">
                        <FiUserCheck className="text-xl sm:text-2xl text-primary-red mb-2" />
                        <p className="text-white text-sm sm:text-base font-semibold">Book Class</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <div className="space-y-4 sm:space-y-6">
              {isMember ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Your Membership</h3>
                  <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs sm:text-sm">Current Plan</p>
                        <p className="text-white text-lg sm:text-2xl font-bold break-words">
                          {membershipStatus?.membership?.planName || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs sm:text-sm font-semibold ${
                        membershipStatus?.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {membershipStatus?.membership?.status?.toUpperCase() || 'INACTIVE'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">Start Date</p>
                        <p className="text-white text-sm sm:text-base">
                          {formatDate(membershipStatus?.membership?.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm">End Date</p>
                        <p className="text-white text-sm sm:text-base">
                          {formatDate(membershipStatus?.membership?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/plans')}
                    className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors font-semibold"
                  >
                    Renew or Upgrade Membership
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Available Plans</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {plans.map((plan) => (
                      <div
                        key={plan._id}
                        className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray"
                      >
                        <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{plan.name}</h4>
                        <p className="text-2xl sm:text-3xl font-bold text-primary-red mb-2">
                          ₹{plan.price}
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm mb-4">{plan.duration}</p>
                        <ul className="space-y-2 mb-4">
                          {plan.features?.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-gray-300 text-xs sm:text-sm flex items-center">
                              <FiCheckCircle className="text-primary-red mr-2 flex-shrink-0" />
                              <span className="break-words">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePurchasePlan(plan)}
                          className="w-full py-2 sm:py-2.5 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
                        >
                          Purchase Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Profile Information</h3>
              <div className="bg-primary-darker p-4 sm:p-6 rounded-lg border border-primary-lightGray">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Full Name</p>
                    <p className="text-white text-sm sm:text-base font-semibold break-words">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Email</p>
                    <p className="text-white text-sm sm:text-base font-semibold break-all">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Phone</p>
                    <p className="text-white text-sm sm:text-base font-semibold">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Role</p>
                    <p className="text-white text-sm sm:text-base font-semibold capitalize">{user.role}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Member Since</p>
                    <p className="text-white text-sm sm:text-base font-semibold">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/contact')}
                  className="mt-4 w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

