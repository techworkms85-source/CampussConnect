const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Main' },
  isVeg: { type: Boolean, default: true },
});

const foodOutletSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    timings: { type: String, required: true },
    image: { type: String, default: '' },
    menu: [menuItemSchema],
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
    avgRating: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodOutlet', foodOutletSchema);
