const Room = require('../models/Room');

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ block: 1, floor: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message,
    });
  }
};

const createRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, capacity, occupiedBeds, inventoryItems, status } =
      req.body;

    if (!roomNumber || !block || floor === undefined || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'roomNumber, block, floor, and capacity are required',
      });
    }

    const room = await Room.create({
      roomNumber,
      block,
      floor,
      capacity,
      occupiedBeds,
      inventoryItems,
      status,
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists',
      });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message,
    });
  }
};

const getRoomInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id).select('roomNumber block inventoryItems');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roomId: room._id,
        roomNumber: room.roomNumber,
        block: room.block,
        inventoryItems: room.inventoryItems,
        itemCount: room.inventoryItems.length,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch room inventory',
      error: error.message,
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      data: room,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message,
    });
  }
};

module.exports = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomInventory,
};
