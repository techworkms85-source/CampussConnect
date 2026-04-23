const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAll, create, update, remove } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.get('/', getAll);
router.post('/', protect, imageUpload.single('image'), create);
router.put('/:id', protect, imageUpload.single('image'), update);
router.delete('/:id', protect, remove);

module.exports = router;
