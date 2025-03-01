var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin/adminController.js')

/* GET home page. */


router.post("/createMake",adminController.createMake)
router.post("/createGeneration",adminController.createGeneration)
router.post("/createModel",adminController.createModel)
router.post("/createEngine",adminController.createEngine)
router.get("/getMakes",adminController.getMakes)
router.post("/getGeneration",adminController.getGeneration)
router.post("/getModels",adminController.getModels)
router.post("/getEngine",adminController.getEngine)

router.get("/getModelByMakeId/:makeId",adminController.getModelByMakeId)
router.delete("/deleteMakeById/:makeId",adminController.deleteMakeById) 
router.get("/getMakes",adminController.getMakes)
router.post("/getVehicleDropDown",adminController.getVehicleDropDown)

// router.post("/createMake",adminController.createMake)

module.exports = router;
 