const fs = require('fs');
const path = require('path');

const Product = require('../schema').models.Product;
const Banner = require('../schema').models.Banner;
const Category = require('../schema').models.Category;
const Warehouse = require('../schema').models.Warehouse;
const News = require('../schema').models.News;

const imageFolderPath = path.join(__dirname.split('/controller')[0], 'uploads');

async function info(req, res) {
    const imageName = req.params.imageName;
    const imagePath = path.join(imageFolderPath, imageName);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).send('Image not found.');
    }

    const extension = path.extname(imageName).toLowerCase();
    const contentType = `image/${extension.substr(1)}`;
    res.set('Content-Type', contentType);

    const imageStream = fs.createReadStream(imagePath);
    imageStream.pipe(res);
}

async function upload(req, res) {
    const file = req.files;
    console.log(req.body.name)

    console.log('Uploaded file:', file);
    res.send('File uploaded successfully.');
}

async function uploadForProduct(req, res) {
    const file = req.files;
    const { _id } = req.params;
	console.log(file)
    if (!file || !file.length) return res.status(400).json({ success: false, message: 'File is reqired and must be array!' });

    const product = await Product.findOne({ _id, delete: false, hide: false });
    if (!product) return res.status(404).json({ success: false, message: 'Not found product!' });

    const warehouse = await Warehouse.findOne({ _id: product.warehouse, delete: false, hide: false });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Not found warehouse!' });

    if (warehouse.manager != req.user._id && req.user.role != 'admin') return res.status(400).json({ success: false, message: 'Must be manager of warehouse!' });

    const image = product.image;
    for (let i = 0; i < file.length; ++i) {
        image.push(file[i].filename);
    }

    await Product.updateOne({ _id }, {
        $set: {
            image
        }
    });

    return res.json({ success: true, message: 'Upload is success!' });
}

async function deleteImageForProduct(req, res) {
    const { _id } = req.params;
    const { imageId } = req.body;

    const product = await Product.findOne({ _id, delete: { $ne: true }, hide: { $ne: true } });
    if (!product) return res.status(404).json({ success: false, message: 'Not found product!' });

    const warehouse = await Warehouse.findOne({ _id: product.warehouse, delete: { $ne: true }, hide: { $ne: true } });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Not found product!' });

    if (warehouse.manager != req.user._id && req.user.role != 'admin') return res.status(400).json({ success: false, message: 'Must be manager of warehouse!' });

    let image = product.image;
    const index = image.findIndex((id) => id == imageId);

    if (index == -1) return res.status(404).json({ success: false, message: 'Not found image!' });

    image.splice(index, 1);

    await Product.updateOne({ _id }, {
        $set: {
            image
        }
    });

    return res.json({ success: true, message: 'Delete image is success!' });
}

async function uploadForCategory(req, res) {
    const image = req.file.filename;
    const { _id } = req.params;

    const category = await Category.findOne({ _id, delete: { $ne: true }, hide: { $ne: true } });
    if (!category) return res.status(404).json({ success: false, message: 'Not found category!' });

    if (req.user.role != 'admin') return res.status(400).json({ success: false, message: 'Must be admin!' });

    await Category.updateOne({ _id }, {
        $set: {
            image
        }
    });

    return res.json({ success: true, message: 'Upload is success!' });
}


async function uploadIconForCategory(req, res) {
    const icon = req.file.filename;
    const { _id } = req.params;

    const category = await Category.findOne({ _id, delete: { $ne: true }, hide: { $ne: true } });
    if (!category) return res.status(404).json({ success: false, message: 'Not found category!' });

    if (req.user.role != 'admin') return res.status(400).json({ success: false, message: 'Must be admin!' });

    await Category.updateOne({ _id }, {
        $set: {
            icon
        }
    });

    return res.json({ success: true, message: 'Upload is success!' });
}

async function uploadBanner(req, res) {
    const image = req.file.filename;
    const { name, expired, order, always, top } = req.body;
	console.log(image)
    const newBanner = new Banner({ name, expired, order, always, image, main: top });
    newBanner.save(newBanner);

    return res.json({ success: true, message: 'Upload is success!' });
}

async function uploadImageForNews(req, res) {
    const image = req.file.filename;
    const { _id } = req.body;

    const news = await News.updateOne({ _id }, {
        $set: {
            image
        }
    })

    return res.json({ success: true, message: 'Upload is success!' });
}

module.exports = {
    info,
    upload,
    uploadForProduct,
    deleteImageForProduct,
    uploadForCategory,
    uploadIconForCategory,
    uploadBanner,
    uploadImageForNews,
}
