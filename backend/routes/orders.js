const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, updateStatus, cancelOrder } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.delete('/:id', cancelOrder);

// Admin
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateStatus);

module.exports = router;
