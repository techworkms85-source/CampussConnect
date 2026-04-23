const Feedback = require('../models/Feedback');

// @GET /api/feedback (admin)
exports.getAll = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    const feedbacks = await Feedback.find(query).populate('submittedBy', 'name email').sort('-createdAt');
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/feedback/mine
exports.getMine = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ submittedBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/feedback
exports.create = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      submittedBy: req.body.isAnonymous ? undefined : req.user._id,
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/feedback/:id (admin)
exports.respond = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, adminResponse: req.body.adminResponse },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/feedback/:id (admin)
exports.remove = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
