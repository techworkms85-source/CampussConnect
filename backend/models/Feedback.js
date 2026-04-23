const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Academic', 'Infrastructure', 'Food', 'Events', 'Other'],
      required: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    isAnonymous: { type: Boolean, default: false },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    adminResponse: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
