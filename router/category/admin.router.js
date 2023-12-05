const express = require('express');
const router = express.Router();
const CategoryController = require('../../controller/category.controller');

router.get('/adminList', CategoryController.adminList);
router.post('/add', CategoryController.add);
router.post('/delete-many', CategoryController.deleteItems);
router.put('/update/:_id', CategoryController.update);
router.put('/delete/:_id', CategoryController.deleteItem);
router.put('/hide/:_id', CategoryController.hide);

module.exports = router;