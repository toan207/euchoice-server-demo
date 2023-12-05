const express = require('express');
const router = express.Router();
const SearchController = require('../../controller/search.controller');

router.get('/all', SearchController.search);
router.get('/price', SearchController.price);

module.exports = router;