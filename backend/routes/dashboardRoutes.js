const express = require('express');

const {
  getDashboardStats,
} = require('../controllers/dashboardController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', verifyToken, getDashboardStats);

module.exports = router;