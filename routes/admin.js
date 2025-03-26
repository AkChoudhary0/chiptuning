var express = require("express");
var router = express.Router();
const adminController = require("../controllers/admin/adminController.js");
const loginController = require("../controllers/admin/loginController.js");
const { verifyToken } = require("../config/auth.js");

/* GET home page. */
// user api's routes

router.post("/login", loginController.login);
router.get("/createSuperAdmin", loginController.createSuperAdmin);
router.get("/", (req, res) => {
  res.send({
    message: "hello",
  });
});

router.post("/createMake", [verifyToken], adminController.createMake);
router.post("/createGeneration", adminController.createGeneration);
router.post("/createModel", adminController.createModel);
router.post("/createEngine", adminController.createEngine);
router.post("/getGeneration/:generationType", adminController.getGeneration);
router.post("/getModels/:modelType", adminController.getModels);
router.post("/listUsers", [verifyToken], adminController.getUserList);
router.put(
  "/updateUser/:userId",
  [verifyToken],
  adminController.updateUserDetail
);
router.post("/getEngine/:engineType", adminController.getEngine);
router.post("/getEngineDetail", adminController.getEngineDetail);
router.get("/getModelByMakeId/:makeId", adminController.getModelByMakeId);
router.get("/getEngineById/:engineId", adminController.getEngineById);
router.post("/getECU/", adminController.getECU);

router.post("/addECU", adminController.addECU);
router.post("/getMakes/:makeType", adminController.getMakes);
router.post("/getVehicleDropDown/:type", adminController.getVehicleDropDown);
router.get("/getDropDownForOri", adminController.getDropDownForOri);
// router.post("/getVehicleDropDown/original_file", adminController.getVehicleDropDown1);
router.delete("/deleteMakeById/:makeId", adminController.deleteMakeById);
router.delete(
  "/deleteGenerationById/:generationId",
  adminController.deleteGenerationById
);
router.delete("/deleteEngineById/:engineId", adminController.deleteEngineById);
router.delete("/deleteModelById/:modelId", adminController.deleteModelById);

// router.post("/createMake",adminController.createMake)

module.exports = router;
