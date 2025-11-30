import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFeather, FiSun, FiMoon, FiTrendingUp, FiPlus, FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import { getDietPlans, getUserDietPlans, createUserDietPlan, updateUserDietPlan, deleteUserDietPlan } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const typeMeta = {
  veg: { label: 'Vegetarian', color: 'text-green-300', icon: FiFeather },
  nonveg: { label: 'Balanced', color: 'text-red-200', icon: FiTrendingUp },
  keto: { label: 'Keto', color: 'text-purple-200', icon: FiMoon },
  weightloss: { label: 'Weight Loss', color: 'text-yellow-200', icon: FiSun },
  gain: { label: 'Muscle Gain', color: 'text-blue-200', icon: FiTrendingUp },
  maintenance: { label: 'Maintenance', color: 'text-gray-300', icon: FiTrendingUp },
};

const DietCard = ({ diet, isUserPlan, onEdit, onDelete }) => {
  const meta = typeMeta[diet.type] || typeMeta.veg;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-red">{diet.access || 'Custom Plan'}</p>
          <h2 className="text-white text-2xl font-bold">{diet.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`${meta.color} text-xl`} />
            <p className={`${meta.color} text-sm font-semibold`}>{meta.label}</p>
          </div>
          {isUserPlan && (
            <>
              <button
                onClick={() => onEdit(diet)}
                className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-primary-red hover:border-primary-red transition-colors"
                title="Edit plan"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(diet._id)}
                className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-300 hover:text-red-400 hover:border-red-400 transition-colors"
                title="Delete plan"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {diet.description && <p className="text-gray-400 text-sm mt-2 mb-4">{diet.description}</p>}
      {((diet.dailyCalories && Number(diet.dailyCalories) > 0) || 
        (diet.dailyProtein && Number(diet.dailyProtein) > 0) || 
        (diet.dailyCarbs && Number(diet.dailyCarbs) > 0) || 
        (diet.dailyFats && Number(diet.dailyFats) > 0)) && (
        <div className="mb-4 p-3 bg-primary-darker rounded-xl border border-primary-lightGray/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {diet.dailyCalories && Number(diet.dailyCalories) > 0 && (
              <div>
                <p className="text-gray-400 text-xs">Calories</p>
                <p className="text-white font-bold">{diet.dailyCalories}</p>
              </div>
            )}
            {diet.dailyProtein && Number(diet.dailyProtein) > 0 && (
              <div>
                <p className="text-gray-400 text-xs">Protein</p>
                <p className="text-white font-bold">{diet.dailyProtein}g</p>
              </div>
            )}
            {diet.dailyCarbs && Number(diet.dailyCarbs) > 0 && (
              <div>
                <p className="text-gray-400 text-xs">Carbs</p>
                <p className="text-white font-bold">{diet.dailyCarbs}g</p>
              </div>
            )}
            {diet.dailyFats && Number(diet.dailyFats) > 0 && (
              <div>
                <p className="text-gray-400 text-xs">Fats</p>
                <p className="text-white font-bold">{diet.dailyFats}g</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {diet.meals?.map((meal, idx) => (
          <div key={`${diet._id}-${idx}`} className="bg-primary-darker rounded-2xl border border-primary-lightGray/60 p-4">
            <p className="text-primary-red text-xs uppercase tracking-[0.3em]">{meal.time}</p>
            <h4 className="text-white font-semibold mt-1">{meal.food}</h4>
            {(() => {
              const hasValue = (val) => val !== null && val !== undefined && val !== '' && Number(val) > 0;
              const calories = hasValue(meal.calories) ? meal.calories : null;
              const protein = hasValue(meal.protein) ? meal.protein : null;
              const carbs = hasValue(meal.carbs) ? meal.carbs : null;
              const fats = hasValue(meal.fats) ? meal.fats : null;
              
              if (!calories && !protein && !carbs && !fats) return null;
              
              return (
                <div className="flex items-center gap-3 mt-2">
                  {calories && <p className="text-gray-500 text-xs">{calories} kcal</p>}
                  {protein && <p className="text-gray-500 text-xs">P: {protein}g</p>}
                  {carbs && <p className="text-gray-500 text-xs">C: {carbs}g</p>}
                  {fats && <p className="text-gray-500 text-xs">F: {fats}g</p>}
                </div>
              );
            })()}
            {meal.notes && <p className="text-gray-400 text-xs mt-2">{meal.notes}</p>}
          </div>
        ))}
        {(!diet.meals || diet.meals.length === 0) && (
          <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
            No meals added yet
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CreateDietModal = ({ isOpen, onClose, onSave, editingPlan, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      type: 'maintenance',
      dailyCalories: '',
      dailyProtein: '',
      dailyCarbs: '',
      dailyFats: '',
      meals: [],
    }
  );
  const [mealForm, setMealForm] = useState({
    time: 'Breakfast',
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (!editingPlan) {
      setFormData({
        title: '',
        description: '',
        type: 'maintenance',
        dailyCalories: '',
        dailyProtein: '',
        dailyCarbs: '',
        dailyFats: '',
        meals: [],
      });
    }
  }, [initialData, editingPlan]);

  const addMeal = () => {
    if (!mealForm.food.trim()) return;
    setFormData({
      ...formData,
      meals: [
        ...formData.meals,
        {
          time: mealForm.time,
          food: mealForm.food,
          calories: mealForm.calories && mealForm.calories.trim() ? Number(mealForm.calories) : undefined,
          protein: mealForm.protein && mealForm.protein.trim() ? Number(mealForm.protein) : undefined,
          carbs: mealForm.carbs && mealForm.carbs.trim() ? Number(mealForm.carbs) : undefined,
          fats: mealForm.fats && mealForm.fats.trim() ? Number(mealForm.fats) : undefined,
          notes: mealForm.notes,
        },
      ],
    });
    setMealForm({
      time: 'Breakfast',
      food: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      notes: '',
    });
  };

  const removeMeal = (index) => {
    setFormData({
      ...formData,
      meals: formData.meals.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a plan title');
      return;
    }
    if (formData.meals.length === 0) {
      alert('Please add at least one meal');
      return;
    }
    onSave(formData);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-primary-darker border border-primary-lightGray rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary-gray transition-colors">
                  <FiX className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Plan Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    >
                      {Object.keys(typeMeta).map((type) => (
                        <option key={type} value={type}>
                          {typeMeta[type].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Daily Calories</label>
                    <input
                      type="number"
                      value={formData.dailyCalories}
                      onChange={(e) => setFormData({ ...formData, dailyCalories: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Protein (g)</label>
                    <input
                      type="number"
                      value={formData.dailyProtein}
                      onChange={(e) => setFormData({ ...formData, dailyProtein: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      value={formData.dailyCarbs}
                      onChange={(e) => setFormData({ ...formData, dailyCarbs: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Fats (g)</label>
                    <input
                      type="number"
                      value={formData.dailyFats}
                      onChange={(e) => setFormData({ ...formData, dailyFats: e.target.value })}
                      className="w-full bg-primary-gray border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-primary-lightGray pt-6">
                  <h3 className="text-white font-semibold mb-4">Meals</h3>
                  
                  {/* Add Meal Form */}
                  <div className="bg-primary-gray rounded-xl p-4 mb-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Meal Time</label>
                        <select
                          value={mealForm.time}
                          onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        >
                          <option>Breakfast</option>
                          <option>Lunch</option>
                          <option>Dinner</option>
                          <option>Snack</option>
                          <option>Pre-Workout</option>
                          <option>Post-Workout</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Food Item *</label>
                        <input
                          type="text"
                          value={mealForm.food}
                          onChange={(e) => setMealForm({ ...mealForm, food: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                          placeholder="e.g., Grilled Chicken Breast"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Calories</label>
                        <input
                          type="number"
                          value={mealForm.calories}
                          onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={mealForm.protein}
                          onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={mealForm.carbs}
                          onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Fats (g)</label>
                        <input
                          type="number"
                          value={mealForm.fats}
                          onChange={(e) => setMealForm({ ...mealForm, fats: e.target.value })}
                          className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Notes</label>
                      <input
                        type="text"
                        value={mealForm.notes}
                        onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                        className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-3 py-2 text-white text-sm focus:border-primary-red outline-none"
                        placeholder="Optional notes..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addMeal}
                      className="w-full px-4 py-2 rounded-xl bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Meal
                    </button>
                  </div>

                  {/* Meals List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.meals.map((meal, idx) => (
                      <div key={idx} className="bg-primary-gray rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{meal.time}: {meal.food}</p>
                          <p className="text-gray-400 text-xs">
                            {meal.calories && Number(meal.calories) > 0 && `${meal.calories} kcal`}
                            {meal.protein && Number(meal.protein) > 0 && ` • P: ${meal.protein}g`}
                            {meal.carbs && Number(meal.carbs) > 0 && ` • C: ${meal.carbs}g`}
                            {meal.fats && Number(meal.fats) > 0 && ` • F: ${meal.fats}g`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMeal(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/20 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-primary-lightGray">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-primary-lightGray text-gray-300 hover:border-primary-red transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
  );
};

const DashboardDiet = () => {
  const { user } = useAuth();
  const [diets, setDiets] = useState([]);
  const [userDiets, setUserDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchDiets();
  }, [user]);

    const fetchDiets = async () => {
      try {
      setLoading(true);
      const [dietsRes, userDietsRes] = await Promise.all([
        getDietPlans(),
        user ? getUserDietPlans(user._id).catch(() => ({ data: { plans: [] } })) : Promise.resolve({ data: { plans: [] } }),
      ]);
      setDiets(dietsRes.data || []);
      setUserDiets(userDietsRes.data?.plans || []);
      } catch (error) {
        console.error('Diet load failed', error);
      } finally {
        setLoading(false);
      }
    };

  const handleCreatePlan = async (formData) => {
    try {
      const newPlan = await createUserDietPlan(formData);
      setUserDiets([...userDiets, newPlan.data.plan]);
      setShowCreateModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to create plan', error);
      alert('Failed to create diet plan');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowCreateModal(true);
  };

  const handleUpdatePlan = async (formData) => {
    try {
      await updateUserDietPlan(editingPlan._id, formData);
      await fetchDiets();
      setShowCreateModal(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Failed to update plan', error);
      alert('Failed to update diet plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      await deleteUserDietPlan(planId);
      setUserDiets(userDiets.filter((p) => p._id !== planId));
    } catch (error) {
      console.error('Failed to delete plan', error);
      alert('Failed to delete diet plan');
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return diets;
    } else if (filter === 'custom') {
      return [];
    } else {
      return diets.filter((diet) => diet.type === filter);
    }
  }, [diets, filter]);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Nutrition Hub</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Diet & Meal Plans</h1>
          <p className="text-gray-400 text-sm sm:text-base">
              {user?.role === 'member'
                ? 'View assigned plans and create your own custom meal plans.'
                : 'Create and manage your custom meal plans with detailed nutrition tracking.'}
            </p>
          </div>
          {user && (
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              <FiPlus className="w-4 h-4" />
              Create Plan
            </button>
          )}
        </div>

        {user && (
        <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                filter === 'all' 
                  ? 'border-primary-red text-white bg-primary-red/20' 
                  : 'border-primary-lightGray text-gray-400 hover:border-primary-red/50'
              }`}
            >
              All Plans
            </button>
            {userDiets.length > 0 && (
              <button
                onClick={() => setFilter('custom')}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  filter === 'custom' 
                    ? 'border-primary-red text-white bg-primary-red/20' 
                    : 'border-primary-lightGray text-gray-400 hover:border-primary-red/50'
                }`}
              >
                Custom Plans
              </button>
            )}
            {user?.role === 'member' && Object.keys(typeMeta).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm capitalize border transition-colors ${
                  filter === type 
                    ? 'border-primary-red text-white bg-primary-red/20' 
                    : 'border-primary-lightGray text-gray-400 hover:border-primary-red/50'
              }`}
            >
                {typeMeta[type].label}
            </button>
          ))}
        </div>
        )}

        {/* Custom Plans Section */}
        {user && userDiets.length > 0 && (filter === 'all' || filter === 'custom') && (
          <section>
            <h2 className="text-white text-xl font-bold mb-4">My Custom Plans</h2>
          <div className="space-y-6">
              {userDiets.map((diet) => (
                <DietCard
                  key={diet._id}
                  diet={diet}
                  isUserPlan={true}
                  onEdit={handleEditPlan}
                  onDelete={handleDeletePlan}
                />
              ))}
                    </div>
          </section>
        )}

        {/* Assigned & Available Plans Section */}
        {user?.role === 'member' && (filter === 'all' || (filter !== 'custom' && filtered.length > 0)) && (
          <section>
            <h2 className="text-white text-xl font-bold mb-4">
              {filter === 'all' ? 'Assigned & Available Plans' : 'Available Plans'}
            </h2>
            {filtered.length > 0 ? (
              <div className="space-y-6">
                {filtered.map((diet) => (
                  <DietCard key={diet._id} diet={diet} isUserPlan={false} />
                    ))}
                  </div>
            ) : filter !== 'all' && filter !== 'custom' ? (
              <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 text-center">
                <p className="text-gray-400">No plans found for this filter.</p>
              </div>
            ) : null}
          </section>
        )}

        {!user && (
          <section className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7 text-center">
            <h2 className="text-white text-2xl font-bold mb-2">Sign Up to Create Meal Plans</h2>
            <p className="text-gray-400 text-sm mb-4">Create personalized diet plans with detailed nutrition tracking.</p>
            <a
              href="/plans"
              className="inline-block px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
            >
              Get Started
            </a>
          </section>
        )}

        {loading && <div className="text-gray-400 text-center py-12">Loading plans...</div>}

        {!loading && user && userDiets.length === 0 && (filter === 'all' ? filtered.length === 0 : filter === 'custom') && (
          <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 text-center">
            <p className="text-gray-400 mb-4">
              {filter === 'custom' ? 'No custom plans yet.' : 'No diet plans yet.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
        )}

        <CreateDietModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPlan(null);
          }}
          onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
          editingPlan={editingPlan}
          initialData={editingPlan ? {
            title: editingPlan.title,
            description: editingPlan.description || '',
            type: editingPlan.type || 'maintenance',
            dailyCalories: editingPlan.dailyCalories || '',
            dailyProtein: editingPlan.dailyProtein || '',
            dailyCarbs: editingPlan.dailyCarbs || '',
            dailyFats: editingPlan.dailyFats || '',
            meals: editingPlan.meals || [],
          } : null}
        />
      </div>
    </div>
  );
};

export default DashboardDiet;
