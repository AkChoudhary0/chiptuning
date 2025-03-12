var express = require('express');
var router = express.Router();
var userController = require("../controllers/admin/userController")
var loginController = require("../controllers/admin/loginController")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/login", loginController.login);

router.post("/getVehicleDropDown/:type", userController.getVehicleDropDown);
router.get("/getEngineById/:engineId", userController.getEngineById);

module.exports = router;
