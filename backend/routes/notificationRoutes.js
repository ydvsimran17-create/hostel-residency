const express = require('express');

const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Every notification route now requires a logged-in user.
router.use(verifyToken);

router.post('/', createNotification);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;