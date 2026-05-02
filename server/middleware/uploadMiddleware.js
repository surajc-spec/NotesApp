const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'notes_app_uploads',
    // Allowed formats for Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'ppt', 'pptx'],
    // Required to support raw files like pdf, doc, etc. alongside images
    resource_type: 'auto',
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = upload;
