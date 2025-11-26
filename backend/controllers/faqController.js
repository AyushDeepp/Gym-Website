import FAQ from '../models/FAQ.js';

export const getFaqs = async (req, res) => {
  try {
    const { publicOnly, category } = req.query;
    const filter = {};

    if (publicOnly === 'true') {
      filter.isPublic = true;
    }

    if (category) {
      filter.category = category;
    }

    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { category, question, answer, isPublic = true, order = 0 } = req.body;

    if (!category || !question || !answer) {
      return res.status(400).json({ message: 'Category, question, and answer are required' });
    }

    const faq = await FAQ.create({
      category,
      question,
      answer,
      isPublic,
      order,
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: error.message });
  }
};


