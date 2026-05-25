const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  status: {
    type: String,
    enum: ['new', 'read', 'resolved'],
    default: 'new',
    index: true,
  },
}, { timestamps: true });

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
