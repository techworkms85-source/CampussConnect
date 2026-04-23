const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    date: { type: Date, required: true },
    endDate: { type: Date },
    venue: { type: String, required: true },
    image: { type: String, default: '' },
    organizer: { type: String, required: true },
    registrationLink: { type: String, default: '' },
    maxParticipants: { type: Number, default: 0 },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [String],
    isPast: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
