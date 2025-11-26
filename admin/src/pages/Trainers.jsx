import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../utils/api';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    bio: '',
    image: '',
    certifications: '',
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const { data } = await getTrainers();
      setTrainers(data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const trainerData = {
        ...formData,
        experience: Number(formData.experience),
        certifications: formData.certifications.split(',').map((c) => c.trim()).filter(Boolean),
      };

      if (editingTrainer) {
        await updateTrainer(editingTrainer._id, trainerData);
      } else {
        await createTrainer(trainerData);
      }

      setShowModal(false);
      setEditingTrainer(null);
      resetForm();
      fetchTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      alert('Error saving trainer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      experience: '',
      bio: '',
      image: '',
      certifications: '',
    });
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      ...trainer,
      certifications: trainer.certifications?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteTrainer(id);
        fetchTrainers();
      } catch (error) {
        console.error('Error deleting trainer:', error);
        alert('Error deleting trainer');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Trainers</h1>
        <button
          onClick={() => {
            setEditingTrainer(null);
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-red text-white text-sm sm:text-base rounded-lg hover:bg-opacity-90 transition-all whitespace-nowrap"
        >
          + Add Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {trainers.map((trainer, index) => (
          <motion.div
            key={trainer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray"
          >
            <img
              src={trainer.image || 'https://via.placeholder.com/400'}
              alt={trainer.name}
              className="w-full h-48 sm:h-64 object-cover rounded-lg mb-3 sm:mb-4"
            />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{trainer.name}</h3>
            <p className="text-primary-blue font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">{trainer.specialization}</p>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">{trainer.experience}+ Years Experience</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(trainer)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(trainer._id)}
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
              {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
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
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                  />
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
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Certifications (comma separated)</label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  {editingTrainer ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTrainer(null);
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

export default Trainers;

