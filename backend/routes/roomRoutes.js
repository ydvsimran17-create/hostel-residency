const express = require('express');
const {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomInventory,
} = require('../controllers/roomController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Every room route now requires a logged-in user.
router.use(verifyToken);

router.get('/', getAllRooms);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.get('/:id/inventory', getRoomInventory);

module.exports = router;