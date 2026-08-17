const express = require('express');
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Every student route requires a logged-in user...
router.use(verifyToken);

router.get('/', getAllStudents);
// ...but creating/editing/deleting student records is admin/staff only.
router.post('/', authorizeRoles('admin', 'staff'), createStudent);
router.put('/:id', authorizeRoles('admin', 'staff'), updateStudent);
router.delete('/:id', authorizeRoles('admin', 'staff'), deleteStudent);

module.exports = router;