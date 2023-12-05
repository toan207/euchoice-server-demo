const express = require('express');
const router = express.Router();
const ShippingInfoController = require('../../controller/shippingInfo.controller');

router.get('/list', ShippingInfoController.list);
router.post('/add', ShippingInfoController.add);
router.post('/update/:_id', ShippingInfoController.update);
router.get('/info/:_id', ShippingInfoController.info);
router.post('/delete-many', ShippingInfoController.deleteItems);
router.put('/delete/:_id', ShippingInfoController.deleteItem);

module.exports = router;