var express = require('express');
var router = express.Router();
var userController = require("../controllers/admin/userController")
var loginController = require("../controllers/admin/loginController")

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post("/login", loginController.userLogin);
router.post("/registerUser", loginController.registerUser);

router.post("/getVehicleDropDown/:type", userController.getVehicleDropDown);
router.get("/getEngineById/:engineId", userController.getEngineById);
router.post("/getEngineDetail", userController.getEngineDetail);
router.post("/getECUDetail", userController.getEngineDetail);

module.exports = router;
