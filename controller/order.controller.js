const Order = require('../schema').models.Order;
const Cart = require('../schema').models.Cart;
const Product = require('../schema').models.Product;
const ProductInfo = require('../schema').models.ProductInfo;
const Warehouse = require('../schema').models.Warehouse;
const ShippingInfo = require('../schema').models.ShippingInfo;

const OrderLib = require('../lib/order.lib');
const MAX_ORDER = 1000000;

async function splitCartFunc(index, owner, shippingInfo, warehouse, cart, splitCart, splitPrice) {
    if (index >= cart.length) {
        if (splitPrice != 0) {
            const orderId = OrderLib.MakeId(6);
            const price = splitPrice;
            const today = new Date();
            const estReceived = new Date(today.setDate(today.getDate() + 5));

            const newOrder = new Order({ owner, warehouse, cart: splitCart, price, orderId, estReceived, shippingInfo });
            newOrder.save(newOrder);
        }
        return;
    }
    if (cart[index].amount <= 0) await splitCartFunc(index + 1, owner, shippingInfo, warehouse, cart, splitCart, splitPrice);
    if (cart[index].price * cart[index].amount + splitPrice <= MAX_ORDER) {
        const newCart = new Cart({ owner, product: cart[index].product, type: cart[index].type, amount: cart[index].amount, bought: true });
        const getCart = await newCart.save(newCart);
        splitCart.push(getCart._id);

        await splitCartFunc(index + 1, owner, shippingInfo, warehouse, cart, splitCart, splitPrice + cart[index].price * cart[index].amount);
    }
    else {
        const amount = Math.floor(Math.max(0, (MAX_ORDER - splitPrice)) / cart[index].price);
        if (amount != 0) {
            const orderId = OrderLib.MakeId(6);
            const price = splitPrice + cart[index].price * amount;
            const today = new Date();
            const estReceived = new Date(today.setDate(today.getDate() + 5));

            const newCart = new Cart({ owner, product: cart[index].product, type: cart[index].type, amount: amount, bought: true });
            const getCart = await newCart.save(newCart);
            splitCart.push(getCart._id);

            const newOrder = new Order({ owner, warehouse, cart: splitCart, price, orderId, estReceived, shippingInfo });
            newOrder.save(newOrder);

            cart[index].amount -= amount;
            await splitCartFunc(index, owner, shippingInfo, warehouse, cart, [], 0);
        }
        else {
            const orderId = OrderLib.MakeId(6);
            const price = splitPrice;
            const today = new Date();
            const estReceived = new Date(today.setDate(today.getDate() + 5));

            if (price != 0) {
                const newCart = new Cart({ owner, product: cart[index].product, type: cart[index].type, amount: cart[index].amount, bought: true });
                const getCart = await newCart.save(newCart);
                splitCart.push(getCart._id);

                const newOrder = new Order({ owner, warehouse, cart: splitCart, price, orderId, estReceived, shippingInfo });
                newOrder.save(newOrder);
            }
            else {
                const newOrder = new Order({ owner, warehouse, cart: [cart[index]._id], price: cart[index].amount * cart[index].price, orderId, estReceived, shippingInfo });
                newOrder.save(newOrder);
            }

            await splitCartFunc(index + 1, owner, shippingInfo, warehouse, cart, [], 0);
        }
    }
}

