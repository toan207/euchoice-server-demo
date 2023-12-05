const express = require('express');
const router = express.Router();
const WarehouseController = require('../../controller/warehouse.controller');

router.get('/adminList', WarehouseController.adminList);
router.post('/add', WarehouseController.add);
router.post('/delete-many', WarehouseController.deleteItems);
router.put('/update/:_id', WarehouseController.update);
router.put('/delete/:_id', WarehouseController.deleteItem);
router.put('/hide/:_id', WarehouseController.hide);

module.exports = router;