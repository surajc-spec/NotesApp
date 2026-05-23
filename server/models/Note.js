const mongoose = require('mongoose');
const { normalizeSubject, isValidSubject } = require('../utils/subjectUtils');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: {
    type: String,
    required: true,
    set: normalizeSubject,
    validate: {
      validator: isValidSubject,
      message: 'Subject is required',
    },
  },
  subjectKey: {
    type: String,
    required: true,
    index: true,
    set: normalizeSubject,
  },
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

noteSchema.pre('validate', function setNormalizedSubject() {
  this.subject = normalizeSubject(this.subject);
  this.subjectKey = this.subject;
});

noteSchema.index({ branch: 1, year: 1, isPublic: 1, createdAt: -1 });
noteSchema.index({ branch: 1, year: 1, subjectKey: 1, createdAt: -1 });
noteSchema.index({ uploader: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
