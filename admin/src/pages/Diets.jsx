import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '../utils/api';

const emptyMeal = { time: '8:00 AM', food: '', calories: 0 };

const Diets = () => {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'veg',
    description: '',
    access: 'members',
    assignedTo: '',
    meals: [emptyMeal],
  });

  const fetchDiets = async () => {
    try {
      const { data } = await getDietPlans();
      setDiets(data);
    } catch (error) {
      console.error('Load diets failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiets();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      type: 'veg',
      description: '',
      access: 'members',
      assignedTo: '',
      meals: [emptyMeal],
    });
  };

  const addMeal = () => {
    setFormData((prev) => ({ ...prev, meals: [...prev.meals, emptyMeal] }));
  };

  const updateMeal = (index, field, value) => {
    const updated = [...formData.meals];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, meals: updated }));
  };

  const removeMeal = (index) => {
    setFormData((prev) => ({ ...prev, meals: prev.meals.filter((_, idx) => idx !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      meals: formData.meals.filter((meal) => meal.food.trim()),
      assignedTo: formData.assignedTo
        ? formData.assignedTo.split(',').map((id) => id.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editing) {
        await updateDietPlan(editing._id, payload);
      } else {
        await createDietPlan(payload);
      }
      setShowModal(false);
      resetForm();
      fetchDiets();
    } catch (error) {
      console.error('Save diet failed', error);
      alert('Unable to save diet plan');
    }
  };

  const handleEdit = (diet) => {
    setEditing(diet);
    setFormData({
      title: diet.title,
      type: diet.type,
      description: diet.description,
      access: diet.access,
      assignedTo: diet.assignedTo?.map((id) => id.toString()).join(', ') || '',
      meals: diet.meals.length ? diet.meals : [emptyMeal],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    try {
      await deleteDietPlan(id);
      fetchDiets();
    } catch (error) {
      console.error('Delete diet failed', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold gradient-text-red">Diet Plans</h1>
        <button
          className="px-6 py-3 bg-primary-red text-white rounded-lg"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Create Diet
        </button>
      </div>

      <div className="space-y-4">
        {diets.map((plan) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-red">{plan.type}</p>
                <h3 className="text-white text-xl font-semibold">{plan.title}</h3>
              </div>
              <span className="text-gray-400 text-xs uppercase tracking-[0.3em]">{plan.access}</span>
            </div>
            <p className="text-gray-400 text-sm">{plan.description}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.meals.map((meal, idx) => (
                <div key={`${plan._id}-${idx}`} className="bg-primary-darker border border-primary-lightGray/60 rounded-xl p-3">
                  <p className="text-primary-blue text-xs uppercase tracking-[0.3em]">{meal.time}</p>
                  <p className="text-white text-sm font-semibold">{meal.food}</p>
                  <p className="text-gray-500 text-xs">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-primary-blue text-white rounded-lg" onClick={() => handleEdit(plan)}>
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg" onClick={() => handleDelete(plan._id)}>
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-2xl font-bold">{editing ? 'Edit Diet Plan' : 'New Diet Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Diet Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  >
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="keto">Keto</option>
                    <option value="weightloss">Weight Loss</option>
                    <option value="gain">Gain</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Access</label>
                  <select
                    value={formData.access}
                    onChange={(e) => setFormData((prev) => ({ ...prev, access: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  >
                    <option value="public">Public</option>
                    <option value="members">Members</option>
                    <option value="assigned">Assigned</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Assigned Users</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                    placeholder="Comma separated IDs"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  rows="3"
                  required
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold">Meals</label>
                  <button type="button" onClick={addMeal} className="text-primary-red text-sm font-semibold">
                    + Add Meal
                  </button>
                </div>
                {formData.meals.map((meal, idx) => (
                  <div key={`meal-${idx}`} className="grid sm:grid-cols-3 gap-3 bg-primary-darker border border-primary-lightGray rounded-xl p-3">
                    <input
                      type="text"
                      placeholder="Time"
                      value={meal.time}
                      onChange={(e) => updateMeal(idx, 'time', e.target.value)}
                      className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Food"
                      value={meal.food}
                      onChange={(e) => updateMeal(idx, 'food', e.target.value)}
                      className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Calories"
                        value={meal.calories}
                        onChange={(e) => updateMeal(idx, 'calories', Number(e.target.value))}
                        className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white flex-1"
                      />
                      {formData.meals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeal(idx)}
                          className="px-3 py-2 border border-red-500 text-red-400 rounded-lg"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 rounded-lg bg-primary-red text-white">
                  {editing ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-lg border border-primary-lightGray text-white"
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

export default Diets;


