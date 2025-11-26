import { useState } from 'react';
import { motion } from 'framer-motion';
import { getProgressEntries } from '../utils/api';

const Progress = () => {
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await getProgressEntries(userId.trim());
      setEntries(data);
    } catch (err) {
      setEntries([]);
      setError(err.response?.data?.message || 'Unable to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="text-3xl font-bold gradient-text-red mb-4">Member Progress Logs</h1>
      <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleFetch}>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1 bg-primary-gray border border-primary-lightGray rounded-lg px-4 py-3 text-white"
        />
        <button className="px-6 py-3 bg-primary-red text-white rounded-lg" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Logs'}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {entries.length ? (
        <div className="space-y-3">
          {entries
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 flex flex-wrap gap-4 items-center"
              >
                <div>
                  <p className="text-white font-semibold">{entry.weight} kg</p>
                  <p className="text-gray-500 text-xs">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                {entry.bodyFat && <p className="text-gray-400 text-sm">{entry.bodyFat}% body fat</p>}
                {entry.photoUrl && (
                  <img src={entry.photoUrl} alt="progress" className="w-20 h-20 object-cover rounded-xl border border-primary-lightGray/60" />
                )}
                <p className="text-gray-400 text-sm flex-1">{entry.notes || 'No notes'}</p>
              </motion.div>
            ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No entries loaded.</p>
      )}
    </div>
  );
};

export default Progress;


