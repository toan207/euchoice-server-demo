const Product = require('../schema').models.Product;
const ProductInfo = require('../schema').models.ProductInfo;
const Account = require('../schema').models.Account;
const Warehouse = require('../schema').models.Warehouse;
const Category = require('../schema').models.Category;

async function add(req, res) {
    const { name, provider, warehouse, category, description, weight } = req.body;
    const { productInfo } = req.body;

    const group1 = productInfo?.group1;
    const group2 = productInfo?.group2;

    const type = productInfo?.type;

    if (!name) return res.status(403).json({
        success: false,
        message: "Name is required!"
    });

    const checkWarehouse = await Warehouse.findOne({ _id: warehouse });
    if (!checkWarehouse && !!warehouse) return res.status(404).json({ success: false, message: 'Not found warehouse!' });

    const checkCategory = await Category.findOne({ _id: category });
    if (!checkCategory && !!category) return res.status(404).json({ success: false, message: 'Not found category!' });

    const newProduct = new Product({ name, provider, warehouse, category, description, group1, group2, weight });
    const product = await newProduct.save(newProduct);

    if (!type || !type.length) return res.status(201).json({
        success: true,
        message: "Added product to db!"
    });

    const productType = [];

    for (let i = 0; i < type.length; ++i) {
        const subgroup1 = type[i]?.group1;
        const subgroup2 = type[i]?.group2;
        const { price, amount, sold } = type[i];
        const newInfo = new ProductInfo({ product: product._id, group1: subgroup1, group2: subgroup2, price, amount, sold });
        const info = await newInfo.save(newInfo);

        productType.push(info._id);
    }

    await Product.updateOne({ _id: product._id }, {
        $set: {
            type: productType,
        }
    });

    const info = await Product.findOne({ _id: product._id });

    return res.status(201).json({
        success: true,
        message: "Added product to db!",
        data: info
    });
}

