const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for documents (resources)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campus-portal/resources',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'txt'],
  },
});

// Storage for images (lost & found)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campus-portal/lost-found',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

module.exports = { cloudinary, documentStorage, imageStorage };
