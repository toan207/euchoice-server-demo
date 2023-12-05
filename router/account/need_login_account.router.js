const express = require('express');
const router = express.Router();
const AccountController = require('../../controller/account.controller');

router.put('/changePassword', AccountController.changePassword);
router.get('/info', AccountController.info);
router.post('/signout', AccountController.signout);

module.exports = router;