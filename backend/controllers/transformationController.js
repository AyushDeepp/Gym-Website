import Transformation from '../models/Transformation.js';

const memberRoles = ['member', 'admin', 'super_admin'];

const isUserAdminRole = (user) => user && (user.role === 'admin' || user.role === 'super_admin');

export const submitTransformation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!memberRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only members can submit transformations' });
    }

    const { beforeImage, afterImage, story } = req.body;

    if (!beforeImage || !afterImage || !story) {
      return res.status(400).json({ message: 'Before image, after image and story are required' });
    }

    // Validate image size (base64 images should be under 10MB to leave room for other fields)
    const beforeImageSize = beforeImage.length;
    const afterImageSize = afterImage.length;
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes (base64 encoded)

    if (beforeImageSize > maxSize || afterImageSize > maxSize) {
      return res.status(400).json({ 
        message: 'Image size too large. Please use images under 7MB (compressed).' 
      });
    }

    // Validate story length
    if (story.length > 5000) {
      return res.status(400).json({ message: 'Story must be under 5000 characters' });
    }

    const existingPending = await Transformation.findOne({
      userId: req.user._id,
      approved: false,
    });

    if (existingPending) {
      return res.status(409).json({ message: 'You already have a pending submission' });
    }

    const transformation = await Transformation.create({
      userId: req.user._id,
      beforeImage,
      afterImage,
      story: story.trim(),
    });

    res.status(201).json(transformation);
  } catch (error) {
    console.error('Submit transformation error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'Duplicate entry' });
      }
      if (error.message && error.message.includes('too large')) {
        return res.status(413).json({ 
          message: 'Image size too large. Please compress your images before uploading.' 
        });
      }
    }

    res.status(500).json({ 
      message: error.message || 'Failed to submit transformation. Please try again with smaller images.' 
    });
  }
};

export const getTransformations = async (req, res) => {
  try {
    const includePending = req.query.includePending === 'true';
    const mine = req.query.mine === 'true';
    const isAdmin = !!req.admin || isUserAdminRole(req.user);

    if (includePending && !isAdmin && !mine) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (mine && !req.user) {
      return res.status(401).json({ message: 'Please login to view your submissions' });
    }

    let filter = includePending ? {} : { approved: true };

    if (mine && req.user) {
      filter = { userId: req.user._id };
      if (!includePending) {
        filter.approved = true;
      }
    }

    const transformations = await Transformation.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name createdAt role membership');

    res.json(transformations);
  } catch (error) {
    console.error('Get transformations error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const approveTransformation = async (req, res) => {
  try {
    const isAdminContext = !!req.admin || isUserAdminRole(req.user);

    if (!isAdminContext) {
      return res.status(403).json({ message: 'Admin approval required' });
    }

    const { id } = req.params;
    const { featured = false } = req.body;

    const transformation = await Transformation.findById(id);

    if (!transformation) {
      return res.status(404).json({ message: 'Transformation not found' });
    }

    transformation.approved = true;
    transformation.featured = featured;
    await transformation.save();

    res.json(transformation);
  } catch (error) {
    console.error('Approve transformation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransformation = async (req, res) => {
  try {
    const transformation = await Transformation.findById(req.params.id);

    if (!transformation) {
      return res.status(404).json({ message: 'Transformation not found' });
    }

    const isOwner = req.user && transformation.userId.toString() === req.user._id.toString();
    const isAdmin = !!req.admin || isUserAdminRole(req.user);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this transformation' });
    }

    await transformation.deleteOne();
    res.json({ message: 'Transformation removed' });
  } catch (error) {
    console.error('Delete transformation error:', error);
    res.status(500).json({ message: error.message });
  }
};


