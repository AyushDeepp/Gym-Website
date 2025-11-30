import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  FiUploadCloud,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiTrash2,
  FiTarget,
  FiActivity,
  FiHeart,
  FiZap,
  FiAward,
  FiBarChart2,
  FiImage,
  FiEdit,
  FiX,
  FiSave,
  FiDownload,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { createProgressEntry, updateProgressEntry, deleteProgressEntry, getProgressEntries } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatDateFull = (value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Calculate statistics
const calculateStats = (entries) => {
  if (!entries.length) return null;
  
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  
  const weightChange = latest.weight - first.weight;
  const bodyFatChange = latest.bodyFat && first.bodyFat ? latest.bodyFat - first.bodyFat : null;
  
  // Calculate average energy
  const energyEntries = entries.filter(e => e.energy);
  const avgEnergy = energyEntries.length 
    ? (energyEntries.reduce((sum, e) => sum + e.energy, 0) / energyEntries.length).toFixed(1)
    : null;
  
  // Calculate total weight loss/gain
  const totalChange = weightChange;
  const changePercent = first.weight ? ((weightChange / first.weight) * 100).toFixed(1) : 0;
  
  return {
    first,
    latest,
    weightChange,
    bodyFatChange,
    avgEnergy,
    totalChange,
    changePercent,
    totalEntries: entries.length,
  };
};

// Calculate streak
const computeStreak = (entries) => {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = (new Date(sorted[i - 1].date) - new Date(sorted[i].date)) / (1000 * 60 * 60 * 24);
    if (gap <= 7) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

// Goal progress calculation
const calculateGoalProgress = (entries, goal) => {
  if (!entries.length || !goal) return null;
  const latest = entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const first = entries.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  
  if (goal.targetWeight) {
    const current = latest.weight;
    const start = first.weight;
    const target = goal.targetWeight;
    const progress = ((start - current) / (start - target)) * 100;
    return {
      type: 'weight',
      current,
      target,
      progress: Math.max(0, Math.min(100, progress)),
      remaining: current - target,
    };
  }
  
  if (goal.targetBodyFat) {
    const current = latest.bodyFat || 0;
    const start = first.bodyFat || 0;
    const target = goal.targetBodyFat;
    const progress = start > target 
      ? ((start - current) / (start - target)) * 100
      : ((current - start) / (target - start)) * 100;
    return {
      type: 'bodyFat',
      current,
      target,
      progress: Math.max(0, Math.min(100, progress)),
      remaining: Math.abs(current - target),
    };
  }
  
  return null;
};

const DashboardProgress = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, charts, photos, calendar
  const [timeFilter, setTimeFilter] = useState('all'); // 7d, 30d, 90d, all
  const [chartType, setChartType] = useState('line'); // line, area, bar
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    height: '',
    notes: '',
    photoUrl: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
      neck: '',
    },
    strengthMetrics: {
      benchPress: '',
      squat: '',
      deadlift: '',
      overheadPress: '',
      notes: '',
    },
    energy: '',
    sleep: {
      hours: '',
      quality: '',
    },
    mood: '',
    goals: {
      targetWeight: '',
      targetBodyFat: '',
      targetDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (user?._id) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

    const fetchEntries = async () => {
      try {
        const { data } = await getProgressEntries(user._id);
      setEntries(data || []);
      } catch (error) {
        console.error('Progress load failed', error);
      setEntries([]);
      } finally {
        setLoading(false);
      }
    };

  // Filter entries by time period
  const filteredEntries = useMemo(() => {
    if (timeFilter === 'all') return entries;
    const now = new Date();
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[timeFilter] || 0;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return entries.filter(e => new Date(e.date) >= cutoff);
  }, [entries, timeFilter]);

  const stats = useMemo(() => calculateStats(filteredEntries), [filteredEntries]);
  const streak = useMemo(() => computeStreak(entries), [entries]);
  const latestEntry = filteredEntries.length > 0 
    ? filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date))[0] 
    : null;

  // Chart data
  const chartData = useMemo(
    () =>
      filteredEntries
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((entry) => ({
          date: formatDate(entry.date),
          weight: entry.weight,
          bodyFat: entry.bodyFat || null,
          bmi: entry.bmi ? Number(entry.bmi.toFixed(1)) : null,
          chest: entry.measurements?.chest || null,
          waist: entry.measurements?.waist || null,
          arms: entry.measurements?.arms || null,
          energy: entry.energy || null,
        })),
    [filteredEntries]
  );

  // Photos with entries
  const photoEntries = useMemo(
    () => entries.filter(e => e.photoUrl).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries]
  );

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, photoUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
      setForm({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        height: '',
        notes: '',
        photoUrl: '',
      measurements: {
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
        neck: '',
      },
      strengthMetrics: {
        benchPress: '',
        squat: '',
        deadlift: '',
        overheadPress: '',
        notes: '',
      },
      energy: '',
      sleep: {
        hours: '',
        quality: '',
      },
      mood: '',
      goals: {
        targetWeight: '',
        targetBodyFat: '',
        targetDate: '',
        notes: '',
      },
    });
    setEditingEntry(null);
    setActiveTab('basic');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight) return;
    setSubmitting(true);
    try {
      const submitData = {
        date: form.date,
        weight: Number(form.weight),
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
        height: form.height ? Number(form.height) : undefined,
        notes: form.notes,
        photoUrl: form.photoUrl,
        measurements: Object.keys(form.measurements).reduce((acc, key) => {
          if (form.measurements[key]) acc[key] = Number(form.measurements[key]);
          return acc;
        }, {}),
        strengthMetrics: Object.keys(form.strengthMetrics).reduce((acc, key) => {
          if (form.strengthMetrics[key] && key !== 'notes') {
            acc[key] = Number(form.strengthMetrics[key]);
          } else if (key === 'notes' && form.strengthMetrics[key]) {
            acc[key] = form.strengthMetrics[key];
          }
          return acc;
        }, {}),
        energy: form.energy ? Number(form.energy) : undefined,
        sleep: form.sleep.hours || form.sleep.quality
          ? {
              hours: form.sleep.hours ? Number(form.sleep.hours) : undefined,
              quality: form.sleep.quality ? Number(form.sleep.quality) : undefined,
            }
          : undefined,
        mood: form.mood || undefined,
        goals: Object.keys(form.goals).reduce((acc, key) => {
          if (form.goals[key]) {
            if (key === 'targetDate') {
              acc[key] = form.goals[key];
            } else if (key === 'targetWeight' || key === 'targetBodyFat') {
              acc[key] = Number(form.goals[key]);
            } else {
              acc[key] = form.goals[key];
            }
          }
          return acc;
        }, {}),
      };

      if (editingEntry) {
        // Update existing entry
        await updateProgressEntry(editingEntry._id, submitData);
      } else {
        // Create new entry
        await createProgressEntry(submitData);
      }
      
      await fetchEntries();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Progress save failed', error);
      alert('Failed to save progress entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteProgressEntry(id);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      date: new Date(entry.date).toISOString().split('T')[0],
      weight: entry.weight.toString(),
      bodyFat: entry.bodyFat?.toString() || '',
      height: '',
      notes: entry.notes || '',
      photoUrl: entry.photoUrl || '',
      measurements: {
        chest: entry.measurements?.chest?.toString() || '',
        waist: entry.measurements?.waist?.toString() || '',
        hips: entry.measurements?.hips?.toString() || '',
        arms: entry.measurements?.arms?.toString() || '',
        thighs: entry.measurements?.thighs?.toString() || '',
        neck: entry.measurements?.neck?.toString() || '',
      },
      strengthMetrics: {
        benchPress: entry.strengthMetrics?.benchPress?.toString() || '',
        squat: entry.strengthMetrics?.squat?.toString() || '',
        deadlift: entry.strengthMetrics?.deadlift?.toString() || '',
        overheadPress: entry.strengthMetrics?.overheadPress?.toString() || '',
        notes: entry.strengthMetrics?.notes || '',
      },
      energy: entry.energy?.toString() || '',
      sleep: {
        hours: entry.sleep?.hours?.toString() || '',
        quality: entry.sleep?.quality?.toString() || '',
      },
      mood: entry.mood || '',
      goals: {
        targetWeight: entry.goals?.targetWeight?.toString() || '',
        targetBodyFat: entry.goals?.targetBodyFat?.toString() || '',
        targetDate: entry.goals?.targetDate 
          ? new Date(entry.goals.targetDate).toISOString().split('T')[0]
          : '',
        notes: entry.goals?.notes || '',
      },
    });
    setShowForm(true);
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Weight (kg)', 'Body Fat (%)', 'BMI', 'Energy', 'Mood', 'Notes'].join(','),
      ...filteredEntries.map(e => [
        formatDateFull(e.date),
        e.weight,
        e.bodyFat || '',
        e.bmi?.toFixed(1) || '',
        e.energy || '',
        e.mood || '',
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-400 text-lg mb-4">Please log in to track your progress.</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 rounded-full bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  const goalProgress = latestEntry?.goals ? calculateGoalProgress(entries, latestEntry.goals) : null;

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-2">Progress Tracking</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">My Fitness Journey</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Track your progress, visualize your journey, and achieve your goals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors flex items-center gap-2"
            >
              <FiActivity className="w-4 h-4" />
              New Entry
            </button>
            {filteredEntries.length > 0 && (
              <button
                onClick={exportData}
                className="px-5 py-2.5 rounded-full border border-primary-lightGray text-gray-300 text-sm font-semibold hover:border-primary-red transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-primary-lightGray pb-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
            { id: 'charts', label: 'Analytics', icon: FiTrendingUp },
            { id: 'photos', label: 'Photos', icon: FiImage },
            { id: 'history', label: 'History', icon: FiCalendar },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === mode.id
                    ? 'bg-primary-red text-white'
                    : 'bg-primary-gray border border-primary-lightGray text-gray-300 hover:border-primary-red'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 sm:p-6"
              >
                <p className="text-gray-400 text-xs mb-1">Current Weight</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {latestEntry?.weight || '--'} <span className="text-lg text-gray-400">kg</span>
                </p>
                {stats && stats.weightChange !== 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    {stats.weightChange > 0 ? (
                      <>
                        <FiTrendingUp className="text-red-400" />
                        <span className="text-red-400">+{stats.weightChange.toFixed(1)} kg</span>
                      </>
                    ) : (
                      <>
                        <FiTrendingDown className="text-green-400" />
                        <span className="text-green-400">{stats.weightChange.toFixed(1)} kg</span>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 sm:p-6"
              >
                <p className="text-gray-400 text-xs mb-1">Active Streak</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{streak}</p>
                <p className="text-xs text-gray-400">weeks</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 sm:p-6"
              >
                <p className="text-gray-400 text-xs mb-1">Total Entries</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.totalEntries || 0}</p>
                <p className="text-xs text-gray-400">logged</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 sm:p-6"
              >
                <p className="text-gray-400 text-xs mb-1">Avg Energy</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stats?.avgEnergy || '--'}
                  {stats?.avgEnergy && <span className="text-lg text-gray-400">/10</span>}
                </p>
                <p className="text-xs text-gray-400">level</p>
              </motion.div>
            </div>

            {/* Goal Progress */}
            {goalProgress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiTarget className="text-primary-red text-2xl" />
            <div>
                      <h3 className="text-white font-bold text-lg">Goal Progress</h3>
                      <p className="text-gray-400 text-sm">
                        {goalProgress.type === 'weight' ? 'Weight Goal' : 'Body Fat Goal'}
                      </p>
            </div>
          </div>
                  <span className="text-2xl font-bold text-primary-red">{goalProgress.progress.toFixed(0)}%</span>
                </div>
                <div className="mb-4">
                  <div className="h-4 bg-primary-darker rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goalProgress.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary-red to-orange-500 rounded-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Current</p>
                    <p className="text-white font-bold">
                      {goalProgress.current}
                      {goalProgress.type === 'weight' ? ' kg' : ' %'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Target</p>
                    <p className="text-white font-bold">
                      {goalProgress.target}
                      {goalProgress.type === 'weight' ? ' kg' : ' %'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Remaining</p>
                    <p className="text-white font-bold">
                      {Math.abs(goalProgress.remaining).toFixed(1)}
                      {goalProgress.type === 'weight' ? ' kg' : ' %'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            {stats && (
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6"
                >
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-primary-red" />
                    Progress Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Starting Weight</span>
                      <span className="text-white font-semibold">{stats.first.weight} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Current Weight</span>
                      <span className="text-white font-semibold">{stats.latest.weight} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total Change</span>
                      <span className={`font-semibold ${stats.weightChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg ({stats.changePercent}%)
                      </span>
                    </div>
                    {stats.bodyFatChange !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Body Fat Change</span>
                        <span className={`font-semibold ${stats.bodyFatChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {stats.bodyFatChange > 0 ? '+' : ''}{stats.bodyFatChange.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Recent Entry Preview */}
                {latestEntry && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6"
                  >
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <FiCalendar className="text-primary-red" />
                      Latest Entry
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Date</p>
                        <p className="text-white font-semibold">{formatDateFull(latestEntry.date)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {latestEntry.bodyFat && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Body Fat</p>
                            <p className="text-white font-semibold">{latestEntry.bodyFat}%</p>
                          </div>
                        )}
                        {latestEntry.bmi && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">BMI</p>
                            <p className="text-white font-semibold">{latestEntry.bmi.toFixed(1)}</p>
                          </div>
                        )}
                        {latestEntry.energy && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Energy</p>
                            <p className="text-white font-semibold">{latestEntry.energy}/10</p>
                          </div>
                        )}
                        {latestEntry.mood && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Mood</p>
                            <p className="text-white font-semibold capitalize">{latestEntry.mood}</p>
                          </div>
                        )}
                      </div>
                      {latestEntry.notes && (
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Notes</p>
                          <p className="text-white text-sm">{latestEntry.notes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Weight Trend</h3>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d', 'all'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeFilter(period)}
                        className={`px-3 py-1 rounded-lg text-xs ${
                          timeFilter === period
                            ? 'bg-primary-red text-white'
                            : 'bg-primary-darker text-gray-400 hover:text-white'
                        }`}
                      >
                        {period === 'all' ? 'All' : period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                      <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#777" fontSize={12} />
                      <YAxis stroke="#777" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          borderRadius: '10px',
                          border: '1px solid #2a2a2a',
                          color: '#fff',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#ff5f1f"
                        strokeWidth={3}
                        dot={{ fill: '#ff5f1f', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Charts View */}
        {viewMode === 'charts' && (
          <div className="space-y-6">
            {/* Time Filter & Chart Type */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['7d', '30d', '90d', 'all'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-4 py-2 rounded-xl text-sm ${
                      timeFilter === period
                        ? 'bg-primary-red text-white'
                        : 'bg-primary-gray border border-primary-lightGray text-gray-400 hover:border-primary-red'
                    }`}
                  >
                    {period === 'all' ? 'All Time' : period}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['line', 'area', 'bar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-4 py-2 rounded-xl text-sm capitalize ${
                      chartType === type
                        ? 'bg-primary-red text-white'
                        : 'bg-primary-gray border border-primary-lightGray text-gray-400 hover:border-primary-red'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Chart */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6"
              >
                <h3 className="text-white font-bold mb-4">Weight Progress</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={chartData} margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#777" fontSize={12} />
                        <YAxis stroke="#777" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1a1a',
                            borderRadius: '10px',
                            border: '1px solid #2a2a2a',
                            color: '#fff',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#ff5f1f"
                          strokeWidth={3}
                          dot={{ fill: '#ff5f1f', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : chartType === 'area' ? (
                      <AreaChart data={chartData} margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#777" fontSize={12} />
                        <YAxis stroke="#777" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1a1a',
                            borderRadius: '10px',
                            border: '1px solid #2a2a2a',
                            color: '#fff',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#ff5f1f"
                          fill="#ff5f1f"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData} margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#777" fontSize={12} />
                        <YAxis stroke="#777" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: '#1a1a1a',
                            borderRadius: '10px',
                            border: '1px solid #2a2a2a',
                            color: '#fff',
                          }}
                        />
                        <Bar dataKey="weight" fill="#ff5f1f" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Combined Chart */}
            {chartData.some(d => d.bodyFat || d.waist || d.energy) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-gray border border-primary-lightGray rounded-3xl p-6"
              >
                <h3 className="text-white font-bold mb-4">Multi-Metric Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#777" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#777" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#777" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          borderRadius: '10px',
                          border: '1px solid #2a2a2a',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="#ff5f1f"
                        strokeWidth={3}
                        name="Weight (kg)"
                      />
                      {chartData.some(d => d.bodyFat) && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bodyFat"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Body Fat (%)"
                        />
                      )}
                      {chartData.some(d => d.waist) && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="waist"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Waist (cm)"
                        />
                      )}
                      {chartData.some(d => d.energy) && (
                        <Bar
                          yAxisId="right"
                          dataKey="energy"
                          fill="#8b5cf6"
                          fillOpacity={0.6}
                          name="Energy (1-10)"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Photos View */}
        {viewMode === 'photos' && (
          <div className="space-y-6">
            {photoEntries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoEntries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedPhoto(entry)}
                    className="relative aspect-square bg-primary-gray border border-primary-lightGray rounded-2xl overflow-hidden cursor-pointer group hover:border-primary-red transition-colors"
                  >
                    <img
                      src={entry.photoUrl}
                      alt={`Progress ${formatDate(entry.date)}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-semibold">{formatDateFull(entry.date)}</p>
                        <p className="text-gray-300 text-xs">{entry.weight} kg</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-primary-gray border border-primary-lightGray rounded-3xl p-12 text-center">
                <FiImage className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No progress photos yet</p>
                <p className="text-gray-500 text-sm mb-4">Start tracking your visual progress!</p>
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
                >
                  Add First Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {viewMode === 'history' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading entries...</div>
            ) : filteredEntries.length > 0 ? (
              filteredEntries
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                            <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
                              {formatDateFull(entry.date)}
                            </p>
                            {entry.mood && (
                              <span className="px-2 py-1 rounded-full bg-primary-darker text-gray-300 text-xs capitalize">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-400 hover:text-primary-red hover:border-primary-red transition-colors"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="p-2 rounded-lg bg-primary-darker border border-primary-lightGray text-gray-400 hover:text-red-400 hover:border-red-400 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                            <p className="text-gray-400 text-xs mb-1">Weight</p>
                            <p className="text-white text-lg font-bold">{entry.weight} kg</p>
              </div>
                          {entry.bodyFat && (
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Body Fat</p>
                              <p className="text-white text-lg font-bold">{entry.bodyFat}%</p>
            </div>
                          )}
                          {entry.bmi && (
                            <div>
                              <p className="text-gray-400 text-xs mb-1">BMI</p>
                              <p className="text-white text-lg font-bold">{entry.bmi.toFixed(1)}</p>
                            </div>
                          )}
                          {entry.energy && (
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Energy</p>
                              <p className="text-white text-lg font-bold">{entry.energy}/10</p>
                            </div>
                          )}
                        </div>
                        {entry.measurements && Object.keys(entry.measurements).length > 0 && (
                          <div className="mb-3">
                            <p className="text-gray-400 text-xs mb-2">Measurements:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(entry.measurements).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 rounded-lg bg-primary-darker text-gray-300 text-xs capitalize">
                                  {key}: {value}cm
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.strengthMetrics && Object.keys(entry.strengthMetrics).filter(k => k !== 'notes').length > 0 && (
                          <div className="mb-3">
                            <p className="text-gray-400 text-xs mb-2">Strength PRs:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(entry.strengthMetrics)
                                .filter(([key]) => key !== 'notes')
                                .map(([key, value]) => (
                                  <span key={key} className="px-2 py-1 rounded-lg bg-primary-darker text-gray-300 text-xs capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value}kg
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-gray-300 text-sm mt-3">{entry.notes}</p>
                        )}
                      </div>
                      {entry.photoUrl && (
                        <div className="lg:w-32">
                          <img
                            src={entry.photoUrl}
                            alt="progress"
                            onClick={() => setSelectedPhoto(entry)}
                            className="w-full h-32 object-cover rounded-xl border border-primary-lightGray/60 cursor-pointer hover:border-primary-red transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="bg-primary-gray border border-primary-lightGray rounded-3xl p-12 text-center">
                <FiCalendar className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No entries yet</p>
                <p className="text-gray-500 text-sm mb-4">Start tracking your progress today!</p>
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="px-5 py-2.5 rounded-full bg-primary-red text-white text-sm font-semibold hover:bg-primary-red/90 transition-colors"
                >
                  Add First Entry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Entry Form Modal */}
        {createPortal(
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowForm(false);
                    resetForm();
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-primary-darker border border-primary-lightGray rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {editingEntry ? 'Edit Entry' : 'New Progress Entry'}
                    </h2>
                    <button
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="p-2 rounded-lg hover:bg-primary-gray transition-colors"
                    >
                      <FiX className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-primary-lightGray pb-4">
                      {[
                        { id: 'basic', label: 'Basic', icon: FiActivity },
                        { id: 'measurements', label: 'Measurements', icon: FiTarget },
                        { id: 'strength', label: 'Strength', icon: FiZap },
                        { id: 'wellness', label: 'Wellness', icon: FiHeart },
                        { id: 'goals', label: 'Goals', icon: FiTarget },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                              activeTab === tab.id
                                ? 'bg-primary-red text-white'
                                : 'bg-primary-gray border border-primary-lightGray text-gray-300 hover:border-primary-red'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Basic Tab */}
                    {activeTab === 'basic' && (
                      <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                              value={form.weight}
                              onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                              required
                  />
                </div>
              <div>
                            <label className="text-gray-400 text-sm block mb-2">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Body Fat (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={form.bodyFat}
                              onChange={(e) => setForm((prev) => ({ ...prev, bodyFat: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Height (cm)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={form.height}
                              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Notes</label>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-3 text-white focus:border-primary-red outline-none resize-none"
                            placeholder="How are you feeling? Any PRs? Energy levels?"
              />
            </div>
            <div className="border border-dashed border-primary-lightGray rounded-2xl p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
                id="progress-photo"
              />
              <label htmlFor="progress-photo" className="flex flex-col items-center gap-2 cursor-pointer">
                <FiUploadCloud className="text-3xl text-primary-red" />
                <span className="text-white text-sm font-semibold">
                              {form.photoUrl ? 'Photo attached' : 'Upload progress photo'}
                </span>
                <p className="text-gray-500 text-xs">PNG/JPG up to 3MB</p>
              </label>
                          {form.photoUrl && (
                            <img
                              src={form.photoUrl}
                              alt="Preview"
                              className="mt-4 max-w-full max-h-48 rounded-xl mx-auto"
                            />
                          )}
            </div>
                      </div>
                    )}

                    {/* Measurements Tab */}
                    {activeTab === 'measurements' && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {['chest', 'waist', 'hips', 'arms', 'thighs', 'neck'].map((measurement) => (
                          <div key={measurement}>
                            <label className="text-gray-400 text-sm block mb-2 capitalize">
                              {measurement} (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={form.measurements[measurement]}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  measurements: { ...prev.measurements, [measurement]: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
              </div>
                        ))}
                      </div>
                    )}

                    {/* Strength Tab */}
                    {activeTab === 'strength' && (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {['benchPress', 'squat', 'deadlift', 'overheadPress'].map((lift) => (
                            <div key={lift}>
                              <label className="text-gray-400 text-sm block mb-2 capitalize">
                                {lift.replace(/([A-Z])/g, ' $1').trim()} (kg)
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={form.strengthMetrics[lift]}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    strengthMetrics: { ...prev.strengthMetrics, [lift]: e.target.value },
                                  }))
                                }
                                className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                              />
        </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-2">Strength Notes</label>
                          <textarea
                            rows="2"
                            value={form.strengthMetrics.notes}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                strengthMetrics: { ...prev.strengthMetrics, notes: e.target.value },
                              }))
                            }
                            className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-3 text-white focus:border-primary-red outline-none resize-none"
                            placeholder="PRs, form improvements, etc."
                          />
                        </div>
                      </div>
                    )}

                    {/* Wellness Tab */}
                    {activeTab === 'wellness' && (
            <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Energy Level (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={form.energy}
                              onChange={(e) => setForm((prev) => ({ ...prev, energy: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Sleep Hours</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              value={form.sleep.hours}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  sleep: { ...prev.sleep, hours: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Sleep Quality (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={form.sleep.quality}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  sleep: { ...prev.sleep, quality: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Mood</label>
                            <select
                              value={form.mood}
                              onChange={(e) => setForm((prev) => ({ ...prev, mood: e.target.value }))}
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            >
                              <option value="">Select mood</option>
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="okay">Okay</option>
                              <option value="poor">Poor</option>
                              <option value="terrible">Terrible</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goals Tab */}
                    {activeTab === 'goals' && (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                            <label className="text-gray-400 text-sm block mb-2">Target Weight (kg)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={form.goals.targetWeight}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  goals: { ...prev.goals, targetWeight: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                    </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Target Body Fat (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={form.goals.targetBodyFat}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  goals: { ...prev.goals, targetBodyFat: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">Target Date</label>
                            <input
                              type="date"
                              value={form.goals.targetDate}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  goals: { ...prev.goals, targetDate: e.target.value },
                                }))
                              }
                              className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-2">Goal Notes</label>
                          <textarea
                            rows="2"
                            value={form.goals.notes}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                goals: { ...prev.goals, notes: e.target.value },
                              }))
                            }
                            className="w-full bg-primary-gray border border-primary-lightGray rounded-2xl px-4 py-3 text-white focus:border-primary-red outline-none resize-none"
                            placeholder="Additional goal details..."
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-primary-lightGray">
                    <button
                        type="button"
                        onClick={() => { setShowForm(false); resetForm(); }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-primary-lightGray text-gray-300 hover:border-primary-red transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiSave className="w-4 h-4" />
                        {submitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative max-w-4xl w-full"
                >
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                  <img
                    src={selectedPhoto.photoUrl}
                    alt={`Progress ${formatDate(selectedPhoto.date)}`}
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                    <p className="text-white font-bold text-lg">{formatDateFull(selectedPhoto.date)}</p>
                    <p className="text-gray-300 text-sm">{selectedPhoto.weight} kg</p>
                    {selectedPhoto.notes && (
                      <p className="text-gray-300 text-sm mt-2">{selectedPhoto.notes}</p>
                    )}
            </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardProgress;
