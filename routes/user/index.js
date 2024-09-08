const express = require('express');
const UserController = require("../../controllers/user");
const router = express.Router();

router.get('/user-detials', UserController.userDetails);

module.exports = router;
