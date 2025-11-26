import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTransformations, approveTransformation, deleteTransformation } from '../utils/api';

const Transformations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data } = await getTransformations({ includePending: true });
      setItems(data);
    } catch (error) {
      console.error('Load transformations failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleApprove = async (id, featured) => {
    try {
      await approveTransformation(id, { featured });
      fetchItems();
    } catch (error) {
      console.error('Approve failed', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await deleteTransformation(id);
      fetchItems();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold gradient-text-red">Transformations</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{item.userId?.name || 'Member'}</p>
                <p className="text-gray-500 text-xs">
                  Submitted {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.approved ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-200'
                }`}
              >
                {item.approved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <img src={item.beforeImage} alt="before" className="h-40 w-full object-cover rounded-xl border border-primary-lightGray/60" />
              <img src={item.afterImage} alt="after" className="h-40 w-full object-cover rounded-xl border border-primary-lightGray/60" />
            </div>
            <p className="text-gray-300 text-sm">{item.story}</p>
            <div className="flex flex-wrap gap-2">
              {!item.approved && (
                <>
                  <button
                    className="flex-1 px-3 py-2 bg-primary-blue text-white rounded-lg"
                    onClick={() => handleApprove(item._id, false)}
                  >
                    Approve
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg"
                    onClick={() => handleApprove(item._id, true)}
                  >
                    Approve & Feature
                  </button>
                </>
              )}
              <button className="px-3 py-2 bg-red-600 text-white rounded-lg" onClick={() => handleDelete(item._id)}>
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Transformations;


