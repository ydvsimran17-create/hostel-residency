const Maintenance = require("../models/Maintenance");

// Create Maintenance Request
const createMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Maintenance Requests
const getAllMaintenanceRequests = async (req, res) => {
  try {
    const data = await Maintenance.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Maintenance Status
const updateMaintenanceStatus = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Maintenance Request
const deleteMaintenanceRequest = async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);

    res.json({
      message: "Maintenance request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
};