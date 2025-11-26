import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiCheck, FiClock, FiTrash2 } from 'react-icons/fi';
import { submitTransformation, getTransformations, removeTransformation } from '../utils/api';

const TransformationSubmit = () => {
  const [form, setForm] = useState({ story: '', beforeImage: '', afterImage: '' });
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMine = async () => {
      try {
        const { data } = await getTransformations({ params: { mine: true, includePending: true } });
        setSubmissions(data);
      } catch (error) {
        console.error('Load transformations failed', error);
      } finally {
        setLoading(false);
      }
    };

    loadMine();
  }, []);

  const handleFile = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.beforeImage || !form.afterImage || !form.story) return;
    setSubmitting(true);
    try {
      await submitTransformation(form);
      const { data } = await getTransformations({ params: { mine: true, includePending: true } });
      setSubmissions(data);
      setForm({ story: '', beforeImage: '', afterImage: '' });
    } catch (error) {
      console.error('Submit failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this submission?')) return;
    try {
      await removeTransformation(id);
      setSubmissions((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker pt-24 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-red mb-3">Spotlight</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Submit Your Transformation</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Share your before/after journey and inspire the community. Coach-approved submissions go live on the public wall.
          </p>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-gray border border-primary-lightGray rounded-3xl p-5 sm:p-7 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {['beforeImage', 'afterImage'].map((field) => (
              <label
                key={field}
                className="border border-dashed border-primary-lightGray rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(field, e.target.files[0])}
                />
                <FiUploadCloud className="text-3xl text-primary-red" />
                <p className="text-white text-sm font-semibold">{field === 'beforeImage' ? 'Before Photo' : 'After Photo'}</p>
                <p className="text-gray-500 text-xs text-center">High-res JPG/PNG</p>
                {form[field] && <span className="text-green-400 text-xs">Uploaded ✓</span>}
              </label>
            ))}
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Story / Caption</label>
            <textarea
              rows="4"
              value={form.story}
              onChange={(e) => setForm((prev) => ({ ...prev, story: e.target.value }))}
              className="w-full bg-primary-darker border border-primary-lightGray rounded-2xl px-4 py-3 text-white focus:border-primary-red outline-none resize-none"
              placeholder="Share highlights, mindset shifts, or gratitude for your coach…"
              required
            />
          </div>
          <button
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-primary-red text-white font-semibold hover:bg-primary-red/90 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Send for Approval'}
          </button>
        </motion.form>

        <section className="bg-primary-gray/60 border border-primary-lightGray rounded-3xl p-5 sm:p-7 space-y-4">
          <p className="text-white font-semibold">Your Submissions</p>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : submissions.length ? (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="bg-primary-darker border border-primary-lightGray rounded-2xl p-4 flex flex-col md:flex-row gap-4 relative"
                >
                  <div className="flex gap-3">
                    <img
                      src={submission.beforeImage}
                      alt="before"
                      className="w-24 h-24 object-cover rounded-xl border border-primary-lightGray/60"
                    />
                    <img
                      src={submission.afterImage}
                      alt="after"
                      className="w-24 h-24 object-cover rounded-xl border border-primary-lightGray/60"
                    />
                  </div>
                  <p className="text-gray-300 text-sm flex-1">{submission.story}</p>
                  <div className="flex items-center gap-2">
                    {submission.approved ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-sm font-semibold">
                        <FiCheck /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-yellow-300 text-sm font-semibold">
                        <FiClock /> Pending
                      </span>
                    )}
                    {!submission.approved && (
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="p-2 rounded-full border border-primary-lightGray text-gray-400 hover:text-white hover:border-primary-red transition"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No stories shared yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransformationSubmit;


