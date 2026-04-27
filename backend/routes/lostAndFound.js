const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAll, create, update, remove } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/auth');
const { imageStorage } = require('../middleware/cloudinary');

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
