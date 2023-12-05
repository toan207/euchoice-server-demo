const express = require('express');
const router = express.Router();
const CategoryController = require('../../controller/category.controller');

router.get('/list', CategoryController.list);
router.get('/info/:_id', CategoryController.info);

module.exports = router;