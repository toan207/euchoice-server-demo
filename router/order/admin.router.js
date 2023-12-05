const express = require('express');
const router = express.Router();
const OrderController = require('../../controller/order.controller');

router.get('/adminList', OrderController.adminList);
router.post('/delete-many', OrderController.deleteItems);
router.put('/delete/:_id', OrderController.deleteItem);
router.put('/hide/:_id', OrderController.hide);
router.post('/packing-many', OrderController.packingItems);
router.put('/packing/:_id', OrderController.packingItem);
router.post('/shipping-many', OrderController.shippingItems);
router.put('/shipping/:_id', OrderController.shippingItem);
router.post('/done-many', OrderController.doneItems);
router.post('/cancel-many', OrderController.cancelItems);

module.exports = router;