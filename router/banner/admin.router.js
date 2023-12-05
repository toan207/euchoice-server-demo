const express = require('express');
const router = express.Router();
const BannerController = require('../../controller/banner.controller');

router.get('/adminList', BannerController.adminList);
router.post('/delete-many', BannerController.deleteItems);
router.post('/update-orders', BannerController.updateOrder);
router.put('/update/:_id', BannerController.update);
router.put('/delete/:_id', BannerController.deleteItem);
router.put('/hide/:_id', BannerController.hide);
router.put('/always/:_id', BannerController.always);

module.exports = router;