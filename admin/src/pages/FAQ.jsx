import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../utils/api';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    isPublic: true,
    order: 0,
  });

  const fetchFaqs = async () => {
    try {
      const { data } = await getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Fetch FAQ failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData({
      category: '',
      question: '',
      answer: '',
      isPublic: true,
      order: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateFaq(editing._id, formData);
      } else {
        await createFaq(formData);
      }
      setShowModal(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error('Save FAQ failed', error);
    }
  };

  const handleEdit = (faq) => {
    setEditing(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      isPublic: faq.isPublic,
      order: faq.order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await deleteFaq(id);
      fetchFaqs();
    } catch (error) {
      console.error('Delete FAQ failed', error);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold gradient-text-red">FAQ & Policies</h1>
        <button
          className="px-6 py-3 bg-primary-red text-white rounded-lg"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <motion.div
            key={faq._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-gray border border-primary-lightGray rounded-2xl p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-red">{faq.category}</p>
                <h3 className="text-white font-semibold">{faq.question}</h3>
              </div>
              <span className="text-gray-400 text-xs">{faq.isPublic ? 'Public' : 'Hidden'}</span>
            </div>
            <p className="text-gray-400 mt-2 text-sm">{faq.answer}</p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 bg-primary-blue text-white rounded-lg" onClick={() => handleEdit(faq)}>
                Edit
              </button>
              <button className="px-3 py-2 bg-red-600 text-white rounded-lg" onClick={() => handleDelete(faq._id)}>
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary-gray border border-primary-lightGray rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-2xl font-bold">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Answer</label>
                <textarea
                  rows="4"
                  value={formData.answer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
                  className="w-full bg-primary-darker border border-primary-lightGray rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="accent-primary-red"
                />
                <span className="text-gray-300 text-sm">Visible to public</span>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 rounded-lg bg-primary-red text-white">
                  {editing ? 'Update FAQ' : 'Create FAQ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-lg border border-primary-lightGray text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FAQ;


