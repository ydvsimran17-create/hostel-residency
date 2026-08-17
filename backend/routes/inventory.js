const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');
const verifyToken = require('../middleware/authMiddleware');

// Every inventory route now requires a logged-in user.
router.use(verifyToken);

// GET all inventory with search & filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minQty, maxQty } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (minQty || maxQty) {
      filter.quantity = {};
      if (minQty) filter.quantity.$gte = Number(minQty);
      if (maxQty) filter.quantity.$lte = Number(maxQty);
    }

    const items = await Inventory.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create item
router.post('/', async (req, res) => {
try {
    const item = new Inventory(req.body);
    const saved = await item.save();
    await ActivityLog.create({ action: 'CREATED', itemId: saved._id, itemName: saved.name, details: `Item created with quantity ${saved.quantity}` });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;