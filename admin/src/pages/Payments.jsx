import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPayments } from '../utils/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Note: You'll need to create a getPayments endpoint in backend
      const { data } = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Payments</h1>
        <div className="bg-primary-gray rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-primary-lightGray w-full sm:w-auto">
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold gradient-text-blue">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {payments.length > 0 ? (
          payments.map((payment, index) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-primary-gray rounded-xl p-6 border border-primary-lightGray"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{payment.planName}</h3>
                  <p className="text-primary-blue">{payment.customerName}</p>
                  <p className="text-gray-400 text-sm">{payment.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold gradient-text-red mb-1">
                    ₹{payment.amount?.toLocaleString()}
                  </p>
                  <p className={`font-semibold ${getStatusColor(payment.status)}`}>
                    {payment.status?.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Order ID</p>
                  <p className="text-gray-300 font-mono text-xs">{payment.orderId}</p>
                </div>
                {payment.paymentId && (
                  <div>
                    <p className="text-gray-400 mb-1">Payment ID</p>
                    <p className="text-gray-300 font-mono text-xs">{payment.paymentId}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-1">Date</p>
                  <p className="text-gray-300">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Time</p>
                  <p className="text-gray-300">
                    {new Date(payment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p>No payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;

