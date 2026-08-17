const express = require("express");
const router = express.Router();

const {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
} = require("../controllers/maintenanceController");
const verifyToken = require("../middleware/authMiddleware");

// Every maintenance route now requires a logged-in user.
router.use(verifyToken);

router.post("/", createMaintenanceRequest);
router.get("/", getAllMaintenanceRequests);
router.put("/:id", updateMaintenanceStatus);
router.delete("/:id", deleteMaintenanceRequest);

module.exports = router;