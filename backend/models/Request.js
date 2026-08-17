const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', requestSchema);