const Order = require('../models/Order');
const FoodOutlet = require('../models/FoodOutlet');

// @POST /api/orders — place order
exports.placeOrder = async (req, res) => {
  try {
    const { outletId, items, note } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'No items in order' });

    const outlet = await FoodOutlet.findById(outletId);
    if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
    if (!outlet.isOpen) return res.status(400).json({ success: false, message: 'Outlet is currently closed' });

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({ outlet: outletId, user: req.user._id, items, total, note });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders/my — user's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('outlet', 'name location')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/orders — admin: all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('outlet', 'name')
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/orders/:id/status — admin: update status
exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('outlet', 'name').populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/orders/:id — user cancel own pending order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
