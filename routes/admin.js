var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin/adminController.js')

/* GET home page. */


router.post("/createMake",adminController.createMake)
router.post("/createGeneration",adminController.createGeneration)
router.post("/createModel",adminController.createModel)
router.post("/createEngine",adminController.createEngine)
// router.get("/getMakes",adminController.getMakes)
// router.post("/getGeneration",adminController.getGeneration)
router.post("/getGeneration/:generationType",adminController.getGeneration)

router.post("/getModels/:modelType",adminController.getModels) 
router.post("/getEngine",adminController.getEngine)

router.get("/getModelByMakeId/:makeId",adminController.getModelByMakeId)

router.get("/getEngineById/:engineId",adminController.getEngineById)

router.post("/getECU/",adminController.getECU)

router.post("/getMakes/:makeType",adminController.getMakes)
router.post("/getVehicleDropDown/:type",adminController.getVehicleDropDown)

router.delete("/deleteMakeById/:makeId",adminController.deleteMakeById) 
router.delete("/deleteGenerationById/:generationId",adminController.deleteGenerationById) 
router.delete("/deleteEngineById/:engineId",adminController.deleteEngineById)
router.delete("/deleteModelById/:modelId",adminController.deleteModelById)

// router.post("/createMake",adminController.createMake)

module.exports = router;
 