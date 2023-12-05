const express = require('express');
const router = express.Router();
const ProviderController = require('../../controller/provider.controller');

router.get('/adminList', ProviderController.adminList);
router.post('/add', ProviderController.add);
router.post('/delete-many', ProviderController.deleteItems);
router.put('/update/:_id', ProviderController.update);
router.put('/delete/:_id', ProviderController.deleteItem);
router.put('/hide/:_id', ProviderController.hide);

module.exports = router;