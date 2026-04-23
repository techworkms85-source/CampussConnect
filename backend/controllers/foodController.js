const FoodOutlet = require('../models/FoodOutlet');

// @GET /api/food
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const outlets = await FoodOutlet.find(query).populate('createdBy', 'name');
    res.json({ success: true, data: outlets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/food/:id
exports.getOne = async (req, res) => {
  try {
    const outlet = await FoodOutlet.findById(req.params.id).populate('createdBy', 'name');
    if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
    res.json({ success: true, data: outlet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/food (admin)
exports.create = async (req, res) => {
  try {
    const outlet = await FoodOutlet.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: outlet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/food/:id (admin)
exports.update = async (req, res) => {
  try {
    const outlet = await FoodOutlet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
    res.json({ success: true, data: outlet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/food/:id (admin)
exports.remove = async (req, res) => {
  try {
    await FoodOutlet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Outlet deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/food/:id/rate
exports.rate = async (req, res) => {
  try {
    const { rating } = req.body;
    const outlet = await FoodOutlet.findById(req.params.id);
    if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });

    const existing = outlet.ratings.find((r) => r.user.toString() === req.user._id.toString());
    if (existing) existing.rating = rating;
    else outlet.ratings.push({ user: req.user._id, rating });

    outlet.avgRating = parseFloat(
      (outlet.ratings.reduce((s, r) => s + r.rating, 0) / outlet.ratings.length).toFixed(1)
    );
    await outlet.save();
    res.json({ success: true, data: outlet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
