import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../utils/api';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await loginAdmin(formData);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-primary-gray rounded-xl p-8 border border-primary-lightGray">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text-red mb-2">Elite Gym</h1>
            <p className="text-gray-400">Admin Login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                placeholder="admin@elitegym.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-primary-dark border border-primary-lightGray rounded-lg text-white focus:outline-none focus:border-primary-red"
                placeholder="Enter your password"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary-red text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>Default credentials:</p>
            <p className="mt-2">Email: admin@elitegym.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

