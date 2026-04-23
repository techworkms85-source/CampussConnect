const Event = require('../models/Event');

// @GET /api/events
exports.getAll = async (req, res) => {
  try {
    const { category, search, upcoming } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (upcoming === 'true') query.date = { $gte: new Date() };
    else if (upcoming === 'false') query.date = { $lt: new Date() };
    const events = await Event.find(query).populate('createdBy', 'name').sort('date');
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/events/:id
exports.getOne = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registrations', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/events (admin)
exports.create = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/events/:id (admin)
exports.update = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/events/:id (admin)
exports.remove = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/events/:id/register
exports.register = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrations.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'Already registered' });
    if (event.maxParticipants && event.registrations.length >= event.maxParticipants)
      return res.status(400).json({ success: false, message: 'Event is full' });
    event.registrations.push(req.user._id);
    await event.save();
    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
