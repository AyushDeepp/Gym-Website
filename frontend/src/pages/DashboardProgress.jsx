import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiUploadCloud, FiTrendingUp, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { createProgressEntry, deleteProgressEntry, getProgressEntries } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

const DashboardProgress = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    height: '',
    notes: '',
    photoUrl: '',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data } = await getProgressEntries(user._id);
        setEntries(data);
      } catch (error) {
        console.error('Progress load failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user._id]);

  const chartData = useMemo(
    () =>
      entries
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((entry) => ({
          date: formatDate(entry.date),
          weight: entry.weight,
          bmi: entry.bmi ? Number(entry.bmi.toFixed(1)) : null,
        })),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight) return;
    setSubmitting(true);
    try {
      await createProgressEntry({
        ...form,
        weight: Number(form.weight),
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
        height: form.height ? Number(form.height) : undefined,
      });
      const { data } = await getProgressEntries(user._id);
      setEntries(data);
      setForm({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        height: '',
        notes: '',
        photoUrl: '',
      });
    } catch (error) {
      console.error('Progress save failed', error);
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

  const streak = computeStreak(entries);

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        <header className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Progress</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Progress Tracking & History</h1>
            <p className="text-gray-400 text-sm sm:text-base">Log weekly stats, see weight trendlines, and celebrate streaks.</p>
          </div>
          <div className="bg-primary-gray border border-primary-lightGray rounded-3xl p-4 flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-[0.3em]">Active Streak</p>
              <p className="text-3xl font-black text-white">{entries.length ? streak : 0} weeks</p>
            </div>
            <FiTrendingUp className="text-primary-red text-3xl" />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-7 space-y-4"
          >
            <div className="flex items-center gap-3">
              <FiCalendar className="text-primary-red text-2xl" />
              <div>
                <p className="text-white font-semibold">Log Weekly Check-In</p>
                <p className="text-gray-400 text-sm">Add weight, optional body fat, and coach notes.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {['weight', 'bodyFat', 'height'].map((field) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm block mb-2 capitalize">
                    {field} {field === 'weight' ? '(kg)*' : field === 'height' ? '(cm)' : '(%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form[field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                    required={field === 'weight'}
                  />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm block mb-2">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-2xl px-4 py-2.5 text-white focus:border-primary-red outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Notes</label>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-primary-darker border border-primary-lightGray rounded-2xl px-4 py-3 text-white focus:border-primary-red outline-none resize-none"
                placeholder="Energy, sleep, PRs…"
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
                  {form.photoUrl ? 'Photo attached' : 'Upload before/after selfie'}
                </span>
                <p className="text-gray-500 text-xs">PNG/JPG up to 3MB</p>
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Entry'}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-7"
          >
            <p className="text-white font-semibold mb-3">Trendlines</p>
            {chartData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -20 }}>
                    <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#777" />
                    <YAxis stroke="#777" />
                    <Tooltip contentStyle={{ background: '#121212', borderRadius: '10px', border: '1px solid #2a2a2a' }} />
                    <Line type="monotone" dataKey="weight" stroke="#ff5f1f" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="bmi" stroke="#3b82f6" strokeWidth={2} dot={false} hide={!chartData.some((d) => d.bmi)} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Add a few entries to unlock charts.</p>
            )}
          </motion.div>
        </div>

        <section className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7 space-y-4">
          <p className="text-white font-semibold">History</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading history…</p>
          ) : entries.length ? (
            <div className="space-y-4">
              {entries
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-primary-darker border border-primary-lightGray rounded-2xl p-4 flex flex-wrap items-center gap-4"
                  >
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">{formatDate(entry.date)}</p>
                      <p className="text-white text-lg font-semibold">{entry.weight} kg</p>
                      {entry.bodyFat && <p className="text-gray-400 text-sm">{entry.bodyFat}% body fat</p>}
                    </div>
                    {entry.photoUrl && (
                      <img
                        src={entry.photoUrl}
                        alt="progress"
                        className="w-20 h-20 object-cover rounded-xl border border-primary-lightGray/60"
                      />
                    )}
                    <p className="text-gray-400 text-sm flex-1 min-w-[200px]">{entry.notes || 'No notes recorded'}</p>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 rounded-full border border-primary-lightGray text-gray-400 hover:text-white hover:border-primary-red transition"
                      title="Delete entry"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No entries yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardProgress;


