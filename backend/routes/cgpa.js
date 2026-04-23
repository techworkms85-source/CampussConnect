const express = require('express');
const router = express.Router();
const { getRecord, addSemester, deleteSemester } = require('../controllers/cgpaController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getRecord);
router.post('/semester', addSemester);
router.delete('/semester/:sem', deleteSemester);

module.exports = router;
