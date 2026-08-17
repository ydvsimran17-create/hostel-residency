const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      contact,
      gender,
      roomNumber,
      block,
      joinDate,
    } = req.body;

    if (!name || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'name and studentId are required',
      });
    }

    const studentEmail =
      email || `${studentId.toLowerCase()}@hostel.edu`;

    const existing = await User.findOne({
      $or: [{ email: studentEmail }, { studentId }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or ID already exists',
      });
    }

    const defaultPassword = await bcrypt.hash(`${studentId}@hostel`, 10);

    const student = await User.create({
      name,
      email: studentEmail,
      password: defaultPassword,
      role: 'student',
      studentId,
      contact,
      gender,
      roomNumber: roomNumber || null,
      block: block || null,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
    });

    const saved = student.toObject();
    delete saved.password;

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'student',
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
