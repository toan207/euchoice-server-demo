const upload = require('../upload');
const uploadArrayImage = upload.array('file');
const uploadImage = upload.single('file');

const checkBeforeUploadArray = async (req, res, next) => {
    uploadArrayImage(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err });
        next();
    })
}

const checkBeforeUpload = async (req, res, next) => {
    uploadImage(req, res, (err) => {
        if (err) return res.status(400).json({ success: false, message: err });
        next();
    })
}

module.exports = {
    checkBeforeUploadArray,
    checkBeforeUpload,
}