const express = require('express');
const router = express.Router();
const SearchController = require('../../controller/search.controller');

router.get('/admin', SearchController.admin);

module.exports = router;