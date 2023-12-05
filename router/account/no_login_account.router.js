const express = require('express');
const router = express.Router();
const AccountController = require('../../controller/account.controller');

router.post('/register', AccountController.register);

module.exports = router;