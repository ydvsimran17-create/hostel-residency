const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },

  roomNumber: {
    type: String,
    required: true,
  },

  issueType: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  description: {
    type: String,
    required: true,
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },

  raisedBy: {
    type: String,
    default: 'Staff Reporter',
  },

  assignedTo: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);