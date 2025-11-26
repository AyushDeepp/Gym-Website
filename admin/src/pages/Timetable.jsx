import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTimetable, createTimetable, updateTimetable, deleteTimetable } from '../utils/api';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    trainer: '',
    day: 'Monday',
    time: '',
    duration: '',
    capacity: 20,
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const { data } = await getTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const entryData = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingEntry) {
        await updateTimetable(editingEntry._id, entryData);
      } else {
        await createTimetable(entryData);
      }

      setShowModal(false);
      setEditingEntry(null);
      resetForm();
      fetchTimetable();
    } catch (error) {
      console.error('Error saving timetable entry:', error);
      alert('Error saving timetable entry');
    }
  };

  const resetForm = () => {
    setFormData({
      className: '',
      trainer: '',
      day: 'Monday',
      time: '',
      duration: '',
      capacity: 20,
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await deleteTimetable(id);
        fetchTimetable();
      } catch (error) {
        console.error('Error deleting timetable entry:', error);
        alert('Error deleting timetable entry');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Class Timetable</h1>
        <button
          onClick={() => {
            setEditingEntry(null);
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all whitespace-nowrap"
        >
          + Add Class
        </button>
      </div>

      <div className="space-y-4">
        {days.map((day) => {
          const dayClasses = timetable.filter((item) => item.day === day);
          return (
            <div key={day} className="bg-primary-gray rounded-xl p-6 border border-primary-lightGray">
              <h3 className="text-xl font-bold gradient-text-red mb-4">{day}</h3>
              {dayClasses.length > 0 ? (
                <div className="space-y-3">
                  {dayClasses.map((entry, index) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-primary-dark rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-white font-semibold">{entry.className}</h4>
                        <p className="text-primary-blue text-sm">{entry.trainer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{entry.time}</p>
                        <p className="text-gray-400 text-sm">{entry.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-all text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No classes scheduled</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-gray rounded-xl p-8 max-w-2xl w-full border border-primary-lightGray"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingEntry ? 'Edit Class' : 'Add New Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Class Name</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Trainer</label>
                <input
                  type="text"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder="60 min"
                    className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  {editingEntry ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEntry(null);
                  }}
                  className="flex-1 px-6 py-3 bg-primary-lightGray text-white rounded-lg hover:bg-opacity-90 transition-all"
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

export default Timetable;

