var express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin/adminController.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/createType",adminController.createType); // get all users by role

module.exports = router;
