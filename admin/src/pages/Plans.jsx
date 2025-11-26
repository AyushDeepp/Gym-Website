import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPlans, createPlan, updatePlan, deletePlan } from '../utils/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    features: '',
    popular: false,
    description: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        price: Number(formData.price),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      };

      if (editingPlan) {
        await updatePlan(editingPlan._id, planData);
      } else {
        await createPlan(planData);
      }

      setShowModal(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      features: '',
      popular: false,
      description: '',
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      features: plan.features?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(id);
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Error deleting plan');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Membership Plans</h1>
        <button
          onClick={() => {
            setEditingPlan(null);
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-red text-white text-sm sm:text-base rounded-lg hover:bg-opacity-90 transition-all whitespace-nowrap"
        >
          + Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-primary-gray rounded-xl p-4 sm:p-6 border-2 ${
              plan.popular ? 'border-primary-red' : 'border-primary-lightGray'
            }`}
          >
            {plan.popular && (
              <div className="bg-primary-red text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full inline-block mb-3 sm:mb-4">
                POPULAR
              </div>
            )}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 truncate">{plan.name}</h3>
            <div className="mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl font-bold gradient-text-red">₹{plan.price}</span>
              <span className="text-gray-400 ml-2 text-sm sm:text-base">/{plan.duration}</span>
            </div>
            {plan.description && (
              <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{plan.description}</p>
            )}
            <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
              {plan.features?.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="text-gray-300 text-xs sm:text-sm flex items-start">
                  <span className="text-primary-red mr-2 flex-shrink-0">✓</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan._id)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full border border-primary-lightGray max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder="month/year"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Features (comma separated)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-4 h-4 mr-2"
                />
                <label className="text-gray-300 text-sm sm:text-base">Mark as Popular</label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  {editingPlan ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-lightGray text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Plans;

