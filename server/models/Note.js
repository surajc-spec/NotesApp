const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Local path or Cloudinary URL
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
