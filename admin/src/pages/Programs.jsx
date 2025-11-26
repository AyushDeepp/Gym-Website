import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '../utils/api';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    image: '',
    features: '',
    price: 0,
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const programData = {
        ...formData,
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
        price: Number(formData.price),
      };

      if (editingProgram) {
        await updateProgram(editingProgram._id, programData);
      } else {
        await createProgram(programData);
      }

      setShowModal(false);
      setEditingProgram(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        difficulty: 'Beginner',
        image: '',
        features: '',
        price: 0,
      });
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program');
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      ...program,
      features: program.features?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await deleteProgram(id);
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Error deleting program');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Programs</h1>
        <button
          onClick={() => {
            setEditingProgram(null);
            setFormData({
              name: '',
              description: '',
              duration: '',
              difficulty: 'Beginner',
              image: '',
              features: '',
              price: 0,
            });
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-red text-white text-sm sm:text-base rounded-lg hover:bg-opacity-90 transition-all whitespace-nowrap"
        >
          + Add Program
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {programs.map((program, index) => (
          <motion.div
            key={program._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray"
          >
            <img
              src={program.image || 'https://via.placeholder.com/400'}
              alt={program.name}
              className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
            />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 truncate">{program.name}</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{program.description}</p>
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
              <span className="px-2 sm:px-3 py-1 bg-primary-red text-white text-xs rounded-full whitespace-nowrap">
                {program.difficulty}
              </span>
              <span className="text-primary-blue text-xs sm:text-sm">{program.duration}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(program)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(program._id)}
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
              {editingProgram ? 'Edit Program' : 'Add New Program'}
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
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Features (comma separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  {editingProgram ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProgram(null);
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

export default Programs;

