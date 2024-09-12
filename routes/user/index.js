const express = require('express');
const UserController = require("../../controllers/user");
const isAdmin = require('../../middleware/isAdmin');
const router = express.Router();

router.get('/user-detials', UserController.userDetails);

router.delete('/user/:id', UserController.deleteUser);

router.patch('/restore-user/:id', isAdmin, UserController.restoreUser);

module.exports = router;
