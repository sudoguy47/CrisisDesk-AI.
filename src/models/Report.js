const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  contact: { type: String, default: '' },
  location: { type: String, required: [true, 'Location is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  language: { type: String, enum: ['bn', 'en', 'unknown'], default: 'unknown' },
  category: {
    type: String,
    enum: ['medical', 'fire', 'accident', 'crime', 'flood', 'utility', 'public_service', 'infrastructure', 'other'],
    default: 'other'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  summary: { type: String, default: '' },
  suggestedAction: { type: String, default: '' },
  confidence: { type: Number, default: 0, min: 0, max: 1 },
  possibleDuplicate: { type: Boolean, default: false },
  matchedReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ⚠️ Text index REMOVED - causing "language override unsupported: bn" error
// Using regex search in controller instead

reportSchema.index({ category: 1, urgency: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);