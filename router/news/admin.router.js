const express = require('express');
const router = express.Router();
const NewsController = require('../../controller/news.controller');

router.get('/adminList', NewsController.adminList);
router.post('/add', NewsController.add);
router.post('/delete-many', NewsController.deleteItems);
router.put('/update/:_id', NewsController.update);
router.put('/delete/:_id', NewsController.deleteItem);
router.put('/hide/:_id', NewsController.hide);

module.exports = router;