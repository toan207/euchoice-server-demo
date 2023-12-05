const express = require('express');
const router = express.Router();

const UploadMiddleware = require('../../middlewares/image');

const ImageController = require('../../controller/image.controller');

router.post('/upload/banner', UploadMiddleware.checkBeforeUpload, ImageController.uploadBanner);
router.post('/upload/news/:_id', UploadMiddleware.checkBeforeUpload, ImageController.uploadImageForNews);
router.post('/upload/category/:_id', UploadMiddleware.checkBeforeUpload, ImageController.uploadForCategory);
router.post('/upload/category/icon/:_id', UploadMiddleware.checkBeforeUpload, ImageController.uploadIconForCategory);
router.post('/upload/product/:_id', UploadMiddleware.checkBeforeUploadArray, ImageController.uploadForProduct);
router.put('/delete/product/:_id', ImageController.deleteImageForProduct);

module.exports = router;