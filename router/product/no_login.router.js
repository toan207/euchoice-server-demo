const express = require('express');
const router = express.Router();
const ProductController = require('../../controller/product.controller');

router.get('/list', ProductController.list);
router.get('/list-sale', ProductController.flashSaleList);
router.get('/top', ProductController.listTopSold);
router.get('/info/:_id', ProductController.info);

module.exports = router;