const mongoose = require('mongoose');
const { normalizeSubject, isValidSubject } = require('../utils/subjectUtils');

const questionPaperSchema = new mongoose.Schema({
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
    set: normalizeSubject,
  },
  description: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String, required: true },
  storedFileName: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  previewUrl: { type: String },
  filePublicId: { type: String },
  fileResourceType: { type: String, default: 'raw' },
  fileStorageType: { type: String, default: 'authenticated' },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

questionPaperSchema.pre('validate', function setNormalizedSubject() {
  this.subject = normalizeSubject(this.subject);
  this.subjectKey = this.subject;
});

questionPaperSchema.index({ branch: 1, year: 1, isPublic: 1, createdAt: -1 });
questionPaperSchema.index({ branch: 1, year: 1, subjectKey: 1, createdAt: -1 });
questionPaperSchema.index({ uploader: 1, createdAt: -1 });
questionPaperSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
