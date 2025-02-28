var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin/adminController.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/createMake",adminController.createMake)
router.post("/createGeneration",adminController.createGeneration)
router.post("/createModel",adminController.createModel)
router.post("/createEngine",adminController.createEngine)
router.post("/getMakes",adminController.getMakes)
// router.post("/getModels",adminController.getModels)
router.post("/getVehicleDropDown",adminController.getVehicleDropDown)

// router.post("/createMake",adminController.createMake)

module.exports = router;
