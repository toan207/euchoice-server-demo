const express = require('express');
const router = express.Router();
const NewsController = require('../../controller/news.controller');

router.get('/list', NewsController.list);
router.get('/info/:_id', NewsController.info);

module.exports = router;