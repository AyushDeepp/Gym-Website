import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTransformations } from '../utils/api';

const BeforeAfter = ({ beforeImage, afterImage }) => {
  const [split, setSplit] = useState(50);
  return (
    <div className="relative h-64 rounded-3xl overflow-hidden border border-primary-lightGray">
      <img src={afterImage} alt="after" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
        <img src={beforeImage} alt="before" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 pointer-events-none flex justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white drop-shadow">
        <span>Before</span>
        <span>After</span>
      </div>
      <input
        type="range"
        min="10"
        max="90"
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="absolute bottom-4 left-4 right-4 accent-primary-red"
      />
    </div>
  );
};

const Transformations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await getTransformations();
        setItems(data);
      } catch (error) {
        console.error('Transformation load failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Community Wall</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Member Transformations</h1>
          <p className="text-gray-400 text-sm sm:text-base">Real progress from Elite Gym members across India.</p>
        </header>

        {loading ? (
          <p className="text-gray-400">Loading inspiration…</p>
        ) : items.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((item) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-6 space-y-4"
              >
                <BeforeAfter beforeImage={item.beforeImage} afterImage={item.afterImage} />
                <div>
                  <p className="text-white font-semibold text-lg">{item.userId?.name || 'Member'}</p>
                  <p className="text-gray-500 text-xs">
                    Member since {item.userId?.createdAt ? new Date(item.userId.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{item.story}</p>
              </motion.article>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No stories yet. Be the first to submit yours!</p>
        )}
      </div>
    </div>
  );
};

export default Transformations;


