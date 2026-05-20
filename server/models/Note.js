const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Local path or Cloudinary URL
  filePublicId: { type: String },
  fileResourceType: { type: String, default: 'raw' },
  fileStorageType: { type: String, default: 'authenticated' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  password: { type: String } // Optional password protection
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
