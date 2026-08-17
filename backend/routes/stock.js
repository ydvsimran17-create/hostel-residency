const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory')
const Transaction = require('../models/Transaction')
const ActivityLog = require('../models/ActivityLog');
const verifyToken = require('../middleware/authMiddleware');

// Every stock route now requires a logged-in user.
router.use(verifyToken);

// Stock IN
router.post('/in', async (req, res) => {
  try {
    const {
      inventoryId,
      quantity,
      note,
      supplierName,
      supplierContact,
      supplierEmail,
      purchaseCost,
      invoiceFileName,
    } = req.body;
    const item = await Inventory.findById(inventoryId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    item.quantity += quantity;
    item.goodCount = (item.goodCount || 0) + quantity;
    await item.save();
    const transaction = new Transaction({
      inventoryId,
      type: 'IN',
      quantity,
      note,
      supplierName,
      supplierContact,
      supplierEmail,
      purchaseCost,
      invoiceFileName,
    });
    await transaction.save();
    await ActivityLog.create({ action: 'STOCK_IN', itemId: inventoryId, itemName: item.name, details: `Stock IN of quantity ${quantity}. Note: ${note}` });

    res.json({ message: 'Stock added', item, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stock OUT
router.post('/out', async (req, res) => {
  try {
    const { inventoryId, quantity, note } = req.body;
    const item = await Inventory.findById(inventoryId);
    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    item.quantity -= quantity;
    item.goodCount = Math.max(0, (item.goodCount || item.quantity) - quantity);
    await item.save();
    const transaction = new Transaction({ inventoryId, type: 'OUT', quantity, note });
    await transaction.save();
    await ActivityLog.create({ action: 'STOCK_OUT', itemId: inventoryId, itemName: item.name, details: `Stock OUT of quantity ${quantity}. Note: ${note}` });
    res.json({ message: 'Stock removed', item, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stock History
router.post('/adjustment', async (req, res) => {
  try {
    const { inventoryId, quantity, note } = req.body;
    const transaction = new Transaction({
      inventoryId,
      type: 'ADJUSTMENT',
      quantity,
      note,
    });
    await transaction.save();
    res.json({ message: 'Adjustment recorded', transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await Transaction.find().populate('inventoryId', 'name').sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stock record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;