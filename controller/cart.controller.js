const Cart = require('../schema').models.Cart;
const Product = require('../schema').models.Product;
const ProductInfo = require('../schema').models.ProductInfo;
const Account = require('../schema').models.Account;

const CartLib = require('../lib/cart.lib');

async function add(req, res) {
    const { product, type, amount, buyNow } = req.body;
    const user = req.user._id;
    const today = new Date();

    if (!product) return res.status(403).json({
        success: false,
        message: "Product is required!"
    });

    const getProduct = await Product.findOne({ _id: product });
    if (!getProduct)
        return res.status(403).json({
            success: false,
            message: "Product is not exist!"
        });

    const productInfo = await ProductInfo.findOne({ _id: type, product });
    if (!productInfo)
        return res.status(403).json({
            success: false,
            message: "Type is not exist!"
        });

    if (!amount) return res.status(403).json({
        success: false,
        message: "Amount is invalid!"
    });

    if (amount * 1 > productInfo.amount
        || (getProduct.startSale < today
            && getProduct.endSale > today
            && productInfo.amountSale < amount * 1)) return res.status(403).json({
                success: false,
                message: "Not enough amount to add to cart!"
            });

    const account = await Account.findOne({ _id: user });
    if (!account) return res.status(404).json({ success: false, message: 'Not found account!' });

    if (!!buyNow) {
        if (amount * 1 < 1) return res.status(403).json({
            success: false,
            message: "Amount is invalid!"
        });

        const newCart = new Cart({ owner: user, product, type, amount, bought: true });
        newCart.save(newCart);

        const data = await CartLib.infoId(newCart._id, user);

        return res.status(201).json({
            success: true,
            message: "Added cart to db!",
            data,
        });
    }

    const cart = await Cart.findOne({ product, type, owner: user, bought: { $ne: true } });
    if (!!cart) {
        cart.amount += amount * 1;
        if (cart.amount > productInfo.amount
            || (getProduct.startSale < today
                && getProduct.endSale > today
                && productInfo.amountSale < amount * 1)
        ) return res.status(403).json({
            success: false,
            message: "Not enough amount to add to cart!"
        });

        if (cart.amount < 1) return res.status(403).json({
            success: false,
            message: "Amount is invalid!"
        });

        await Cart.updateOne({ _id: cart._id }, {
            $set: {
                amount: cart.amount,
            }
        });

        return res.status(201).json({
            success: true,
            message: "Added cart to db!"
        });
    }

    if (amount * 1 < 1) return res.status(403).json({
        success: false,
        message: "Amount is invalid!"
    });

    const newCart = new Cart({ owner: user, product, type, amount });
    newCart.save(newCart);

    return res.status(201).json({
        success: true,
        message: "Added cart to db!"
    });
}

async function update(req, res) {
    const { _id } = req.params;
    const { product, type, amount } = req.body;
    const user = req.user._id;

    let cart = await Cart.findOne({ _id, owner: user });
    if (!cart) return res.status(404).json({ success: false, message: 'Not found cart!' });

    const getProduct = await Product.findOne({ _id: product });
    if (!getProduct)
        return res.status(403).json({
            success: false,
            message: "Product is not exist!"
        });

    const productInfo = await ProductInfo.findOne({ _id: type, product });
    if (!productInfo)
        return res.status(403).json({
            success: false,
            message: "Type is not exist!"
        });

    if (!amount) return res.status(403).json({
        success: false,
        message: "Amount is invalid!"
    });

    if (amount * 1 > productInfo.amount) return res.status(403).json({
        success: false,
        message: "Not enough amount to add to cart!"
    });

    const cartCheck = await Cart.findOne({ product, type, owner: user, bought: { $ne: true } });
    if (!!cartCheck) {
        cartCheck.amount += amount * 1;
        if (cartCheck.amount > productInfo.amount) return res.status(403).json({
            success: false,
            message: "Not enough amount to add to cart!"
        });

        if (cartCheck.amount < 1) return res.status(403).json({
            success: false,
            message: "Amount is invalid!"
        });

        await Cart.updateOne({ _id: cartCheck._id }, {
            $set: {
                amount: cartCheck.amount,
            }
        });

        return res.status(200).json({
            success: true,
            message: "Updated!"
        });
    }

    if (amount * 1 < 1) return res.status(403).json({
        success: false,
        message: "Amount is invalid!"
    });

    await Cart.updateOne({ _id }, {
        $set: {
            product, type, amount
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}


async function updateAmount(req, res) {
    const { _id } = req.params;
    const { amount } = req.body;
    const user = req.user._id;

    let cart = await Cart.findOne({ _id, owner: user });
    if (!cart) return res.status(404).json({ success: false, message: 'Not found cart!' });

    const productInfo = await ProductInfo.findOne({ _id: cart.type });
    if (!productInfo)
        return res.status(403).json({
            success: false,
            message: "Type is not exist!"
        });

    if (!amount || amount * 1 < 1) return res.status(403).json({
        success: false,
        message: "Amount is invalid!"
    });

    if (amount * 1 > productInfo.amount) return res.status(403).json({
        success: false,
        message: "Not enough amount to add to cart!"
    });

    await Cart.updateOne({ _id }, {
        $set: {
            type, amount
        }
    });
    return res.status(200).json({ success: true, message: 'Updated!' });
}

async function info(req, res) {
    const user = req.user._id;
    const cart = await Cart.find({ owner: user, bought: { $ne: true } })
        .populate('owner', '-password')
        .populate({
            path: 'product',
            populate: {
                path: 'warehouse'
            },
        })
        .populate({
            path: 'type',
            populate: {
                path: 'product'
            },
        });

    const data = [];
    const mapId = {};

    for (let i = 0; i < cart.length; ++i) {
        const warehouse = cart[i].product?.warehouse?._id;
        if (mapId[warehouse] == null) {
            mapId[warehouse] = data.length;
            data.push({
                warehouse: {
                    name: cart[i].product?.warehouse?.name,
                    address: cart[i].product?.warehouse?.address,
                    city: cart[i].product?.warehouse?.city,
                    country: cart[i].product?.warehouse?.country,
                },
                product: []
            });
        }

        const index = mapId[warehouse];
        let price = cart[i].type?.price;
        const today = new Date();

        if (cart[i].product?.startSale < today && cart[i].product?.endSale > today) {
            price = cart[i].type?.priceSale;
        }

        const dataToCart = {
            cartId: cart[i]._id,
            productId: cart[i].product?._id,
            name: cart[i].product?.name,
            image: cart[i].product?.image,
            typeId: cart[i].type?._id,
            group1: cart[i].type?.group1,
            group2: cart[i].type?.group2,
            price,
            storage: cart[i].type?.amount,
            amount: cart[i].amount,
        }
        data[index].product.push(dataToCart);
    }

    return res.json({ success: true, data });
}

async function deleteItem(req, res) {
    const { _id } = req.params;
    const item = await Cart.deleteOne({ _id, owner: req.user._id });

    return res.json({ success: true, message: 'Deleted!' });
}

async function deleteItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        const item = await Cart.deleteOne({ _id: listId[i], owner: req.user._id });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

module.exports = {
    add,
    update,
    info,
    deleteItem,
    deleteItems,
    updateAmount,
}