async function add(req, res) {
    const { carts, shippingInfo } = req.body;
    const owner = req.user._id;

    if (!carts || !carts.length) return res.status(400).json({ success: false, message: 'Carts is reqired and must be array!' });

    const shipping = await ShippingInfo.findOne({ _id: shippingInfo });
    if (!shipping) return res.status(404).json({ success: false, message: 'Not found shipping info!' });

    let delivery_fee = 0;
    if (shipping.city != 'Hà Nội') delivery_fee = 0;

    const data = [];
    const mapId = {};
    const today = new Date();

    for (let i = 0; i < carts.length; ++i) {
        const cart = await Cart.findOne({ _id: carts[i] })
            .populate('product')
            .populate('type');

        if (!cart) return res.status(404).json({ success: false, message: 'Not found cart!', data: carts[i] });
        if (cart.amount > cart?.type?.amount
            || (cart?.product?.startSale < today && cart?.product?.endSale > today && cart.amount > cart?.type?.amountSale))
            return res.status(400).json({ success: false, message: 'Not enough product amount!', data: carts[i] });

        const warehouse = cart.product?.warehouse;

        if (mapId[warehouse] == null) {
            mapId[warehouse] = data.length;
            data.push({
                warehouse,
                cart: [],
                cartInfo: [],
                price: 0
            });
        }

        const index = mapId[warehouse];
        const found = data[index].cart.findIndex((i) => i === carts[i]);
        if (found != -1) continue;

        const tmpCart = cart;
        tmpCart.price = cart?.type?.price;

        if (cart?.product?.startSale < today && cart?.product?.endSale > today) {
            tmpCart.price = cart?.type?.priceSale;
            data[index].price += cart?.amount * cart?.type?.priceSale;
        }
        else {
            data[index].price += cart?.amount * cart?.type?.price;
        }

        data[index].cartInfo.push(tmpCart);
        data[index].cart.push(carts[i]);
    }

    for (let i = 0; i < data.length; ++i) {
        const warehouse = data[i].warehouse;
        const price = data[i].price;
        const cart = data[i].cart;
        const cartInfo = data[i].cartInfo?.sort((a, b) => a.price - b.price);

        const orderId = OrderLib.MakeId(6);
        const today = new Date();
        const estReceived = new Date(today.setDate(today.getDate() + 5));

        if (price > MAX_ORDER) {
            splitCartFunc(0, owner, shippingInfo, warehouse, cartInfo, [], 0);
        }
        else {
            const newOrder = new Order({ owner, warehouse, cart, price, orderId, estReceived, shippingInfo, delivery_fee });
            newOrder.save(newOrder);
        }

        for (let c = 0; c < cart.length; ++c) {
            const getCart = await Cart.findOne({ _id: cart[c] })
                .populate('type');
            let amount = getCart.type?.amount;

            if (cart?.product?.startSale < today && cart?.product?.endSale > today) {
                amount = getCart.type?.amountSale;
                await ProductInfo.updateOne({ _id: getCart.type?._id }, {
                    $set: {
                        amount: Math.max(0, amount - getCart.amount),
                        sold: getCart.type?.sold + getCart.amount,
                    }
                });
            }
            else {
                await ProductInfo.updateOne({ _id: getCart.type?._id }, {
                    $set: {
                        amount: Math.max(0, amount - getCart.amount),
                        sold: getCart.type?.sold + getCart.amount,
                    }
                });
            }

            await Cart.updateOne({ _id: cart[c] }, {
                $set: {
                    bought: true,
                }
            });
        }
    }

    return res.status(201).json({
        success: true,
        message: "Added order to db!"
    });
}

async function list(req, res) {
    const user = req.user;
    const { status } = req.query;

    const query = {
        hide: { $ne: true },
        delete: { $ne: true }
    };

    if (user.role == 'editor') {
        const getWarehouse = await Warehouse.find({ manager: user._id })
            .select('_id');
        const warehouseId = getWarehouse.map((w) => { return w._id });
        query['warehouse'] = { "$in": warehouseId };
    }

    if (user.role == 'user') {
        query['owner'] = user._id;
    }

    if (!!status) {
        query['status'] = status;
    }

    const orders = await Order.find(query)
        .populate('warehouse')
        .populate('shippingInfo')
        .populate({
            path: 'cart',
            populate: [{
                path: 'type',
                model: ProductInfo
            }, {
                path: 'product',
                model: Product
            }],
        })
        .sort({ "status": -1, "createdAt": -1 });

    res.json({
        success: true,
        data: orders,
    });
}

