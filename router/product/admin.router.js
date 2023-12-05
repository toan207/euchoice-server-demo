const express = require('express');
const router = express.Router();
const ProductController = require('../../controller/product.controller');

router.get('/adminList', ProductController.adminList);
router.post('/add', ProductController.add);
router.post('/flash-sale', ProductController.flashSale);
router.post('/delete-many', ProductController.deleteItems);
router.put('/update/:_id', ProductController.update);
router.put('/delete/:_id', ProductController.deleteItem);
router.put('/hide/:_id', ProductController.hide);

module.exports = router;