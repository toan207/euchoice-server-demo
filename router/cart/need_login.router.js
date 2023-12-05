const express = require('express');
const router = express.Router();
const CartController = require('../../controller/cart.controller');

router.post('/add', CartController.add);
router.put('/update/amount/:_id', CartController.updateAmount);
router.post('/delete-many', CartController.deleteItems);
router.put('/update/:_id', CartController.update);
router.put('/delete/:_id', CartController.deleteItem);
router.get('/info', CartController.info);

module.exports = router;