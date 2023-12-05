const { default: mongoose } = require('mongoose');

const Product = require('../schema').models.Product;
const ProductInfo = require('../schema').models.ProductInfo;
const Account = require('../schema').models.Account;
const Warehouse = require('../schema').models.Warehouse;
const Category = require('../schema').models.Category;

async function search(req, res) {
    const { key, limit, page } = req.query;

    const categoryQuery = {
        hide: { $ne: true },
        delete: { $ne: true },
        name: { $regex: key || "", $options: "i" }
    }

    let category = await Category.find(categoryQuery);
    category = category.map((c) => { return c._id });

    const warehouseQuery = {
        hide: { $ne: true },
        delete: { $ne: true },
        $or: [
            { name: { $regex: key || "", $options: "i" } },
            { address: { $regex: key || "", $options: "i" } },
            { city: { $regex: key || "", $options: "i" } },
            { country: { $regex: key || "", $options: "i" } },
        ]
    }

    let warehouse = await Warehouse.find(warehouseQuery);
    warehouse = warehouse.map((w) => { return w._id });

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const productQuery = {
        hide: { $ne: true },
        delete: { $ne: true },
        image: { $gt: [] },
        $or: [
            { name: { $regex: key || "", $options: "i" } },
            { description: { $regex: key || "", $options: "i" } },
            { category: { $in: category } },
            { warehouse: { $in: warehouse } },
        ]
    }
    const product = await Product.find(productQuery)
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type')
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Product.countDocuments(productQuery);

    return res.json({
        success: true,
        data: product,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function admin(req, res) {
    const { key } = req.query;

    const categoryQuery = {
        delete: { $ne: true },
        name: { $regex: key || "", $options: "i" }
    }

    let category = await Category.find(categoryQuery);
    category = category.map((c) => { return c._id });

    const warehouseQuery = {
        delete: { $ne: true },
        $or: [
            { name: { $regex: key || "", $options: "i" } },
            { address: { $regex: key || "", $options: "i" } },
            { city: { $regex: key || "", $options: "i" } },
            { country: { $regex: key || "", $options: "i" } },
        ]
    }

    let warehouse = await Warehouse.find(warehouseQuery);
    warehouse = warehouse.map((w) => { return w._id });

    const productQuery = {
        delete: { $ne: true },
        $or: [
            { name: { $regex: key || "", $options: "i" } },
            { description: { $regex: key || "", $options: "i" } },
            { category: { $in: category } },
            { warehouse: { $in: warehouse } },
        ]
    }
    const product = await Product.find(productQuery)
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type');

    return res.json({ success: true, data: product });
}

async function price(req, res) {
    const { under, over, limit, page } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const productInfoQuery = {
        hide: { $ne: true },
        delete: { $ne: true },
    }

    const filter = {};

    if (!!under) {
        filter['$lte'] = under.replace('.', '') * 1;
    }

    if (!!over) {
        filter['$gte'] = over.replace('.', '') * 1;
    }

    if (filter != {}) {
        productInfoQuery['price'] = filter;
    }

    const info = await ProductInfo.find(productInfoQuery);

    const prodKey = {};
    const prodId = [];

    for (let i = 0; i < info.length; ++i) {
        const prod = info[i]['product'];
        const productQuery = {
            hide: { $ne: true },
            delete: { $ne: true },
            image: { $gt: [] },
            _id: prod,
        }
        const getProd = await Product.findOne(productQuery);
        if (prodKey[prod] != 1 && !!getProd) {
            prodId.push(prod);
        }
        prodKey[prod] = 1;
    }

    const product = await Product.find({ _id: { $in: prodId.slice(lim * (pa - 1), lim * (pa - 1) + lim) } })
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type');

    const count = prodId.length;

    return res.json({
        success: true,
        data: product,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

module.exports = {
    search,
    admin,
    price,
}