const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateRole, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
