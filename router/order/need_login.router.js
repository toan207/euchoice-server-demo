const express = require('express');
const router = express.Router();
const OrderController = require('../../controller/order.controller');

router.get('/list', OrderController.list);
router.post('/add', OrderController.add);
router.get('/info/:_id', OrderController.info);
router.put('/done/:_id', OrderController.doneItem);
router.put('/cancel/:_id', OrderController.cancelItem);

module.exports = router;