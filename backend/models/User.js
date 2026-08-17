const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

      resetPasswordToken: {
  type: String,
},

resetPasswordExpire: {
  type: Date,
},

    role: {
      type: String,
      enum: ['admin', 'staff', 'student'],
      default: 'student',
    },

    studentId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },

    contact: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },

    roomNumber: {
      type: String,
      default: null,
    },

    block: {
      type: String,
      default: null,
    },

    joinDate: {
      type: String,
    },

    phone: {
      type: String,
      trim: true,
    },

    profilePic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);