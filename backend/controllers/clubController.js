const Club = require('../models/Club');

// @GET /api/clubs
exports.getAll = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const clubs = await Club.find(query).populate('members', 'name').sort('name');
    res.json({ success: true, data: clubs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/clubs/:id
exports.getOne = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members', 'name email');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/clubs (admin)
exports.create = async (req, res) => {
  try {
    const club = await Club.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/clubs/:id (admin)
exports.update = async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/clubs/:id (admin)
exports.remove = async (req, res) => {
  try {
    await Club.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/clubs/:id/join
exports.joinRequest = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.members.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'Already a member' });
    if (!club.joinRequests.includes(req.user._id)) club.joinRequests.push(req.user._id);
    await club.save();
    res.json({ success: true, message: 'Join request sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/clubs/:id/approve/:userId (admin)
exports.approveRequest = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    club.joinRequests = club.joinRequests.filter((u) => u.toString() !== req.params.userId);
    if (!club.members.includes(req.params.userId)) club.members.push(req.params.userId);
    await club.save();
    res.json({ success: true, message: 'Member approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
