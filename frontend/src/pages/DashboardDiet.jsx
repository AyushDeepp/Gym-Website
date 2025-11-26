import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFeather, FiSun, FiMoon, FiTrendingUp } from 'react-icons/fi';
import { getDietPlans } from '../utils/api';

const typeMeta = {
  veg: { label: 'Vegetarian', color: 'text-green-300', icon: FiFeather },
  nonveg: { label: 'Balanced', color: 'text-red-200', icon: FiTrendingUp },
  keto: { label: 'Keto', color: 'text-purple-200', icon: FiMoon },
  weightloss: { label: 'Weight Loss', color: 'text-yellow-200', icon: FiSun },
  gain: { label: 'Muscle Gain', color: 'text-blue-200', icon: FiTrendingUp },
};

const DashboardDiet = () => {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const { data } = await getDietPlans();
        setDiets(data);
      } catch (error) {
        console.error('Diet load failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiets();
  }, []);

  const filtered = useMemo(
    () => diets.filter((diet) => (filter === 'all' ? true : diet.type === filter)),
    [diets, filter]
  );

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Nutrition HQ</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Diet & Meal Playbooks</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Assigned plans adapt to your macros, allergies, and schedule. Tap a meal slot to see recommended pairings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {['all', ...Object.keys(typeMeta)].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm capitalize border ${
                filter === type ? 'border-primary-red text-white bg-primary-red/20' : 'border-primary-lightGray text-gray-400'
              }`}
            >
              {type === 'all' ? 'All Plans' : typeMeta[type].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400">Loading diets...</div>
        ) : filtered.length ? (
          <div className="space-y-6">
            {filtered.map((diet) => {
              const meta = typeMeta[diet.type] || typeMeta.veg;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={diet._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-7"
                >
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-primary-red">{diet.access}</p>
                      <h2 className="text-white text-2xl font-bold">{diet.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className={`${meta.color} text-xl`} />
                      <p className={`${meta.color} text-sm font-semibold`}>{meta.label}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 mb-4">{diet.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {diet.meals.map((meal, idx) => (
                      <div key={`${diet._id}-${idx}`} className="bg-primary-darker rounded-2xl border border-primary-lightGray/60 p-4">
                        <p className="text-primary-red text-xs uppercase tracking-[0.3em]">{meal.time}</p>
                        <h4 className="text-white font-semibold">{meal.food}</h4>
                        <p className="text-gray-500 text-xs">{meal.calories} kcal</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400">No diet plans found for this filter yet.</div>
        )}
      </div>
    </div>
  );
};

export default DashboardDiet;


