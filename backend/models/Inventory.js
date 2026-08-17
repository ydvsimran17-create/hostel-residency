const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  goodCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },
  repairCount: { type: Number, default: 0 },
  location: { type: String, default: 'Hostel Common Area' },
  unit: { type: String, default: 'units' },
  lowStockLimit: { type: Number, default: 10 },
  minRequired: { type: Number, default: 5 },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);