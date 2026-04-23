const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, joinRequest, approveRequest } = require('../controllers/clubController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);
router.post('/:id/join', protect, joinRequest);
router.post('/:id/approve/:userId', protect, adminOnly, approveRequest);

module.exports = router;
