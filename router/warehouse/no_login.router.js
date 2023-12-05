const express = require('express');
const router = express.Router();
const WarehouseController = require('../../controller/warehouse.controller');

router.get('/list', WarehouseController.list);
router.get('/info/:_id', WarehouseController.info);

module.exports = router;