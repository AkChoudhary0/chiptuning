var express = require('express');
var router = express.Router();
var userController = require("../controllers/admin/userController")


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/getVehicleDropDown/:type", userController.getVehicleDropDown);
router.get("/getEngineById/:engineId", userController.getEngineById);

module.exports = router;
