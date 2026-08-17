const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  itemName: { type: String },
  details: { type: String },
  performedBy: { type: String, default: 'system' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);