async function adminList(req, res) {
    const { limit, page, status } = req.query;
    const user = req.user;

    const query = {
        delete: { $ne: true }
    };

    let lim = 20;
    let pa = 1;

    if (!!limit) lim = limit * 1;
    if (!!page) pa = page * 1;

    if (user.role == 'editor') {
        const getWarehouse = await Warehouse.find({ manager: user._id })
            .select('_id');
        const warehouseId = getWarehouse.map((w) => { return w._id });
        query['warehouse'] = { "$in": warehouseId };
    }

    if (!!status) {
        query['status'] = status;
    }

    const orders = await Order.find(query)
        .populate('warehouse')
        .populate('shippingInfo')
        .populate('owner', '-password')
        .populate({
            path: 'cart',
            populate: [{
                path: 'type',
                model: ProductInfo
            }, {
                path: 'product',
                model: Product
            }],
        })
        .sort({ "createdAt": -1 })
        .skip(lim * (pa - 1))
        .limit(lim);

    const count = await Order.countDocuments(query);
    const data = [];

    for (let i = 0; i < orders.length; ++i) {
        const ord = orders[i].toObject();
        ord.shippingInfo.phone_number = ord.owner?.phone_number;

        data.push(ord);
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

async function info(req, res) {
    const { _id } = req.params;

    const order = await Order.findOne({ _id })
        .populate('warehouse')
        .populate('shippingInfo')
        .populate({
            path: 'cart',
            populate: [{
                path: 'type',
                model: ProductInfo
            }, {
                path: 'product',
                model: Product
            }],
        });

    return res.json({ success: true, data: order });
}

async function deleteItem(req, res) {
    const { _id } = req.params;

    const item = await Order.updateOne({ _id }, {
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
        const item = await Order.updateOne({ _id: listId[i] }, {
            $set: {
                delete: true,
            }
        });
    }

    return res.json({ success: true, message: 'Deleted!' });
}

async function packingItem(req, res) {
    const { _id } = req.params;

    await OrderLib.setPackingStatus(_id);

    return res.json({ success: true, message: 'Packing!' });
}

async function packingItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        await OrderLib.setPackingStatus(listId[i]);
    }

    return res.json({ success: true, message: 'Packing!' });
}

async function shippingItem(req, res) {
    const { _id } = req.params;

    await OrderLib.setShippingStatus(_id);

    return res.json({ success: true, message: 'Shipping!' });
}

async function shippingItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        await OrderLib.setShippingStatus(listId[i]);
    }

    return res.json({ success: true, message: 'Shipping!' });
}

async function doneItem(req, res) {
    const { _id } = req.params;

    await OrderLib.setDoneStatus(_id);

    return res.json({ success: true, message: 'Done!' });
}

async function doneItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        await OrderLib.setDoneStatus(listId[i]);
    }

    return res.json({ success: true, message: 'Done!' });
}

async function cancelItem(req, res) {
    const { _id } = req.params;

    const order = await Order.findOne({ _id });
    if (!order || order.status != 'new') return res.status(400).json({ success: false, message: 'Can not cancel order!' });

    const cart = order.cart || [];
    for (let c = 0; c < cart.length; ++c) {
        const getCart = await Cart.findOne({ _id: cart[c] })
            .populate('type');

        await ProductInfo.updateOne({ _id: getCart.type?._id }, {
            $set: {
                amount: getCart.type?.amount + getCart.amount,
                sold: getCart.type?.sold - getCart.amount,
            }
        });
    }

    await OrderLib.setCancelStatus(_id);

    return res.json({ success: true, message: 'Cancel!' });
}

async function cancelItems(req, res) {
    const { listId } = req.body;

    if (!listId) return res.status(400).json({ success: false, message: 'No Id found!' });
    if (typeof (listId) != typeof ([])) return res.status(400).json({ success: false, message: 'List must be array!' });

    for (let i = 0; i < listId.length; ++i) {
        const order = await Order.findOne({ _id: listId[i] });

        const cart = order.cart || [];
        for (let c = 0; c < cart.length; ++c) {
            const getCart = await Cart.findOne({ _id: cart[c] })
                .populate({
                    path: 'type',
                    populate: {
                        path: 'product',
                        model: Product
                    },
                });

            let productBack = getCart.type?.product?.return + getCart.amount;
            if (order?.status === 'new') productBack = getCart.type?.product?.return;

            await ProductInfo.updateOne({ _id: getCart.type?._id }, {
                $set: {
                    amount: getCart.type?.amount + getCart.amount,
                    sold: getCart.type?.sold - getCart.amount,
                }
            });

            await Product.updateOne({ _id: getCart?.type?.product?._id }, {
                $set: {
                    return: productBack,
                }
            });
        }

        await OrderLib.setCancelStatus(listId[i]);
    }

    return res.json({ success: true, message: 'Cancel!' });
}

async function hide(req, res) {
    const { _id } = req.params;

    const order = await Order.findOne({ _id });
    if (!order) return res.json({ success: false, message: 'Order not found!' });

    const item = await Order.updateOne({ _id }, {
        $set: {
            hide: !order.hide,
        }
    });

    return res.json({ success: true, message: 'Hid!' });
}

module.exports = {
    add,
    list,
    info,
    deleteItem,
    hide,
    adminList,
    deleteItems,
    shippingItem,
    shippingItems,
    doneItem,
    doneItems,
    cancelItem,
    cancelItems,
    packingItem,
    packingItems,
}
