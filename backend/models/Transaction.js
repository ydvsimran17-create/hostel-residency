const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true },
  note: { type: String },
  supplierName: { type: String },
  supplierContact: { type: String },
  supplierEmail: { type: String },
  purchaseCost: { type: Number },
  invoiceFileName: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);