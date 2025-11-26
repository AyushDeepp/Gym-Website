import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlayCircle, FiLock, FiTarget, FiFilter } from 'react-icons/fi';
import { getWorkoutPlans } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WorkoutCard = ({ plan }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary-red">{plan.goal}</p>
        <h3 className="text-white text-xl font-bold">{plan.title}</h3>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          plan.access === 'public'
            ? 'bg-green-500/20 text-green-300'
            : plan.access === 'members'
            ? 'bg-blue-500/20 text-blue-200'
            : 'bg-purple-500/20 text-purple-200'
        }`}
      >
        {plan.access}
      </span>
    </div>
    {plan.imageUrl && (
      <img src={plan.imageUrl} alt={plan.title} className="w-full h-44 object-cover rounded-2xl border border-primary-lightGray/60" />
    )}
    <div className="space-y-3">
      <p className="text-gray-400 text-sm">Level: <span className="text-white capitalize">{plan.level}</span></p>
      <div className="space-y-2">
        {plan.exercises.slice(0, 4).map((exercise, idx) => (
          <div key={`${plan._id}-${exercise.name}-${idx}`} className="flex items-center gap-3 text-sm text-gray-300">
            <span className="w-6 h-6 rounded-full bg-primary-darker flex items-center justify-center text-xs text-gray-400">{idx + 1}</span>
            <div className="flex-1">
              <p className="text-white font-medium">{exercise.name}</p>
              <p className="text-gray-400 text-xs">
                {exercise.sets} sets • {exercise.reps}
              </p>
            </div>
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary-red text-xs font-semibold flex items-center gap-1"
              >
                <FiPlayCircle /> Demo
              </a>
            )}
          </div>
        ))}
        {plan.exercises.length > 4 && <p className="text-gray-500 text-xs">+ {plan.exercises.length - 4} more drills</p>}
      </div>
    </div>
  </motion.div>
);

const PreviewCard = ({ plan }) => (
  <div className="bg-primary-darker border border-primary-lightGray rounded-2xl p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/60 pointer-events-none" />
    <div className="flex items-center justify-between mb-3 relative z-10">
      <h4 className="text-white font-semibold">{plan.title}</h4>
      <FiLock className="text-primary-red" />
    </div>
    <p className="text-gray-400 text-xs mb-2">{plan.goal}</p>
    <ul className="text-gray-300 text-sm space-y-1 relative z-10">
      {plan.sampleExercises.map((exercise) => (
        <li key={exercise.name}>{exercise.name}</li>
      ))}
    </ul>
    <p className="text-xs text-gray-500 mt-3 relative z-10">Unlock {plan.totalExercises} exercises as a member.</p>
  </div>
);

const DashboardWorkouts = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [previewPlans, setPreviewPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [fullRes, previewRes] = await Promise.all([
          getWorkoutPlans(),
          getWorkoutPlans({ params: { preview: true } }),
        ]);
        setPlans(fullRes.data);
        setPreviewPlans(previewRes.data?.plans || []);
      } catch (error) {
        console.error('Workout load failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => (filter === 'all' ? true : plan.access === filter));

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Member Library</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Workout Plan Library</h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              Curated programs mapped to your goal pipeline. Assigned tracks auto-update when your coach tweaks them.
            </p>
          </div>
          <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 flex items-center gap-3">
            <FiTarget className="text-primary-red text-xl" />
            <div>
              <p className="text-white text-sm font-semibold">Active Role</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FiFilter />
            Filter
          </div>
          {['all', 'public', 'members', 'assigned'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm capitalize border ${
                filter === key ? 'border-primary-red text-white bg-primary-red/20' : 'border-primary-lightGray text-gray-400'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400">Loading plans...</div>
        ) : filteredPlans.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPlans.map((plan) => (
              <WorkoutCard key={plan._id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 text-gray-400">
            No plans available for this filter yet.
          </div>
        )}

        <section className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                <FiLock className="text-primary-red" /> Visitor Preview Deck
              </h2>
              <p className="text-gray-400 text-sm">This is the teaser visitors see before joining.</p>
            </div>
            <a
              href="/plans"
              className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
            >
              Share Plans Page
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {previewPlans.slice(0, 4).map((plan) => (
              <PreviewCard key={plan._id} plan={plan} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardWorkouts;


