const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    category: { type: String, default: 'Other' },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String, default: '' },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostFound', lostFoundSchema);
