const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, register } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/:id/register', protect, register);

module.exports = router;
