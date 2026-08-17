const User = require('../models/User');
const Room = require('../models/Room');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const Maintenance = require('../models/Maintenance');

const getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInventoryItems = await Inventory.countDocuments();
    const totalMaintenance = await Maintenance.countDocuments();

    const approvedRequests = await Request.countDocuments({
      status: 'Approved',
    });

    const rejectedRequests = await Request.countDocuments({
      status: 'Rejected',
    });

    const pendingRequests = await Request.countDocuments({
      status: 'Pending',
    });

    const pendingMaintenance = await Maintenance.countDocuments({
      status: 'Pending',
    });

    const inProgressMaintenance = await Maintenance.countDocuments({
      status: 'In Progress',
    });

    const completedMaintenance = await Maintenance.countDocuments({
      status: 'Completed',
    });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        totalRequests,
        totalStudents,
        totalInventoryItems,
        totalMaintenance,
        approvedRequests,
        rejectedRequests,
        pendingRequests,
        pendingMaintenance,
        inProgressMaintenance,
        completedMaintenance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};