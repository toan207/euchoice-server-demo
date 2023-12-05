const express = require('express');
const router = express.Router();
const BannerController = require('../../controller/banner.controller');

router.get('/list', BannerController.list);
router.get('/info/:_id', BannerController.info);

module.exports = router;