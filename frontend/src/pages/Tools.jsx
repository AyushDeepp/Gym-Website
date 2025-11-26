import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { getWorkoutPlans, getDietPlans } from '../utils/api';

const bmiLabel = (value) => {
  if (!value) return '—';
  if (value < 18.5) return 'Underweight';
  if (value < 25) return 'Healthy';
  if (value < 30) return 'Overweight';
  return 'Obese';
};

const bmiBadgeColor = (value) => {
  if (!value) return 'bg-gray-500/20 text-gray-200';
  if (value < 18.5) return 'bg-blue-500/20 text-blue-300';
  if (value < 25) return 'bg-green-500/20 text-green-300';
  if (value < 30) return 'bg-yellow-500/20 text-yellow-200';
  return 'bg-red-500/20 text-red-300';
};

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const safeLog10 = (value) => Math.log10(Math.max(value, 1));

const Tools = () => {
  const [bmiInputs, setBmiInputs] = useState({ height: 170, weight: 70 });
  const [bodyInputs, setBodyInputs] = useState({
    gender: 'male',
    waist: 82,
    neck: 40,
    hip: 95,
  });
  const [tdeeInputs, setTdeeInputs] = useState({
    age: 28,
    height: 170,
    weight: 70,
    gender: 'male',
    activity: 'moderate',
  });
  const [workoutPreviews, setWorkoutPreviews] = useState([]);
  const [dietPreviews, setDietPreviews] = useState([]);

  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        const [workoutsRes, dietsRes] = await Promise.all([
          getWorkoutPlans({ params: { preview: true } }),
          getDietPlans({ params: { preview: true } }),
        ]);
        setWorkoutPreviews(workoutsRes.data?.plans || []);
        setDietPreviews(dietsRes.data?.diets || dietsRes.data || []);
      } catch (error) {
        console.error('Preview load failed', error);
      }
    };
    fetchPreviews();
  }, []);

  const bmiValue = useMemo(() => {
    const heightMeters = bmiInputs.height / 100;
    if (!heightMeters) return 0;
    return +(bmiInputs.weight / (heightMeters * heightMeters)).toFixed(1);
  }, [bmiInputs]);

  const bodyFat = useMemo(() => {
    const { gender, waist, neck, hip } = bodyInputs;
    const height = bmiInputs.height;
    if (gender === 'male') {
      return +(
        495 /
          (1.0324 - 0.19077 * safeLog10(waist - neck) + 0.15456 * safeLog10(height)) -
        450
      ).toFixed(1);
    }
    return +(
      495 /
        (1.29579 - 0.35004 * safeLog10(waist + hip - neck) + 0.221 * safeLog10(height)) -
      450
    ).toFixed(1);
  }, [bodyInputs, bmiInputs.height]);

  const tdee = useMemo(() => {
    const { weight, height, age, gender, activity } = tdeeInputs;
    const base =
      gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    return Math.round(base * activityMultipliers[activity]);
  }, [tdeeInputs]);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Tools</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            BMI & Health Calculators
          </h1>
          <p className="text-gray-400 max-w-3xl text-base sm:text-lg">
            Track vitals instantly with responsive sliders, live feedback, and smart insights. No data is stored — perfect
            for quick assessments before you book a free consult with our coaches.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          {/* BMI Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-5 sm:p-7 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <FiActivity className="text-primary-red text-2xl" />
                  BMI Calculator
                </h2>
                <p className="text-gray-400 text-sm">Body Mass Index with instant interpretation.</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${bmiBadgeColor(bmiValue)}`}>
                {bmiLabel(bmiValue)}
              </div>
            </div>

            <div className="space-y-6">
              {['height', 'weight'].map((field) => (
                <div key={field}>
                  <div className="flex justify-between text-gray-400 text-sm mb-2">
                    <span className="capitalize">{field}</span>
                    <span className="text-white font-semibold">{bmiInputs[field]} {field === 'height' ? 'cm' : 'kg'}</span>
                  </div>
                  <input
                    type="range"
                    min={field === 'height' ? 130 : 30}
                    max={field === 'height' ? 220 : 200}
                    value={bmiInputs[field]}
                    onChange={(e) => setBmiInputs({ ...bmiInputs, [field]: Number(e.target.value) })}
                    className="w-full accent-primary-red"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 bg-primary-darker rounded-2xl p-5 border border-primary-lightGray/60">
              <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mb-3">Result</p>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-black text-white">{bmiValue || '—'}</span>
                <span className="text-gray-400 text-sm mb-2">kg/m²</span>
              </div>
              <p className="text-gray-300 text-sm mt-3">
                Keep BMI between 18.5 - 24.9 for optimal health. Our coaches use this score as a baseline and personalize the
                rest.
              </p>
            </div>
          </motion.div>

          {/* Body Fat & TDEE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary-gray/70 border border-primary-lightGray rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <FiHeart className="text-primary-red text-2xl" />
                  Body Composition
                </h2>
                <p className="text-gray-400 text-sm">Navy formula body-fat estimate + calorie planner.</p>
              </div>
              <select
                value={bodyInputs.gender}
                onChange={(e) => setBodyInputs({ ...bodyInputs, gender: e.target.value })}
                className="bg-primary-darker border border-primary-lightGray text-white rounded-xl px-4 py-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
            {['waist', 'neck', 'hip'].map((field) => {
              const disabled = field === 'hip' && bodyInputs.gender === 'male';
              return (
                <div key={field} className={disabled ? 'opacity-30' : ''}>
                  <label className="text-gray-400 text-sm block mb-2 capitalize">{field} (cm)</label>
                  <input
                    type="number"
                    value={bodyInputs[field]}
                    min="20"
                    max="200"
                    disabled={disabled}
                    onChange={(e) => setBodyInputs({ ...bodyInputs, [field]: Number(e.target.value) })}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                  />
                </div>
              );
            })}
            </div>

            <div className="bg-primary-darker rounded-2xl p-5 border border-primary-lightGray flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-[0.3em]">Body Fat %</p>
                <p className="text-4xl text-white font-black mt-1">{isFinite(bodyFat) ? bodyFat : '—'}%</p>
              </div>
              <div className="text-sm text-gray-400">
                <p>Fitness Range: Men 10-20% | Women 18-28%</p>
                <p className="text-primary-red">We build nutrition blocks to hit your target.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-lightGray">
              <div className="flex items-center gap-3 mb-4">
                <FiTrendingUp className="text-primary-red text-xl" />
                <div>
                  <p className="text-white font-semibold text-base">Calorie & TDEE Estimator</p>
                  <p className="text-gray-400 text-sm">Based on Mifflin-St Jeor equation.</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {['age', 'height', 'weight'].map((field) => (
                  <div key={field}>
                    <label className="text-gray-400 text-sm block mb-2 capitalize">
                      {field} {field !== 'age' ? '(cm/kg)' : ''}
                    </label>
                    <input
                      type="number"
                      value={tdeeInputs[field]}
                      onChange={(e) => setTdeeInputs({ ...tdeeInputs, [field]: Number(e.target.value) })}
                      className="w-full bg-primary-darker border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm block mb-2">Activity Level</label>
                  <select
                    value={tdeeInputs.activity}
                    onChange={(e) => setTdeeInputs({ ...tdeeInputs, activity: e.target.value })}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                  >
                    <option value="sedentary">Sedentary (desk)</option>
                    <option value="light">Lightly Active (1-3 workouts)</option>
                    <option value="moderate">Moderate (3-5 workouts)</option>
                    <option value="active">Active (6-7 workouts)</option>
                    <option value="athlete">Athlete (twice daily)</option>
                  </select>
                </div>
              </div>
              <div className="bg-primary-darker rounded-2xl p-5 border border-primary-lightGray flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-[0.3em]">Maintenance</p>
                  <p className="text-4xl text-white font-black mt-1">{tdee} kcal</p>
                </div>
                <div className="text-gray-300 text-sm">
                  <p>Cutting Target: {(tdee - 400).toLocaleString()} kcal</p>
                  <p>Bulking Target: {(tdee + 300).toLocaleString()} kcal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {(workoutPreviews.length || dietPreviews.length) && (
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-white text-2xl font-bold">Member Preview Deck</h2>
              <a
                href="/plans"
                className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
              >
                Unlock Full Access
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {workoutPreviews.slice(0, 2).map((plan) => (
                <div key={plan._id} className="bg-primary-gray/60 border border-primary-lightGray rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary-red">Workout</p>
                  <h3 className="text-white font-semibold">{plan.title}</h3>
                  <p className="text-gray-400 text-sm">{plan.goal}</p>
                  <p className="text-gray-500 text-xs mt-2">{plan.totalExercises} drills • locked</p>
                </div>
              ))}
              {dietPreviews.slice(0, 2).map((diet) => (
                <div key={diet._id || diet.title} className="bg-primary-gray/60 border border-primary-lightGray rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Nutrition</p>
                  <h3 className="text-white font-semibold">{diet.title}</h3>
                  <p className="text-gray-400 text-sm">{diet.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row items-center gap-6"
        >
          <FiAlertCircle className="text-primary-red text-4xl flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-white text-xl font-semibold mb-2">Need deeper diagnostics?</h3>
            <p className="text-gray-400 text-sm">
              Book a complimentary InBody scan at Elite Gym HQ. We combine DEXA-grade scans, posture analysis, and mobility
              screening to build the perfect workout & diet stack for you.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3 rounded-2xl bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
          >
            Book Assessment
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Tools;


