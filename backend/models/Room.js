const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Block is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
      min: [0, 'Floor cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
  occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, 'Occupied beds cannot be negative'],
      validate: {
        validator: async function (value) {
          const capacity = this.capacity !== undefined
            ? this.capacity
            : (await this.model.findOne(this.getQuery())).capacity;
          return value <= capacity;
        },
        message: 'Occupied beds cannot exceed room capacity',
      },
    },
    inventoryItems: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
