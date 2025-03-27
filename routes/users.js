var express = require("express");
var router = express.Router();
var userController = require("../controllers/admin/userController");
var loginController = require("../controllers/admin/loginController");
const adminController = require("../controllers/admin/adminController.js");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/login", loginController.userLogin);
router.post("/registerUser", loginController.registerUser);
router.post("/getEngine/:engineType", adminController.getEngine);

router.post("/getVehicleDropDown/:type", userController.getVehicleDropDown);
router.post("/saveFileServiceForm", userController.saveFileServiceForm);
router.post("/getServicerForms/:status", userController.getServicerForms);
router.post("/getDropDownForOri", adminController.getDropDownForOri);

router.delete("/deleteServiceForm/:id", userController.deleteServiceForm);
router.get("/getServicerFormById/:id", userController.getServicerFormById);

router.get("/getEngineById/:engineId", userController.getEngineById);
router.post("/getEngineDetail", userController.getEngineDetail);
router.post("/getECUDetail", userController.getECUDetail);

module.exports = router;
