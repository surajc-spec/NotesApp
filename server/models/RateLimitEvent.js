const mongoose = require('mongoose');

const rateLimitEventSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true, default: 'unknown' },
  route: { type: String, required: true },
  reason: { type: String, required: true },
}, { timestamps: true });

rateLimitEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RateLimitEvent', rateLimitEventSchema);
