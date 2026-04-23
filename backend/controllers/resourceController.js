const Resource = require('../models/Resource');
const path = require('path');

// @GET /api/resources
exports.getAll = async (req, res) => {
  try {
    const { subject, semester, branch, search } = req.query;
    const query = {};
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;
    if (search) query.title = { $regex: search, $options: 'i' };
    const resources = await Resource.find(query).populate('uploadedBy', 'name').sort('-createdAt');
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/resources
exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const resource = await Resource.create({
      ...req.body,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).slice(1),
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/resources/:id/download
exports.download = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    resource.downloads += 1;
    await resource.save();
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/resources/:id
exports.remove = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
