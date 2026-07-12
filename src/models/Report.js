const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  contact: { type: String, default: '' },
  location: { type: String, required: [true, 'Location is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  language: { type: String, enum: ['bn', 'en', 'unknown'], default: 'unknown' },
  
  // AI Generated Fields
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
  confidence: { type: Number, default: 0 },

  // Duplicate Detection Fields
  possibleDuplicate: { type: Boolean, default: false },
  matchedReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },

  // Status Management
  status: { 
    type: String, 
    enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'], 
    default: 'pending' 
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt
});

module.exports = mongoose.model('Report', reportSchema);