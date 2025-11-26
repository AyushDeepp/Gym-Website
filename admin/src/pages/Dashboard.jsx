import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiCreditCard,
  FiMail,
  FiDollarSign,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa';
import { getPrograms, getTrainers, getPlans, getContacts, getPayments } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    programs: 0,
    trainers: 0,
    plans: 0,
    contacts: 0,
    payments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [programsRes, trainersRes, plansRes, contactsRes, paymentsRes] = await Promise.all([
          getPrograms(),
          getTrainers(),
          getPlans(),
          getContacts(),
          getPayments().catch(() => ({ data: [] })),
        ]);

        const completedPayments = paymentsRes.data.filter((p) => p.status === 'completed');
        const revenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({
          programs: programsRes.data.length,
          trainers: trainersRes.data.length,
          plans: plansRes.data.length,
          contacts: contactsRes.data.length,
          payments: paymentsRes.data.length,
          revenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Programs', value: stats.programs, icon: FaDumbbell, color: 'red', link: '/programs' },
    { label: 'Trainers', value: stats.trainers, icon: FiUsers, color: 'blue', link: '/trainers' },
    { label: 'Plans', value: stats.plans, icon: FiCreditCard, color: 'red', link: '/plans' },
    { label: 'Contacts', value: stats.contacts, icon: FiMail, color: 'blue', link: '/contacts' },
    { label: 'Payments', value: stats.payments, icon: FiDollarSign, color: 'red', link: '/payments' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: FiTrendingUp, color: 'blue', link: '/payments' },
  ];

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red mb-4 sm:mb-6 md:mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray ${
                  stat.color === 'red' ? 'hover:border-primary-red' : 'hover:border-primary-blue'
                } transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 truncate">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${stat.color === 'red' ? 'gradient-text-red' : 'gradient-text-blue'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`text-2xl sm:text-3xl md:text-4xl flex-shrink-0 ml-2 ${stat.color === 'red' ? 'text-primary-red' : 'text-primary-blue'}`}>
                    <IconComponent />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

