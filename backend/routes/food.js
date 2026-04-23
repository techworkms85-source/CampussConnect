const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, rate } = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/:id/rate', protect, rate);

module.exports = router;
