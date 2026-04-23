const express = require('express');
const router = express.Router();
const { getAll, getMine, create, respond, remove } = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAll);
router.get('/mine', protect, getMine);
router.post('/', protect, create);
router.put('/:id', protect, adminOnly, respond);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
