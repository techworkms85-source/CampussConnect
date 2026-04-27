const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAll, upload, download, remove } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { documentStorage } = require('../middleware/cloudinary');

const fileUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.txt'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

router.get('/', getAll);
router.post('/', protect, fileUpload.single('file'), upload);
router.get('/:id/download', protect, download);
router.delete('/:id', protect, remove);

module.exports = router;
