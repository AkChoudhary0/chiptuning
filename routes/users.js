var express = require("express");
var router = express.Router();
var userController = require("../controllers/admin/userController");
var loginController = require("../controllers/admin/loginController");
const adminController = require("../controllers/admin/adminController.js");
const { verifyToken } = require("../config/auth.js")

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/login", loginController.userLogin);
router.post("/registerUser", loginController.registerUser);
router.post("/getEngine/:engineType", [verifyToken], adminController.getEngine);
router.post("/getMakesWithModels", [verifyToken], adminController.getMakesWithModels);

router.post("/getVehicleDropDown/:type", [verifyToken], userController.getVehicleDropDown);
router.post("/saveFileServiceForm", [verifyToken], userController.saveFileServiceForm);
router.post("/getServicerForms/:status", [verifyToken], userController.getServicerForms);
router.post("/getDropDownForOri", [verifyToken], adminController.getDropDownForOri);

router.delete("/deleteServiceForm/:id", [verifyToken], userController.deleteServiceForm);
router.get("/getServicerFormById/:id", [verifyToken], userController.getServicerFormById);

router.get("/getEngineById/:engineId", [verifyToken], userController.getEngineById);
router.post("/getEngineDetail", [verifyToken], userController.getEngineDetail);
router.post("/getECUDetail", [verifyToken], userController.getECUDetail);
router.post("/getGenerationDropDown", [verifyToken], userController.getGenerationDropDown);


// copied for api without login required
router.post("/withoutlogin/login", loginController.userLogin);
router.post("/withoutlogin/registerUser", loginController.registerUser);
router.post("/withoutlogin/getEngine/:engineType", adminController.getEngine);
router.post("/withoutlogin/getMakesWithModels", adminController.getMakesWithModels);

router.post("/withoutlogin/getVehicleDropDown/:type", userController.getVehicleDropDown);
router.post("/withoutlogin/saveFileServiceForm", userController.saveFileServiceForm);
router.post("/withoutlogin/getServicerForms/:status", userController.getServicerForms);
router.post("/withoutlogin/getDropDownForOri", adminController.getDropDownForOri);

router.delete("/withoutlogin/deleteServiceForm/:id", userController.deleteServiceForm);
router.get("/withoutlogin/getServicerFormById/:id", userController.getServicerFormById);

router.get("/withoutlogin/getEngineById/:engineId", userController.getEngineById);
router.post("/withoutlogin/getEngineDetail", userController.getEngineDetail);
router.post("/withoutlogin/getECUDetail", userController.getECUDetail);
router.post("/withoutlogin/getGenerationDropDown", userController.getGenerationDropDown);

module.exports = router;
