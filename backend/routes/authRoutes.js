const express = require('express');

const {
  register,
  login,
  profile,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Only a logged-in admin (Head) can create new accounts.
// Public self-registration is intentionally disabled.
router.post('/register', verifyToken, authorizeRoles('admin'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/profile', verifyToken, profile);
router.post('/logout', verifyToken, logout);

router.get('/test', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected Route Accessed',
    user: req.user,
  });
});

module.exports = router;