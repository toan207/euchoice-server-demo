const express = require('express');
const router = express.Router();
const ProviderController = require('../../controller/provider.controller');

router.get('/list', ProviderController.list);
router.get('/info/:_id', ProviderController.info);

module.exports = router;