const express = require('express');

const {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestcontroller');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// Every request route now requires a logged-in user.
router.use(verifyToken);

router.post('/', createRequest);
router.get('/', getAllRequests);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;