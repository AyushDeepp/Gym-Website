import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from '../utils/api';

const emptyExercise = { name: '', sets: 3, reps: '12 reps', videoUrl: '' };

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    level: 'beginner',
    imageUrl: '',
    access: 'public',
    assignedTo: '',
    exercises: [emptyExercise],
  });

  const fetchWorkouts = async () => {
    try {
      const { data } = await getWorkoutPlans();
      setWorkouts(data);
    } catch (error) {
      console.error('Fetch workouts failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleExerciseChange = (index, field, value) => {
    const updated = [...formData.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, exercises: updated }));
  };

  const addExercise = () => {
    setFormData((prev) => ({ ...prev, exercises: [...prev.exercises, emptyExercise] }));
  };

  const removeExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      goal: '',
      level: 'beginner',
      imageUrl: '',
      access: 'public',
      assignedTo: '',
      exercises: [emptyExercise],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      exercises: formData.exercises.filter((ex) => ex.name.trim()),
      assignedTo: formData.assignedTo
        ? formData.assignedTo.split(',').map((id) => id.trim()).filter(Boolean)
        : [],
    };
    try {
      if (editing) {
        await updateWorkoutPlan(editing._id, payload);
      } else {
        await createWorkoutPlan(payload);
      }
      setShowModal(false);
      resetForm();
      fetchWorkouts();
    } catch (error) {
      console.error('Save workout failed', error);
      alert('Unable to save workout');
    }
  };

  const handleEdit = (plan) => {
    setEditing(plan);
    setFormData({
      title: plan.title,
      goal: plan.goal,
      level: plan.level,
      imageUrl: plan.imageUrl || '',
      access: plan.access,
      assignedTo: plan.assignedTo?.map((id) => id.toString()).join(', ') || '',
      exercises: plan.exercises.length ? plan.exercises : [emptyExercise],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await deleteWorkoutPlan(id);
      fetchWorkouts();
    } catch (error) {
      console.error('Delete workout failed', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold gradient-text-red">Workout Plans</h1>
        <button
          className="px-6 py-3 bg-primary-red text-white rounded-lg"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Create Workout
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {workouts.map((plan) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray rounded-2xl border border-primary-lightGray p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white text-xl font-semibold">{plan.title}</h3>
              <span className="text-xs uppercase tracking-[0.3em] text-primary-blue">{plan.access}</span>
            </div>
            <p className="text-gray-400 text-sm">{plan.goal}</p>
            <div className="text-gray-500 text-xs uppercase tracking-[0.3em]">Exercises</div>
            <ul className="text-gray-300 text-sm space-y-1 max-h-32 overflow-y-auto pr-2">
              {plan.exercises.map((exercise) => (
                <li key={`${plan._id}-${exercise.name}`}>{exercise.name}</li>
              ))}
            </ul>
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
              <h2 className="text-white text-2xl font-bold">{editing ? 'Edit Workout' : 'New Workout Plan'}</h2>
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
                  <label className="text-gray-400 text-sm block mb-1">Goal</label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goal: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
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
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Assigned User IDs (comma separated)</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold">Exercises</label>
                  <button type="button" onClick={addExercise} className="text-primary-red text-sm font-semibold">
                    + Add Exercise
                  </button>
                </div>
                {formData.exercises.map((exercise, idx) => (
                  <div key={`exercise-${idx}`} className="grid sm:grid-cols-4 gap-3 bg-primary-darker border border-primary-lightGray rounded-xl p-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                      className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                      className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                      placeholder="Sets"
                    />
                    <input
                      type="text"
                      value={exercise.reps}
                      placeholder="Reps"
                      onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                      className="bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Video URL"
                        value={exercise.videoUrl}
                        onChange={(e) => handleExerciseChange(idx, 'videoUrl', e.target.value)}
                        className="flex-1 bg-transparent border border-primary-gray rounded-lg px-3 py-2 text-white"
                      />
                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(idx)}
                          className="px-3 py-2 border border-red-500 text-red-400 rounded-lg"
                        >
                          Remove
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

export default Workouts;


