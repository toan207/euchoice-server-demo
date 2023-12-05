const express = require('express');
const router = express.Router();

const AccountRouter = require('./account/admin_account.router');
const BannerRouter = require('./banner/admin.router');
const ProviderRouter = require('./provider/admin.router');
const CategoryRouter = require('./category/admin.router');
const WarehouseRouter = require('./warehouse/admin.router');
const ProductRouter = require('./product/admin.router');
const ImageRouter = require('./image/admin.router');
const SearchRouter = require('./search/admin.router');
const OrderRouter = require('./order/admin.router');
const NewsRouter = require('./news/admin.router');

const ConfigRouter = require('../controller/config.controller');

router.use('/account', AccountRouter);
router.use('/banner', BannerRouter);
router.use('/category', CategoryRouter);
router.use('/provider', ProviderRouter);
router.use('/warehouse', WarehouseRouter);
router.use('/product', ProductRouter);
router.use('/image', ImageRouter);
router.use('/search', SearchRouter);
router.use('/order', OrderRouter);
router.use('/news', NewsRouter);

router.post('/config/editProfile', ConfigRouter.editProfile);

module.exports = router;