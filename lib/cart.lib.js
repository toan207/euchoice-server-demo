const Cart = require('../schema').models.Cart;
const Product = require('../schema').models.Product;
const ProductInfo = require('../schema').models.ProductInfo;
const Account = require('../schema').models.Account;

async function infoId(cartId, user) {
    const cart = await Cart.find({ _id: cartId, owner: user })
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

    return data;
}

module.exports = {
    infoId,
}