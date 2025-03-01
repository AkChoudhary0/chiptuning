var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin/adminController.js')

/* GET home page. */


router.post("/createMake",adminController.createMake)
router.post("/createGeneration",adminController.createGeneration)
router.post("/createModel",adminController.createModel)
// router.post("/createMake",adminController.createMake)

module.exports = router;
 