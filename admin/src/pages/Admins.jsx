import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAdmins, registerAdmin, updateAdmin, deleteAdmin } from '../utils/api';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  useEffect(() => {
    // Get current admin from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setCurrentAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
    fetchAdmins();
  }, []);

  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  const fetchAdmins = async () => {
    try {
      const { data } = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });
    setEditingAdmin(null);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '', // Don't pre-fill password
      role: admin.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        // Update admin
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        // Only include password if it's provided
        if (formData.password && formData.password.length > 0) {
          updateData.password = formData.password;
        }
        await updateAdmin(editingAdmin._id, updateData);
        alert('Admin updated successfully!');
      } else {
        // Create new admin
        await registerAdmin(formData);
        alert('Admin created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      alert(error.response?.data?.message || `Error ${editingAdmin ? 'updating' : 'creating'} admin`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await deleteAdmin(id);
        fetchAdmins();
        alert('Admin deleted successfully!');
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert(error.response?.data?.message || 'Error deleting admin');
      }
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-red">Admin Management</h1>
        {isSuperAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all whitespace-nowrap"
          >
            + Add Admin
          </button>
        )}
        {!isSuperAdmin && (
          <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-400 text-center">
            Only superadmins can manage admins
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {admins.map((admin, index) => (
          <motion.div
            key={admin._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-primary-gray rounded-xl p-4 sm:p-6 border border-primary-lightGray"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-red rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                  admin.role === 'superadmin'
                    ? 'bg-primary-red text-white'
                    : 'bg-primary-blue text-white'
                }`}
              >
                {admin.role}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{admin.name}</h3>
            <p className="text-primary-blue mb-3 sm:mb-4 text-sm sm:text-base truncate">{admin.email}</p>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
              Created: {new Date(admin.createdAt).toLocaleDateString()}
            </p>
            {isSuperAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(admin)}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-gray rounded-xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-primary-lightGray max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
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
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">
                  Password {editingAdmin && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingAdmin}
                  minLength={editingAdmin ? 0 : 6}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-dark border border-primary-lightGray rounded-lg text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary-red text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
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

export default Admins;

