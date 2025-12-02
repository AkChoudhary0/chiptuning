const express = require("express");
const router = express.Router();
const dealerCtrl = require("../controllers/dealerController");

// Public route (Frontend popup submits request)
router.post("/dealer/request", dealerCtrl.createDealerRequest);

// Admin routes
router.get("/dealers", dealerCtrl.getAllDealerRequests);
router.post("/dealer/approve/:dealerId", dealerCtrl.approveDealer);

module.exports = router;