async function list(req, res) {
    const { limit, page, category } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        hide: { $ne: true },
        delete: { $ne: true },
        image: { $gt: [] },
    }

    const categoryQuery = {
        name: category,
        hide: { $ne: true },
        delete: { $ne: true },
    }

    const getCategory = await Category.findOne(categoryQuery);
    if (!!getCategory) {
        query['category'] = getCategory._id;
    }

    const products = await Product.find(query)
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type')
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Product.countDocuments(query);

    const data = [];
    for (let i = 0; i < products.length; ++i) {
        const prod = products[i].toObject();
        const today = new Date();
        const isSale = today > prod.startSale && today < prod.endSale;
        prod.isSale = isSale;

        data.push(prod);
    }

    res.json({
        success: true,
        data,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function adminList(req, res) {
    const { limit, page, category } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const query = {
        delete: { $ne: true },
    }

    const categoryQuery = {
        name: category,
        hide: { $ne: true },
        delete: { $ne: true },
    }

    const getCategory = await Category.findOne(categoryQuery);
    if (!!getCategory) {
        query['category'] = getCategory._id;
    }

    const products = await Product.find(query)
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type')
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Product.countDocuments(query);

    res.json({
        success: true,
        data: products,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { name, warehouse, provider, category, description, weight } = req.body;

    const { productInfo } = req.body;

    const group1 = productInfo?.group1 || null;
    const group2 = productInfo?.group2 || null;

    const type = productInfo?.type;

    if (!name) return res.status(403).json({
        success: false,
        message: "Name is required!"
    });

    const checkWarehouse = await Warehouse.findOne({ _id: warehouse });
    if (!checkWarehouse && !!warehouse) return res.status(404).json({ success: false, message: 'Not found warehouse!' });

    const checkCategory = await Category.findOne({ _id: category });
    if (!checkCategory && !!category) return res.status(404).json({ success: false, message: 'Not found category!' });

    await Product.updateOne({ _id }, {
        $set: {
            name, provider, warehouse, category, description, group1, group2, weight
        }
    });

    if (!type || !type.length) return res.status(201).json({
        success: true,
        message: "Updated!"
    });

    const productType = [];

    for (let i = 0; i < type.length; ++i) {
        if (type[i].delete) {
            await ProductInfo.deleteOne({ _id: type[i]._id });
            continue;
        }

        const subgroup1 = type[i]?.group1;
        const subgroup2 = type[i]?.group2;
        const { price, amount, sold } = type[i];

        if (!!type[i]._id) {
            await ProductInfo.updateOne({ _id: type[i]._id }, {
                $set: {
                    group1: subgroup1, group2: subgroup2, price, amount, sold
                }
            });

            productType.push(type[i]._id);
            continue;
        }

        const newInfo = new ProductInfo({ product: _id, group1: subgroup1, group2: subgroup2, price, amount, sold });
        const info = await newInfo.save(newInfo);

        productType.push(info._id);
    }

    await Product.updateOne({ _id }, {
        $set: {
            type: productType,
        }
    });

    return res.status(201).json({
        success: true,
        message: "Updated!"
    });
}

async function info(req, res) {
    const { _id } = req.params;

    const product = await Product.findOne({ _id })
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type');

    const today = new Date();
    const isSale = today > product.startSale && today < product.endSale;

    for (let i = 0; i < product.type?.length && isSale; ++i) {
        product.type[i].price = product.type[i].priceSale;
    }

    return res.json({ success: true, data: product });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Product.updateOne({ _id }, {
        $set: {
            delete: true,
        }
    });

    return res.json({ success: true, message: 'Deleted!' });
}

async function deleteItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        const item = await Product.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const product = await Product.findOne({ _id });
    if (!product) return res.json({ success: false, message: 'Product not found!' });

    const item = await Product.updateOne({ _id }, {
        $set: {
            hide: !product.hide,
        }
    });

    return res.json({ success: true, message: 'Hid!' });
}

async function listTopSold(req, res) {
    const { limit } = req.query;
    const top = (limit * 1) || 10;

    const preCheck = await ProductInfo.aggregate([
        {
            $group: {
                _id: '$product',
                soldTotal: { $sum: '$sold' },
                price: { $min: '$price' }
            }
        },
        { $sort: { 'soldTotal': -1 } }
    ]);

    const data = [];
    let check = 0;
    for (let i = 0; i < preCheck.length; ++i) {
        const product = await Product.findOne({
            _id: preCheck[i]._id,
            hide: { $ne: true },
            delete: { $ne: true },
            image: { $gt: [] },
        })
            .populate('type');

        if (!product) continue;

        check++;
        data.push(product);

        if (check >= top) break;
    }

    return res.json({ success: true, data });
}

async function flashSale(req, res) {
    const { product, startSale, endSale, type } = req.body;

    if (!type || !type.length) return res.status(400).json({ success: false, message: 'Type is reqired and must be array!' });

    const prod = await Product.findOne({ _id: product });
    if (!prod) return res.status(404).json({ success: false, message: 'Not found product!' });

    for (let i = 0; i < type.length; ++i) {
        const info = await ProductInfo.findOne({ _id: type[i]._id });
        if (!info) return res.status(404).json({ success: false, message: 'Not found type, ' + type[i]._id });

        let priceSale = info.price;
        if (type[i].priceSale > 0) priceSale = type[i].priceSale * 1;
        let amountSale = info.amount;
        if (type[i].amountSale > 0) amountSale = type[i].amountSale * 1;

        await ProductInfo.updateOne({ _id: type[i]._id }, {
            $set: {
                priceSale, amountSale
            }
        })
    }

    await Product.updateOne({ _id: product }, {
        $set: {
            startSale,
            endSale
        }
    });

    return res.json({ success: true, message: 'Set flash sale successed!' });
}

async function flashSaleList(req, res) {
    const { limit, page, category } = req.query;

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    const today = new Date();
    const query = {
        startSale: { $lt: today },
        endSale: { $gt: today },
        hide: { $ne: true },
        delete: { $ne: true },
        image: { $gt: [] },
    }

    const categoryQuery = {
        name: category,
        hide: { $ne: true },
        delete: { $ne: true },
    }

    const getCategory = await Category.findOne(categoryQuery);
    if (!!getCategory) {
        query['category'] = getCategory._id;
    }

    const products = await Product.find(query)
        .populate('warehouse')
        .populate('category')
        .populate('provider')
        .populate('type')
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Product.countDocuments(query);

    res.json({
        success: true,
        data: products,
        pagination: {
            page: pa,
            limit: lim,
            totalData: count
        }
    });
}

module.exports = {
    add,
    list,
    update,
    info,
    deleteItem,
    hide,
    adminList,
    deleteItems,
    listTopSold,
    flashSale,
    flashSaleList,
}