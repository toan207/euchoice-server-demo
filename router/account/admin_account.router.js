const express = require('express');
const router = express.Router();
const AccountController = require('../../controller/account.controller');

router.get('/list', AccountController.list);
router.get('/adminList', AccountController.adminList);
router.post('/add', AccountController.addAccount);
router.put('/update', AccountController.update);
router.put('/delete/:_id', AccountController.deleteItem);
router.put('/hide/:_id', AccountController.hide);
router.put('/admin-changePassword', AccountController.adminChangePassword);

module.exports = router;